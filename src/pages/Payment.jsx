import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Button, Radio, Spin, message, Divider, Alert } from 'antd';
import { CreditCardOutlined, MobileOutlined, BankOutlined, WalletOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { paymentAPI, bookingAPI } from '../services/api';
import { formatCurrency, getSeatLabel } from '../utils/helpers';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title, Text } = Typography;

const Payment = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { booking, show, selectedSeats } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [processing, setProcessing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  useEffect(() => {
    if (!booking) {
      message.error('Invalid booking');
      navigate('/');
      return;
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          message.error('Booking time expired. Please try again.');
          navigate(`/booking/show/${show.id}/seats`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // Step 1: Process payment (mock)
      const paymentResponse = await paymentAPI.create(
        booking.paymentTransactionId,
        paymentMethod
      );

      if (paymentResponse.data.status !== 'SUCCESS') {
        throw new Error('Payment failed');
      }

      message.success('Payment successful!');

      // Step 2: Confirm booking
      await bookingAPI.confirm(bookingId, booking.paymentTransactionId);

      message.success('Booking confirmed!');

      // Navigate to confirmation page
      navigate(`/booking/confirmation/${bookingId}`);

    } catch (error) {
      message.error(error.response?.data?.message || 'Payment failed. Please try again.');
      
      // On payment failure, unlock seats and navigate back
      setTimeout(() => {
        navigate(`/booking/show/${show.id}/seats`);
      }, 2000);
    } finally {
      setProcessing(false);
    }
  };

  if (!booking || !show) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 flex items-center justify-center">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Alert
            message={
              <div className="flex items-center justify-center gap-2">
                <ClockCircleOutlined />
                <Text strong>Complete payment within: {formatTimeLeft()}</Text>
              </div>
            }
            type="warning"
            className="mb-6 text-center"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Card title="Booking Details">
                <div className="space-y-3">
                  <div>
                    <Text type="secondary">Movie</Text>
                    <div><Text strong>{show.movie.title}</Text></div>
                  </div>
                  
                  <div>
                    <Text type="secondary">Theatre</Text>
                    <div><Text strong>{show.screen.theatre.name}</Text></div>
                    <div><Text className="text-sm">{show.screen.theatre.address}</Text></div>
                  </div>

                  <div>
                    <Text type="secondary">Show Time</Text>
                    <div><Text strong>{show.showTime}</Text></div>
                  </div>

                  <Divider />

                  <div>
                    <Text type="secondary">Selected Seats</Text>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedSeats?.map(seat => (
                        <span key={seat.seatId} className="bg-blue-100 px-3 py-1 rounded">
                          {getSeatLabel(seat.rowLabel, seat.seatNumber)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Divider />

                  <div className="flex justify-between text-lg">
                    <Text strong>Total Amount:</Text>
                    <Text strong className="text-green-600">
                      {formatCurrency(booking.totalAmount)}
                    </Text>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card title="Payment Method">
                <Radio.Group 
                  value={paymentMethod} 
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full"
                >
                  <div className="space-y-3">
                    <Radio value="CREDIT_CARD" className="w-full p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <CreditCardOutlined style={{ fontSize: 20 }} />
                        <Text>Credit Card</Text>
                      </div>
                    </Radio>
                    
                    <Radio value="DEBIT_CARD" className="w-full p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <CreditCardOutlined style={{ fontSize: 20 }} />
                        <Text>Debit Card</Text>
                      </div>
                    </Radio>
                    
                    <Radio value="UPI" className="w-full p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <MobileOutlined style={{ fontSize: 20 }} />
                        <Text>UPI</Text>
                      </div>
                    </Radio>
                    
                    <Radio value="NET_BANKING" className="w-full p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <BankOutlined style={{ fontSize: 20 }} />
                        <Text>Net Banking</Text>
                      </div>
                    </Radio>
                    
                    <Radio value="WALLET" className="w-full p-3 border rounded hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <WalletOutlined style={{ fontSize: 20 }} />
                        <Text>Wallet</Text>
                      </div>
                    </Radio>
                  </div>
                </Radio.Group>

                <Divider />

                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handlePayment}
                  loading={processing}
                >
                  Pay {formatCurrency(booking.totalAmount)}
                </Button>

                <Text type="secondary" className="text-xs block text-center mt-3">
                  This is a mock payment gateway. Payment will be processed automatically.
                </Text>
              </Card>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default Payment;

