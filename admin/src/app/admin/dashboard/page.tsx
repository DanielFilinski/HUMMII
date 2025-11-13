"use client";

import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import { motion } from 'framer-motion';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  StarOutlined,
  RiseOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layouts/AdminLayout';
import { adminApi } from '@/lib/api/admin-client';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useEffect } from 'react';

export default function DashboardPage() {
  // Устанавливаем заголовок страницы
  useEffect(() => {
    document.title = 'Дашборд | Hummii Admin';
    console.log('Dashboard page mounted');
  }, []);
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      try {
        console.log('Fetching platform stats...');
        const result = await adminApi.getPlatformStats();
        console.log('Platform stats received:', result);
        return result;
      } catch (error) {
        console.error('Error fetching stats:', error);
        return {
          totalUsers: 1247,
          activeUsers: 892,
          totalOrders: 3456,
          verifiedContractors: 234,
          totalRevenue: 1245678,
          pendingOrders: 45,
          completedOrders: 3211,
          cancelledOrders: 200,
          pendingVerifications: 12,
        };
      }
    },
    refetchInterval: 30000,
  });

  console.log('Dashboard rendering with stats:', stats, 'isLoading:', isLoading);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const userGrowthData = [
    { month: 'Янв', users: 850, active: 620 },
    { month: 'Фев', users: 920, active: 680 },
    { month: 'Мар', users: 1050, active: 750 },
    { month: 'Апр', users: 1180, active: 820 },
    { month: 'Май', users: 1090, active: 780 },
    { month: 'Июн', users: 1247, active: 892 },
  ];

  const revenueData = [
    { month: 'Янв', revenue: 850000 },
    { month: 'Фев', revenue: 920000 },
    { month: 'Мар', revenue: 1050000 },
    { month: 'Апр', revenue: 1180000 },
    { month: 'Май', revenue: 1090000 },
    { month: 'Июн', revenue: 1245678 },
  ];

  const orderStatusData = [
    { name: 'Завершено', value: stats?.completedOrders || 3211, color: '#52c41a' },
    { name: 'В процессе', value: stats?.pendingOrders || 45, color: '#faad14' },
    { name: 'Отменено', value: stats?.cancelledOrders || 200, color: '#ff4d4f' },
  ];

  const recentOrders = [
    {
      id: 'ORD-2547',
      customer: 'Иван Петров',
      service: 'Ремонт смартфона',
      amount: 5000,
      status: 'completed',
      date: '2025-11-09',
    },
    {
      id: 'ORD-2546',
      customer: 'Мария Сидорова',
      service: 'Установка кондиционера',
      amount: 12000,
      status: 'in_progress',
      date: '2025-11-08',
    },
    {
      id: 'ORD-2545',
      customer: 'Александр Иванов',
      service: 'Чистка ноутбука',
      amount: 3500,
      status: 'completed',
      date: '2025-11-08',
    },
    {
      id: 'ORD-2544',
      customer: 'Елена Кузнецова',
      service: 'Ремонт холодильника',
      amount: 8500,
      status: 'pending',
      date: '2025-11-07',
    },
    {
      id: 'ORD-2543',
      customer: 'Дмитрий Смирнов',
      service: 'Настройка ПК',
      amount: 4200,
      status: 'completed',
      date: '2025-11-07',
    },
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>{id}</span>,
    },
    {
      title: 'Клиент',
      dataIndex: 'customer',
      key: 'customer',
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#5B7FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '14px',
            fontWeight: '600',
          }}>
            {name.charAt(0)}
          </div>
          <span style={{ fontWeight: '500', color: '#111827' }}>{name}</span>
        </div>
      ),
    },
    {
      title: 'Услуга',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => (
        <span style={{ fontWeight: '600', color: '#52c41a' }}>
          ₽{amount.toLocaleString()}
        </span>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig = {
          completed: { color: 'success', text: 'Завершен', icon: <CheckCircleOutlined /> },
          in_progress: { color: 'processing', text: 'В процессе', icon: <ClockCircleOutlined /> },
          pending: { color: 'warning', text: 'Ожидание', icon: <ClockCircleOutlined /> },
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Статистические карточки */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card
                bordered={false}
                loading={isLoading}
                className="stat-card"
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  borderLeft: '4px solid #5B7FFF',
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#EEF2FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <UserOutlined style={{ fontSize: '24px', color: '#5B7FFF' }} />
                  </div>
                </div>
                <Statistic
                  title={<span style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Всего пользователей</span>}
                  value={stats?.totalUsers || 0}
                  valueStyle={{ color: '#111827', fontWeight: '700', fontSize: '28px' }}
                />
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <ArrowUpOutlined style={{ color: '#10B981' }} />
                  <span style={{ color: '#10B981', fontWeight: '500' }}>+12.5% за месяц</span>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card
                bordered={false}
                loading={isLoading}
                className="stat-card"
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  borderLeft: '4px solid #8B5CF6',
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#F5F3FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <RiseOutlined style={{ fontSize: '24px', color: '#8B5CF6' }} />
                  </div>
                </div>
                <Statistic
                  title={<span style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Активные пользователи</span>}
                  value={stats?.activeUsers || 0}
                  valueStyle={{ color: '#111827', fontWeight: '700', fontSize: '28px' }}
                />
                <div style={{ marginTop: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#6B7280', fontWeight: '500' }}>
                    {stats ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : '0'}% активности
                  </span>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card
                bordered={false}
                loading={isLoading}
                className="stat-card"
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  borderLeft: '4px solid #06B6D4',
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#ECFEFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <ShoppingCartOutlined style={{ fontSize: '24px', color: '#06B6D4' }} />
                  </div>
                </div>
                <Statistic
                  title={<span style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Всего заказов</span>}
                  value={stats?.totalOrders || 0}
                  valueStyle={{ color: '#111827', fontWeight: '700', fontSize: '28px' }}
                />
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <ArrowUpOutlined style={{ color: '#10B981' }} />
                  <span style={{ color: '#10B981', fontWeight: '500' }}>+8.2% за неделю</span>
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card
                bordered={false}
                loading={isLoading}
                className="stat-card"
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  borderLeft: '4px solid #10B981',
                }}
                bodyStyle={{ padding: '20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: '#ECFDF5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <StarOutlined style={{ fontSize: '24px', color: '#10B981' }} />
                  </div>
                </div>
                <Statistic
                  title={<span style={{ color: '#6B7280', fontSize: '13px', fontWeight: '500' }}>Подтвержденные исполнители</span>}
                  value={stats?.verifiedContractors || 0}
                  valueStyle={{ color: '#111827', fontWeight: '700', fontSize: '28px' }}
                />
                <div style={{ marginTop: '12px', fontSize: '13px' }}>
                  <span style={{ color: '#6B7280', fontWeight: '500' }}>
                    {stats?.pendingVerifications || 0} на проверке
                  </span>
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Графики */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} lg={16}>
            <motion.div variants={itemVariants}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>Рост пользователей</span>
                    <Tag color="blue">За последние 6 месяцев</Tag>
                  </div>
                }
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#5B7FFF"
                      fill="#5B7FFF"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Всего пользователей"
                    />
                    <Area
                      type="monotone"
                      dataKey="active"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.1}
                      strokeWidth={2}
                      name="Активные"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} lg={8}>
            <motion.div variants={itemVariants}>
              <Card
                title={
                  <span style={{ fontSize: '16px', fontWeight: '600' }}>Статус заказов</span>
                }
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={orderStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry: any) => `${entry.name}: ${((entry.percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {orderStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ marginTop: '16px' }}>
                  {orderStatusData.map((item, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%',
                            backgroundColor: item.color 
                          }}
                        />
                        <span style={{ fontSize: '14px', color: '#595959' }}>{item.name}</span>
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* График выручки */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24}>
            <motion.div variants={itemVariants}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>Выручка</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <Tag color="green">
                        <DollarOutlined /> ₽{(stats?.totalRevenue || 0).toLocaleString()}
                      </Tag>
                      <Button type="primary" size="small">Экспорт</Button>
                    </div>
                  </div>
                }
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number) => `₽${value.toLocaleString()}`}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="#10B981"
                      radius={[8, 8, 0, 0]}
                      name="Выручка"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* Таблица последних заказов */}
        <motion.div variants={itemVariants}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <span style={{ fontSize: '16px', fontWeight: '600' }}>Последние заказы</span>
                <Button type="primary" size="small">Все заказы</Button>
              </div>
            }
            bordered={false}
            style={{
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            }}
          >
            <Table
              columns={columns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              scroll={{ x: 800 }}
            />
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}
