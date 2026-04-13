import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get the page user was trying to access before being redirected to login
  const from = location.state?.from || '/';

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login(values);
      const { token, userId, email, name, role } = response.data;

      login({ userId, email, name, role }, token);
      message.success('Login successful!');

      // Redirect to the page they were trying to access, or admin dashboard for admins
      if (role === 'ADMIN' && from === '/') {
        navigate('/admin');
      } else {
        navigate(from);
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <Title level={2}>Movie Ticket Booking</Title>
          <Text type="secondary">
            {from !== '/' ? 'Please login to continue booking' : 'Login to your account'}
          </Text>
        </div>

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              Log in
            </Button>
          </Form.Item>

          <div className="text-center">
            <Text>Don't have an account? </Text>
            <Link to="/signup" className="text-blue-600 hover:text-blue-800">
              Sign up now!
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;