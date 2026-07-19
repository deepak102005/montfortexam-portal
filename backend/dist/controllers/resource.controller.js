"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResources = getResources;
exports.uploadResource = uploadResource;
exports.deleteResource = deleteResource;
const database_1 = __importDefault(require("../config/database"));
async function getResources(req, res) {
    try {
        const { type, subject, stream } = req.query;
        const where = {};
        if (type)
            where.type = type;
        if (subject)
            where.subject = subject;
        if (stream)
            where.stream = stream;
        const resources = await database_1.default.resource.findMany({
            where,
            include: {
                uploadedBy: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(resources);
    }
    catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function uploadResource(req, res) {
    try {
        const userId = req.user.userId;
        const userRole = req.user.role;
        const { type, title, description, subject, stream } = req.body;
        if (!req.file) {
            res.status(400).json({ error: 'File is required' });
            return;
        }
        if (!type || !title || !subject || !stream) {
            res.status(400).json({ error: 'Missing required fields (type, title, subject, stream)' });
            return;
        }
        // Role-based upload restrictions
        if (userRole === 'TEACHER' && !['ANSWER_SCRIPT'].includes(type)) {
            res.status(403).json({ error: 'Teachers can only upload answer scripts' });
            return;
        }
        if (userRole === 'STUDENT') {
            res.status(403).json({ error: 'Students cannot upload resources' });
            return;
        }
        const resource = await database_1.default.resource.create({
            data: {
                type,
                title,
                description,
                subject,
                stream,
                fileUrl: `/uploads/${req.file.filename}`,
                fileName: req.file.originalname,
                fileSize: req.file.size,
                uploadedById: userId,
                uploadedByRole: userRole,
            },
        });
        res.status(201).json(resource);
    }
    catch (error) {
        console.error('Upload resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function deleteResource(req, res) {
    try {
        const id = req.params.id;
        const userRole = req.user.role;
        if (userRole !== 'ADMIN') {
            res.status(403).json({ error: 'Only admins can delete resources' });
            return;
        }
        await database_1.default.resource.delete({ where: { id } });
        res.json({ message: 'Resource deleted' });
    }
    catch (error) {
        console.error('Delete resource error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=resource.controller.js.map