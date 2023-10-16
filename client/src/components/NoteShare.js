import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';

const NoteShare = () => {
  const { shareableLink } = useParams();
  const [password, setPassword] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [displayContent, setDisplayContent] = useState(false);
  const [hasPassword, setHasPassword] = useState(true); 

  const fetchNoteContent = () => {
    axios
      .get(`http://localhost:3001/api/share/${shareableLink}`, {
        params: { password },
      })
      .then((response) => {
        const { title, content } = response.data;
        setNoteTitle(title);
        setNoteContent(content);
        setDisplayContent(true);
        message.success('Xác thực mật khẩu thành công');
      })
      .catch((err) => {
        message.error('Xác thực thất bại. Vui lòng kiểm tra lại mật khẩu.');
      });
  };

  useEffect(() => {
    axios.get(`http://localhost:3001/api/share/${shareableLink}`)
      .then((response) => {
        const { password } = response.data;
        if (!password) {
          setHasPassword(false);
          fetchNoteContent();
        } else {
          setHasPassword(true);
        }
      })
      .catch((err) => {
        setHasPassword(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareableLink]);

  return (
    <div>
      {displayContent ? (
        <div>
          <h1>{noteTitle}</h1>
          <p style={{ whiteSpace: 'pre-wrap' }}>{noteContent}</p>
        </div>
      ) : hasPassword ? (
        <div>
          <h2>Nhập Mật Khẩu:</h2>
          <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}>
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
      ) : null}
    </div>
  );
};

export default NoteShare;
