"use client";

import { Card, Row, Col, Statistic, Table, Tag, Button } from 'antd';
import { motion } from 'framer-motion';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/layouts/AdminLayout';
import { adminApi } from '@/lib/api/admin-client';
import Head from 'next/head';

export default function DashboardPage() {
  // Запрос статистики платформы
  const { data: stats, isLoading } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: () => adminApi.getPlatformStats(),
    refetchInterval: 30000, // Обновление каждые 30 секунд
  });
  // Анимация для статистики
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  // Тестовые данные для таблицы последних заказов
  const recentOrders = [
    {
      id: '1',
      customer: 'Иван Петров',
      service: 'Ремонт техники',
      amount: 5000,
      status: 'completed',
      date: '2025-11-07',
    },
    // ... другие заказы
  ];

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Клиент',
      dataIndex: 'customer',
      key: 'customer',
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
      render: (amount: number) => `₽${amount.toLocaleString()}`,
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'green' : 'gold'}>
          {status === 'completed' ? 'Завершен' : 'В процессе'}
        </Tag>
      ),
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
    },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Дашборд | Hummii Admin</title>
      </Head>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card bordered={false} loading={isLoading}>
                <Statistic
                  title="Всего пользователей"
                  value={stats?.totalUsers || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card bordered={false} loading={isLoading}>
                <Statistic
                  title="Активные пользователи"
                  value={stats?.activeUsers || 0}
                  prefix={<UserOutlined />}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card bordered={false} loading={isLoading}>
                <Statistic
                  title="Всего заказов"
                  value={stats?.totalOrders || 0}
                  prefix={<ShoppingCartOutlined />}
                />
              </Card>
            </motion.div>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <motion.div variants={itemVariants}>
              <Card bordered={false} loading={isLoading}>
                <Statistic
                  title="Подтвержденные исполнители"
                  value={stats?.verifiedContractors || 0}
                  prefix={<StarOutlined />}
                />
              </Card>
            </motion.div>
          </Col>
        </Row>

        <motion.div
          variants={itemVariants}
          style={{ marginTop: 24 }}
        >
          <Card
            title="Последние заказы"
            extra={<Button type="primary">Все заказы</Button>}
          >
            <Table
              columns={columns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={{ pageSize: 5 }}
            />
          </Card>
        </motion.div>
      </motion.div>
    </AdminLayout>
  );
}