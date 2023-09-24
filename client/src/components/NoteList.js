import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import { Form, Input, Button, List, Modal } from 'antd';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    content: '',
    password: '', // Thêm trường mật khẩu
  });
  const [editingNote, setEditingNote] = useState(null); // Ghi chú đang chỉnh sửa
  const [editNoteContent, setEditNoteContent] = useState(''); // Nội dung chỉnh sửa
  const [shareableLinks, setShareableLinks] = useState({});
  const [shareModalVisible, setShareModalVisible] = useState(false); // State để kiểm soát hiển thị Modal
  const [shareableLinkId, setShareableLinkId] = useState(null); // Lưu trữ ID của ghi chú đang lấy link chia sẻ

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
      .post(`http://localhost:3001/api/notes`, {
        userId,
        content: newNote.content,
        password: newNote.password, // Gửi mật khẩu
      })
      .then((response) => {
        // Cập nhật danh sách ghi chú sau khi thêm ghi chú mới
        setNotes((prevNotes) => [...prevNotes, response.data]);
        // Xóa nội dung ghi chú và mật khẩu trong form
        setNewNote({
          content: '',
          password: '',
        });
      })
      .catch((error) => {
        console.error('Không thể thêm ghi chú', error);
      });
  };

  const handleEditNote = (noteId, content, password) => {
    // Thiết lập trạng thái chỉnh sửa và nội dung chỉnh sửa
    setEditingNote(noteId);
    setEditNoteContent(content);
    // Đặt mật khẩu cho ghi chú trong newNote
    setNewNote({
      ...newNote,
      password,
    });
  };

  const handleSaveEditNote = () => {
    // Gửi yêu cầu PUT để lưu chỉnh sửa ghi chú
    axios
      .put(`http://localhost:3001/api/notes/${userId}/${editingNote}`, {
        content: editNoteContent,
        password: newNote.password, // Gửi mật khẩu
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
        // Xóa mật khẩu trong newNote
        setNewNote({
          ...newNote,
          password: '',
        });
      })
      .catch((error) => {
        console.error('Không thể lưu chỉnh sửa ghi chú', error);
      });
  };

  const handleOpenShareModal = (noteId) => {
    setShareableLinkId(noteId); // Lưu lại ID của ghi chú được chọn
    setShareModalVisible(true); // Mở Modal
  };

  const handleCloseShareModal = () => {
    setShareableLinkId(null); // Xóa ID của ghi chú
    setShareModalVisible(false); // Đóng Modal
  };

  const generateShareableLink = (noteId) => {
    axios
      .post(`http://localhost:3001/api/share/${noteId}`)
      .then((response) => {
        const link = response.data.shareableLink;
        setShareableLinks({ ...shareableLinks, [noteId]: link });
        handleOpenShareModal(noteId); // Mở Modal sau khi có link chia sẻ
      })
      .catch((error) => {
        console.error('Không thể tạo đường dẫn chia sẻ', error);
      });
  };

  const handleCancelEditNote = () => {
    // Hủy bỏ chỉnh sửa
    setEditingNote(null);
    setEditNoteContent('');
    // Xóa mật khẩu trong newNote
    setNewNote({
      ...newNote,
      password: '',
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
            value={newNote.content}
            onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
          />
        </Form.Item>
        <Form.Item>
          <Input
            type="password"
            placeholder="Nhập mật khẩu (Tuỳ chọn)"
            value={newNote.password}
            onChange={(e) => setNewNote({ ...newNote, password: e.target.value })}
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
              <Button type="link" onClick={() => handleEditNote(item._id, item.content, item.password)}>
                Sửa
              </Button>,
              <Button type="link" onClick={() => handleDeleteNote(item._id)}>
                Xoá
              </Button>,
              <Button type="link" onClick={() => generateShareableLink(item._id)}>
                Lấy Link Chia Sẻ
              </Button>,
            ]}
          >
            {item.content}

          </List.Item>
        )}
      />

      {/* Modal chỉnh sửa ghi chú */}
      <Modal
        title="Chỉnh Sửa Ghi Chú"
        open={editingNote !== null}
        onCancel={handleCancelEditNote}
        onOk={handleSaveEditNote}
      >
        <Input.TextArea
          value={editNoteContent}
          onChange={(e) => setEditNoteContent(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Nhập mật khẩu"
          value={newNote.password}
          onChange={(e) => setNewNote({ ...newNote, password: e.target.value })}
        />
      </Modal>

      {/* Modal chia sẻ */}
      <Modal
        title="Lấy Link Chia Sẻ"
        open={shareModalVisible}
        onCancel={handleCloseShareModal}
        footer={[
          <Button key="cancel" onClick={handleCloseShareModal}>
            Đóng
          </Button>,
        ]}
      >
        {shareableLinks[shareableLinkId] && (
          <div>
            Link Chia Sẻ:
            <a href={`http://localhost:3000/share/${shareableLinks[shareableLinkId]}`}>
               http://localhost:3000/share/{shareableLinks[shareableLinkId]}
            </a>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NoteList;