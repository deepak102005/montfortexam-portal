import { Request, Response } from 'express';
import { put } from '@vercel/blob';
import fs from 'fs';
import prisma from '../config/database';

export async function getResources(req: Request, res: Response): Promise<void> {
  try {
    const { type, subject, stream } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (subject) where.subject = subject;
    if (stream) where.stream = stream;

    const resources = await prisma.resource.findMany({
      where,
      include: {
        uploadedBy: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(resources);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function uploadResource(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const userRole = req.user!.role;
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

    const fileBuffer = fs.readFileSync(req.file.path);
    const blob = await put(req.file.originalname, fileBuffer, {
      access: 'public',
    });

    const resource = await prisma.resource.create({
      data: {
        type,
        title,
        description,
        subject,
        stream,
        fileUrl: blob.url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        uploadedById: userId,
        uploadedByRole: userRole as any,
      },
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Upload resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteResource(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const userRole = req.user!.role;

    if (userRole !== 'ADMIN') {
      res.status(403).json({ error: 'Only admins can delete resources' });
      return;
    }

    await prisma.resource.delete({ where: { id } });
    res.json({ message: 'Resource deleted' });
  } catch (error) {
    console.error('Delete resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
