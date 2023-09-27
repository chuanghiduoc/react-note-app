export const isUserAuthenticated = () => {
    const token = localStorage.getItem('token');
    return !!token; // Trả về true nếu token tồn tại, ngược lại trả về false
  };