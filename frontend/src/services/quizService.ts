import api from '@/lib/axios';
import axios from 'axios';
import { getToken } from '@/utils/auth';

import { Quiz, Question, QuizAttempt, LeaderboardEntry, AdminQuiz } from '@/types';

const API_BASE_URL = 'http://localhost:8080';

export const quizService = {

  // User endpoints
  getAllQuizzes: async (): Promise<Quiz[]> => {
    const response = await api.get('/user/quizSubjects');
    return response.data;
  },

  getQuizQuestions: async (quizId: string): Promise<Question[]> => {
    const response = await api.get(`/user/quiz/${quizId}`);
    return response.data;
  },

  // submitQuizAnswers: async (quizId: string, answers: Record<number, number>): Promise<{ score: number }> => {
  //   const response = await api.post(`user/solve/${quizId}`, { answers });
  //   return response.data;
  // },

  submitQuizAnswers: async (quizId: string, answers: string[]) => {
    const token = getToken(); // ensure this is set
    return api.post(`/user/solve/${quizId}`, answers);
  },

  getUserAttempts: async (): Promise<QuizAttempt[]> => {
    const response = await api.get('/user/attempts');
    return response.data;
  },

  getLeaderboard: async (quizId: string): Promise<LeaderboardEntry[]> => {
    const response = await api.get(`/user/leaderboard/${quizId}`);
    return response.data;
  },

  // Admin endpoints
  createQuiz: async (subject: string): Promise<Quiz> => {
    const response = await api.post('/admin/addQuiz', { subject });
    return response.data;
  },

  addQuestion: async (
    quizId: string,
    question: string,
    options: string[],
    correctAnswerIndex: number
  ): Promise<Question> => {
    const payload = {
      id: Date.now().toString(), // or generate UUID
      questionText: question,
      optionA: options[0] || null,
      optionB: options[1] || null,
      optionC: options[2] || null,
      optionD: options[3] || null,
      correctAnswer: ["A", "B", "C", "D"][correctAnswerIndex],
    };

    const response = await api.put(`/admin/addQuestion/${quizId}`, payload);
    return response.data;
  },


  deleteQuiz: async (quizId: string): Promise<void> => {
    await api.delete(`/admin/deleteQuiz/${quizId}`);
  },

  getAllUsers: async (): Promise<any[]> => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/admin/users/${userId}`);
  },

  getAdminQuizSubjects: async (): Promise<AdminQuiz[]> => {
    const response = await api.get('/admin/quizzes');
    return response.data;
  },

  //get all ques of a quiz
  getQuizById: async (quizId: string): Promise<Quiz> => {
    const response = await api.get(`/admin/quiz/${quizId}`);
    return response.data;
  },

  updateQuestion: async (quizId: string, questionId: string, updatedQuestion: any) => {
    const token = getToken(); // ⬅️ Make sure you're attaching JWT token if needed
    console.log("Token used:", token);
    return api.put(
      `${API_BASE_URL}/admin/updateQuestion/${quizId}/${questionId}`,
      updatedQuestion,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  deleteQuestion: async (quizId: string, questionId: string) => {
    const token = getToken();
    return api.delete(
      `${API_BASE_URL}/admin/deleteQuestion/${quizId}/${questionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }


};
