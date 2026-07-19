import { Request, Response } from 'express';
export declare function getDashboardStats(req: Request, res: Response): Promise<void>;
export declare function getStudents(req: Request, res: Response): Promise<void>;
export declare function createStudent(req: Request, res: Response): Promise<void>;
export declare function bulkCreateStudents(req: Request, res: Response): Promise<void>;
export declare function toggleStudentActive(req: Request, res: Response): Promise<void>;
export declare function updateStudent(req: Request, res: Response): Promise<void>;
export declare function createTest(req: Request, res: Response): Promise<void>;
export declare function uploadPaper(req: Request, res: Response): Promise<void>;
export declare function getAllTests(req: Request, res: Response): Promise<void>;
export declare function getTestById(req: Request, res: Response): Promise<void>;
export declare function submitAnswerKey(req: Request, res: Response): Promise<void>;
export declare function autoGradeTest(req: Request, res: Response): Promise<void>;
export declare function deleteStudent(req: Request, res: Response): Promise<void>;
export declare function getTestQuestions(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map