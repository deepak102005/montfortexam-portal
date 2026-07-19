"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdmins = getAdmins;
exports.createAdmin = createAdmin;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("../config/database"));
async function getAdmins(req, res) {
    try {
        const admins = await database_1.default.user.findMany({
            where: { role: 'ADMIN' },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(admins);
    }
    catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Failed to fetch admins' });
    }
}
async function createAdmin(req, res) {
    try {
        const { name, email, username, password } = req.body;
        if (!name || !email || !username || !password) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }
        // Check if user already exists
        const existingUser = await database_1.default.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });
        if (existingUser) {
            res.status(400).json({ error: 'Email or username already exists' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const admin = await database_1.default.user.create({
            data: {
                name,
                email,
                username,
                passwordHash,
                role: 'ADMIN',
                isActive: true,
            },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                role: true,
                createdAt: true,
            },
        });
        res.status(201).json(admin);
    }
    catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Failed to create admin' });
    }
}
//# sourceMappingURL=superadmin.controller.js.map