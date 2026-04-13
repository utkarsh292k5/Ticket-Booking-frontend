import { useState, useEffect } from 'react';
import { Layout, Card, Row, Col, Statistic, Typography, Spin } from 'antd';
import { VideoCameraOutlined, ShopOutlined, FileTextOutlined } from '@ant-design/icons';
import { movieAPI, theatreAPI, bookingAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const { Content } = Layout;
const { Title } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    movies: 0,
    theatres: 0,
    bookings: 0,
    revenue: 0,
    todayBookings: 0,
    todayRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [moviesRes, theatresRes, bookingStatsRes] = await Promise.all([
        movieAPI.getAll(),
        theatreAPI.getAll(),
        bookingAPI.getStats(),
      ]);

      setStats({
        movies: moviesRes.data.length,
        theatres: theatresRes.data.length,
        bookings: bookingStatsRes.data.totalBookings || 0,
        revenue: bookingStatsRes.data.totalRevenue || 0,
        todayBookings: bookingStatsRes.data.todayBookings || 0,
        todayRevenue: bookingStatsRes.data.todayRevenue || 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="mb-6">Admin Dashboard</Title>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Movies"
                  value={stats.movies}
                  prefix={<VideoCameraOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Theatres"
                  value={stats.theatres}
                  prefix={<ShopOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Bookings"
                  value={stats.bookings}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Revenue"
                  value={stats.revenue}
                  prefix="₹"
                  precision={0}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} lg={12}>
              <Card className="bg-blue-50">
                <Statistic
                  title="Today's Bookings"
                  value={stats.todayBookings}
                  prefix={<FileTextOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={12}>
              <Card className="bg-green-50">
                <Statistic
                  title="Today's Revenue"
                  value={stats.todayRevenue}
                  prefix="₹"
                  precision={0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Card title="Quick Actions" className="shadow-md">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <a href="/admin/movies" className="block">
                    <Card hoverable className="text-center">
                      <VideoCameraOutlined style={{ fontSize: 40, color: '#1890ff' }} />
                      <Title level={4} className="mt-4">Manage Movies</Title>
                    </Card>
                  </a>
                  <a href="/admin/theatres" className="block">
                    <Card hoverable className="text-center">
                      <ShopOutlined style={{ fontSize: 40, color: '#52c41a' }} />
                      <Title level={4} className="mt-4">Manage Theatres</Title>
                    </Card>
                  </a>
                  <a href="/admin/shows" className="block">
                    <Card hoverable className="text-center">
                      <FileTextOutlined style={{ fontSize: 40, color: '#faad14' }} />
                      <Title level={4} className="mt-4">Manage Shows</Title>
                    </Card>
                  </a>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default AdminDashboard;