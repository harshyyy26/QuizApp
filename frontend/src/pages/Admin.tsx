import { useState, useEffect } from 'react';
import { quizService } from '@/services/quizService';
import { Quiz, Question, AdminQuiz } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2, Users, BookOpen, Settings } from 'lucide-react';

const Admin = () => {
  const [quizzes, setQuizzes] = useState<AdminQuiz[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newQuizSubject, setNewQuizSubject] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState({
    question: '',
    option1: '',
    option2: '',
    option3: '',
    option4: '',
    correctAnswer: 0,
  });

  const [selectedQuizForView, setSelectedQuizForView] = useState<Quiz | null>(null);
  const [viewingQuestions, setViewingQuestions] = useState(false);
  //recent
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctAnswer: '',
  });



  useEffect(() => {
    fetchData();
  }, []);

  //recent
  const handleViewQuestions = async (quizId: string) => {
    try {
      const quiz = await quizService.getQuizById(quizId);
      setSelectedQuizForView(quiz);
      setViewingQuestions(true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load quiz questions',
        variant: 'destructive',
      });
    }
  };


  const fetchData = async () => {
    try {
      const [quizzesData, usersData] = await Promise.all([
        quizService.getAdminQuizSubjects(), // 🔄 Using admin-specific subject list
        quizService.getAllUsers(),
      ]);
      setQuizzes(quizzesData);
      setUsers(usersData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizSubject.trim()) return;

    try {
      await quizService.createQuiz(newQuizSubject);
      setNewQuizSubject('');
      fetchData();
      toast({
        title: 'Success',
        description: 'Quiz created successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create quiz',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;

    try {
      await quizService.deleteQuiz(quizId);
      fetchData();
      toast({
        title: 'Success',
        description: 'Quiz deleted successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete quiz',
        variant: 'destructive',
      });
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuiz || !newQuestion.question.trim()) return;

    const options = [
      newQuestion.option1,
      newQuestion.option2,
      newQuestion.option3,
      newQuestion.option4,
    ].filter(option => option.trim());

    if (options.length < 2) {
      toast({
        title: 'Error',
        description: 'Please provide at least 2 options',
        variant: 'destructive',
      });
      return;
    }

    try {
      await quizService.addQuestion(
        selectedQuiz,
        newQuestion.question,
        options,
        newQuestion.correctAnswer
      );
      setNewQuestion({
        question: '',
        option1: '',
        option2: '',
        option3: '',
        option4: '',
        correctAnswer: 0,
      });
      fetchData();
      toast({
        title: 'Success',
        description: 'Question added successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add question',
        variant: 'destructive',
      });
    }
  };

  const handleEditSave = async (questionId: string) => {
    if (!selectedQuizForView) return;

    try {
      await quizService.updateQuestion(selectedQuizForView.id, questionId, editForm);
      toast({
        title: 'Success',
        description: 'Question updated successfully!',
      });

      setEditingQuestionId(null);
      // Refresh the specific quiz view
      const updatedQuiz = await quizService.getQuizById(selectedQuizForView.id);
      setSelectedQuizForView(updatedQuiz);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update question',
        variant: 'destructive',
      });
    }
  };


  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await quizService.deleteUser(userId);
      fetchData();
      toast({
        title: 'Success',
        description: 'User deleted successfully!',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete user',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!selectedQuizForView) return;
    const confirmDelete = confirm("Are you sure you want to delete this question?");
    if (!confirmDelete) return;

    try {
      await quizService.deleteQuestion(selectedQuizForView.id, questionId);
      toast({
        title: 'Success',
        description: 'Question deleted successfully!',
      });

      const updatedQuiz = await quizService.getQuizById(selectedQuizForView.id);
      setSelectedQuizForView(updatedQuiz);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete question',
        variant: 'destructive',
      });
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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
          <Settings className="h-8 w-8 text-purple-600" />
          <span>Admin Dashboard</span>
        </h1>
        <p className="text-gray-600">Manage quizzes and users</p>
      </div>

      <Tabs defaultValue="quizzes" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quizzes" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Quiz Management</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quizzes" className="space-y-6">
          {/* Create Quiz Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create New Quiz</span>
              </CardTitle>
              <CardDescription>
                Add a new quiz subject
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateQuiz} className="flex space-x-4">
                <div className="flex-1">
                  <Input
                    placeholder="Enter quiz subject"
                    value={newQuizSubject}
                    onChange={(e) => setNewQuizSubject(e.target.value)}
                  />
                </div>
                <Button type="submit">Create Quiz</Button>
              </form>
            </CardContent>
          </Card>

          {/* Add Question Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Question to Quiz</CardTitle>
              <CardDescription>
                Select a quiz and add questions to it
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <Label htmlFor="quiz-select">Select Quiz</Label>
                  <Select
                    value={selectedQuiz?.toString() || ''}
                    onValueChange={(value) => setSelectedQuiz(value)}
                  >
                    <SelectTrigger id="quiz-select"> {/* ✅ add id here */}
                      <SelectValue placeholder="Choose a quiz" />
                    </SelectTrigger>
                    <SelectContent>
                      {quizzes.map((quiz) => (
                        <SelectItem key={quiz.id} value={quiz.id.toString()}>
                          {quiz.subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>


                <div>
                  <Label htmlFor="question">Question</Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question"
                    value={newQuestion.question}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, question: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="option1">Option 1</Label>
                    <Input
                      id="option1"
                      placeholder="First option"
                      value={newQuestion.option1}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, option1: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="option2">Option 2</Label>
                    <Input
                      id="option2"
                      placeholder="Second option"
                      value={newQuestion.option2}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, option2: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="option3">Option 3 (Optional)</Label>
                    <Input
                      id="option3"
                      placeholder="Third option"
                      value={newQuestion.option3}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, option3: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="option4">Option 4 (Optional)</Label>
                    <Input
                      id="option4"
                      placeholder="Fourth option"
                      value={newQuestion.option4}
                      onChange={(e) => setNewQuestion(prev => ({ ...prev, option4: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="correct-answer">Correct Answer</Label>
                  <Select
                    value={newQuestion.correctAnswer.toString()}
                    onValueChange={(value) =>
                      setNewQuestion((prev) => ({ ...prev, correctAnswer: Number(value) }))
                    }
                  >
                    <SelectTrigger id="correct-answer"> {/* ✅ add id here */}
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Option 1</SelectItem>
                      <SelectItem value="1">Option 2</SelectItem>
                      <SelectItem value="2">Option 3</SelectItem>
                      <SelectItem value="3">Option 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>


                <Button type="submit" disabled={!selectedQuiz}>
                  Add Question
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing Quizzes */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Quizzes</CardTitle>
              <CardDescription>
                Manage your quiz collection
              </CardDescription>
            </CardHeader>
            <CardContent>
              {quizzes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No quizzes created yet.</p>
              ) : (
                <div className="space-y-4">
                  {quizzes.map((quiz) => (
                    <div
                      key={quiz.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{quiz.subject}</h3>
                        <p className="text-sm text-gray-600">
                          Quiz ID: {quiz.id}
                        </p>

                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleViewQuestions(quiz.id)}
                          variant="outline"
                          size="sm"
                        >
                          View Questions
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuiz(quiz.id)}
                          variant="destructive"
                          size="sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No users registered yet.</p>
              ) : (
                <div className="space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-medium">{user.username}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                          <div className="flex space-x-2">
                            {user.roles.map((role: string) => (
                              <Badge
                                key={role}
                                variant={role === 'ROLE_ADMIN' ? 'default' : 'secondary'}
                              >
                                {role}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {selectedQuizForView && (
  <Dialog open={viewingQuestions} onOpenChange={setViewingQuestions}>
    <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Questions for "{selectedQuizForView.subject}"</DialogTitle>
        <DialogDescription>
          Total Questions: {selectedQuizForView.questions.length}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {selectedQuizForView.questions.length === 0 ? (
          <p className="text-gray-600 text-sm">No questions added yet.</p>
        ) : (
          selectedQuizForView.questions.map((q, index) => (
            <div key={q.id || index} className="border rounded-lg p-4 space-y-2">
              {editingQuestionId === q.id ? (
                <>
                  <div>
                    <Label htmlFor="edit-question-text">Question Text</Label>
                    <Input
                      id="edit-question-text"
                      value={editForm.questionText}
                      onChange={(e) =>
                        setEditForm({ ...editForm, questionText: e.target.value })
                      }
                      placeholder="Question Text"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-option-a">Option A</Label>
                    <Input
                      id="edit-option-a"
                      value={editForm.optionA}
                      onChange={(e) =>
                        setEditForm({ ...editForm, optionA: e.target.value })
                      }
                      placeholder="Option A"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-option-b">Option B</Label>
                    <Input
                      id="edit-option-b"
                      value={editForm.optionB}
                      onChange={(e) =>
                        setEditForm({ ...editForm, optionB: e.target.value })
                      }
                      placeholder="Option B"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-option-c">Option C</Label>
                    <Input
                      id="edit-option-c"
                      value={editForm.optionC}
                      onChange={(e) =>
                        setEditForm({ ...editForm, optionC: e.target.value })
                      }
                      placeholder="Option C"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-option-d">Option D</Label>
                    <Input
                      id="edit-option-d"
                      value={editForm.optionD}
                      onChange={(e) =>
                        setEditForm({ ...editForm, optionD: e.target.value })
                      }
                      placeholder="Option D"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-correct-answer">Correct Answer</Label>
                    <Select
                      value={editForm.correctAnswer}
                      onValueChange={(val) =>
                        setEditForm({ ...editForm, correctAnswer: val })
                      }
                    >
                      <SelectTrigger id="edit-correct-answer">
                        <SelectValue placeholder="Correct Answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 mt-2">
                    <Button onClick={() => handleEditSave(q.id)} size="sm">
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingQuestionId(null)}
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-medium">
                    {index + 1}. {q.questionText}
                  </p>
                  <ul className="list-disc ml-6 text-sm text-gray-700">
                    <li>A: {q.optionA}</li>
                    <li>B: {q.optionB}</li>
                    <li>C: {q.optionC}</li>
                    <li>D: {q.optionD}</li>
                  </ul>
                  <p className="text-sm text-green-600">
                    ✅ Correct Answer: {q.correctAnswer}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button
                      onClick={() => {
                        setEditingQuestionId(q.id);
                        setEditForm({
                          questionText: q.questionText,
                          optionA: q.optionA,
                          optionB: q.optionB,
                          optionC: q.optionC,
                          optionD: q.optionD,
                          correctAnswer: q.correctAnswer,
                        });
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>

                    <Button
                      onClick={() => handleDeleteQuestion(q.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <DialogFooter>
        <Button onClick={() => setViewingQuestions(false)}>Close</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)}


    </div>
  );
};

export default Admin;
