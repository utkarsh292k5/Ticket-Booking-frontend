import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Button, Result, Spin, Divider, QRCode } from 'antd';
import { CheckCircleOutlined, HomeOutlined, HistoryOutlined } from '@ant-design/icons';
import { bookingAPI } from '../services/api';
import { formatCurrency, formatDate, formatTime, getSeatLabel } from '../utils/helpers';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title, Text } = Typography;

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      const response = await bookingAPI.getById(bookingId);
      setBooking(response.data);
    } catch (error) {
      console.error('Failed to fetch booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 flex items-center justify-center">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!booking) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6">
          <Result
            status="404"
            title="Booking Not Found"
            subTitle="The booking you're looking for doesn't exist."
            extra={
              <Button type="primary" onClick={() => navigate('/')}>
                Back Home
              </Button>
            }
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <Result
            status="success"
            title="Booking Confirmed!"
            subTitle={`Booking Code: ${booking.bookingCode}`}
            icon={<CheckCircleOutlined className="text-green-500" />}
          />

          <Card className="shadow-lg">
            <div className="text-center mb-6">
              <QRCode value={booking.bookingCode} size={200} />
              <div className="mt-4">
                <Text type="secondary">Show this QR code at the theatre</Text>
              </div>
            </div>

            <Divider />

            <div className="space-y-4">
              <div>
                <Title level={4}>{booking.show.movie.title}</Title>
                <Text type="secondary">
                  {booking.show.movie.language} • {booking.show.movie.genre}
                </Text>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Text type="secondary" className="block mb-1">Theatre</Text>
                  <Text strong>{booking.show.screen.theatre.name}</Text>
                  <div>
                    <Text className="text-sm">
                      {booking.show.screen.theatre.address}, {booking.show.screen.theatre.city}
                    </Text>
                  </div>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">Screen</Text>
                  <Text strong>Screen {booking.show.screen.name}</Text>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">Date & Time</Text>
                  <Text strong>
                    {formatDate(booking.show.showDate)} at {formatTime(booking.show.showTime)}
                  </Text>
                </div>

                <div>
                  <Text type="secondary" className="block mb-1">Number of Seats</Text>
                  <Text strong>{booking.numberOfSeats}</Text>
                </div>
              </div>

              <div>
                <Text type="secondary" className="block mb-2">Seats</Text>
                <div className="flex flex-wrap gap-2">
                  {booking.bookingSeats.map(bs => (
                    <span key={bs.id} className="bg-green-100 text-green-800 px-3 py-1 rounded font-medium">
                      {getSeatLabel(bs.seat.rowLabel, bs.seat.seatNumber)}
                    </span>
                  ))}
                </div>
              </div>

              <Divider />

              <div className="flex justify-between items-center text-lg">
                <Text strong>Total Amount Paid:</Text>
                <Text strong className="text-green-600">
                  {formatCurrency(booking.totalAmount)}
                </Text>
              </div>

              <div className="flex justify-between items-center">
                <Text type="secondary">Booking Code:</Text>
                <Text strong>{booking.bookingCode}</Text>
              </div>
            </div>

            <Divider />

            <div className="flex gap-4 justify-center">
              <Button 
                size="large" 
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
              <Button 
                type="primary"
                size="large" 
                icon={<HistoryOutlined />}
                onClick={() => navigate('/bookings')}
              >
                View My Bookings
              </Button>
            </div>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default BookingConfirmation;

