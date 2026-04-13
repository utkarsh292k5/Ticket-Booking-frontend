import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Button, Spin, message, Tag, Divider, Modal } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { showAPI, bookingAPI } from '../services/api';
import { formatTime, formatCurrency, groupSeatsByRow, getSeatLabel, generateIdempotencyKey } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title, Text } = Typography;

const SeatSelection = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [lockTimer, setLockTimer] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading before checking user
    if (authLoading) return;
    
    // ProtectedRoute already handles auth, but just in case
    if (!user) {
      message.warning('Please login to book tickets');
      navigate('/login', { state: { from: `/booking/show/${showId}/seats` } });
      return;
    }
    
    fetchShowDetails();
    fetchSeats();
    
    // Refresh seats every 5 seconds for real-time updates
    const interval = setInterval(fetchSeats, 5000);
    
    return () => {
      clearInterval(interval);
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, [showId, authLoading, user]);

  const fetchShowDetails = async () => {
    try {
      const response = await showAPI.getById(showId);
      setShow(response.data);
    } catch (error) {
      message.error('Failed to fetch show details');
    }
  };

  const fetchSeats = async () => {
    try {
      const response = await showAPI.getSeatAvailability(showId);
      setSeats(response.data);
    } catch (error) {
      message.error('Failed to fetch seat availability');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatClick = (seat) => {
    if (seat.status !== 'AVAILABLE') return;

    const seatId = seat.seatId;
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  const getSeatClass = (seat) => {
    let baseClass = 'seat';

    // Add seat type class for color coding
    if (seat.seatType === 'VIP') baseClass += ' vip';
    else if (seat.seatType === 'PREMIUM') baseClass += ' premium';
    else baseClass += ' regular';

    // Add status class
    if (selectedSeats.includes(seat.seatId)) return baseClass + ' selected';
    if (seat.status === 'BOOKED') return baseClass + ' booked';
    if (seat.status === 'LOCKED') return baseClass + ' locked';
    return baseClass + ' available';
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find(s => s.seatId === seatId);
      return total + parseFloat(seat?.price || 0);
    }, 0);
  };

  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      message.warning('Please select at least one seat');
      return;
    }

    setBooking(true);

    try {
      // Initiate booking (backend handles seat locking internally)
      const bookingRequest = {
        showId: parseInt(showId),
        seatIds: selectedSeats,
        userId: user.userId,
        idempotencyKey: generateIdempotencyKey()
      };

      const bookingResponse = await bookingAPI.initiate(bookingRequest);
      const bookingData = bookingResponse.data;

      message.success('Seats reserved! Proceeding to payment...');

      // Navigate to payment page
      navigate(`/payment/${bookingData.bookingId}`, {
        state: {
          booking: bookingData,
          show: show,
          selectedSeats: seats.filter(s => selectedSeats.includes(s.seatId))
        }
      });

    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to proceed with booking');
      fetchSeats(); // Refresh seats
      setSelectedSeats([]);
    } finally {
      setBooking(false);
    }
  };

  if (authLoading || loading || !show) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6 flex items-center justify-center">
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  const groupedSeats = groupSeatsByRow(seats);

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Card className="mb-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <Title level={3} className="mb-2">{show.movie.title}</Title>
                <Text type="secondary">
                  {show.screen.theatre.name} • Screen {show.screen.name} •
                  <ClockCircleOutlined className="ml-2 mr-1" />
                  {formatTime(show.showTime)}
                </Text>
                <div className="mt-2 flex gap-4">
                  <Tag color="blue">Regular: {formatCurrency(show.regularPrice)}</Tag>
                  <Tag color="purple">Premium: {formatCurrency(show.premiumPrice)}</Tag>
                  <Tag color="gold">VIP: {formatCurrency(show.vipPrice)}</Tag>
                </div>
              </div>
              <Tag color="green" className="text-base px-4 py-2">
                {show.availableSeats} seats available
              </Tag>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <div className="screen-indicator mb-6">
                  <Text className="text-white">SCREEN THIS WAY</Text>
                </div>

                <div className="space-y-4">
                  {Object.keys(groupedSeats).sort().map(row => (
                    <div key={row} className="flex items-center gap-2">
                      <div className="w-8 font-bold text-gray-600">{row}</div>
                      <div className="flex gap-2 flex-wrap">
                        {groupedSeats[row].map(seat => (
                          <div
                            key={seat.seatId}
                            className={getSeatClass(seat)}
                            onClick={() => handleSeatClick(seat)}
                            title={`${getSeatLabel(seat.rowLabel, seat.seatNumber)} - ${seat.status} - ${formatCurrency(seat.price)}`}
                          >
                            {seat.seatNumber}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <Divider />

                {/* Seat Type Legend */}
                <div className="flex gap-6 flex-wrap justify-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="seat regular available"></div>
                    <Text>Regular</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="seat premium available"></div>
                    <Text>Premium</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="seat vip available"></div>
                    <Text>VIP</Text>
                  </div>
                </div>

                {/* Status Legend */}
                <div className="flex gap-6 flex-wrap justify-center">
                  <div className="flex items-center gap-2">
                    <div className="seat available"></div>
                    <Text>Available</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="seat selected"></div>
                    <Text>Selected</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="seat booked"></div>
                    <Text>Booked</Text>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="seat locked"></div>
                    <Text>Locked</Text>
                  </div>
                </div>
              </Card>
            </div>

            <div>
              <Card title="Booking Summary" className="sticky top-6">
                <div className="space-y-4">
                  <div>
                    <Text strong>Selected Seats:</Text>
                    <div className="mt-2">
                      {selectedSeats.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedSeats.map(seatId => {
                            const seat = seats.find(s => s.seatId === seatId);
                            const tagColor = seat?.seatType === 'VIP' ? 'gold' :
                                            seat?.seatType === 'PREMIUM' ? 'purple' : 'blue';
                            return (
                              <Tag key={seatId} color={tagColor} className="text-base px-3 py-1">
                                {getSeatLabel(seat.rowLabel, seat.seatNumber)} ({seat?.seatType})
                              </Tag>
                            );
                          })}
                        </div>
                      ) : (
                        <Text type="secondary">No seats selected</Text>
                      )}
                    </div>
                  </div>

                  <Divider />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Text>Number of Seats:</Text>
                      <Text strong>{selectedSeats.length}</Text>
                    </div>
                    <div className="flex justify-between text-lg">
                      <Text strong>Total Amount:</Text>
                      <Text strong className="text-green-600">
                        {formatCurrency(calculateTotal())}
                      </Text>
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    block
                    icon={<CheckCircleOutlined />}
                    onClick={handleProceedToPayment}
                    loading={booking}
                    disabled={selectedSeats.length === 0}
                  >
                    Proceed to Payment
                  </Button>

                  <Text type="secondary" className="text-xs block text-center">
                    Seats will be locked for 5 minutes
                  </Text>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Content>
    </Layout>
  );
};

export default SeatSelection;