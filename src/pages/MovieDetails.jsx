import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout, Card, Typography, Button, Tag, Spin, message, Row, Col, Divider } from 'antd';
import { PlayCircleOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import { movieAPI } from '../services/api';
import { formatDate } from '../utils/helpers';
import Navbar from '../components/Navbar';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMovieDetails();
  }, [id]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      const response = await movieAPI.getById(id);
      setMovie(response.data);
    } catch (error) {
      message.error('Failed to fetch movie details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookTickets = () => {
    navigate(`/movies/${id}/shows`);
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

  if (!movie) {
    return (
      <Layout className="min-h-screen">
        <Navbar />
        <Content className="p-6">
          <div className="text-center">
            <Text>Movie not found</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <Card className="shadow-lg">
            <Row gutter={[32, 32]}>
              <Col xs={24} md={8}>
                <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                  {movie.posterUrl ? (
                    <img
                      alt={movie.title}
                      src={movie.posterUrl}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PlayCircleOutlined style={{ fontSize: 80, color: '#ccc' }} />
                  )}
                </div>
              </Col>

              <Col xs={24} md={16}>
                <div className="space-y-4">
                  <Title level={1}>{movie.title}</Title>

                  <div className="flex gap-2 flex-wrap">
                    <Tag color="blue" className="text-base px-3 py-1">
                      {movie.language}
                    </Tag>
                    <Tag color="green" className="text-base px-3 py-1">
                      {movie.rating}
                    </Tag>
                    <Tag color="purple" className="text-base px-3 py-1">
                      {movie.genre}
                    </Tag>
                    <Tag color={movie.status === 'NOW_SHOWING' ? 'red' : 'orange'} className="text-base px-3 py-1">
                      {movie.status === 'NOW_SHOWING' ? 'Now Showing' : 'Coming Soon'}
                    </Tag>
                  </div>

                  <div className="flex gap-6 text-gray-600">
                    <div>
                      <ClockCircleOutlined className="mr-2" />
                      <Text>{movie.duration} minutes</Text>
                    </div>
                    <div>
                      <CalendarOutlined className="mr-2" />
                      <Text>{formatDate(movie.releaseDate)}</Text>
                    </div>
                  </div>

                  <Divider />

                  <div>
                    <Title level={4}>Synopsis</Title>
                    <Paragraph className="text-base text-gray-700">
                      {movie.description || 'No description available.'}
                    </Paragraph>
                  </div>

                  {movie.trailerUrl && (
                    <div>
                      <Button
                        icon={<PlayCircleOutlined />}
                        size="large"
                        onClick={() => window.open(movie.trailerUrl, '_blank')}
                      >
                        Watch Trailer
                      </Button>
                    </div>
                  )}

                  {movie.status === 'NOW_SHOWING' && (
                    <div className="pt-4">
                      <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleBookTickets}
                      >
                        Book Tickets
                      </Button>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      </Content>
    </Layout>
  );
};

export default MovieDetails;

