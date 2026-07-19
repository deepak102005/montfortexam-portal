"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentDashboard = getStudentDashboard;
exports.getSubjects = getSubjects;
exports.getStudentTests = getStudentTests;
exports.getTestForAttempt = getTestForAttempt;
exports.submitTest = submitTest;
exports.getStudentReports = getStudentReports;
exports.getTestReport = getTestReport;
exports.getNotifications = getNotifications;
exports.markNotificationRead = markNotificationRead;
exports.markAllNotificationsRead = markAllNotificationsRead;
const database_1 = __importDefault(require("../config/database"));
// ─── Student Dashboard ──────────────────────────────────
async function getStudentDashboard(req, res) {
    try {
        const userId = req.user.userId;
        const student = await database_1.default.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true },
        });
        if (!student?.studentProfile) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }
        const stream = student.studentProfile.stream;
        // Last 5 test results (performance trend)
        const recentResults = await database_1.default.submission.findMany({
            where: { studentId: userId, gradedAt: { not: null } },
            include: {
                test: { select: { id: true, title: true, grade: true, totalMarks: true } },
            },
            orderBy: { submittedAt: 'desc' },
            take: 5,
        });
        // Upcoming exams
        const upcomingExams = await database_1.default.test.findMany({
            where: {
                stream,
                status: 'PUBLISHED',
                scheduledAt: { gte: new Date() },
            },
            orderBy: { scheduledAt: 'asc' },
            take: 5,
        });
        // Recent notifications/messages
        const messages = await database_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        // Teacher remarks
        const remarks = await database_1.default.remark.findMany({
            where: { studentId: userId },
            include: { teacher: { select: { name: true } }, test: { select: { title: true } } },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        // Next exam countdown
        const nextExam = upcomingExams[0] || null;
        res.json({
            student: { name: student.name, stream, rollNumber: student.studentProfile.rollNumber },
            performanceTrend: recentResults.map((r) => ({
                testId: r.test.id,
                title: r.test.title,
                subject: r.test.grade,
                score: r.score,
                totalMarks: r.test.totalMarks,
                date: r.submittedAt,
            })),
            upcomingExams,
            messages,
            remarks,
            nextExam,
        });
    }
    catch (error) {
        console.error('Student dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Subjects ───────────────────────────────────────────
async function getSubjects(req, res) {
    try {
        const userId = req.user.userId;
        const student = await database_1.default.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true },
        });
        if (!student?.studentProfile) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }
        const stream = student.studentProfile.stream;
        const subjects = stream === 'MPC'
            ? ['MATHS', 'PHYSICS', 'CHEMISTRY']
            : ['BIOLOGY', 'PHYSICS', 'CHEMISTRY'];
        // Get subject-wise performance
        const subjectData = await Promise.all(subjects.map(async (subject) => {
            const submissions = await database_1.default.submission.findMany({
                where: {
                    studentId: userId,
                    gradedAt: { not: null },
                    test: { grade: subject },
                },
                select: { score: true, totalMarks: true },
            });
            const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
            const totalMaxMarks = submissions.reduce((sum, s) => sum + (s.totalMarks || 0), 0);
            const progress = totalMaxMarks > 0 ? (totalScore / totalMaxMarks) * 100 : 0;
            return {
                subject,
                testsAttempted: submissions.length,
                progress: Math.round(progress),
                totalScore,
                totalMaxMarks,
            };
        }));
        res.json(subjectData);
    }
    catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Tests ──────────────────────────────────────────────
