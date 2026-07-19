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
exports.login = login;
exports.refreshToken = refreshToken;
exports.getMe = getMe;
exports.changePassword = changePassword;
const database_1 = __importDefault(require("../config/database"));
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
async function login(req, res) {
    try {
        const { emailOrUsername, password } = req.body;
        if (!emailOrUsername || !password) {
            res.status(400).json({ error: 'Email/username and password are required' });
            return;
        }
        // Find user by email or username
        const user = await database_1.default.user.findFirst({
            where: {
                OR: [
                    { email: emailOrUsername },
                    { username: emailOrUsername },
                ],
            },
            include: {
                studentProfile: true,
            },
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ error: 'Account is deactivated. Contact your administrator.' });
            return;
        }
        const isValidPassword = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const tokenPayload = {
            userId: user.id,
            role: user.role,
            email: user.email,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(tokenPayload);
        const refreshToken = (0, jwt_1.generateRefreshToken)(tokenPayload);
        // Determine stream from profile
        const stream = user.studentProfile?.stream || null;
        res.json({
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                stream,
                isActive: user.isActive,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function refreshToken(req, res) {
    try {
        const { refreshToken: token } = req.body;
        if (!token) {
            res.status(400).json({ error: 'Refresh token required' });
            return;
        }
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        // Verify user still exists and is active
        const user = await database_1.default.user.findUnique({
            where: { id: payload.userId },
        });
        if (!user || !user.isActive) {
            res.status(401).json({ error: 'User not found or inactive' });
            return;
        }
        const newTokenPayload = {
            userId: user.id,
            role: user.role,
            email: user.email,
        };
        const accessToken = (0, jwt_1.generateAccessToken)(newTokenPayload);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(newTokenPayload);
        res.json({ accessToken, refreshToken: newRefreshToken });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
}
async function getMe(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.userId },
            include: {
                studentProfile: true,
            },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const { passwordHash, ...safeUser } = user;
        res.json(safeUser);
    }
    catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
async function changePassword(req, res) {
    try {
        if (!req.user) {
            res.status(401).json({ error: 'Not authenticated' });
            return;
        }
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current and new passwords are required' });
            return;
        }
        if (newPassword.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters' });
            return;
        }
        const user = await database_1.default.user.findUnique({
            where: { id: req.user.userId },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const isValid = await (0, password_1.comparePassword)(currentPassword, user.passwordHash);
        if (!isValid) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }
        const { hashPassword } = await Promise.resolve().then(() => __importStar(require('../utils/password')));
        const newHash = await hashPassword(newPassword);
        await database_1.default.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
        });
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=auth.controller.js.map