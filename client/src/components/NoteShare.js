import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Input, Button } from 'antd';

const NoteShare = () => {
  const { shareableLink } = useParams();
  const [password, setPassword] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [displayContent, setDisplayContent] = useState(false);
  const [error, setError] = useState('');

  const fetchNoteContent = () => {
    axios
      .get(`http://localhost:3001/api/share/${shareableLink}`, {
        params: { password },
      })
      .then((response) => {
        setNoteContent(response.data.content);
        setDisplayContent(true);
        setError('');
      })
      .catch((err) => {
        setError('Sai mật khẩu. Vui lòng nhập lại.');
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
          <h2>Nội dung ghi chú:</h2>
          <p>{noteContent}</p>
        </div>
      ) : (
        <div>
          <h2>Nhập Mật Khẩu:</h2>
          <Input.Password
            placeholder="Nhập mật khẩu của ghi chú"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="primary" onClick={fetchNoteContent}>
            Xác Nhận
          </Button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
      )}
    </div>
  );
};

export default NoteShare;
