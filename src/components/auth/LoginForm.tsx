import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../ui/Button';
import Input from '../ui/Input';
import toast from 'react-hot-toast';
import { handleApiError } from '../../service/servicehelper';
import { loginUser } from '../../service/service';
import { LoginApiUrl } from '../../service/ApiEndPoints';
import { setToken, setUserDetails } from '../../service/asyncstorage';

interface LoginFormData {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Please fill in both email and password');
      return;
    }
    setIsLoading(true);
    try {
      const response = await loginUser(LoginApiUrl, formData);
      setToken(response.token);
      setUserDetails(response.data);
      toast.success('Login successful');
      navigate('/');
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onChangeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <div className="space-y-6">
          <Input
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter your email"
            value={formData.email}
            onChange={onChangeValue}
            icon={<Mail size={20} className="text-gray-400" />}
          />
          <div className="relative">
            <Input
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={onChangeValue}
              icon={<Lock size={20} className="text-gray-400" />}
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Remember me
              </label>
            </div>

            <Link
              to="/forgot-password"
              className="text-sm text-orange-600 hover:text-orange-500"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="button"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
            onClick={handleLogin}
          >
            Sign In
          </Button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-600 hover:text-orange-500 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LoginForm;
