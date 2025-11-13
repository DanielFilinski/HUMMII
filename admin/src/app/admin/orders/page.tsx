"use client";

import { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Input,
  Button,
  Space,
  Select,
  Modal,
  Descriptions,
  Timeline,
  Statistic,
  Row,
  Col,
  Badge,
  Avatar,
} from 'antd';
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  UserOutlined,
  ToolOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin-client';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  contractor: {
    id: string;
    name: string;
    email: string;
  } | null;
  service: string;
  amount: number;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  description?: string;
  location?: string;
}

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ['orders', statusFilter, searchText],
    queryFn: async () => {
      // Mock data for now
      return [
        {
          id: '1',
          orderNumber: 'ORD-2547',
          customer: { id: '1', name: 'Иван Петров', email: 'ivan@example.com' },
          contractor: { id: '1', name: 'Мария Сидорова', email: 'maria@example.com' },
          service: 'Ремонт смартфона',
          amount: 5000,
          status: 'completed',
          createdAt: '2025-11-09T10:00:00Z',
          updatedAt: '2025-11-09T15:00:00Z',
          completedAt: '2025-11-09T15:00:00Z',
          description: 'Замена экрана iPhone 12',
          location: 'Москва, ул. Ленина, 10',
        },
        {
          id: '2',
          orderNumber: 'ORD-2546',
          customer: { id: '2', name: 'Александр Иванов', email: 'alex@example.com' },
          contractor: { id: '2', name: 'Елена Кузнецова', email: 'elena@example.com' },
          service: 'Установка кондиционера',
          amount: 12000,
          status: 'in_progress',
          createdAt: '2025-11-08T09:00:00Z',
          updatedAt: '2025-11-09T10:00:00Z',
          description: 'Установка сплит-системы в квартире',
          location: 'Москва, ул. Пушкина, 25',
        },
        {
          id: '3',
          orderNumber: 'ORD-2545',
          customer: { id: '3', name: 'Дмитрий Смирнов', email: 'dmitry@example.com' },
          contractor: null,
          service: 'Чистка ноутбука',
          amount: 3500,
          status: 'pending',
          createdAt: '2025-11-07T14:00:00Z',
          updatedAt: '2025-11-07T14:00:00Z',
          description: 'Чистка от пыли и замена термопасты',
          location: 'Москва, ул. Гоголя, 5',
        },
      ] as Order[];
    },
  });

  const statusConfig: Record<string, { color: string; icon: JSX.Element; text: string }> = {
    pending: { color: 'warning', icon: <ClockCircleOutlined />, text: 'Ожидание' },
    accepted: { color: 'processing', icon: <CheckCircleOutlined />, text: 'Принят' },
    in_progress: { color: 'processing', icon: <ClockCircleOutlined />, text: 'В работе' },
    completed: { color: 'success', icon: <CheckCircleOutlined />, text: 'Завершен' },
    cancelled: { color: 'error', icon: <CloseCircleOutlined />, text: 'Отменен' },
  };

  const columns: ColumnsType<Order> = [
    {
      title: 'Номер заказа',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      width: 140,
      render: (orderNumber: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: '#5B7FFF' }}>
          {orderNumber}
        </span>
      ),
    },
    {
      title: 'Клиент',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: Order['customer']) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Avatar size={32} style={{ background: '#5B7FFF', fontWeight: '600' }}>
            {customer.name.charAt(0)}
          </Avatar>
          <div>
            <div style={{ fontWeight: '500', color: '#111827' }}>{customer.name}</div>
            <div style={{ fontSize: '12px', color: '#6B7280' }}>{customer.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Исполнитель',
      dataIndex: 'contractor',
      key: 'contractor',
      render: (contractor: Order['contractor']) =>
        contractor ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar size={32} style={{ background: '#10B981', fontWeight: '600' }}>
              {contractor.name.charAt(0)}
            </Avatar>
            <div>
              <div style={{ fontWeight: '500', color: '#111827' }}>{contractor.name}</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>{contractor.email}</div>
            </div>
          </div>
        ) : (
          <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Не назначен</span>
        ),
    },
    {
      title: 'Услуга',
      dataIndex: 'service',
      key: 'service',
      render: (service: string) => <span style={{ color: '#111827' }}>{service}</span>,
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: '600', color: '#10B981', fontSize: '14px' }}>
          ₽{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: Order['status']) => {
        const config = statusConfig[status];
        return (
          <Tag color={config.color} icon={config.icon} style={{ borderRadius: '6px', fontWeight: '500' }}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 140,
      render: (date: string) => (
        <span style={{ color: '#6B7280', fontSize: '13px' }}>
          {new Date(date).toLocaleDateString('ru-RU')}
        </span>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => {
            setSelectedOrder(record);
            setDetailsModalVisible(true);
          }}
        >
          Детали
        </Button>
      ),
    },
  ];

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.status === 'pending').length || 0,
    inProgress: orders?.filter((o) => o.status === 'in_progress').length || 0,
    completed: orders?.filter((o) => o.status === 'completed').length || 0,
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Управление заказами
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Просмотр и управление всеми заказами на платформе
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderLeft: '4px solid #5B7FFF' }}>
              <Statistic
                title={<span style={{ color: '#6B7280', fontSize: '13px' }}>Всего заказов</span>}
                value={stats.total}
                prefix={<DollarOutlined style={{ color: '#5B7FFF' }} />}
                valueStyle={{ color: '#111827', fontWeight: '700' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderLeft: '4px solid #F59E0B' }}>
              <Statistic
                title={<span style={{ color: '#6B7280', fontSize: '13px' }}>Ожидают</span>}
                value={stats.pending}
                prefix={<ClockCircleOutlined style={{ color: '#F59E0B' }} />}
                valueStyle={{ color: '#111827', fontWeight: '700' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderLeft: '4px solid #06B6D4' }}>
              <Statistic
                title={<span style={{ color: '#6B7280', fontSize: '13px' }}>В работе</span>}
                value={stats.inProgress}
                prefix={<ToolOutlined style={{ color: '#06B6D4' }} />}
                valueStyle={{ color: '#111827', fontWeight: '700' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card bordered={false} style={{ borderLeft: '4px solid #10B981' }}>
              <Statistic
                title={<span style={{ color: '#6B7280', fontSize: '13px' }}>Завершено</span>}
                value={stats.completed}
                prefix={<CheckCircleOutlined style={{ color: '#10B981' }} />}
                valueStyle={{ color: '#111827', fontWeight: '700' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Filters and Actions */}
        <Card bordered={false} style={{ marginBottom: '16px' }}>
          <Space size="middle" wrap>
            <Input
              placeholder="Поиск по номеру, клиенту, исполнителю..."
              prefix={<SearchOutlined style={{ color: '#6B7280' }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 180 }}
            >
              <Option value="all">Все статусы</Option>
              <Option value="pending">Ожидание</Option>
              <Option value="accepted">Принят</Option>
              <Option value="in_progress">В работе</Option>
              <Option value="completed">Завершен</Option>
              <Option value="cancelled">Отменен</Option>
            </Select>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              Обновить
            </Button>
          </Space>
        </Card>

        {/* Orders Table */}
        <Card bordered={false}>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Всего: ${total} заказов`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Order Details Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '18px', fontWeight: '600' }}>Детали заказа</span>
              {selectedOrder && (
                <Tag
                  color={statusConfig[selectedOrder.status].color}
                  icon={statusConfig[selectedOrder.status].icon}
                >
                  {statusConfig[selectedOrder.status].text}
                </Tag>
              )}
            </div>
          }
          open={detailsModalVisible}
          onCancel={() => {
            setDetailsModalVisible(false);
            setSelectedOrder(null);
          }}
          footer={[
            <Button key="close" onClick={() => setDetailsModalVisible(false)}>
              Закрыть
            </Button>,
          ]}
          width={700}
        >
          {selectedOrder && (
            <div>
              <Descriptions column={2} bordered size="small">
                <Descriptions.Item label="Номер заказа" span={2}>
                  <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#5B7FFF' }}>
                    {selectedOrder.orderNumber}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Услуга" span={2}>
                  {selectedOrder.service}
                </Descriptions.Item>
                <Descriptions.Item label="Описание" span={2}>
                  {selectedOrder.description || 'Нет описания'}
                </Descriptions.Item>
                <Descriptions.Item label="Локация" span={2}>
                  {selectedOrder.location || 'Не указана'}
                </Descriptions.Item>
                <Descriptions.Item label="Клиент">
                  <div>
                    <div style={{ fontWeight: '500' }}>{selectedOrder.customer.name}</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>
                      {selectedOrder.customer.email}
                    </div>
                  </div>
                </Descriptions.Item>
                <Descriptions.Item label="Исполнитель">
                  {selectedOrder.contractor ? (
                    <div>
                      <div style={{ fontWeight: '500' }}>{selectedOrder.contractor.name}</div>
                      <div style={{ fontSize: '12px', color: '#6B7280' }}>
                        {selectedOrder.contractor.email}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Не назначен</span>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Сумма">
                  <span style={{ fontWeight: '600', color: '#10B981', fontSize: '16px' }}>
                    ₽{selectedOrder.amount.toLocaleString()}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Дата создания">
                  {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
                </Descriptions.Item>
                <Descriptions.Item label="Последнее обновление">
                  {new Date(selectedOrder.updatedAt).toLocaleString('ru-RU')}
                </Descriptions.Item>
                {selectedOrder.completedAt && (
                  <Descriptions.Item label="Дата завершения">
                    {new Date(selectedOrder.completedAt).toLocaleString('ru-RU')}
                  </Descriptions.Item>
                )}
              </Descriptions>

              <div style={{ marginTop: '24px' }}>
                <h4 style={{ marginBottom: '12px', fontWeight: '600' }}>История заказа</h4>
                <Timeline
                  items={[
                    {
                      color: 'blue',
                      children: (
                        <div>
                          <div style={{ fontWeight: '500' }}>Заказ создан</div>
                          <div style={{ fontSize: '12px', color: '#6B7280' }}>
                            {new Date(selectedOrder.createdAt).toLocaleString('ru-RU')}
                          </div>
                        </div>
                      ),
                    },
                    ...(selectedOrder.contractor
                      ? [
                          {
                            color: 'green',
                            children: (
                              <div>
                                <div style={{ fontWeight: '500' }}>Исполнитель назначен</div>
                                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                  {selectedOrder.contractor.name}
                                </div>
                              </div>
                            ),
                          },
                        ]
                      : []),
                    ...(selectedOrder.status === 'completed'
                      ? [
                          {
                            color: 'green',
                            children: (
                              <div>
                                <div style={{ fontWeight: '500' }}>Заказ завершен</div>
                                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                  {selectedOrder.completedAt
                                    ? new Date(selectedOrder.completedAt).toLocaleString('ru-RU')
                                    : 'N/A'}
                                </div>
                              </div>
                            ),
                          },
                        ]
                      : []),
                  ]}
                />
              </div>
            </div>
          )}
        </Modal>
      </motion.div>
    </AdminLayout>
  );
}
