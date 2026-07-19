"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminAttendance = getAdminAttendance;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getAdminAttendance(req, res) {
    try {
        const { date } = req.query;
        if (!date) {
            res.status(400).json({ error: 'Date is required' });
            return;
        }
        const queryDate = new Date(date);
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
        const attendanceData = students.map(s => ({
            id: s.id,
            name: s.name,
            rollNumber: s.studentProfile?.rollNumber,
            stream: s.studentProfile?.stream,
            grade: s.studentProfile?.grade,
            present: s.attendances.length > 0 ? s.attendances[0].present : false,
        }));
        res.json(attendanceData);
    }
    catch (error) {
        console.error('Get admin attendance error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=attendance.controller.js.map