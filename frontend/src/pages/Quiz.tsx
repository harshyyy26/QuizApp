
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '@/services/quizService';
import { Question } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { BookOpen, Clock, CheckCircle } from 'lucide-react';
import { QuizQuestion } from '@/types'; // ✅ Import the QuizQuestion type

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const questionsData = await quizService.getQuizQuestions(id);
        // ✅ Transform backend response to match expected structure
        const normalized = questionsData.map((q: any) => ({
          id: q.id,
          question: q.questionText,
          options: [q.optionA, q.optionB, q.optionC, q.optionD],
        }));
        setQuestions(normalized);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load quiz questions',
          variant: 'destructive',
        });
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuestions();
    }
  }, [id, navigate]);

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // Convert selected option indices to their corresponding option values (A/B/C/D)
      const submittedAnswers: string[] = questions.map((q) => {
        const selectedIndex = answers[q.id];
        return ['A', 'B', 'C', 'D'][selectedIndex] || ''; // fallback if unanswered
      });
      const response = await quizService.submitQuizAnswers(id, submittedAnswers);
      setScore(response.data.score); // ✅ use `.data`
      setShowResults(true);
      toast({
        title: 'Success',
        description: 'Quiz submitted successfully!',
      });
    } catch (error: any) {
      console.error("SUBMIT ERROR:", error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit quiz',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No questions available for this quiz.</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2 text-2xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <span>Quiz Completed!</span>
            </CardTitle>
            <CardDescription>
              Here are your results
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="text-6xl font-bold text-purple-600">
              {Math.round((score / questions.length) * 100)}%
            </div>
            <div className="text-xl text-gray-600">
              You scored {score} out of {questions.length} questions correctly
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/leaderboard/${id}`)}
              >
                View Leaderboard
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setAnswers({});
                  setScore(0);
                  setCurrentQuestionIndex(0);
                  setShowResults(false);
                  setSubmitting(false);
                  // Optionally reload questions if you want fresh data
                  // or just reuse current `questions`
                }}
              >
                Retake Quiz
              </Button>

            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          <span className="text-lg font-medium">Quiz Progress</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
      </div>

      <Progress value={progress} className="w-full" />

      <Card>
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
          <CardDescription className="text-lg">
            {currentQuestion.question}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup
            value={answers[currentQuestion.id]?.toString() || ''}
            onValueChange={(value) =>
              handleAnswerChange(currentQuestion.id, parseInt(value))
            }
          >
            {currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label
                  htmlFor={`option-${index}`}
                  className="cursor-pointer flex-1 p-3 rounded-md hover:bg-gray-50 transition-colors"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between items-center">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              variant="outline"
            >
              Previous
            </Button>

            <div className="text-sm text-gray-500">
              {Object.keys(answers).length} of {questions.length} answered
            </div>

            {currentQuestionIndex === questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length === 0}
              >
                {submitting ? 'Submitting...' : 'Submit Quiz'}
              </Button>
            ) : (
              <Button onClick={handleNext}>
                Next
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Quiz;
