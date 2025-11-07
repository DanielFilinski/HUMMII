'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Modal,
  Descriptions,
} from 'antd';
import { SearchOutlined, EyeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layouts/AdminLayout';
import { adminApi } from '@/lib/api/admin-client';
import { AuditLog } from '@/types/admin';
import Head from 'next/head';
import ReactJson from '@microlink/react-json-view';

const { Search } = Input;

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [userId, setUserId] = useState<string>();
  const [action, setAction] = useState<string>();
  const [resourceType, setResourceType] = useState<string>();
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  // Запрос списка логов
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, limit, userId, action, resourceType],
    queryFn: () =>
      adminApi.getAuditLogs({
        page,
        limit,
        userId,
        action,
        resourceType,
      }),
  });

  const columns = [
    {
      title: 'Дата/Время',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => (
        <div>
          <div>{new Date(date).toLocaleDateString('ru-RU')}</div>
          <div className="text-xs text-gray-500">
            {new Date(date).toLocaleTimeString('ru-RU')}
          </div>
        </div>
      ),
    },
    {
      title: 'Действие',
      dataIndex: 'action',
      key: 'action',
      render: (action: string) => {
        const colors: Record<string, string> = {
          CREATE: 'green',
          UPDATE: 'blue',
          DELETE: 'red',
          LOGIN: 'purple',
          LOGOUT: 'orange',
          VERIFY: 'cyan',
          REJECT: 'volcano',
          LOCK: 'red',
          UNLOCK: 'green',
        };
        
        const color = Object.keys(colors).find(key => action.includes(key)) || 'default';
        
        return <Tag color={colors[color]}>{action}</Tag>;
      },
    },
    {
      title: 'Тип ресурса',
      dataIndex: 'resourceType',
      key: 'resourceType',
      render: (type: string) => (
        <Tag color="default">{type}</Tag>
      ),
    },
    {
      title: 'ID ресурса',
      dataIndex: 'resourceId',
      key: 'resourceId',
      width: 100,
      render: (id: string) => (
        <span className="text-gray-500 text-xs">{id?.slice(0, 8)}...</span>
      ),
    },
    {
      title: 'ID пользователя',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
      render: (id: string) => (
        <span className="text-gray-500 text-xs">{id?.slice(0, 8)}...</span>
      ),
    },
    {
      title: 'ID администратора',
      dataIndex: 'adminId',
      key: 'adminId',
      width: 100,
      render: (id: string) => (
        <span className="text-gray-500 text-xs">{id?.slice(0, 8)}...</span>
      ),
    },
    {
      title: 'IP адрес',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 130,
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (record: AuditLog) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedLog(record);
            setDetailModalVisible(true);
          }}
        >
          Детали
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Аудит логи | Hummii Admin</title>
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-4">Журнал аудита</h1>

            <Space className="mb-4" wrap>
              <Search
                placeholder="Поиск по User ID"
                allowClear
                style={{ width: 250 }}
                onSearch={setUserId}
                enterButton={<SearchOutlined />}
              />

              <Select
                placeholder="Фильтр по действию"
                style={{ width: 200 }}
                allowClear
                onChange={setAction}
                options={[
                  { label: 'Все действия', value: undefined },
                  { label: 'Создание', value: 'CREATE' },
                  { label: 'Обновление', value: 'UPDATE' },
                  { label: 'Удаление', value: 'DELETE' },
                  { label: 'Вход', value: 'LOGIN' },
                  { label: 'Выход', value: 'LOGOUT' },
                  { label: 'Подтверждение', value: 'VERIFY' },
                  { label: 'Отклонение', value: 'REJECT' },
                  { label: 'Блокировка', value: 'LOCK' },
                  { label: 'Разблокировка', value: 'UNLOCK' },
                ]}
              />

              <Select
                placeholder="Фильтр по типу ресурса"
                style={{ width: 200 }}
                allowClear
                onChange={setResourceType}
                options={[
                  { label: 'Все типы', value: undefined },
                  { label: 'Пользователь', value: 'USER' },
                  { label: 'Заказ', value: 'ORDER' },
                  { label: 'Контрактер', value: 'CONTRACTOR' },
                  { label: 'Отзыв', value: 'REVIEW' },
                  { label: 'Портфолио', value: 'PORTFOLIO' },
                ]}
              />
            </Space>
          </div>

          <Table
            columns={columns}
            dataSource={data?.data || []}
            rowKey="id"
            loading={isLoading}
            pagination={{
              current: page,
              pageSize: limit,
              total: data?.pagination.total || 0,
              onChange: setPage,
              showSizeChanger: false,
              showTotal: (total) => `Всего: ${total} записей`,
            }}
            scroll={{ x: 1200 }}
          />
        </Card>
      </motion.div>

      {/* Модалка детального просмотра */}
      <Modal
        title="Детали записи аудита"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Закрыть
          </Button>,
        ]}
      >
        {selectedLog && (
          <div>
            <Descriptions bordered column={1}>
              <Descriptions.Item label="ID">{selectedLog.id}</Descriptions.Item>
              <Descriptions.Item label="Действие">
                {selectedLog.action}
              </Descriptions.Item>
              <Descriptions.Item label="Тип ресурса">
                {selectedLog.resourceType}
              </Descriptions.Item>
              <Descriptions.Item label="ID ресурса">
                {selectedLog.resourceId}
              </Descriptions.Item>
              <Descriptions.Item label="ID пользователя">
                {selectedLog.userId}
              </Descriptions.Item>
              <Descriptions.Item label="ID администратора">
                {selectedLog.adminId}
              </Descriptions.Item>
              <Descriptions.Item label="IP адрес">
                {selectedLog.ipAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Дата/Время">
                {new Date(selectedLog.createdAt).toLocaleString('ru-RU')}
              </Descriptions.Item>
            </Descriptions>

            <div className="mt-4">
              <h3 className="font-semibold mb-2">Метаданные:</h3>
              {selectedLog.metadata && typeof selectedLog.metadata === 'object' ? (
                <ReactJson
                  src={selectedLog.metadata}
                  theme="rjv-default"
                  collapsed={1}
                  displayDataTypes={false}
                  enableClipboard={false}
                />
              ) : (
                <pre className="bg-gray-100 p-4 rounded">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}