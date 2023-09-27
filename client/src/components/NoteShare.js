import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';

const NoteShare = () => {
  const { shareableLink } = useParams();
  const [password, setPassword] = useState('');
  const [noteTitle, setNoteTitle] = useState(''); // Thêm state cho nhan đề
  const [noteContent, setNoteContent] = useState('');
  const [displayContent, setDisplayContent] = useState(false);

  const fetchNoteContent = () => {
    axios
      .get(`http://localhost:3001/api/share/${shareableLink}`, {
        params: { password },
      })
      .then((response) => {
        const { title, content } = response.data;
        setNoteTitle(title); // Cập nhật state nhan đề từ phản hồi của API
        setNoteContent(content);
        setDisplayContent(true);
      })
      .catch((err) => {
        message.error('Xác nhận thất bại. Vui lòng kiểm tra lại mật khẩu.');
      });
  };

  useEffect(() => {
    if (displayContent) {
      fetchNoteContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayContent]);

  return (
    <div>
      {displayContent ? (
        <div>
          <h1>{noteTitle}</h1> {/* Hiển thị nhan đề */}
          <p style={{ whiteSpace: 'pre-wrap' }}>{noteContent}</p>
        </div>
      ) : (
        <div>
          <h2>Nhập Mật Khẩu:</h2>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu của ghi chú"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>
          <Button type="primary" onClick={fetchNoteContent}>
            Xác Nhận
          </Button>
        </div>
      )}
    </div>
  );
};

export default NoteShare;