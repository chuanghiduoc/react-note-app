import React from 'react';
import { List, Button } from 'antd';

function NoteList({ notes, handleDeleteNote }) {
  return (
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
  );
}

export default NoteList;
