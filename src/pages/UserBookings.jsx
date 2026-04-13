import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Button, Table, Tag, message, Modal, Space } from 'antd';
import { EyeOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { bookingAPI } from '../services/api';
import { formatCurrency, formatDate, formatTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title } = Typography;

const UserBookings = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;
    
    if (!user) {
      navigate('/login', { state: { from: '/bookings' } });
      return;
    }
    fetchBookings();
  }, [user, authLoading]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getUserBookings(user.userId);
      setBookings(response.data);
    } catch (error) {
      message.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (bookingId) => {
    Modal.confirm({
      title: 'Cancel Booking',
      content: 'Are you sure you want to cancel this booking? This action cannot be undone.',
      okText: 'Yes, Cancel',
      okType: 'danger',
      onOk: async () => {
        try {
          await bookingAPI.cancel(bookingId);
          message.success('Booking cancelled successfully');
          fetchBookings();
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to cancel booking');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Booking Code',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (code) => <span className="font-mono font-bold">{code}</span>,
    },
    {
      title: 'Movie',
      key: 'movie',
      render: (_, record) => (
        <div>
          <div className="font-semibold">{record.show.movie.title}</div>
          <div className="text-xs text-gray-500">{record.show.screen.theatre.name}</div>
        </div>
      ),
    },
    {
      title: 'Show Details',
      key: 'show',
      render: (_, record) => (
        <div>
          <div>{formatDate(record.show.showDate)}</div>
          <div className="text-sm text-gray-500">{formatTime(record.show.showTime)}</div>
        </div>
      ),
    },
    {
      title: 'Seats',
      dataIndex: 'numberOfSeats',
      key: 'seats',
      align: 'center',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => <span className="font-semibold text-green-600">{formatCurrency(amount)}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          CONFIRMED: 'green',
          INITIATED: 'blue',
          CANCELLED: 'red',
          FAILED: 'red',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/booking/confirmation/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'CONFIRMED' && (
            <Button
              size="small"
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => handleCancelBooking(record.id)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Card>
            <Title level={2} className="mb-6">My Bookings</Title>
            
            <Table
              dataSource={bookings}
              columns={columns}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showTotal: (total) => `Total ${total} bookings`,
              }}
            />
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default UserBookings;