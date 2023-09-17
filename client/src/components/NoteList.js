import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { Form, Input, Button, List } from 'antd';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  // Lấy username từ localStorage
  const username = localStorage.getItem('username');

  // Lấy token từ localStorage
  const token = localStorage.getItem('token');
  
  // Giải mã token để lấy userId
  const decodedToken = jwt_decode(token);
  const userId = decodedToken.userId;
  useEffect(() => {
    // Gửi yêu cầu GET để lấy danh sách các ghi chú của người dùng
    axios.get(`http://localhost:3001/api/notes/${userId}`)
      .then(response => {
        setNotes(response.data);
      })
      .catch(error => {
        console.error('Không tìm nạp được ghi chú', error);
      });
  }, [userId]);

  const handleDeleteNote = (noteId) => {
    // Gửi yêu cầu DELETE để xoá ghi chú
    axios.delete(`http://localhost:3001/api/notes/${userId}/${noteId}`)
      .then(() => {
        // Cập nhật danh sách ghi chú sau khi xoá
        setNotes(prevNotes => prevNotes.filter(note => note._id !== noteId));
      })
      .catch(error => {
        console.error('Không thể xóa ghi chú', error);
      });
  };

  const handleAddNote = () => {
    // Gửi yêu cầu POST để thêm ghi chú mới
    axios.post(`http://localhost:3001/api/notes`, { userId, content: newNote })
      .then(response => {
        // Cập nhật danh sách ghi chú sau khi thêm ghi chú mới
        setNotes(prevNotes => [...prevNotes, response.data]);
        // Xóa nội dung ghi chú trong form
        setNewNote('');
      })
      .catch(error => {
        console.error('Không thể thêm ghi chú', error);
      });
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    // Làm mới trang sau khi đăng xuất
    window.location.reload();

  };
  return (
    <div>
      <h2>Hi, {username} - Mời thí chủ test</h2>

      <Form onFinish={handleAddNote}>
        <Form.Item>
          <Input.TextArea
            type="text"
            placeholder="Nhập ghi chú mới"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">Thêm Ghi Chú</Button>
          <Button type="link" danger onClick={handleLogout}>Đăng Xuất</Button>
        </Form.Item>
      </Form>
      <List
        dataSource={notes}
        renderItem={item => (
          <List.Item actions={[
            <Button type="link" onClick={() => handleDeleteNote(item._id)}>Xoá</Button>
          ]}>
            {item.content}
          </List.Item>
        )}
      />
    </div>
  );
  
};

export default NoteList;