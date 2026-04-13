import { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, Table, Modal, Form, Select, DatePicker, TimePicker, InputNumber, message, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { showAPI, movieAPI, theatreAPI, screenAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const ShowManagement = () => {
  const [shows, setShows] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [screens, setScreens] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingShow, setEditingShow] = useState(null);
  const [form] = Form.useForm();

  // Filter state
  const [filterMovie, setFilterMovie] = useState(null);
  const [filterDate, setFilterDate] = useState(dayjs());
  const [selectedTheatre, setSelectedTheatre] = useState(null);

  useEffect(() => {
    fetchMovies();
    fetchTheatres();
  }, []);

  useEffect(() => {
    if (filterMovie && filterDate) {
      fetchShows();
    }
  }, [filterMovie, filterDate]);

  const fetchShows = async () => {
    if (!filterMovie || !filterDate) return;
    setLoading(true);
    try {
      const response = await showAPI.getShows(filterMovie, filterDate.format('YYYY-MM-DD'));
      setShows(response.data);
    } catch (error) {
      message.error('Failed to fetch shows');
    } finally {
      setLoading(false);
    }
  };

  const fetchMovies = async () => {
    try {
      const response = await movieAPI.getAll();
      setMovies(response.data);
      if (response.data.length > 0) {
        setFilterMovie(response.data[0].id);
      }
    } catch (error) {
      message.error('Failed to fetch movies');
    }
  };

  const fetchTheatres = async () => {
    try {
      const response = await theatreAPI.getAll();
      setTheatres(response.data);
    } catch (error) {
      message.error('Failed to fetch theatres');
    }
  };

  const fetchScreensForTheatre = async (theatreId) => {
    try {
      const response = await theatreAPI.getScreens(theatreId);
      setScreens(response.data);
    } catch (error) {
      message.error('Failed to fetch screens');
    }
  };

  const handleAdd = () => {
    setEditingShow(null);
    form.resetFields();
    setScreens([]);
    setSelectedTheatre(null);
    setModalVisible(true);
  };

  const handleEdit = async (show) => {
    setEditingShow(show);
    const theatreId = show.screen?.theatre?.id;
    if (theatreId) {
      setSelectedTheatre(theatreId);
      await fetchScreensForTheatre(theatreId);
    }
    form.setFieldsValue({
      movieId: show.movie?.id,
      theatreId: theatreId,
      screenId: show.screen?.id,
      showDate: show.showDate ? dayjs(show.showDate) : null,
      showTime: show.showTime ? dayjs(show.showTime, 'HH:mm:ss') : null,
      regularPrice: show.regularPrice,
      premiumPrice: show.premiumPrice,
      vipPrice: show.vipPrice,
      status: show.status,
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Show',
      content: 'Are you sure you want to delete this show? This will also cancel any existing bookings.',
      okText: 'Yes',
      okType: 'danger',
      onOk: async () => {
        try {
          await showAPI.delete(id);
          message.success('Show deleted successfully');
          fetchShows();
        } catch (error) {
          message.error('Failed to delete show');
        }
      },
    });
  };

  const handleTheatreChange = (theatreId) => {
    setSelectedTheatre(theatreId);
    form.setFieldValue('screenId', undefined);
    fetchScreensForTheatre(theatreId);
  };

  const handleSubmit = async (values) => {
    try {
      const showData = {
        movie: { id: values.movieId },
        screen: { id: values.screenId },
        showDate: values.showDate?.format('YYYY-MM-DD'),
        showTime: values.showTime?.format('HH:mm:ss'),
        regularPrice: values.regularPrice,
        premiumPrice: values.premiumPrice,
        vipPrice: values.vipPrice,
        availableSeats: 0,
        status: values.status || 'SCHEDULED',
      };

      if (editingShow) {
        await showAPI.update(editingShow.id, showData);
        message.success('Show updated successfully');
      } else {
        await showAPI.create(showData);
        message.success('Show created successfully');
      }

      setModalVisible(false);
      fetchShows();
    } catch (error) {
      message.error('Failed to save show');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SCHEDULED': return 'blue';
      case 'CANCELLED': return 'red';
      case 'COMPLETED': return 'green';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Movie',
      key: 'movie',
      render: (_, record) => record.movie?.title || 'N/A',
    },
    {
      title: 'Theatre',
      key: 'theatre',
      render: (_, record) => record.screen?.theatre?.name || 'N/A',
    },
    {
      title: 'Screen',
      key: 'screen',
      render: (_, record) => record.screen?.name || 'N/A',
    },
    {
      title: 'Date',
      dataIndex: 'showDate',
      key: 'showDate',
      render: (date) => date ? dayjs(date).format('DD MMM YYYY') : 'N/A',
    },
    {
      title: 'Time',
      dataIndex: 'showTime',
      key: 'showTime',
      render: (time) => time ? dayjs(time, 'HH:mm:ss').format('hh:mm A') : 'N/A',
    },
    {
      title: 'Prices (R/P/V)',
      key: 'prices',
      render: (_, record) => (
        <span>
          ₹{record.regularPrice} / ₹{record.premiumPrice} / ₹{record.vipPrice}
        </span>
      ),
    },
    {
      title: 'Available',
      dataIndex: 'availableSeats',
      key: 'availableSeats',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
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
            <div className="flex justify-between items-center mb-6">
              <Title level={2}>Show Management</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Show
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6 flex-wrap">
              <div>
                <label className="block text-sm font-medium mb-1">Movie</label>
                <Select
                  style={{ width: 200 }}
                  placeholder="Select Movie"
                  value={filterMovie}
                  onChange={setFilterMovie}
                >
                  {movies.map((movie) => (
                    <Option key={movie.id} value={movie.id}>
                      {movie.title}
                    </Option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <DatePicker
                  value={filterDate}
                  onChange={setFilterDate}
                  style={{ width: 150 }}
                />
              </div>
              <div className="flex items-end">
                <Button icon={<ReloadOutlined />} onClick={fetchShows}>
                  Refresh
                </Button>
              </div>
            </div>

            {!filterMovie ? (
              <div className="text-center py-8 text-gray-500">
                Please select a movie to view shows
              </div>
            ) : (
              <Table
                dataSource={shows}
                columns={columns}
                loading={loading}
                rowKey="id"
              />
            )}
          </Card>

          {/* Show Modal */}
          <Modal
            title={editingShow ? 'Edit Show' : 'Add Show'}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="movieId"
                label="Movie"
                rules={[{ required: true, message: 'Please select a movie' }]}
              >
                <Select placeholder="Select Movie">
                  {movies.map((movie) => (
                    <Option key={movie.id} value={movie.id}>
                      {movie.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="theatreId"
                label="Theatre"
                rules={[{ required: true, message: 'Please select a theatre' }]}
              >
                <Select placeholder="Select Theatre" onChange={handleTheatreChange}>
                  {theatres.map((theatre) => (
                    <Option key={theatre.id} value={theatre.id}>
                      {theatre.name} - {theatre.city}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="screenId"
                label="Screen"
                rules={[{ required: true, message: 'Please select a screen' }]}
              >
                <Select placeholder="Select Screen" disabled={!selectedTheatre}>
                  {screens.map((screen) => (
                    <Option key={screen.id} value={screen.id}>
                      {screen.name} ({screen.totalSeats} seats)
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  name="showDate"
                  label="Show Date"
                  rules={[{ required: true, message: 'Please select date' }]}
                >
                  <DatePicker className="w-full" />
                </Form.Item>

                <Form.Item
                  name="showTime"
                  label="Show Time"
                  rules={[{ required: true, message: 'Please select time' }]}
                >
                  <TimePicker className="w-full" format="hh:mm A" use12Hours />
                </Form.Item>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Form.Item
                  name="regularPrice"
                  label="Regular Price (₹)"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber min={0} className="w-full" />
                </Form.Item>

                <Form.Item
                  name="premiumPrice"
                  label="Premium Price (₹)"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber min={0} className="w-full" />
                </Form.Item>

                <Form.Item
                  name="vipPrice"
                  label="VIP Price (₹)"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
              </div>

              {editingShow && (
                <Form.Item
                  name="status"
                  label="Status"
                >
                  <Select>
                    <Option value="SCHEDULED">Scheduled</Option>
                    <Option value="CANCELLED">Cancelled</Option>
                    <Option value="COMPLETED">Completed</Option>
                  </Select>
                </Form.Item>
              )}

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingShow ? 'Update' : 'Create'}
                  </Button>
                  <Button onClick={() => setModalVisible(false)}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default ShowManagement;