import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { Form, Input, Button, List, Modal } from 'antd';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState(null); // Ghi chú đang chỉnh sửa
  const [editNoteContent, setEditNoteContent] = useState(''); // Nội dung chỉnh sửa

  // Lấy username từ localStorage
  const username = localStorage.getItem('username');

  // Lấy token từ localStorage
  const token = localStorage.getItem('token');

  // Giải mã token để lấy userId
  const decodedToken = jwt_decode(token);
  const userId = decodedToken.userId;

  useEffect(() => {
    // Gửi yêu cầu GET để lấy danh sách các ghi chú của người dùng
    axios
      .get(`http://localhost:3001/api/notes/${userId}`)
      .then((response) => {
        setNotes(response.data);
      })
      .catch((error) => {
        console.error('Không tìm nạp được ghi chú', error);
      });
  }, [userId]);

  const handleDeleteNote = (noteId) => {
    // Gửi yêu cầu DELETE để xoá ghi chú
    axios
      .delete(`http://localhost:3001/api/notes/${userId}/${noteId}`)
      .then(() => {
        // Cập nhật danh sách ghi chú sau khi xoá
        setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
      })
      .catch((error) => {
        console.error('Không thể xóa ghi chú', error);
      });
  };

  const handleAddNote = () => {
    // Gửi yêu cầu POST để thêm ghi chú mới
    axios
      .post(`http://localhost:3001/api/notes`, { userId, content: newNote })
      .then((response) => {
        // Cập nhật danh sách ghi chú sau khi thêm ghi chú mới
        setNotes((prevNotes) => [...prevNotes, response.data]);
        // Xóa nội dung ghi chú trong form
        setNewNote('');
      })
      .catch((error) => {
        console.error('Không thể thêm ghi chú', error);
      });
  };

  const handleEditNote = (noteId, content) => {
    // Thiết lập trạng thái chỉnh sửa và nội dung chỉnh sửa
    setEditingNote(noteId);
    setEditNoteContent(content);
  };

  const handleSaveEditNote = () => {
    // Gửi yêu cầu PUT để lưu chỉnh sửa ghi chú
    axios
      .put(`http://localhost:3001/api/notes/${userId}/${editingNote}`, {
        content: editNoteContent,
      })
      .then((response) => {
        // Cập nhật danh sách ghi chú sau khi lưu chỉnh sửa
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === editingNote ? { ...note, content: editNoteContent } : note
          )
        );
        // Đóng modal chỉnh sửa
        setEditingNote(null);
        setEditNoteContent('');
      })
      .catch((error) => {
        console.error('Không thể lưu chỉnh sửa ghi chú', error);
      });
  };

  const handleCancelEditNote = () => {
    // Hủy bỏ chỉnh sửa
    setEditingNote(null);
    setEditNoteContent('');
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
          <Button type="primary" htmlType="submit">
            Thêm Ghi Chú
          </Button>
          <Button type="link" danger onClick={handleLogout}>
            Đăng Xuất
          </Button>
        </Form.Item>
      </Form>
      <List
        dataSource={notes}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button type="link" onClick={() => handleEditNote(item._id, item.content)}>
                Sửa
              </Button>,
              <Button type="link" onClick={() => handleDeleteNote(item._id)}>
                Xoá
              </Button>,
            ]}
          >
            {item.content}
          </List.Item>
        )}
      />
      {/* Modal chỉnh sửa ghi chú */}
      <Modal
        open={editingNote !== null}
        title="Chỉnh Sửa Ghi Chú"
        onCancel={handleCancelEditNote}
        onOk={handleSaveEditNote}
      >
        <Input.TextArea
          value={editNoteContent}
          onChange={(e) => setEditNoteContent(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default NoteList;