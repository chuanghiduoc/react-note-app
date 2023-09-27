import React, { Component } from 'react';
import { Table, Space, Button, Modal, Input } from 'antd';
import axios from 'axios';

class AdminDashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usersInfo: [],
      totalNotes: 0,
      newPassword: '',
      userIdToChangePassword: '', 
      isChangePasswordModalVisible: false,
    };
  }

  componentDidMount() {
    // Kiểm tra trong localStorage nếu người dùng đã đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      // Người dùng chưa đăng nhập, chuyển hướng về trang đăng nhập
      this.props.history.push('/login');
    } else {
      // Gọi API để lấy thông tin về người dùng và số lượng ghi chú của họ
      axios.get('http://localhost:3001/api/admin/users-and-notes-info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          const { usersInfo, totalNotes } = response.data;
          this.setState({ usersInfo, totalNotes });
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }

  // Mở modal thay đổi mật khẩu và lưu ID của người dùng cần thay đổi
  showChangePasswordModal = (userId) => {
    this.setState({
      userIdToChangePassword: userId,
      isChangePasswordModalVisible: true,
    });
  };

  // Đóng modal thay đổi mật khẩu và đặt lại giá trị userIdToChangePassword
  handleCancelChangePasswordModal = () => {
    this.setState({
      isChangePasswordModalVisible: false,
      newPassword: '',
      userIdToChangePassword: '',
    });
  };

  // Gửi yêu cầu thay đổi mật khẩu đến server
  handleChangePassword = () => {
    const { newPassword, userIdToChangePassword } = this.state;

    // Kiểm tra trạng thái đăng nhập và vai trò của người dùng
    const token = localStorage.getItem('token');
    axios.get('http://localhost:3001/api/user/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        const userRole = response.data.user.role; // Lấy vai trò của người dùng từ phản hồi
        if (userRole !== 'admin') {
          Modal.error({ content: 'Bạn không có quyền thay đổi mật khẩu.' });
        } else {
          // Gọi API để thay đổi mật khẩu cho người dùng admin
          axios.post(`http://localhost:3001/api/admin/change-password/${userIdToChangePassword}`, { newPassword })
            .then((response) => {
              Modal.success({ content: response.data.message });
              this.handleCancelChangePasswordModal();
            })
            .catch((error) => {
              // Xử lý các lỗi từ API
              if (error.response) {
                Modal.error({ content: error.response.data.error });
              } else {
                Modal.error({ content: 'Đã xảy ra lỗi khi thay đổi mật khẩu.' });
              }
            });
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  render() {
    const { usersInfo, totalNotes, newPassword, isChangePasswordModalVisible } = this.state;

    const columns = [
      {
        title: 'Username',
        dataIndex: 'username',
        key: 'username',
      },
      {
        title: 'Số lượng ghi chú',
        dataIndex: 'numNotes',
        key: 'numNotes',
      },
      {
        title: 'Hành động',
        key: 'actions',
        render: (text, record) => (
          <Space size="middle">
            <Button type="primary" onClick={() => this.showChangePasswordModal(record.userId)}>
              Thay đổi mật khẩu
            </Button>
          </Space>
        ),
      },
    ];

    return (
      <div>
        <h1>Admin Dashboard</h1>
        <p>Total Notes: {totalNotes}</p>
        <Table dataSource={usersInfo} columns={columns} />
        <Modal
          title="Thay đổi mật khẩu"
          open={isChangePasswordModalVisible}
          onCancel={this.handleCancelChangePasswordModal}
          onOk={this.handleChangePassword}
        >
          <Input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => this.setState({ newPassword: e.target.value })}
          />
        </Modal>
      </div>
    );
  }
}

export default AdminDashboard;