// Register.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/register', {
        username,
        password,
      });
      // Nếu thành công, chuyển hướng đến trang `/login`
      navigate('/login'); 
    } catch (error) {
      console.error('Đăng kí thất bại', error);
    }
  };

  return (
    <div>
      <h2>Đăng kí</h2>
      <input
        type="text"
        placeholder="Tên đăng nhập"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Đăng kí</button>
    </div>
  );
};

export default Register;
