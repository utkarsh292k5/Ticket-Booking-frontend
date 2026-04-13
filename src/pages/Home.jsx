import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Card, Row, Col, Typography, Tag, Button, Spin, message, Tabs } from 'antd';
import { PlayCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { movieAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Meta } = Card;

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('NOW_SHOWING');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMovies(activeTab);
  }, [activeTab]);

  const fetchMovies = async (status) => {
    setLoading(true);
    try {
      const response = await movieAPI.getByStatus(status);
      setMovies(response.data);
    } catch (error) {
      message.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movies/${movieId}`);
  };

  const tabs = [
    { key: 'NOW_SHOWING', label: 'Now Showing' },
    { key: 'UPCOMING', label: 'Coming Soon' },
  ];

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <Title level={1}>Book Movie Tickets</Title>
            <Text type="secondary" className="text-lg">
              Choose from the latest movies and book your seats now!
            </Text>
          </div>

          <Tabs 
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabs}
            size="large"
            className="mb-6"
          />

          {loading ? (
            <div className="text-center py-20">
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[24, 24]}>
              {movies.map((movie) => (
                <Col xs={24} sm={12} md={8} lg={6} key={movie.id}>
                  <Card
                    hoverable
                    className="movie-card h-full"
                    cover={
                      <div className="h-80 bg-gray-200 flex items-center justify-center overflow-hidden">
                        {movie.posterUrl ? (
                          <img
                            alt={movie.title}
                            src={movie.posterUrl}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <PlayCircleOutlined style={{ fontSize: 60, color: '#ccc' }} />
                        )}
                      </div>
                    }
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <Meta
                      title={
                        <div className="truncate" title={movie.title}>
                          {movie.title}
                        </div>
                      }
                      description={
                        <div className="space-y-2">
                          <div className="flex gap-2 flex-wrap">
                            <Tag color="blue">{movie.language}</Tag>
                            <Tag color="green">{movie.rating}</Tag>
                          </div>
                          <div className="text-sm text-gray-600">
                            <CalendarOutlined className="mr-1" />
                            {formatDate(movie.releaseDate)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {movie.duration} mins • {movie.genre}
                          </div>
                          {movie.status === 'NOW_SHOWING' && (
                            <Button type="primary" block className="mt-3">
                              Book Tickets
                            </Button>
                          )}
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}

          {!loading && movies.length === 0 && (
            <div className="text-center py-20">
              <Text type="secondary" className="text-lg">
                No movies available
              </Text>
            </div>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default Home;

