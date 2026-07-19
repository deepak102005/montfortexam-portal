"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeacherDashboard = getTeacherDashboard;
exports.getTeacherTests = getTeacherTests;
exports.createTest = createTest;
exports.updateTest = updateTest;
exports.publishTest = publishTest;
exports.addQuestion = addQuestion;
exports.updateQuestion = updateQuestion;
exports.deleteQuestion = deleteQuestion;
exports.getTestQuestions = getTestQuestions;
exports.getTeacherReports = getTeacherReports;
exports.getGradedTests = getGradedTests;
exports.getTestStudentScores = getTestStudentScores;
exports.addRemark = addRemark;
const database_1 = __importDefault(require("../config/database"));
// ─── Teacher Dashboard ──────────────────────────────────
async function getTeacherDashboard(req, res) {
    try {
        const userId = req.user.userId;
        const teacher = await database_1.default.user.findUnique({
            where: { id: userId },
            include: { teacherProfile: true },
        });
        if (!teacher?.teacherProfile) {
            res.status(404).json({ error: 'Teacher profile not found' });
            return;
        }
        const stream = teacher.teacherProfile.stream;
        const [totalStudents, testsCreated, pendingGrading, recentRemarks, upcomingTests,] = await Promise.all([
            database_1.default.studentProfile.count({ where: { stream } }),
            database_1.default.test.count({ where: { createdById: userId } }),
            database_1.default.test.count({
                where: { createdById: userId, status: 'PUBLISHED', answerKey: null },
            }),
            database_1.default.remark.findMany({
                where: { teacherId: userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { student: { select: { name: true } } },
            }),
            database_1.default.test.findMany({
                where: {
                    createdById: userId,
                    status: 'PUBLISHED',
                    scheduledAt: { gte: new Date() },
                },
                orderBy: { scheduledAt: 'asc' },
                take: 5,
            }),
        ]);
        res.json({
            teacher: { name: teacher.name, stream, subjects: teacher.teacherProfile.subjects },
            stats: { totalStudents, testsCreated, pendingGrading },
            recentRemarks,
            upcomingTests,
        });
    }
    catch (error) {
        console.error('Teacher dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Tests ──────────────────────────────────────────────
async function getTeacherTests(req, res) {
    try {
        const userId = req.user.userId;
        const { status } = req.query;
        const where = { createdById: userId };
        if (status)
            where.status = status;
        const tests = await database_1.default.test.findMany({
            where,
            include: {
                _count: { select: { submissions: true, questions: true } },
                answerKey: { select: { id: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tests);
    }
    catch (error) {
        console.error('Get teacher tests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function createTest(req, res) {
    try {
        const userId = req.user.userId;
        const { title, subject, stream, duration, totalMarks, scheduledAt, negativeMarking, negativeMarks } = req.body;
        if (!title || !subject || !stream || !duration || !totalMarks) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        const test = await database_1.default.test.create({
            data: {
                title,
                subject,
                stream,
                duration,
                totalMarks,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                negativeMarking: negativeMarking || false,
                negativeMarks: negativeMarks || 0,
                createdById: userId,
                status: 'DRAFT',
            },
        });
        res.status(201).json(test);
    }
    catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateTest(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const { title, subject, stream, duration, totalMarks, scheduledAt, negativeMarking, negativeMarks } = req.body;
        // Ensure teacher owns this test
        const existing = await database_1.default.test.findUnique({ where: { id } });
        if (!existing || existing.createdById !== userId) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        if (existing.status !== 'DRAFT') {
            res.status(400).json({ error: 'Can only edit draft tests' });
            return;
        }
        const test = await database_1.default.test.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(subject && { subject }),
                ...(stream && { stream }),
                ...(duration && { duration }),
                ...(totalMarks && { totalMarks }),
                ...(scheduledAt && { scheduledAt: new Date(scheduledAt) }),
                ...(negativeMarking !== undefined && { negativeMarking }),
                ...(negativeMarks !== undefined && { negativeMarks }),
            },
        });
        res.json(test);
    }
    catch (error) {
        console.error('Update test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function publishTest(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        const test = await database_1.default.test.findUnique({
            where: { id },
            include: { _count: { select: { questions: true } } },
        });
        if (!test || test.createdById !== userId) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        if (test._count.questions === 0) {
            res.status(400).json({ error: 'Cannot publish a test with no questions' });
            return;
        }
        const updated = await database_1.default.test.update({
            where: { id },
            data: { status: 'PUBLISHED' },
        });
        // Notify all students in the same stream
        const students = await database_1.default.user.findMany({
            where: {
                role: 'STUDENT',
                isActive: true,
                studentProfile: { stream: test.stream },
            },
        });
        if (students.length > 0) {
            await database_1.default.notification.createMany({
                data: students.map((s) => ({
                    userId: s.id,
                    title: 'New Test Available',
                    message: `A new ${test.subject} test "${test.title}" has been published.`,
                    link: `/student/tests`,
                })),
            });
        }
        res.json(updated);
    }
    catch (error) {
        console.error('Publish test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Questions ──────────────────────────────────────────
async function addQuestion(req, res) {
    try {
        const testId = req.params.testId;
        const userId = req.user.userId;
        const { text, imageUrl, options, correctOption, marks, negativeMarks } = req.body;
        const test = await database_1.default.test.findUnique({ where: { id: testId } });
        if (!test || test.createdById !== userId) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        if (test.status !== 'DRAFT') {
            res.status(400).json({ error: 'Can only add questions to draft tests' });
            return;
        }
        // Get next question number
        const lastQuestion = await database_1.default.question.findFirst({
            where: { testId },
            orderBy: { questionNumber: 'desc' },
        });
        const question = await database_1.default.question.create({
            data: {
                testId,
                questionNumber: (lastQuestion?.questionNumber || 0) + 1,
                text,
                imageUrl,
                options,
                correctOption,
                marks: marks || 4,
                negativeMarks: negativeMarks || 0,
            },
        });
        res.status(201).json(question);
    }
    catch (error) {
        console.error('Add question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateQuestion(req, res) {
    try {
        const testId = req.params.testId;
        const questionId = req.params.questionId;
        const userId = req.user.userId;
        const { text, imageUrl, options, correctOption, marks, negativeMarks } = req.body;
        const test = await database_1.default.test.findUnique({ where: { id: testId } });
        if (!test || test.createdById !== userId) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        const question = await database_1.default.question.update({
            where: { id: questionId },
            data: {
                ...(text && { text }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(options && { options }),
                ...(correctOption !== undefined && { correctOption }),
                ...(marks !== undefined && { marks }),
                ...(negativeMarks !== undefined && { negativeMarks }),
            },
        });
        res.json(question);
    }
    catch (error) {
        console.error('Update question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function deleteQuestion(req, res) {
    try {
        const testId = req.params.testId;
        const questionId = req.params.questionId;
        const userId = req.user.userId;
        const test = await database_1.default.test.findUnique({ where: { id: testId } });
        if (!test || test.createdById !== userId) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        await database_1.default.question.delete({ where: { id: questionId } });
        res.json({ message: 'Question deleted' });
    }
    catch (error) {
        console.error('Delete question error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getTestQuestions(req, res) {
    try {
        const testId = req.params.testId;
        const questions = await database_1.default.question.findMany({
            where: { testId },
            orderBy: { questionNumber: 'asc' },
        });
        res.json(questions);
    }
    catch (error) {
        console.error('Get test questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Reports ────────────────────────────────────────────
async function getTeacherReports(req, res) {
    try {
        const userId = req.user.userId;
        const teacher = await database_1.default.user.findUnique({
            where: { id: userId },
            include: { teacherProfile: true },
        });
        if (!teacher?.teacherProfile) {
            res.status(404).json({ error: 'Teacher profile not found' });
            return;
        }
        const stream = teacher.teacherProfile.stream;
        // Get all graded tests for this teacher's stream
        const tests = await database_1.default.test.findMany({
            where: {
                stream,
                status: 'CLOSED',
                submissions: { some: { gradedAt: { not: null } } },
            },
            include: {
                submissions: {
                    where: { gradedAt: { not: null } },
                    select: { score: true, totalMarks: true, studentId: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Compute analytics per test
        const analytics = tests.map((test) => {
            const scores = test.submissions
                .filter((s) => s.score !== null)
                .map((s) => s.score);
            const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            const max = scores.length > 0 ? Math.max(...scores) : 0;
            const min = scores.length > 0 ? Math.min(...scores) : 0;
            return {
                testId: test.id,
                title: test.title,
                subject: test.subject,
                totalMarks: test.totalMarks,
                studentCount: scores.length,
                average: Math.round(avg * 100) / 100,
                highest: max,
                lowest: min,
            };
        });
        res.json(analytics);
    }
    catch (error) {
        console.error('Teacher reports error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Grade Page ─────────────────────────────────────────
async function getGradedTests(req, res) {
    try {
        const userId = req.user.userId;
        const tests = await database_1.default.test.findMany({
            where: {
                createdById: userId,
                status: 'CLOSED',
            },
            include: {
                _count: { select: { submissions: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tests);
    }
    catch (error) {
        console.error('Get graded tests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getTestStudentScores(req, res) {
    try {
        const testId = req.params.testId;
        const userId = req.user.userId;
        const test = await database_1.default.test.findUnique({ where: { id: testId } });
        if (!test || test.createdById !== userId) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        const submissions = await database_1.default.submission.findMany({
            where: { testId, gradedAt: { not: null } },
            include: {
                student: {
                    select: { id: true, name: true, studentProfile: true },
                },
            },
            orderBy: { score: 'desc' },
        });
        res.json({
            test: { id: test.id, title: test.title, subject: test.subject, totalMarks: test.totalMarks },
            submissions: submissions.map((s, i) => ({
                rank: i + 1,
                studentId: s.student.id,
                studentName: s.student.name,
                rollNumber: s.student.studentProfile?.rollNumber,
                grade: s.student.studentProfile?.grade,
                score: s.score,
                totalMarks: s.totalMarks,
                submittedAt: s.submittedAt,
                gradedAt: s.gradedAt,
            })),
        });
    }
    catch (error) {
        console.error('Get test student scores error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Remarks ────────────────────────────────────────────
async function addRemark(req, res) {
    try {
        const userId = req.user.userId;
        const { studentId, testId, note } = req.body;
        if (!studentId || !note) {
            res.status(400).json({ error: 'Student ID and note are required' });
            return;
        }
        const remark = await database_1.default.remark.create({
            data: {
                teacherId: userId,
                studentId,
                testId: testId || null,
                note,
            },
        });
        // Notify student
        await database_1.default.notification.create({
            data: {
                userId: studentId,
                title: 'New Teacher Remark',
                message: `You have a new remark from your teacher.`,
                link: `/student`,
            },
        });
        res.status(201).json(remark);
    }
    catch (error) {
        console.error('Add remark error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=teacher.controller.js.map