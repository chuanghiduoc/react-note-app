import React, { useState } from 'react';
import { Input, Button } from 'antd';

function LoginForm({ handleLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // Điều này là nơi bạn thực hiện xử lý đăng nhập, ví dụ:
    if (username === 'your_username' && password === 'your_password') {
      handleLogin();
    }
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <Input
        placeholder="Tên đăng nhập"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button type="primary" htmlType="submit">
        Đăng nhập
      </Button>
    </form>
  );
}

export default LoginForm;
