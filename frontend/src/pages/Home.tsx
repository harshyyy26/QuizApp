
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Trophy, Users, Shield, ArrowRight, CheckCircle } from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: 'Interactive Quizzes',
      description: 'Take engaging quizzes on various subjects and test your knowledge.',
    },
    {
      icon: Trophy,
      title: 'Leaderboards',
      description: 'Compete with others and see how you rank on the leaderboard.',
    },
    {
      icon: Users,
      title: 'User Profiles',
      description: 'Track your progress and view your quiz history.',
    },
    {
      icon: Shield,
      title: 'Admin Controls',
      description: 'Administrators can create quizzes and manage users.',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6 py-12">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Welcome to QuizVista
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Test your knowledge with our interactive quiz platform. Challenge yourself, 
            compete with others, and track your progress.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {!isAuthenticated ? (
            <>
              <Button asChild size="lg" className="text-lg px-8 py-3">
                <Link to="/signup" className="flex items-center space-x-2">
                  <span>Get Started</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link to="/login">Sign In</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <span>Go to Dashboard</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <feature.icon className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white text-center">
        <h2 className="text-3xl font-bold mb-8">Platform Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-bold mb-2">10+</div>
            <div className="text-purple-100">Quiz Categories</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">100+</div>
            <div className="text-purple-100">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">1000+</div>
            <div className="text-purple-100">Questions Available</div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-gray-900">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-purple-600">1</span>
            </div>
            <h3 className="text-xl font-semibold">Sign Up</h3>
            <p className="text-gray-600">Create your account to get started with QuizVista.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-purple-600">2</span>
            </div>
            <h3 className="text-xl font-semibold">Take Quizzes</h3>
            <p className="text-gray-600">Choose from various quiz categories and test your knowledge.</p>
          </div>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-2xl font-bold text-purple-600">3</span>
            </div>
            <h3 className="text-xl font-semibold">Track Progress</h3>
            <p className="text-gray-600">View your scores and compete on the leaderboard.</p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Join thousands of users who are already testing their knowledge and having fun with our quizzes.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-3">
            <Link to="/signup" className="flex items-center space-x-2">
              <span>Create Account</span>
              <CheckCircle className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Home;
