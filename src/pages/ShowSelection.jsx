import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Button, DatePicker, Select, Spin, message, Row, Col, Empty } from 'antd';
import { ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { showAPI, movieAPI, theatreAPI } from '../services/api';
import { formatTime, formatCurrency } from '../utils/helpers';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const ShowSelection = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovie();
    fetchCities();
  }, [movieId]);

  useEffect(() => {
    if (selectedCity && selectedDate) {
      fetchShows();
    }
  }, [selectedDate, selectedCity]);

  const fetchMovie = async () => {
    try {
      const response = await movieAPI.getById(movieId);
      setMovie(response.data);
    } catch (error) {
      message.error('Failed to fetch movie details');
    }
  };

  const fetchCities = async () => {
    try {
      const response = await theatreAPI.getAll();
      const uniqueCities = [...new Set(response.data.map(t => t.city))];
      setCities(uniqueCities);
      if (uniqueCities.length > 0) {
        setSelectedCity(uniqueCities[0]);
      }
    } catch (error) {
      message.error('Failed to fetch cities');
    }
  };

  const fetchShows = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await showAPI.getShows(movieId, dateStr, selectedCity);
      
      // Group shows by theatre
      const groupedShows = response.data.reduce((acc, show) => {
        const theatreName = show.screen.theatre.name;
        if (!acc[theatreName]) {
          acc[theatreName] = {
            theatre: show.screen.theatre,
            shows: []
          };
        }
        acc[theatreName].shows.push(show);
        return acc;
      }, {});
      
      setShows(Object.values(groupedShows));
    } catch (error) {
      message.error('Failed to fetch shows');
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowSelect = (showId) => {
    navigate(`/booking/show/${showId}/seats`);
  };

  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {movie && (
            <Card className="mb-6">
              <Title level={2}>{movie.title}</Title>
              <Text type="secondary">{movie.language} • {movie.genre} • {movie.duration} mins</Text>
            </Card>
          )}

          <Card className="mb-6">
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <div className="space-y-2">
                  <Text strong>Select Date</Text>
                  <DatePicker
                    value={selectedDate}
                    onChange={setSelectedDate}
                    disabledDate={disabledDate}
                    format="DD MMM YYYY"
                    size="large"
                    className="w-full"
                  />
                </div>
              </Col>
              <Col xs={24} md={12}>
                <div className="space-y-2">
                  <Text strong>Select City</Text>
                  <Select
                    value={selectedCity}
                    onChange={setSelectedCity}
                    size="large"
                    className="w-full"
                  >
                    {cities.map(city => (
                      <Option key={city} value={city}>{city}</Option>
                    ))}
                  </Select>
                </div>
              </Col>
            </Row>
          </Card>

          {loading ? (
            <div className="text-center py-20">
              <Spin size="large" />
            </div>
          ) : shows.length > 0 ? (
            <div className="space-y-6">
              {shows.map((item, index) => (
                <Card key={index} className="shadow-md">
                  <div className="mb-4">
                    <Title level={4} className="mb-2">{item.theatre.name}</Title>
                    <Text type="secondary">
                      <EnvironmentOutlined className="mr-1" />
                      {item.theatre.address}, {item.theatre.city}
                    </Text>
                  </div>

                  <div className="flex gap-3 flex-wrap">
                    {item.shows.map(show => (
                      <Button
                        key={show.id}
                        size="large"
                        className="flex flex-col items-center h-auto py-3 px-6"
                        onClick={() => handleShowSelect(show.id)}
                        disabled={show.availableSeats === 0}
                      >
                        <div className="text-lg font-semibold">
                          <ClockCircleOutlined className="mr-1" />
                          {formatTime(show.showTime)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {show.availableSeats} seats
                        </div>
                        <div className="text-sm text-green-600 mt-1">
                          From {formatCurrency(show.regularPrice)}
                        </div>
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <Empty description="No shows available for selected date and city" />
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default ShowSelection;

