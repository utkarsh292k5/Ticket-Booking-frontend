import { Layout, Menu, Button, Dropdown, Typography } from 'antd';
import { HomeOutlined, UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header } = Layout;
const { Text } = Typography;

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => navigate('/'),
    },
  ];

  if (isAdmin()) {
    menuItems.push({
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Admin Dashboard',
      onClick: () => navigate('/admin'),
    });
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: 'My Bookings',
        onClick: () => navigate('/bookings'),
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <Header className="bg-white shadow-md flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div
          className="text-xl font-bold text-blue-600 cursor-pointer"
          onClick={() => navigate('/')}
        >
          🎬 MovieBox
        </div>
        {user && (
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            className="flex-1 border-0"
          />
        )}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button type="text" icon={<UserOutlined />}>
              <Text className="hidden sm:inline">{user.name}</Text>
            </Button>
          </Dropdown>
        ) : (
          <div className="flex gap-2">
            <Button onClick={() => navigate('/login')}>Login</Button>
            <Button type="primary" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </Header>
  );
};

export default Navbar;