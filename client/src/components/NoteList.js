import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { Form, Input, Button, List, Modal, message } from "antd";
import "../utils/css/css.css";
import { useNavigate } from "react-router-dom";

const NoteList = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    password: "",
  });
  const [editingNote, setEditingNote] = useState(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");
  const [editNoteContent, setEditNoteContent] = useState("");
  const [shareableLinks, setShareableLinks] = useState({});
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareableLinkId, setShareableLinkId] = useState(null);
  const [updatePasswordModalVisible, setUpdatePasswordModalVisible] =
    useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);

  const username = localStorage.getItem("username");
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  // Giải mã token để lấy userId
  const decodedToken = jwt_decode(token);
  const userId = decodedToken.userId;

  useEffect(() => {
    if (token) {
      const decodedToken = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp < currentTime) {
        handleLogout();
      }
    }
  }, [token]);

  useEffect(() => {
    // Gửi yêu cầu GET để lấy danh sách các ghi chú của người dùng
    axios
      .get(`http://localhost:3001/api/notes/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setNotes(response.data);
      })
      .catch((error) => {
        console.error("Không tìm nạp được ghi chú", error);
      });
  }, [token, userId]);

  const handleDeleteNote = (noteId) => {
    // Gửi yêu cầu DELETE để xoá ghi chú
    axios
      .delete(`http://localhost:3001/api/notes/${userId}/${noteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        // Cập nhật danh sách ghi chú sau khi xoá
        setNotes((prevNotes) =>
          prevNotes.filter((note) => note._id !== noteId)
        );
        message.success("Xoá ghi chú thành công");
      })
      .catch((error) => {
        console.error("Không thể xóa ghi chú", error);
        message.error("Xoá ghi chú không thành công");
      });
  };

  const handleAddNote = () => {
    // Gửi yêu cầu POST để thêm ghi chú mới
    axios
      .post(
        `http://localhost:3001/api/notes`,
        {
          userId,
          title: newNote.title,
          content: newNote.content,
          password: newNote.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        // Cập nhật danh sách ghi chú sau khi thêm ghi chú mới
        setNotes((prevNotes) => [...prevNotes, response.data]);
        // Xóa nội dung ghi chú, tiêu đề và mật khẩu trong form
        setNewNote({
          title: "",
          content: "",
          password: "",
        });
        message.success("Thêm ghi chú thành công");
      })
      .catch((error) => {
        console.error("Không thể thêm ghi chú", error);
        message.error("Thêm ghi chú không thành công");
      });
  };

  const handleEditNote = (noteId, title, content, password) => {
    // Thiết lập trạng thái chỉnh sửa và tiêu đề, nội dung chỉnh sửa
    setEditingNote(noteId);
    setEditNoteTitle(title);
    setEditNoteContent(content);
    setNewNote({
      title,
      content,
      password,
    });
  };

  const handleSaveEditNote = () => {
    // Gửi yêu cầu PUT để lưu chỉnh sửa ghi chú
    axios
      .put(
        `http://localhost:3001/api/notes/${userId}/${editingNote}`,
        {
          title: editNoteTitle,
          content: editNoteContent,
          password: newNote.password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        // Cập nhật danh sách ghi chú sau khi lưu chỉnh sửa
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note._id === editingNote
              ? { ...note, title: editNoteTitle, content: editNoteContent }
              : note
          )
        );
        // Đóng modal chỉnh sửa
        setEditingNote(null);
        setEditNoteTitle("");
        setEditNoteContent("");
        // Xóa mật khẩu trong newNote
        setNewNote({
          ...newNote,
          password: "",
        });
        message.success("Sửa ghi chú thành công");
      })
      .catch((error) => {
        console.error("Không thể lưu chỉnh sửa ghi chú", error);
        message.error("Sửa ghi chú không thành công");
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
      .post(`http://localhost:3001/api/share/${userId}/${noteId}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const link = response.data.shareableLink;
        setShareableLinks({ ...shareableLinks, [noteId]: link });
        handleOpenShareModal(noteId); // Mở Modal sau khi có link chia sẻ
      })
      .catch((error) => {
        console.error("Không thể tạo đường dẫn chia sẻ", error);
      });
  };

  const handleCancelEditNote = () => {
    // Hủy bỏ chỉnh sửa
    setEditingNote(null);
    setEditNoteTitle("");
    setEditNoteContent("");
    // Xóa mật khẩu trong newNote
    setNewNote({
      ...newNote,
      password: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    message.success("Đăng xuất thành công");
    setTimeout(() => window.location.reload(), 1000);
  };
  const handleAdmin = () => {
    navigate("/admin");
  };
  const handleUpdatePassword = (noteId) => {
    setSelectedNoteId(noteId);
    setUpdatePasswordModalVisible(true);
  };

  const handleCloseUpdatePasswordModal = () => {
    setUpdatePasswordModalVisible(false);
  };

  const handleUpdatePasswordSubmit = () => {
    if (selectedNoteId) {
      // Gửi yêu cầu PUT để cập nhật mật khẩu ghi chú
      axios
        .put(
          `http://localhost:3001/api/notes/${userId}/${selectedNoteId}`,
          {
            password: newPassword,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
        .then((response) => {
          // Cập nhật danh sách ghi chú sau khi cập nhật mật khẩu
          setNotes((prevNotes) =>
            prevNotes.map((note) =>
              note._id === selectedNoteId
                ? { ...note, password: newPassword }
                : note
            )
          );
          // Đóng modal cập nhật mật khẩu
          setUpdatePasswordModalVisible(false);
          // Xóa mật khẩu mới
          setNewPassword("");
          setSelectedNoteId(null);
          message.success("Cập nhật mật khẩu thành công");
        })
        .catch((error) => {
          console.error("Không thể cập nhật mật khẩu ghi chú", error);
          message.error("Cập nhật mật khẩu không thành công");
        });
    }
  };
  return (
    <div>
      <h2>Hi, {username} - Hôm nay là một ngày đẹp trời</h2>

      <Form onFinish={handleAddNote}>
        <Form.Item
          name="title"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập tiêu đề ghi chú!",
            },
          ]}
        >
          <Input
            type="text"
            placeholder="Nhập tiêu đề ghi chú"
            value={newNote.title}
            onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          />
        </Form.Item>
        <Form.Item
          name="content"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập nội dung ghi chú!",
            },
          ]}
        >
          <Input.TextArea
            type="text"
            placeholder="Nhập nội dung ghi chú"
            value={newNote.content}
            onChange={(e) =>
              setNewNote({ ...newNote, content: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item>
          <Input
            type="password"
            placeholder="Nhập mật khẩu (tuỳ chọn)"
            value={newNote.password}
            onChange={(e) =>
              setNewNote({ ...newNote, password: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Thêm Ghi Chú
          </Button>
          <Button type="link" danger onClick={handleLogout}>
            Đăng Xuất
          </Button>
          {role === "admin" && (
            <Button type="primary" onClick={handleAdmin}>
              Trang quản lý
            </Button>
          )}
        </Form.Item>
      </Form>
      <List
        dataSource={notes}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="link"
                onClick={() =>
                  handleEditNote(
                    item._id,
                    item.title,
                    item.content,
                    item.password
                  )
                }
              >
                Sửa
              </Button>,
              <Button
                type="link"
                onClick={() => handleUpdatePassword(item._id)}
              >
                Cập nhật mật khẩu
              </Button>,
              <Button type="link" onClick={() => handleDeleteNote(item._id)}>
                Xoá
              </Button>,
              <Button
                type="link"
                onClick={() => generateShareableLink(item._id)}
              >
                Chia Sẻ
              </Button>,
            ]}
          >
            <h3>{item.title}</h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{item.content}</p>
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
        <Input
          type="text"
          placeholder="Nhập tiêu đề"
          value={editNoteTitle}
          onChange={(e) => setEditNoteTitle(e.target.value)}
          style={{ marginBottom: '10px' }}
        />
        <Input.TextArea
          value={editNoteContent}
          onChange={(e) => setEditNoteContent(e.target.value)}
          rows={10}
          style={{ marginBottom: '10px' }}
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
            <a
              href={`http://localhost:3000/share/${shareableLinks[shareableLinkId]}`}
            >
              http://localhost:3000/share/{shareableLinks[shareableLinkId]}
            </a>
          </div>
        )}
      </Modal>
      <Modal
        title="Cập nhật Mật khẩu"
        open={updatePasswordModalVisible}
        onOk={handleUpdatePasswordSubmit}
        onCancel={handleCloseUpdatePasswordModal}
      >
        <Input
          type="password"
          placeholder="Nhập mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default NoteList;
