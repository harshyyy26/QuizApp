export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface AdminQuiz {
  id: string;
  subject: string;
}


export interface Quiz {
  id: string;
  subject: string;
  questionCount: number;
  createdAt: string;
  questions: Question[]; // ✅ Add this line
}

//for admin dashboard
export interface Question {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: string; // A/B/C/D
}

//for user dashboard (quiz page)
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}


export interface QuizAttempt {
  quizId: string;
  quizSubject: string;
  score: number;
  totalQuestions: number;
  answers: string[];
  attemptedAt: string; // ✅ correct key from backend
}


export interface LeaderboardEntry {
  username: string;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}
