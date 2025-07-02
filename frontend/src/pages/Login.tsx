
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { authService } from '@/services/authService';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { jwtDecode } from 'jwt-decode';
import api from '@/lib/axios';
import axios, { isAxiosError } from 'axios';


interface LoginForm {
  usernameOrEmail: string;
  password: string;
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    try {
      const response = await authService.login(data.usernameOrEmail, data.password);
      // const { token, id, username, email, roles } = response;
      console.log("Login Response from backend:", response);

      const {
        token,
        user: { id, username, email, roles },
      } = response;

      const decoded: any = jwtDecode(token);
      const expiry = decoded.exp * 1000;

      localStorage.setItem('jwt_expiry', expiry.toString());

      const delay = expiry - Date.now();
      if (delay > 0) {
        setTimeout(() => {
          logout();
          toast({
            title: 'Session Expired',
            description: 'Please login again.',
            variant: 'destructive',
            duration: 3000,
          });
          navigate('/login');
        }, delay);
      }

      login(token, { id, username, email, roles });

      toast({
        title: 'Success',
        description: 'Logged in successfully!',
        duration: 3000,
      });

      if (roles.includes("ROLE_ADMIN")) {
        navigate('/admin');
      } else if (roles.includes("ROLE_USER")) {
        navigate('/dashboard');
      } else {
        navigate('/notFound');
      }

    } catch (error: any) {
      console.log('Login error:', error);
      console.log("Error response data:", error.response?.data);
      console.log("Error response status:", error.response?.status);


      if (isAxiosError(error)) {
        const message = error.response?.data;
        toast({
          title: 'Login Failed',
          description:
            error.response?.status === 401 && message === 'Invalid credentials'
              ? 'Invalid username or password'
              : 'Something went wrong. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
          duration: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // ✅ Prevent page reload
              handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="usernameOrEmail">Username or Email</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                placeholder="Enter your username or email"
                {...register('usernameOrEmail', {
                  required: 'Username or email is required',
                })}
              />
              {errors.usernameOrEmail && (
                <p className="text-sm text-red-600">{errors.usernameOrEmail.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Link to="/reset-password" className="text-purple-600 hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>


          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-purple-600 hover:underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
