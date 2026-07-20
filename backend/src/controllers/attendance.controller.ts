import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAdminAttendance(req: Request, res: Response): Promise<void> {
  try {
    const { date } = req.query;
    if (!date) {
      res.status(400).json({ error: 'Date is required' });
      return;
    }

    const queryDate = new Date(date as string);
    queryDate.setUTCHours(0, 0, 0, 0);

    const students = await prisma.user.findMany({
      where: { role: 'STUDENT', isActive: true },
      include: {
        studentProfile: true,
        attendances: {
          where: { date: queryDate },
        },
      },
    });

    const attendanceData = students.map((s: any) => ({
      id: s.id,
      name: s.name,
      rollNumber: s.studentProfile?.rollNumber,
      stream: s.studentProfile?.stream,
      grade: s.studentProfile?.grade,
      present: s.attendances.length > 0 ? s.attendances[0].present : false,
    }));

    res.json(attendanceData);
  } catch (error) {
    console.error('Get admin attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

