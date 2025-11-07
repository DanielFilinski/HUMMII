'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Dropdown,
  Badge,
} from 'antd';
import {
  SearchOutlined,
  LockOutlined,
  UnlockOutlined,
  DeleteOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  MoreOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layouts/AdminLayout';
import { adminApi } from '@/lib/api/admin-client';
import { User, UserRole } from '@/types/admin';
import Head from 'next/head';

const { Search } = Input;

export default function UsersPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | undefined>();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionModalVisible, setActionModalVisible] = useState(false);

  const queryClient = useQueryClient();

  // Запрос списка пользователей
  const { data, isLoading } = useQuery({
    queryKey: ['users', page, limit, search, roleFilter],
    queryFn: () =>
      adminApi.getUsers({
        page,
        limit,
        search: search || undefined,
        role: roleFilter,
      }),
  });

  // Мутация для блокировки пользователя
  const lockUserMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      adminApi.lockUser(userId, reason),
    onSuccess: () => {
      message.success('Пользователь заблокирован');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Ошибка при блокировке пользователя');
    },
  });

  // Мутация для разблокировки пользователя
  const unlockUserMutation = useMutation({
    mutationFn: (userId: string) => adminApi.unlockUser(userId),
    onSuccess: () => {
      message.success('Пользователь разблокирован');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Ошибка при разблокировке пользователя');
    },
  });

  // Мутация для добавления роли
  const addRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminApi.addUserRole(userId, role),
    onSuccess: () => {
      message.success('Роль добавлена');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Ошибка при добавлении роли');
    },
  });

  // Мутация для удаления роли
  const removeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminApi.removeUserRole(userId, role),
    onSuccess: () => {
      message.success('Роль удалена');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: () => {
      message.error('Ошибка при удалении роли');
    },
  });

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => (
        <span className="text-gray-500 text-xs">{id.slice(0, 8)}...</span>
      ),
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: User) => (
        <Space>
          <span className="font-medium">{name}</span>
          {record.isLocked && <Badge status="error" text="Заблокирован" />}
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Роли',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles: UserRole[]) => (
        <Space size={[0, 8]} wrap>
          {roles.map((role) => {
            const colors = {
              ADMIN: 'red',
              CONTRACTOR: 'blue',
              CLIENT: 'green',
            };
            return (
              <Tag key={role} color={colors[role]}>
                {role}
              </Tag>
            );
          })}
        </Space>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (record: User) => (
        <Space>
          {record.isVerified && <Tag color="success">Подтвержден</Tag>}
          {record.isLocked && <Tag color="error">Заблокирован</Tag>}
        </Space>
      ),
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (record: User) => {
        const items = [
          {
            key: 'lock',
            icon: record.isLocked ? <UnlockOutlined /> : <LockOutlined />,
            label: record.isLocked ? 'Разблокировать' : 'Заблокировать',
            onClick: () => {
              if (record.isLocked) {
                unlockUserMutation.mutate(record.id);
              } else {
                Modal.confirm({
                  title: 'Блокировка пользователя',
                  content: 'Вы уверены что хотите заблокировать этого пользователя?',
                  onOk: () => lockUserMutation.mutate({ userId: record.id }),
                });
              }
            },
          },
          {
            key: 'add-role',
            icon: <UserAddOutlined />,
            label: 'Добавить роль',
            onClick: () => {
              setSelectedUser(record);
              setActionModalVisible(true);
            },
          },
        ];

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Управление пользователями | Hummii Admin</title>
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <div className="mb-4">
            <h1 className="text-2xl font-bold mb-4">Управление пользователями</h1>
            
            <Space className="mb-4" wrap>
              <Search
                placeholder="Поиск по имени или email"
                allowClear
                style={{ width: 300 }}
                onSearch={setSearch}
                enterButton={<SearchOutlined />}
              />
              
              <Select
                placeholder="Фильтр по роли"
                style={{ width: 200 }}
                allowClear
                onChange={setRoleFilter}
                options={[
                  { label: 'Все роли', value: undefined },
                  { label: 'Администраторы', value: UserRole.ADMIN },
                  { label: 'Исполнители', value: UserRole.CONTRACTOR },
                  { label: 'Клиенты', value: UserRole.CLIENT },
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
              showTotal: (total) => `Всего: ${total} пользователей`,
            }}
          />
        </Card>
      </motion.div>

      {/* Модалка для управления ролями */}
      <Modal
        title="Управление ролями"
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        footer={null}
      >
        {selectedUser && (
          <div>
            <p className="mb-4">
              Пользователь: <strong>{selectedUser.name}</strong>
            </p>
            <p className="mb-4">Текущие роли:</p>
            <Space className="mb-4" wrap>
              {selectedUser.roles.map((role) => (
                <Tag
                  key={role}
                  closable
                  onClose={() =>
                    removeRoleMutation.mutate({ userId: selectedUser.id, role })
                  }
                >
                  {role}
                </Tag>
              ))}
            </Space>
            
            <Form.Item label="Добавить роль">
              <Select
                placeholder="Выберите роль"
                onChange={(role) =>
                  addRoleMutation.mutate({ userId: selectedUser.id, role })
                }
                options={Object.values(UserRole)
                  .filter((role) => !selectedUser.roles.includes(role))
                  .map((role) => ({
                    label: role,
                    value: role,
                  }))}
              />
            </Form.Item>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}