

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Input, Button, List, Space  } from 'antd';
import './App.css';
import { Layout, Menu } from 'antd';
const { Header, Content, Footer } = Layout;

function App() {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/notes');
        setNotes(response.data);
      } catch (error) {
        console.error('Lỗi tìm nạp ghi chú:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddNote = async () => {
    try {
      const response = await axios.post('http://localhost:3001/api/notes', { text: newNote });
      setNotes([...notes, response.data]);
      setNewNote('');
    } catch (error) {
      console.error('Lỗi khi thêm ghi chú:', error);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/notes/${id}`);
      const updatedNotes = notes.filter((note) => note._id !== id);
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Lỗi xóa ghi chú:', error);
    }
  };

  const handleDeleteAllNotes = async () => {
    try {
      await axios.delete('http://localhost:3001/api/notes');
      setNotes([]);
    } catch (error) {
      console.error('Lỗi xóa tất cả ghi chú:', error);
    }
  };

  return (
    
    <Layout>
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center"
        }}
      >
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={new Array(1).fill(null).map((_, index) => ({
            key: String(index + 1),
            label: `Lưu chú`,
          }))}
        />
      </Header>
      <Content className="site-layout" style={{ padding: '20px 50px' }}>
      <Input.TextArea
        placeholder="Thêm lưu chú mới"
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        size="large"
      />
      <Space wrap>
      <Button type="primary" onClick={handleAddNote}>
        Thêm
      </Button>
      <Button onClick={handleDeleteAllNotes} type="primary" danger className="delete-button">Xoá Tất Cả</Button>
      </Space>
      <List
        dataSource={notes}
        renderItem={(note) => (
          <List.Item
            actions={[
              <Button type="link" danger onClick={() => handleDeleteNote(note._id)}>
                Xoá
              </Button>,
            ]}
          >
            {note.text}
          </List.Item>
        )}
      />
      </Content>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2023 Created by BaoTrong</Footer>
    </Layout>
  );
}

export default App;

