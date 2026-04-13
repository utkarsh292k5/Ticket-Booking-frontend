import { useState, useEffect } from 'react';
import { Layout, Card, Typography, Button, Table, Modal, Form, Input, Select, InputNumber, message, Space, Tabs, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, DesktopOutlined, AppstoreOutlined } from '@ant-design/icons';
import { theatreAPI, screenAPI } from '../../services/api';
import Navbar from '../../components/Navbar';

const { Content } = Layout;
const { Title } = Typography;
const { Option } = Select;

const TheatreManagement = () => {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [theatreModalVisible, setTheatreModalVisible] = useState(false);
  const [editingTheatre, setEditingTheatre] = useState(null);
  const [theatreForm] = Form.useForm();

  // Screen state
  const [screenModalVisible, setScreenModalVisible] = useState(false);
  const [selectedTheatre, setSelectedTheatre] = useState(null);
  const [screens, setScreens] = useState([]);
  const [screensLoading, setScreensLoading] = useState(false);
  const [screenForm] = Form.useForm();

  // Seat state
  const [seatModalVisible, setSeatModalVisible] = useState(false);
  const [selectedScreen, setSelectedScreen] = useState(null);
  const [seats, setSeats] = useState([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [seatForm] = Form.useForm();

  useEffect(() => {
    fetchTheatres();
  }, []);

  const fetchTheatres = async () => {
    setLoading(true);
    try {
      const response = await theatreAPI.getAll();
      setTheatres(response.data);
    } catch (error) {
      message.error('Failed to fetch theatres');
    } finally {
      setLoading(false);
    }
  };

  const fetchScreens = async (theatreId) => {
    setScreensLoading(true);
    try {
      const response = await theatreAPI.getScreens(theatreId);
      setScreens(response.data);
    } catch (error) {
      message.error('Failed to fetch screens');
    } finally {
      setScreensLoading(false);
    }
  };

  const fetchSeats = async (screenId) => {
    setSeatsLoading(true);
    try {
      const response = await screenAPI.getSeats(screenId);
      setSeats(response.data);
    } catch (error) {
      message.error('Failed to fetch seats');
    } finally {
      setSeatsLoading(false);
    }
  };

  // Theatre handlers
  const handleAddTheatre = () => {
    setEditingTheatre(null);
    theatreForm.resetFields();
    setTheatreModalVisible(true);
  };

  const handleEditTheatre = (theatre) => {
    setEditingTheatre(theatre);
    theatreForm.setFieldsValue(theatre);
    setTheatreModalVisible(true);
  };

  const handleDeleteTheatre = (id) => {
    Modal.confirm({
      title: 'Delete Theatre',
      content: 'Are you sure you want to delete this theatre? This will also delete all screens and shows associated with it.',
      okText: 'Yes',
      okType: 'danger',
      onOk: async () => {
        try {
          await theatreAPI.delete(id);
          message.success('Theatre deleted successfully');
          fetchTheatres();
        } catch (error) {
          message.error('Failed to delete theatre');
        }
      },
    });
  };

  const handleTheatreSubmit = async (values) => {
    try {
      if (editingTheatre) {
        await theatreAPI.update(editingTheatre.id, values);
        message.success('Theatre updated successfully');
      } else {
        await theatreAPI.create(values);
        message.success('Theatre created successfully');
      }
      setTheatreModalVisible(false);
      fetchTheatres();
    } catch (error) {
      message.error('Failed to save theatre');
    }
  };

  // Screen handlers
  const handleManageScreens = (theatre) => {
    setSelectedTheatre(theatre);
    fetchScreens(theatre.id);
    setScreenModalVisible(true);
  };

  const handleAddScreen = () => {
    screenForm.resetFields();
    screenForm.setFieldsValue({ theatreId: selectedTheatre.id });
  };

  const handleScreenSubmit = async (values) => {
    try {
      const screenData = {
        name: values.name,
        totalSeats: values.totalSeats,
        theatre: { id: selectedTheatre.id }
      };
      await screenAPI.create(screenData);
      message.success('Screen created successfully');
      screenForm.resetFields();
      fetchScreens(selectedTheatre.id);
    } catch (error) {
      message.error('Failed to create screen');
    }
  };

  // Seat handlers
  const handleManageSeats = (screen) => {
    setSelectedScreen(screen);
    fetchSeats(screen.id);
    setSeatModalVisible(true);
  };

  const handleGenerateSeats = async (values) => {
    try {
      const { rows, seatsPerRow, vipRows, premiumRows } = values;
      const seatsData = [];
      const rowLabels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

      const vipRowCount = vipRows || 0;
      const premiumRowCount = premiumRows || 0;
      const regularRowCount = rows - vipRowCount - premiumRowCount;

      for (let r = 0; r < rows; r++) {
        let seatType = 'REGULAR';

        // Front rows = Regular, Middle = Premium, Back = VIP (like real cinemas)
        if (r < regularRowCount) {
          seatType = 'REGULAR';
        } else if (r < regularRowCount + premiumRowCount) {
          seatType = 'PREMIUM';
        } else {
          seatType = 'VIP';
        }

        for (let s = 1; s <= seatsPerRow; s++) {
          seatsData.push({
            rowLabel: rowLabels[r],
            seatNumber: s,
            seatType: seatType
          });
        }
      }

      // Clear existing seats first, then create new ones
      if (seats.length > 0) {
        await screenAPI.deleteSeats(selectedScreen.id);
      }

      await screenAPI.createSeats(selectedScreen.id, seatsData);
      message.success(`Generated ${seatsData.length} seats successfully`);
      seatForm.resetFields();
      fetchSeats(selectedScreen.id);
    } catch (error) {
      console.error('Failed to generate seats:', error);
      message.error('Failed to generate seats: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleClearSeats = async () => {
    try {
      await screenAPI.deleteSeats(selectedScreen.id);
      message.success('All seats cleared successfully');
      fetchSeats(selectedScreen.id);
    } catch (error) {
      message.error('Failed to clear seats');
    }
  };

  const theatreColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Phone',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<DesktopOutlined />} onClick={() => handleManageScreens(record)}>
            Screens
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditTheatre(record)}>
            Edit
          </Button>
          <Button size="small" danger icon={<DeleteOutlined />} onClick={() => handleDeleteTheatre(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const screenColumns = [
    {
      title: 'Screen Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Total Seats',
      dataIndex: 'totalSeats',
      key: 'totalSeats',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<AppstoreOutlined />} onClick={() => handleManageSeats(record)}>
            Manage Seats
          </Button>
        </Space>
      ),
    },
  ];

  const getSeatTypeColor = (type) => {
    switch (type) {
      case 'VIP': return 'gold';
      case 'PREMIUM': return 'blue';
      default: return 'green';
    }
  };

  return (
    <Layout className="min-h-screen">
      <Navbar />
      <Content className="p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <Card>
            <div className="flex justify-between items-center mb-6">
              <Title level={2}>Theatre Management</Title>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTheatre}>
                Add Theatre
              </Button>
            </div>

            <Table
              dataSource={theatres}
              columns={theatreColumns}
              loading={loading}
              rowKey="id"
            />
          </Card>

          {/* Theatre Modal */}
          <Modal
            title={editingTheatre ? 'Edit Theatre' : 'Add Theatre'}
            open={theatreModalVisible}
            onCancel={() => setTheatreModalVisible(false)}
            footer={null}
            width={600}
          >
            <Form form={theatreForm} layout="vertical" onFinish={handleTheatreSubmit}>
              <Form.Item
                name="name"
                label="Theatre Name"
                rules={[{ required: true, message: 'Please enter theatre name' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="city"
                label="City"
                rules={[{ required: true, message: 'Please enter city' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item name="address" label="Address">
                <Input />
              </Form.Item>

              <Form.Item name="zipCode" label="Zip Code">
                <Input />
              </Form.Item>

              <Form.Item name="phoneNumber" label="Phone Number">
                <Input />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingTheatre ? 'Update' : 'Create'}
                  </Button>
                  <Button onClick={() => setTheatreModalVisible(false)}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>

          {/* Screen Management Modal */}
          <Modal
            title={`Manage Screens - ${selectedTheatre?.name}`}
            open={screenModalVisible}
            onCancel={() => setScreenModalVisible(false)}
            footer={null}
            width={800}
          >
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: 'Existing Screens',
                  children: (
                    <Table
                      dataSource={screens}
                      columns={screenColumns}
                      loading={screensLoading}
                      rowKey="id"
                      size="small"
                    />
                  ),
                },
                {
                  key: '2',
                  label: 'Add New Screen',
                  children: (
                    <Form form={screenForm} layout="vertical" onFinish={handleScreenSubmit}>
                      <Form.Item
                        name="name"
                        label="Screen Name"
                        rules={[{ required: true, message: 'Please enter screen name' }]}
                      >
                        <Input placeholder="e.g., Screen 1, IMAX, Dolby Atmos" />
                      </Form.Item>

                      <Form.Item
                        name="totalSeats"
                        label="Total Seats"
                        rules={[{ required: true, message: 'Please enter total seats' }]}
                      >
                        <InputNumber min={1} max={500} className="w-full" />
                      </Form.Item>

                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Create Screen
                        </Button>
                      </Form.Item>
                    </Form>
                  ),
                },
              ]}
            />
          </Modal>

          {/* Seat Management Modal */}
          <Modal
            title={`Manage Seats - ${selectedScreen?.name}`}
            open={seatModalVisible}
            onCancel={() => setSeatModalVisible(false)}
            footer={null}
            width={900}
          >
            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: `Existing Seats (${seats.length})`,
                  children: (
                    <div>
                      {seats.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          No seats configured. Use "Generate Seats" tab to create seat layout.
                        </div>
                      ) : (
                        <div className="max-h-96 overflow-auto">
                          <div className="mb-4 p-4 bg-gray-100 rounded text-center">
                            <div className="text-lg font-bold mb-2">SCREEN</div>
                          </div>
                          {Object.entries(
                            seats.reduce((acc, seat) => {
                              if (!acc[seat.rowLabel]) acc[seat.rowLabel] = [];
                              acc[seat.rowLabel].push(seat);
                              return acc;
                            }, {})
                          )
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([rowLabel, rowSeats]) => (
                              <div key={rowLabel} className="flex items-center gap-2 mb-2">
                                <span className="w-8 font-bold">{rowLabel}</span>
                                <div className="flex gap-1 flex-wrap">
                                  {rowSeats
                                    .sort((a, b) => a.seatNumber - b.seatNumber)
                                    .map((seat) => (
                                      <Tag key={seat.id} color={getSeatTypeColor(seat.seatType)}>
                                        {seat.seatNumber}
                                      </Tag>
                                    ))}
                                </div>
                              </div>
                            ))}
                          <div className="mt-4 flex gap-4 justify-center">
                            <Tag color="green">Regular</Tag>
                            <Tag color="blue">Premium</Tag>
                            <Tag color="gold">VIP</Tag>
                          </div>
                          <div className="mt-4 text-center">
                            <Button
                              danger
                              onClick={() => {
                                Modal.confirm({
                                  title: 'Clear All Seats',
                                  content: 'Are you sure you want to delete all seats for this screen? This cannot be undone.',
                                  okText: 'Yes, Clear All',
                                  okType: 'danger',
                                  onOk: handleClearSeats
                                });
                              }}
                            >
                              Clear All Seats
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  key: '2',
                  label: 'Generate Seats',
                  children: (
                    <Form form={seatForm} layout="vertical" onFinish={handleGenerateSeats}>
                      <Form.Item
                        name="rows"
                        label="Total Number of Rows"
                        rules={[{ required: true, message: 'Please enter number of rows' }]}
                      >
                        <InputNumber min={1} max={26} className="w-full" placeholder="e.g., 10" />
                      </Form.Item>

                      <Form.Item
                        name="seatsPerRow"
                        label="Seats Per Row"
                        rules={[{ required: true, message: 'Please enter seats per row' }]}
                      >
                        <InputNumber min={1} max={50} className="w-full" placeholder="e.g., 15" />
                      </Form.Item>

                      <div className="p-4 bg-gray-50 rounded mb-4">
                        <div className="font-medium mb-2">Seat Type Distribution (like real cinemas)</div>
                        <div className="text-gray-500 text-xs mb-3">Front rows = Regular (near screen), Back rows = VIP (best view)</div>

                        <Form.Item
                          name="premiumRows"
                          label="Premium Rows (middle section)"
                          initialValue={0}
                          tooltip="Middle rows will be Premium seats"
                        >
                          <InputNumber min={0} max={26} className="w-full" placeholder="e.g., 3" />
                        </Form.Item>

                        <Form.Item
                          name="vipRows"
                          label="VIP Rows (back rows - best view)"
                          initialValue={0}
                          tooltip="Last N rows will be VIP seats"
                        >
                          <InputNumber min={0} max={26} className="w-full" placeholder="e.g., 2" />
                        </Form.Item>

                        <div className="text-gray-500 text-sm">
                          Remaining front rows will be Regular seats.
                        </div>
                      </div>

                      <Form.Item>
                        <Button type="primary" htmlType="submit">
                          Generate Seats
                        </Button>
                      </Form.Item>

                      <div className="text-gray-500 text-sm mt-2">
                        <div className="font-medium mb-1">Example:</div>
                        <div>10 rows with 3 Premium + 2 VIP = A-E (Regular), F-H (Premium), I-J (VIP)</div>
                      </div>
                    </Form>
                  ),
                },
              ]}
            />
          </Modal>
        </div>
      </Content>
    </Layout>
  );
};

export default TheatreManagement;