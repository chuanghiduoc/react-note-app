import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import NoteList from './components/NoteList';
import { isUserAuthenticated } from './utils/auth'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra trong localStorage nếu người dùng đã đăng nhập
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />

        {/* Trang đăng kí */}
        <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <Register />} />

        {/* Trang chính */}
        <Route
          path="/"
          element={isUserAuthenticated() ? <NoteList /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
}

export default App;
