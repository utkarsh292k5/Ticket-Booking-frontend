import { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, Table, Modal, Form, Input, Select, DatePicker, message, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { movieAPI } from '../../services/api';
import { formatDate } from '../../utils/helpers';
import Navbar from '../../components/Navbar';

const { Content } = Layout;
const { Title } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const MovieManagement = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const response = await movieAPI.getAll();
      setMovies(response.data);
    } catch (error) {
      message.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingMovie(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    form.setFieldsValue({
      ...movie,
      releaseDate: movie.releaseDate ? dayjs(movie.releaseDate) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Movie',
      content: 'Are you sure you want to delete this movie?',
      okText: 'Yes',
      okType: 'danger',
      onOk: async () => {
        try {
          await movieAPI.delete(id);
          message.success('Movie deleted successfully');
          fetchMovies();
        } catch (error) {
          message.error('Failed to delete movie');
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      const movieData = {
        ...values,
        releaseDate: values.releaseDate?.format('YYYY-MM-DD'),
      };

      if (editingMovie) {
        await movieAPI.update(editingMovie.id, movieData);
        message.success('Movie updated successfully');
      } else {
        await movieAPI.create(movieData);
        message.success('Movie created successfully');
      }

      setModalVisible(false);
      fetchMovies();
    } catch (error) {
      message.error('Failed to save movie');
    }
  };

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
    },
    {
      title: 'Genre',
      dataIndex: 'genre',
      key: 'genre',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => `${duration} mins`,
    },
    {
      title: 'Release Date',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      render: (date) => formatDate(date),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
              <Title level={2}>Movie Management</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                Add Movie
              </Button>
            </div>

            <Table
              dataSource={movies}
              columns={columns}
              loading={loading}
              rowKey="id"
            />
          </Card>

          <Modal
            title={editingMovie ? 'Edit Movie' : 'Add Movie'}
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="title"
                label="Title"
                rules={[{ required: true, message: 'Please enter title' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="description" label="Description">
                <TextArea rows={3} />
              </Form.Item>

              <Form.Item name="posterUrl" label="Poster URL">
                <Input />
              </Form.Item>

              <Form.Item name="trailerUrl" label="Trailer URL">
                <Input />
              </Form.Item>

              <Form.Item
                name="language"
                label="Language"
                rules={[{ required: true, message: 'Please enter language' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="genre"
                label="Genre"
                rules={[{ required: true, message: 'Please enter genre' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="duration"
                label="Duration (minutes)"
                rules={[{ required: true, message: 'Please enter duration' }]}
              >
                <Input type="number" />
              </Form.Item>

              <Form.Item name="rating" label="Rating">
                <Select>
                  <Option value="G">G</Option>
                  <Option value="PG">PG</Option>
                  <Option value="PG-13">PG-13</Option>
                  <Option value="R">R</Option>
                  <Option value="NC-17">NC-17</Option>
                </Select>
              </Form.Item>

              <Form.Item name="releaseDate" label="Release Date">
                <DatePicker className="w-full" />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select>
                  <Option value="NOW_SHOWING">Now Showing</Option>
                  <Option value="UPCOMING">Upcoming</Option>
                  <Option value="ENDED">Ended</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingMovie ? 'Update' : 'Create'}
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

export default MovieManagement;

