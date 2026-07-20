"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getStudents = getStudents;
exports.createStudent = createStudent;
exports.bulkCreateStudents = bulkCreateStudents;
exports.toggleStudentActive = toggleStudentActive;
exports.updateStudent = updateStudent;
exports.createTest = createTest;
exports.uploadPaper = uploadPaper;
exports.saveManualQuestions = saveManualQuestions;
exports.getAllTests = getAllTests;
exports.getTestById = getTestById;
exports.submitAnswerKey = submitAnswerKey;
exports.autoGradeTest = autoGradeTest;
exports.deleteStudent = deleteStudent;
exports.getTestQuestions = getTestQuestions;
exports.uploadImage = uploadImage;
const blob_1 = require("@vercel/blob");
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("../config/database"));
const password_1 = require("../utils/password");
const XLSX = __importStar(require("xlsx"));
const env_1 = require("../config/env");
// ─── Dashboard Stats ────────────────────────────────────
async function getDashboardStats(req, res) {
    try {
        const [totalStudents, activeStudents, mpcStudents, bipcStudents, totalTests, recentActivity,] = await Promise.all([
            database_1.default.user.count({ where: { role: 'STUDENT' } }),
            database_1.default.user.count({ where: { role: 'STUDENT', isActive: true } }),
            database_1.default.studentProfile.count({ where: { stream: 'MPC' } }),
            database_1.default.studentProfile.count({ where: { stream: 'BIPC' } }),
            database_1.default.test.count(),
            database_1.default.user.findMany({
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: { id: true, name: true, role: true, createdAt: true, isActive: true },
            }),
        ]);
        res.json({
            teachers: { total: 0, active: 0, mpc: 0, bipc: 0 },
            students: { total: totalStudents, active: activeStudents, mpc: mpcStudents, bipc: bipcStudents },
            totalTests,
            recentActivity,
        });
    }
    catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Students CRUD ───────────────────────────────────────
async function getStudents(req, res) {
    try {
        const { stream, isActive, grade, search } = req.query;
        const where = { role: 'STUDENT' };
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
        }
        const students = await database_1.default.user.findMany({
            where,
            include: { studentProfile: true },
            orderBy: { createdAt: 'desc' },
        });
        let filtered = students;
        if (stream) {
            filtered = filtered.filter((s) => s.studentProfile?.stream === stream);
        }
        if (grade) {
            filtered = filtered.filter((s) => s.studentProfile?.grade === grade);
        }
        const safeStudents = filtered.map(({ passwordHash, ...rest }) => rest);
        res.json(safeStudents);
    }
    catch (error) {
        console.error('Get students error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function createStudent(req, res) {
    try {
        const { name, email, rollNumber, phone, stream, grade, guardianContact, username, password } = req.body;
        if (!name || !email || !rollNumber || !stream || !username || !password) {
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }
        // Check duplicates
        const existingUser = await database_1.default.user.findFirst({
            where: { OR: [{ email }, { username }] },
        });
        if (existingUser) {
            res.status(409).json({ error: 'Email or username already exists' });
            return;
        }
        const existingRoll = await database_1.default.studentProfile.findUnique({
            where: { rollNumber },
        });
        if (existingRoll) {
            res.status(409).json({ error: 'Roll number already exists' });
            return;
        }
        const passwordHash = await (0, password_1.hashPassword)(password);
        const user = await database_1.default.user.create({
            data: {
                name,
                email,
                username,
                passwordHash,
                role: 'STUDENT',
                studentProfile: {
                    create: {
                        stream,
                        rollNumber,
                        grade,
                        phone,
                        guardianContact,
                    },
                },
            },
            include: { studentProfile: true },
        });
        const { passwordHash: _, ...safeUser } = user;
        res.status(201).json(safeUser);
    }
    catch (error) {
        console.error('Create student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function bulkCreateStudents(req, res) {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Excel file is required' });
            return;
        }
        const workbook = XLSX.read(req.file.buffer || require('fs').readFileSync(req.file.path));
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet);
        const errors = [];
        const validStudents = [];
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const rowNum = i + 2; // Excel row (1-indexed header + data)
            // Validate required fields
            if (!row.name || !row.email || !row.rollNumber || !row.stream || !row.username || !row.password) {
                errors.push({ row: rowNum, error: 'Missing required fields (name, email, rollNumber, stream, username, password)' });
                continue;
            }
            if (!['MPC', 'BIPC'].includes(row.stream?.toUpperCase())) {
                errors.push({ row: rowNum, error: `Invalid stream: ${row.stream}. Must be MPC or BIPC` });
                continue;
            }
            // Check for duplicates within the upload batch
            const duplicateInBatch = validStudents.find((s) => s.email === row.email || s.username === row.username || s.rollNumber === String(row.rollNumber));
            if (duplicateInBatch) {
                errors.push({ row: rowNum, error: 'Duplicate email, username, or roll number within upload batch' });
                continue;
            }
            // Check against database
            const existingUser = await database_1.default.user.findFirst({
                where: { OR: [{ email: row.email }, { username: row.username }] },
            });
            if (existingUser) {
                errors.push({ row: rowNum, error: `Email or username already exists in database` });
                continue;
            }
            const existingRoll = await database_1.default.studentProfile.findUnique({
                where: { rollNumber: String(row.rollNumber) },
            });
            if (existingRoll) {
                errors.push({ row: rowNum, error: `Roll number ${row.rollNumber} already exists` });
                continue;
            }
            validStudents.push({
                name: row.name,
                email: row.email,
                username: row.username,
                password: row.password,
                rollNumber: String(row.rollNumber),
                stream: row.stream.toUpperCase(),
                grade: row.grade || row.class || '11',
                phone: row.phone ? String(row.phone) : null,
                guardianContact: row.guardianContact ? String(row.guardianContact) : null,
            });
        }
        // If there are errors and no valid students, return errors
        if (validStudents.length === 0) {
            res.status(400).json({ error: 'No valid students to import', errors, totalRows: rows.length });
            return;
        }
        // Create all valid students
        const created = [];
        for (const student of validStudents) {
            const passwordHash = await (0, password_1.hashPassword)(student.password);
            const user = await database_1.default.user.create({
                data: {
                    name: student.name,
                    email: student.email,
                    username: student.username,
                    passwordHash,
                    role: 'STUDENT',
                    studentProfile: {
                        create: {
                            stream: student.stream,
                            rollNumber: student.rollNumber,
                            grade: student.grade,
                            phone: student.phone,
                            guardianContact: student.guardianContact,
                        },
                    },
                },
            });
            created.push(user.id);
        }
        res.status(201).json({
            message: `Successfully created ${created.length} students`,
            created: created.length,
            errors,
            totalRows: rows.length,
        });
    }
    catch (error) {
        console.error('Bulk create students error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function toggleStudentActive(req, res) {
    try {
        const id = req.params.id;
        const user = await database_1.default.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        const updated = await database_1.default.user.update({
            where: { id },
            data: { isActive: !user.isActive },
        });
        res.json({ id: updated.id, isActive: updated.isActive });
    }
    catch (error) {
        console.error('Toggle student active error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function updateStudent(req, res) {
    try {
        const id = req.params.id;
        const { name, email, phone, stream, grade, rollNumber, guardianContact } = req.body;
        const user = await database_1.default.user.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                studentProfile: {
                    update: {
                        ...(phone !== undefined && { phone }),
                        ...(stream && { stream }),
                        ...(grade !== undefined && { grade }),
                        ...(rollNumber && { rollNumber }),
                        ...(guardianContact !== undefined && { guardianContact }),
                    },
                },
            },
            include: { studentProfile: true },
        });
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
    }
    catch (error) {
        console.error('Update student error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
// ─── Admin Grading ───────────────────────────────────────
async function createTest(req, res) {
    try {
        const { title, type, grade, stream, duration, totalMarks, accessCode, description } = req.body;
        // Using an existing user as creator (hardcoded for now if not in token, but we have authMiddleware)
        // Actually, let's assume req.user is populated by authMiddleware. If not, fallback to first admin
        let createdById = req.user?.id;
        if (!createdById) {
            const admin = await database_1.default.user.findFirst({ where: { role: 'ADMIN' } });
            createdById = admin?.id;
        }
        const test = await database_1.default.test.create({
            data: {
                title: title || 'Mock Test',
                description: description || null,
                type: type || 'JEE',
                accessCode: accessCode || 'TEST1234',
                stream: stream || 'MPC',
                grade: grade || '12',
                duration: parseInt(duration) || 180,
                totalMarks: parseInt(totalMarks) || 300,
                createdById: createdById,
                status: 'DRAFT'
            }
        });
        res.status(201).json(test);
    }
    catch (error) {
        console.error('Create test error:', error);
        res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
    }
}
async function uploadPaper(req, res) {
    try {
        const testId = req.params.testId;
        const test = await database_1.default.test.findUnique({ where: { id: testId } });
        if (!test) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }
        // Call Gemini API
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(env_1.env.OCR_API_KEY || 'AIzaSyAi9NwW__LGNhZ0bvYeoRcWobNl_SwzPHE');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log(`Sending ${req.file.originalname} to Gemini API...`);
        let parsedText = '';
        try {
            const result = await model.generateContent([
                {
                    inlineData: {
                        data: fileBuffer.toString("base64"),
                        mimeType: "application/pdf"
                    }
                },
                "Extract all the questions and text from this document. Please maintain the numbering."
            ]);
            parsedText = result.response.text();
        }
        catch (apiError) {
            console.warn('Gemini Parsing failed:', apiError);
            parsedText = 'Failed to extract text from PDF or limit reached.';
        }
        // Clear existing questions for this test
        await database_1.default.question.deleteMany({ where: { testId } });
        const numQuestions = test.stream === 'MPC' ? 90 : 180;
        const questions = [];
        // Simple heuristic parser for questions starting with "1.", "2.", etc.
        const questionBlocks = [];
        const regex = /\b(\d+)[\.\)]\s+([\s\S]*?)(?=\b\d+[\.\)]\s+|$)/g;
        let match;
        while ((match = regex.exec(parsedText)) !== null) {
            questionBlocks.push(match[2].trim());
        }
        for (let i = 1; i <= numQuestions; i++) {
            const qText = questionBlocks[i - 1]
                ? questionBlocks[i - 1].substring(0, 500) // limit length
                : `Question ${i} (Fallback text, couldn't parse)`;
            questions.push({
                testId,
                questionNumber: i,
                text: qText,
                options: ["Option A", "Option B", "Option C", "Option D"],
                correctOption: 0,
                marks: 4,
                negativeMarks: 1,
            });
        }
        await database_1.default.question.createMany({
            data: questions
        });
        res.json({ message: 'Paper parsed and questions created', count: numQuestions });
    }
    catch (error) {
        console.error('Upload paper error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function saveManualQuestions(req, res) {
    try {
        const testId = req.params.testId;
        const { questions } = req.body;
        if (!Array.isArray(questions)) {
            res.status(400).json({ error: 'Questions must be an array' });
            return;
        }
        const test = await database_1.default.test.findUnique({ where: { id: testId } });
        if (!test) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        await database_1.default.question.deleteMany({ where: { testId } });
        const questionsToCreate = questions.map((q, idx) => ({
            testId,
            questionNumber: idx + 1,
            text: q.text || `Question ${idx + 1}`,
            imageUrl: q.imageUrl || null,
            options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
            correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
            marks: q.marks || 4,
            negativeMarks: q.negativeMarks || 1
        }));
        await database_1.default.question.createMany({
            data: questionsToCreate
        });
        const createdQuestions = await database_1.default.question.findMany({
            where: { testId },
            orderBy: { questionNumber: 'asc' }
        });
        const answersData = createdQuestions.map((q) => ({
            questionId: q.id,
            correctOption: q.correctOption
        }));
        await database_1.default.answerKey.upsert({
            where: { testId },
            update: { answers: answersData },
            create: { testId, answers: answersData }
        });
        res.json({ message: 'Questions saved successfully', count: questionsToCreate.length });
    }
    catch (error) {
        console.error('Save manual questions error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getAllTests(req, res) {
    try {
        const { stream, status } = req.query;
        const where = {};
        if (stream)
            where.stream = stream;
        if (status)
            where.status = status;
        const tests = await database_1.default.test.findMany({
            where,
            include: {
                createdBy: { select: { id: true, name: true } },
                _count: { select: { submissions: true, questions: true } },
                answerKey: { select: { id: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(tests);
    }
    catch (error) {
        console.error('Get all tests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function getTestById(req, res) {
    try {
        const testId = req.params.testId;
        const test = await database_1.default.test.findUnique({
            where: { id: testId },
            include: { createdBy: true }
        });
        if (!test) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        res.json(test);
    }
    catch (error) {
        console.error('Get test error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function submitAnswerKey(req, res) {
    try {
        const testId = req.params.testId;
        const { answers } = req.body; // [{ questionId, correctOption }]
        if (!answers || !Array.isArray(answers)) {
            res.status(400).json({ error: 'Answers array is required' });
            return;
        }
        const test = await database_1.default.test.findUnique({
            where: { id: testId },
            include: { questions: true },
        });
        if (!test) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        // Upsert answer key
        const answerKey = await database_1.default.answerKey.upsert({
            where: { testId },
            update: { answers },
            create: { testId, answers },
        });
        res.json(answerKey);
    }
    catch (error) {
        console.error('Submit answer key error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function autoGradeTest(req, res) {
    try {
        const testId = req.params.testId;
        const test = await database_1.default.test.findUnique({
            where: { id: testId },
            include: { questions: true, answerKey: true },
        });
        if (!test) {
            res.status(404).json({ error: 'Test not found' });
            return;
        }
        if (!test.answerKey) {
            res.status(400).json({ error: 'Answer key not found. Submit answer key first.' });
            return;
        }
        const answerKeyMap = new Map();
        const keyAnswers = test.answerKey.answers;
        keyAnswers.forEach((a) => answerKeyMap.set(a.questionId, a.correctOption));
        // Build question marks map
        const questionMarksMap = new Map();
        test.questions.forEach((q) => {
            questionMarksMap.set(q.id, { marks: q.marks, negativeMarks: q.negativeMarks });
        });
        // Get all submissions for this test
        const submissions = await database_1.default.submission.findMany({
            where: { testId },
        });
        let gradedCount = 0;
        for (const submission of submissions) {
            const studentAnswers = submission.answers;
            let score = 0;
            let totalMarks = 0;
            for (const answer of studentAnswers) {
                const questionInfo = questionMarksMap.get(answer.questionId);
                const correctOption = answerKeyMap.get(answer.questionId);
                if (questionInfo === undefined || correctOption === undefined)
                    continue;
                totalMarks += questionInfo.marks;
                if (answer.selectedOption === null)
                    continue; // Unattempted
                if (answer.selectedOption === correctOption) {
                    score += questionInfo.marks;
                }
                else if (test.negativeMarking && questionInfo.negativeMarks > 0) {
                    score -= questionInfo.negativeMarks;
                }
            }
            await database_1.default.submission.update({
                where: { id: submission.id },
                data: { score, totalMarks, gradedAt: new Date() },
            });
            gradedCount++;
        }
        // Close the test
        await database_1.default.test.update({
            where: { id: testId },
            data: { status: 'CLOSED' },
        });
        // Notify the teacher who created the test
        await database_1.default.notification.create({
            data: {
                userId: test.createdById,
                title: 'Test Graded',
                message: `Test "${test.title}" has been auto-graded. ${gradedCount} submissions scored.`,
                link: `/teacher/grade/${testId}`,
            },
        });
        res.json({
            message: `Auto-graded ${gradedCount} submissions`,
            gradedCount,
            testId,
        });
    }
    catch (error) {
        console.error('Auto-grade error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function deleteStudent(req, res) {
    try {
        const id = req.params.id;
        // Check if user exists
        const user = await database_1.default.user.findUnique({ where: { id } });
        if (!user || user.role !== 'STUDENT') {
            res.status(404).json({ error: 'Student not found' });
            return;
        }
        // Delete in transaction
        await database_1.default.$transaction(async (tx) => {
            await tx.submission.deleteMany({ where: { studentId: id } });
            await tx.attendance.deleteMany({ where: { studentId: id } });
            await tx.notification.deleteMany({ where: { userId: id } });
            await tx.remark.deleteMany({ where: { studentId: id } });
            await tx.studentProfile.deleteMany({ where: { userId: id } });
            await tx.user.delete({ where: { id } });
        });
        res.json({ message: 'Student deleted successfully' });
    }
    catch (error) {
        console.error('Delete student error:', error);
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
async function uploadImage(req, res) {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image uploaded' });
            return;
        }
        const fileBuffer = fs_1.default.readFileSync(req.file.path);
        const blob = await (0, blob_1.put)(req.file.originalname, fileBuffer, {
            access: 'public',
        });
        res.status(200).json({ url: blob.url });
    }
    catch (error) {
        console.error('Upload image error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=admin.controller.js.map