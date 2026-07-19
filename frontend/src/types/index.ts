// Shared TypeScript types for the LMS frontend

export type Role = 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
export type Stream = 'MPC' | 'BIPC';
export type Subject = 'MATHS' | 'PHYSICS' | 'CHEMISTRY' | 'BIOLOGY';
export type TestStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type ResourceType = 'BOOK' | 'QUESTION_BANK' | 'ANSWER_SCRIPT';

export interface User {
  id: string;
  name: string;
  email: string;
  username: string;
  role: Role;
  stream: Stream | null;
  isActive: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface StudentProfile {
  id: string;
  userId: string;
  stream: Stream;
  rollNumber: string;
  grade?: '11' | '12';
  phone?: string;
  guardianContact?: string;
}


export interface UserWithProfile extends User {
  studentProfile?: StudentProfile;
}

export interface Test {
  id: string;
  title: string;
  grade: string;
  stream: 'MPC' | 'BIPC';
  duration: number;
  totalMarks: number;
  scheduledAt?: string;
  status: TestStatus;
  negativeMarking: boolean;
  negativeMarks: number;
  createdById: string;
  createdBy?: { id: string; name: string };
  createdAt: string;
  _count?: { submissions: number; questions: number };
  answerKey?: { id: string } | null;
  hasSubmitted?: boolean;
  submission?: { id: string; submittedAt: string; score?: number } | null;
}

export interface Question {
  id: string;
  testId: string;
  questionNumber: number;
  text: string;
  imageUrl?: string;
  options: string[];
  correctOption?: number; // Only available in certain contexts
  marks: number;
  negativeMarks: number;
}

export interface Submission {
  id: string;
  testId: string;
  studentId: string;
  answers: { questionId: string; selectedOption: number | null }[];
  score?: number;
  totalMarks?: number;
  gradedAt?: string;
  submittedAt: string;
}

export interface Resource {
  id: string;
  type: ResourceType;
  title: string;
  description?: string;
  subject: Subject;
  stream: Stream;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  uploadedBy?: { id: string; name: string; role: Role };
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Remark {
  id: string;
  teacherId: string;
  teacher?: { name: string };
  studentId: string;
  student?: { name: string };
  testId?: string;
  test?: { title: string };
  note: string;
  createdAt: string;
}

// Dashboard types
export interface AdminDashboardStats {
  teachers: { total: number; active: number; mpc: number; bipc: number };
  students: { total: number; active: number; mpc: number; bipc: number };
  totalTests: number;
  recentActivity: { id: string; name: string; role: Role; createdAt: string; isActive: boolean }[];
}

export interface TeacherDashboard {
  teacher: { name: string; stream: Stream; subjects: Subject[] };
  stats: { totalStudents: number; testsCreated: number; pendingGrading: number };
  recentRemarks: Remark[];
  upcomingTests: Test[];
}

export interface StudentDashboard {
  student: { name: string; stream: Stream; rollNumber: string };
  performanceTrend: {
    testId: string;
    title: string;
    subject: Subject;
    score: number;
    totalMarks: number;
    date: string;
  }[];
  upcomingExams: Test[];
  messages: Notification[];
  remarks: Remark[];
  nextExam: Test | null;
}

export interface SubjectProgress {
  subject: Subject;
  testsAttempted: number;
  progress: number;
  totalScore: number;
  totalMaxMarks: number;
}

export interface TestReport {
  testTitle: string;
  subject: Subject;
  score: number;
  totalMarks: number;
  rank: number;
  totalStudents: number;
  questions: {
    questionNumber: number;
    text: string;
    options: string[];
    correctOption: number;
    selectedOption: number | null;
    isCorrect: boolean;
    marks: number;
    marksObtained: number;
  }[];
}

// Subject color mapping
export const SUBJECT_COLORS: Record<Subject, { color: string; light: string; dark: string; className: string }> = {
  MATHS: { color: '#3b82f6', light: '#dbeafe', dark: '#1e40af', className: 'subject-maths' },
  PHYSICS: { color: '#8b5cf6', light: '#ede9fe', dark: '#5b21b6', className: 'subject-physics' },
  CHEMISTRY: { color: '#22c55e', light: '#dcfce7', dark: '#15803d', className: 'subject-chemistry' },
  BIOLOGY: { color: '#14b8a6', light: '#ccfbf1', dark: '#0f766e', className: 'subject-biology' },
};

export const SUBJECT_ICONS: Record<Subject, string> = {
  MATHS: '∑',
  PHYSICS: '⚛',
  CHEMISTRY: '⚗',
  BIOLOGY: '🧬',
};

export const STREAM_SUBJECTS: Record<Stream, Subject[]> = {
  MPC: ['MATHS', 'PHYSICS', 'CHEMISTRY'],
  BIPC: ['BIOLOGY', 'PHYSICS', 'CHEMISTRY'],
};
