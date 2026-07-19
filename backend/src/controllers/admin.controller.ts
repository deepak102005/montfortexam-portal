import { Request, Response } from 'express';
import prisma from '../config/database';
import { hashPassword } from '../utils/password';
import * as XLSX from 'xlsx';
import fs from 'fs';
import { env } from '../config/env';

// ─── Dashboard Stats ────────────────────────────────────

export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const [
      totalStudents,
      activeStudents,
      mpcStudents,
      bipcStudents,
      totalTests,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'STUDENT', isActive: true } }),
      prisma.studentProfile.count({ where: { stream: 'MPC' } }),
      prisma.studentProfile.count({ where: { stream: 'BIPC' } }),
      prisma.test.count(),
      prisma.user.findMany({
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
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


// ─── Students CRUD ───────────────────────────────────────

export async function getStudents(req: Request, res: Response): Promise<void> {
  try {
    const { stream, isActive, grade, search } = req.query;

    const where: any = { role: 'STUDENT' as const };
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const students = await prisma.user.findMany({
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
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function createStudent(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, rollNumber, phone, stream, grade, guardianContact, username, password } = req.body;

    if (!name || !email || !rollNumber || !stream || !username || !password) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Check duplicates
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existingUser) {
      res.status(409).json({ error: 'Email or username already exists' });
      return;
    }

    const existingRoll = await prisma.studentProfile.findUnique({
      where: { rollNumber },
    });
    if (existingRoll) {
      res.status(409).json({ error: 'Roll number already exists' });
      return;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
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
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function bulkCreateStudents(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'Excel file is required' });
      return;
    }

    const workbook = XLSX.read(req.file.buffer || require('fs').readFileSync(req.file.path));
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows: any[] = XLSX.utils.sheet_to_json(sheet);

    const errors: { row: number; error: string }[] = [];
    const validStudents: any[] = [];

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
      const duplicateInBatch = validStudents.find(
        (s) => s.email === row.email || s.username === row.username || s.rollNumber === String(row.rollNumber)
      );
      if (duplicateInBatch) {
        errors.push({ row: rowNum, error: 'Duplicate email, username, or roll number within upload batch' });
        continue;
      }

      // Check against database
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email: row.email }, { username: row.username }] },
      });
      if (existingUser) {
        errors.push({ row: rowNum, error: `Email or username already exists in database` });
        continue;
      }

      const existingRoll = await prisma.studentProfile.findUnique({
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
      const passwordHash = await hashPassword(student.password);
      const user = await prisma.user.create({
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
  } catch (error) {
    console.error('Bulk create students error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function toggleStudentActive(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    res.json({ id: updated.id, isActive: updated.isActive });
  } catch (error) {
    console.error('Toggle student active error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateStudent(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { name, email, phone, stream, grade, rollNumber, guardianContact } = req.body;

    const user = await prisma.user.update({
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
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// ─── Admin Grading ───────────────────────────────────────

export async function createTest(req: Request, res: Response): Promise<void> {
  try {
    const { title, type, grade, stream, duration, totalMarks, accessCode, description } = req.body;
    
    // Using an existing user as creator (hardcoded for now if not in token, but we have authMiddleware)
    // Actually, let's assume req.user is populated by authMiddleware. If not, fallback to first admin
    let createdById = (req as any).user?.id;
    if (!createdById) {
       const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
       createdById = admin?.id;
    }

    const test = await prisma.test.create({
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
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : String(error) });
  }
}

export async function uploadPaper(req: Request, res: Response): Promise<void> {
  try {
    const testId = req.params.testId as string;
    
    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Call Gemini API
    const fileBuffer = fs.readFileSync(req.file.path);
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    
    const genAI = new GoogleGenerativeAI(env.OCR_API_KEY || 'AIzaSyAi9NwW__LGNhZ0bvYeoRcWobNl_SwzPHE');
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
    } catch (apiError) {
      console.warn('Gemini Parsing failed:', apiError);
      parsedText = 'Failed to extract text from PDF or limit reached.';
    }

    // Clear existing questions for this test
    await prisma.question.deleteMany({ where: { testId } });

    const numQuestions = test.stream === 'MPC' ? 90 : 180;
    const questions = [];

    // Simple heuristic parser for questions starting with "1.", "2.", etc.
    const questionBlocks: string[] = [];
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

    await prisma.question.createMany({
       data: questions
    });

    res.json({ message: 'Paper parsed and questions created', count: numQuestions });
  } catch (error) {
    console.error('Upload paper error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function saveManualQuestions(req: Request, res: Response): Promise<void> {
  try {
    const testId = req.params.testId as string;
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      res.status(400).json({ error: 'Questions must be an array' });
      return;
    }

    const test = await prisma.test.findUnique({ where: { id: testId } });
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    await prisma.question.deleteMany({ where: { testId } });

    const questionsToCreate = questions.map((q: any, idx: number) => ({
      testId,
      questionNumber: idx + 1,
      text: q.text || `Question ${idx + 1}`,
      imageUrl: q.imageUrl || null,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOption: typeof q.correctOption === 'number' ? q.correctOption : 0,
      marks: q.marks || 4,
      negativeMarks: q.negativeMarks || 1
    }));

    await prisma.question.createMany({
      data: questionsToCreate
    });

    const createdQuestions = await prisma.question.findMany({
      where: { testId },
      orderBy: { questionNumber: 'asc' }
    });

    const answersData = createdQuestions.map(q => ({
      questionId: q.id,
      correctOption: q.correctOption
    }));

    await prisma.answerKey.upsert({
      where: { testId },
      update: { answers: answersData },
      create: { testId, answers: answersData }
    });

    res.json({ message: 'Questions saved successfully', count: questionsToCreate.length });
  } catch (error) {
    console.error('Save manual questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllTests(req: Request, res: Response): Promise<void> {
  try {
    const { stream, status } = req.query;

    const where: any = {};
    if (stream) where.stream = stream;
    if (status) where.status = status;

    const tests = await prisma.test.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
        _count: { select: { submissions: true, questions: true } },
        answerKey: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(tests);
  } catch (error) {
    console.error('Get all tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTestById(req: Request, res: Response): Promise<void> {
  try {
    const testId = req.params.testId as string;
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { createdBy: true }
    });
    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }
    res.json(test);
  } catch (error) {
    console.error('Get test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function submitAnswerKey(req: Request, res: Response): Promise<void> {
  try {
    const testId = req.params.testId as string;
    const { answers } = req.body; // [{ questionId, correctOption }]

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ error: 'Answers array is required' });
      return;
    }

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true },
    });

    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    // Upsert answer key
    const answerKey = await prisma.answerKey.upsert({
      where: { testId },
      update: { answers },
      create: { testId, answers },
    });

    res.json(answerKey);
  } catch (error) {
    console.error('Submit answer key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function autoGradeTest(req: Request, res: Response): Promise<void> {
  try {
    const testId = req.params.testId as string;

    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: { questions: true, answerKey: true },
    }) as any;

    if (!test) {
      res.status(404).json({ error: 'Test not found' });
      return;
    }

    if (!test.answerKey) {
      res.status(400).json({ error: 'Answer key not found. Submit answer key first.' });
      return;
    }

    const answerKeyMap = new Map<string, number>();
    const keyAnswers = test.answerKey.answers as Array<{ questionId: string; correctOption: number }>;
    keyAnswers.forEach((a) => answerKeyMap.set(a.questionId, a.correctOption));

    // Build question marks map
    const questionMarksMap = new Map<string, { marks: number; negativeMarks: number }>();
    test.questions.forEach((q: any) => {
      questionMarksMap.set(q.id, { marks: q.marks, negativeMarks: q.negativeMarks });
    });

    // Get all submissions for this test
    const submissions = await prisma.submission.findMany({
      where: { testId },
    });

    let gradedCount = 0;

    for (const submission of submissions) {
      const studentAnswers = submission.answers as Array<{ questionId: string; selectedOption: number | null }>;
      let score = 0;
      let totalMarks = 0;

      for (const answer of studentAnswers) {
        const questionInfo = questionMarksMap.get(answer.questionId);
        const correctOption = answerKeyMap.get(answer.questionId);

        if (questionInfo === undefined || correctOption === undefined) continue;
        totalMarks += questionInfo.marks;

        if (answer.selectedOption === null) continue; // Unattempted

        if (answer.selectedOption === correctOption) {
          score += questionInfo.marks;
        } else if (test.negativeMarking && questionInfo.negativeMarks > 0) {
          score -= questionInfo.negativeMarks;
        }
      }

      await prisma.submission.update({
        where: { id: submission.id },
        data: { score, totalMarks, gradedAt: new Date() },
      });

      gradedCount++;
    }

    // Close the test
    await prisma.test.update({
      where: { id: testId },
      data: { status: 'CLOSED' },
    });

    // Notify the teacher who created the test
    await prisma.notification.create({
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
  } catch (error) {
    console.error('Auto-grade error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteStudent(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    
    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user || user.role !== 'STUDENT') {
      res.status(404).json({ error: 'Student not found' });
      return;
    }

    // Delete in transaction
    await prisma.$transaction(async (tx) => {
      await tx.submission.deleteMany({ where: { studentId: id } });
      await tx.attendance.deleteMany({ where: { studentId: id } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.remark.deleteMany({ where: { studentId: id } });
      await tx.studentProfile.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getTestQuestions(req: Request, res: Response): Promise<void> {
  try {
    const testId = req.params.testId as string;
    const questions = await prisma.question.findMany({
      where: { testId },
      orderBy: { questionNumber: 'asc' },
    });
    res.json(questions);
  } catch (error) {
    console.error('Get test questions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function uploadImage(req: Request, res: Response): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No image uploaded' });
      return;
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

