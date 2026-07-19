import { Request, Response } from 'express';
export declare function getTeacherDashboard(req: Request, res: Response): Promise<void>;
export declare function getTeacherTests(req: Request, res: Response): Promise<void>;
export declare function createTest(req: Request, res: Response): Promise<void>;
export declare function updateTest(req: Request, res: Response): Promise<void>;
export declare function publishTest(req: Request, res: Response): Promise<void>;
export declare function addQuestion(req: Request, res: Response): Promise<void>;
export declare function updateQuestion(req: Request, res: Response): Promise<void>;
export declare function deleteQuestion(req: Request, res: Response): Promise<void>;
export declare function getTestQuestions(req: Request, res: Response): Promise<void>;
export declare function getTeacherReports(req: Request, res: Response): Promise<void>;
export declare function getGradedTests(req: Request, res: Response): Promise<void>;
export declare function getTestStudentScores(req: Request, res: Response): Promise<void>;
export declare function addRemark(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=teacher.controller.d.ts.map