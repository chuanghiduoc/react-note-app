import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        username: values.username,
        password: values.password,
      });

      // Nếu thành công, chuyển hướng đến trang `/login`
      // navigate('/login');

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', values.username);
      localStorage.setItem('role', response.data.role);

      message.success('Đăng kí thành công');
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error('Đăng ký thất bại', error);
      message.error('Đăng ký thất bại. Vui lòng thử lại sau.');
    }
  };

  return (
    <div>
      <h2>Đăng ký</h2>
      <Form
        form={form}
        name="registerForm"
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
            Đăng ký
          </Button>
          <Button type="link" onClick={() => navigate('/login')}>
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;