async function getStudentTests(req, res) {
    try {
        const userId = req.user.userId;
        const student = await database_1.default.user.findUnique({
            where: { id: userId },
            include: { studentProfile: true },
        });
        if (!student?.studentProfile) {
            res.status(404).json({ error: 'Student profile not found' });
            return;
        }
        const tests = await database_1.default.test.findMany({
            where: {
                stream: student.studentProfile.stream,
                status: 'PUBLISHED',
            },
            include: {
                _count: { select: { questions: true } },
                submissions: {
                    where: { studentId: userId },
                    select: { id: true, submittedAt: true, score: true },
                },
                createdBy: { select: { name: true } },
            },
            orderBy: { scheduledAt: 'desc' },
        });
        const testsWithStatus = tests.map((test) => ({
            ...test,
            hasSubmitted: test.submissions.length > 0,
            submission: test.submissions[0] || null,
        }));
        res.json(testsWithStatus);
    }
    catch (error) {
        console.error('Get student tests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getTestForAttempt(req, res) {
    try {
        const testId = req.params.testId;
        const userId = req.user.userId;
        // Check if already submitted
        const existingSubmission = await database_1.default.submission.findUnique({
            where: { testId_studentId: { testId, studentId: userId } },
        });
        if (existingSubmission) {
            res.status(400).json({ error: 'You have already submitted this test' });
            return;
        }
        const test = await database_1.default.test.findUnique({
            where: { id: testId },
            include: {
                questions: {
                    orderBy: { questionNumber: 'asc' },
                    select: {
                        id: true,
                        questionNumber: true,
                        text: true,
                        imageUrl: true,
                        options: true,
                        marks: true,
                        // NOTE: correctOption is NOT included — students shouldn't see answers
                    },
                },
            },
        });
        if (!test || test.status !== 'PUBLISHED') {
            res.status(404).json({ error: 'Test not found or not available' });
            return;
        }
        res.json(test);
    }
    catch (error) {
        console.error('Get test for attempt error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function submitTest(req, res) {
    try {
        const testId = req.params.testId;
        const userId = req.user.userId;
        const { answers } = req.body; // [{ questionId, selectedOption }]
        // Check if already submitted
        const existingSubmission = await database_1.default.submission.findUnique({
            where: { testId_studentId: { testId, studentId: userId } },
        });
        if (existingSubmission) {
            res.status(400).json({ error: 'Already submitted' });
            return;
        }
        const test = await database_1.default.test.findUnique({ where: { id: testId } });
        if (!test || test.status !== 'PUBLISHED') {
            res.status(400).json({ error: 'Test not available' });
            return;
        }
        const submission = await database_1.default.submission.create({
            data: {
                testId,
                studentId: userId,
                answers: answers || [],
            },
        });
        // Log attendance for today
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        await database_1.default.attendance.upsert({
            where: {
                studentId_date: {
                    studentId: userId,
                    date: today,
                },
            },
            update: { present: true },
            create: {
                studentId: userId,
                date: today,
                present: true,
            },
        });
        res.status(201).json(submission);
    }
    catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Reports ────────────────────────────────────────────
async function getStudentReports(req, res) {
    try {
        const userId = req.user.userId;
        const submissions = await database_1.default.submission.findMany({
            where: { studentId: userId, gradedAt: { not: null } },
            include: {
                test: {
                    select: { id: true, title: true, grade: true, totalMarks: true, stream: true },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
        res.json(submissions.map((s) => ({
            testId: s.test.id,
            title: s.test.title,
            subject: s.test.grade,
            stream: s.test.stream,
            score: s.score,
            totalMarks: s.test.totalMarks,
            percentage: s.test.totalMarks > 0 ? Math.round(((s.score || 0) / s.test.totalMarks) * 100) : 0,
            submittedAt: s.submittedAt,
            gradedAt: s.gradedAt,
        })));
    }
    catch (error) {
        console.error('Get student reports error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getTestReport(req, res) {
    try {
        const testId = req.params.testId;
        const userId = req.user.userId;
        const submission = await database_1.default.submission.findUnique({
            where: { testId_studentId: { testId, studentId: userId } },
            include: {
                test: {
                    include: {
                        questions: { orderBy: { questionNumber: 'asc' } },
                        answerKey: true,
                    },
                },
            },
        });
        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
            return;
        }
        if (!submission.gradedAt) {
            res.status(400).json({ error: 'Test has not been graded yet' });
            return;
        }
        const studentAnswers = submission.answers;
        const answerKeyMap = new Map();
        if (submission.test.answerKey) {
            const keyAnswers = submission.test.answerKey.answers;
            keyAnswers.forEach((a) => answerKeyMap.set(a.questionId, a.correctOption));
        }
        const questionBreakdown = submission.test.questions.map((q) => {
            const studentAnswer = studentAnswers.find((a) => a.questionId === q.id);
            const correctOption = answerKeyMap.get(q.id) ?? q.correctOption;
            return {
                questionNumber: q.questionNumber,
                text: q.text,
                options: q.options,
                correctOption,
                selectedOption: studentAnswer?.selectedOption ?? null,
                isCorrect: studentAnswer?.selectedOption === correctOption,
                marks: q.marks,
                marksObtained: studentAnswer?.selectedOption === correctOption ? q.marks : 0,
            };
        });
        // Get rank
        const allSubmissions = await database_1.default.submission.findMany({
            where: { testId, gradedAt: { not: null } },
            orderBy: { score: 'desc' },
            select: { studentId: true, score: true },
        });
        const rank = allSubmissions.findIndex((s) => s.studentId === userId) + 1;
        res.json({
            testTitle: submission.test.title,
            subject: submission.test.grade,
            score: submission.score,
            totalMarks: submission.test.totalMarks,
            rank,
            totalStudents: allSubmissions.length,
            questions: questionBreakdown,
        });
    }
    catch (error) {
        console.error('Get test report error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Notifications ──────────────────────────────────────
async function getNotifications(req, res) {
    try {
        const userId = req.user.userId;
        const notifications = await database_1.default.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
        });
        const unreadCount = await database_1.default.notification.count({
            where: { userId, read: false },
        });
        res.json({ notifications, unreadCount });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function markNotificationRead(req, res) {
    try {
        const id = req.params.id;
        const userId = req.user.userId;
        await database_1.default.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
        res.json({ message: 'Marked as read' });
    }
    catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function markAllNotificationsRead(req, res) {
    try {
        const userId = req.user.userId;
        await database_1.default.notification.updateMany({
            where: { userId, read: false },
            data: { read: true },
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all notifications read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=student.controller.js.map