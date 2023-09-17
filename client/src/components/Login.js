import React from 'react';
import axios from 'axios';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate('/register');
  };

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        username: values.username,
        password: values.password,
      });
      
      // Kiểm tra kết quả từ API và lưu thông tin đăng nhập (token, user) vào localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', values.username);
      window.location.reload();
    } catch (error) {
      console.error('Đăng nhập thất bại', error);
      message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.');
    }
  };

  return (
    <div>
      <h2>Đăng nhập</h2>
      <Form
        form={form}
        name="loginForm"
        onFinish={onFinish}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
        >
          <Input placeholder="Tên đăng nhập" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
        >
          <Input.Password placeholder="Mật khẩu" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Đăng nhập
          </Button>
          <Button type="link" onClick={handleNavigate}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Login;
