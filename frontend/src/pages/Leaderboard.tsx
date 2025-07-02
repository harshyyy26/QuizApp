
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { quizService } from '@/services/quizService';
import { LeaderboardEntry } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Leaderboard = () => {
  const { id } = useParams<{ id: string }>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const leaderboardData = await quizService.getLeaderboard(id);
        setLeaderboard(leaderboardData);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load leaderboard',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLeaderboard();
    }
  }, [id]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">Top performers for this quiz</p>
        </div>
        <Button asChild variant="outline">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </Button>
      </div>

      {leaderboard.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No attempts yet. Be the first to take this quiz!</p>
            <Button asChild className="mt-4">
              <Link to={`/quiz/${id}`}>Take Quiz</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {leaderboard.map((entry, index) => {
            const rank = index + 1;
            const percentage = Math.round((entry.score / entry.totalQuestions) * 100);
            
            return (
              <Card
                key={index}
                className={`transition-all hover:shadow-md ${
                  rank <= 3 ? 'border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                        {getRankIcon(rank)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entry.username}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(entry.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {percentage}%
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.score}/{entry.totalQuestions} correct
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
