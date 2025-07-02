
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { quizService } from '@/services/quizService';
import { Quiz, QuizAttempt } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Clock, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from "@/hooks/useAuth"; // Adjust the path if needed


const Dashboard = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // This gives you { id, username, email, roles }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesData, attemptsData] = await Promise.all([
          quizService.getAllQuizzes(),
          quizService.getUserAttempts(),
        ]);
        setQuizzes(quizzesData);
        setAttempts(attemptsData);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const recentAttempts = attempts.slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Hello {user?.username ? user.username.charAt(0).toUpperCase() + user.username.slice(1) : "User"}👋</h1>
        <p className="text-gray-600">Choose a quiz to test your knowledge!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Quizzes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quizzes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quiz Attempts</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attempts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {attempts.length > 0
                ? Math.round(
                  attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.totalQuestions) * 100, 0) /
                  attempts.length
                )
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Quizzes */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Quizzes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  <span>{quiz.subject}</span>
                </CardTitle>
                <CardDescription>
                  {quiz.questionCount} questions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <Button asChild className="w-full mr-2">
                    <Link to={`/quiz/${quiz.id}`}>Start Quiz</Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full ml-2">
                    <Link to={`/leaderboard/${quiz.id}`}>Leaderboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {quizzes.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No quizzes available yet.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Attempts */}
      {attempts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Attempts</h2>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200">
                {[...attempts]
                  .sort(
                    (a, b) =>
                      new Date(b.attemptedAt).getTime() -
                      new Date(a.attemptedAt).getTime()
                  )
                  .slice(0, 10)
                  .map((attempt, index) => {
                    const subject =
                      quizzes.find((quiz) => quiz.id === attempt.quizId)?.subject ||
                      'Unknown Quiz';

                    return (
                      <div
                        key={index}
                        className="p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{subject}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(attempt.attemptedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {attempt.score}/{attempt.totalQuestions}
                          </p>
                          <p className="text-sm text-gray-500">
                            {Math.round(
                              (attempt.score / attempt.totalQuestions) * 100
                            )}
                            %
                          </p>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
