export type Role = 'admin' | 'teacher' | 'student' | 'technician' | 'parent';

export type User = {
  id: string;
  email?: string; // For Google login
  username?: string; // For auto-generated student login
  password?: string;
  role: Role;
  fullName: string;
  assignedClassId?: string;
  coins?: number;
  ownedGifs?: string[];
  currentGif?: string;
  viewedContents?: string[];
  streakCount?: number;
  lastVisitDate?: string;
  visitedDates?: string[];
  streakFreezeCount?: number;
  frozenDates?: string[];
  claimedFreeFreeze?: boolean;
  examDate?: string;
  linkedStudentId?: string; // For parent mode
  phone?: string;
  avatarUrl?: string;   // URL or base64 of user's avatar image
  birthYear?: string;   // Birth year e.g. "2012"
  status?: 'online' | 'offline';
  lastActive?: string;  // ISO string
};

export type StoreGif = {
  id: string;
  url: string;
  name: string;
  price: number;
};

export type SubjectRoom = {
  id: string;
  name: string;
  description: string;
  iconName: string;
  color: string;
  contents: { 
    title: string; 
    type: 'doc' | 'video' | 'interactive' | 'link'; 
    url: string; 
    grade?: '6' | '7' | '8' | '9' | 'all'; 
    semester?: '1' | '2' | 'all';
    fileName?: string;
    fileSize?: string;
    fileData?: string;
  }[];
};

export type StudentProfile = {
  id: string;
  fullName: string;
  dob: string;
  classId: string;
  achievements: string[];
  trainingScore: number;
  certificates: string[];
  userId?: string; // Link to user account
  parentName?: string;
  parentEmail?: string;
  parentPhone?: string;
};

export type DigitalClass = {
  id: string;
  name: string;
  teacher: string;
  teacherEmail?: string;
  studentsCount: number;
  password?: string;
  requireFaceId?: boolean;
  faceIdData?: number[];
  teacherFaceImage?: string; // Stored image from first scan
  schedule: { day: string; morning: string[]; afternoon: string[] }[];
  announcements: { id: string; title: string; date: string; content: string; type: string; from: string }[];
  students: StudentProfile[];
};

export type StaffProfile = {
  id: string;
  fullName: string;
  title: string; // e.g. "Hiệu trưởng", "Giáo viên Toán"
  department: 'board' | 'teaching' | 'technician' | 'other';
  email: string;
  phone?: string;
  avatar?: string;
};

export type DashboardStats = {
  totalVisits: number;
  activeStudents: number;
  activeRooms: number;
  qrHours: number;
};

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  userId?: string; // If undefined, targeted at all logic
};

export type QA = {
  id: string;
  question: string;
  subject: string;
  teacher: string;
  date: string;
  status: 'answered' | 'waiting';
  answer?: string;
  likes: number;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'hard';
};

export type QuizResult = {
  studentId: string;
  studentName: string;
  timeTaken: number;
  correctCount: number;
  incorrectCount: number;
  date: string;
};

export type LearningApp = {
  id: string;
  name: string;
  url: string;
  logo: string; // URL or base64
  createdAt: string;
};


