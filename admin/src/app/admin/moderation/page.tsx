'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  Card,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Tag,
  message,
  Image,
} from 'antd';
import { CheckOutlined, CloseOutlined, EyeOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layouts/AdminLayout';
import { adminApi } from '@/lib/api/admin-client';
import { ContractorVerification } from '@/types/admin';
import Head from 'next/head';

const { TextArea } = Input;

export default function ModerationPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selectedContractor, setSelectedContractor] =
    useState<ContractorVerification | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const queryClient = useQueryClient();

  // Запрос списка на модерацию
  const { data, isLoading } = useQuery({
    queryKey: ['pending-contractors', page, limit],
    queryFn: () => adminApi.getPendingContractors({ page, limit }),
  });

  // Мутация для подтверждения
  const verifyMutation = useMutation({
    mutationFn: (contractorId: string) =>
      adminApi.verifyContractor(contractorId, { verified: true }),
    onSuccess: () => {
      message.success('Контрактер подтвержден');
      queryClient.invalidateQueries({ queryKey: ['pending-contractors'] });
      setDetailModalVisible(false);
    },
    onError: () => {
      message.error('Ошибка при подтверждении');
    },
  });

  // Мутация для отклонения
  const rejectMutation = useMutation({
    mutationFn: ({
      contractorId,
      reason,
    }: {
      contractorId: string;
      reason: string;
    }) => adminApi.rejectContractor(contractorId, reason),
    onSuccess: () => {
      message.success('Заявка отклонена');
      queryClient.invalidateQueries({ queryKey: ['pending-contractors'] });
      setDetailModalVisible(false);
      setRejectModalVisible(false);
      setRejectReason('');
    },
    onError: () => {
      message.error('Ошибка при отклонении');
    },
  });

  const handleReject = () => {
    if (!selectedContractor) return;
    if (!rejectReason.trim()) {
      message.error('Укажите причину отклонения');
      return;
    }
    rejectMutation.mutate({
      contractorId: selectedContractor.id,
      reason: rejectReason,
    });
  };

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
      key: 'name',
      render: (record: ContractorVerification) => (
        <div>
          <div className="font-medium">{record.user.name}</div>
          <div className="text-xs text-gray-500">{record.user.email}</div>
        </div>
      ),
    },
    {
      title: 'Название бизнеса',
      dataIndex: 'businessName',
      key: 'businessName',
      render: (name: string) => name || <span className="text-gray-400">Не указано</span>,
    },
    {
      title: 'Тип бизнеса',
      dataIndex: 'businessType',
      key: 'businessType',
      render: (type: string) => type || <span className="text-gray-400">Не указано</span>,
    },
    {
      title: 'Документы',
      dataIndex: 'documents',
      key: 'documents',
      render: (documents: string[]) => (
        <Tag color="blue">{documents?.length || 0} документов</Tag>
      ),
    },
    {
      title: 'Дата подачи',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (record: ContractorVerification) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedContractor(record);
              setDetailModalVisible(true);
            }}
          >
            Просмотр
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Подтверждение контрактера',
                content: `Вы уверены что хотите подтвердить ${record.user.name}?`,
                onOk: () => verifyMutation.mutate(record.id),
              });
            }}
          >
            Подтвердить
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={() => {
              setSelectedContractor(record);
              setRejectModalVisible(true);
            }}
          >
            Отклонить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <Head>
        <title>Модерация контрактеров | Hummii Admin</title>
      </Head>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            Модерация контрактеров
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Проверка и подтверждение заявок на регистрацию исполнителей
          </p>
        </div>

        {/* Table */}
        <Card bordered={false}>
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
              showSizeChanger: true,
              showTotal: (total) => `Всего: ${total} заявок`,
            }}
          />
        </Card>
      </motion.div>

      {/* Модалка просмотра деталей */}
      <Modal
        title="Детали заявки"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={800}
        footer={[
          <Button key="cancel" onClick={() => setDetailModalVisible(false)}>
            Закрыть
          </Button>,
          <Button
            key="reject"
            danger
            onClick={() => {
              setDetailModalVisible(false);
              setRejectModalVisible(true);
            }}
          >
            Отклонить
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => {
              if (selectedContractor) {
                verifyMutation.mutate(selectedContractor.id);
              }
            }}
          >
            Подтвердить
          </Button>,
        ]}
      >
        {selectedContractor && (
          <div>
            <div className="mb-4">
              <h3 className="font-semibold">Информация о пользователе</h3>
              <p>
                <strong>Имя:</strong> {selectedContractor.user.name}
              </p>
              <p>
                <strong>Email:</strong> {selectedContractor.user.email}
              </p>
              <p>
                <strong>Название бизнеса:</strong>{' '}
                {selectedContractor.businessName || 'Не указано'}
              </p>
              <p>
                <strong>Тип бизнеса:</strong>{' '}
                {selectedContractor.businessType || 'Не указано'}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Документы</h3>
              {selectedContractor.documents &&
              selectedContractor.documents.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {selectedContractor.documents.map((doc, index) => (
                    <Image
                      key={index}
                      src={doc}
                      alt={`Document ${index + 1}`}
                      width={200}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Документы не загружены</p>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Модалка отклонения */}
      <Modal
        title="Отклонение заявки"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setRejectReason('');
        }}
        onOk={handleReject}
        okText="Отклонить"
        cancelText="Отмена"
        okButtonProps={{ danger: true }}
      >
        <Form layout="vertical">
          <Form.Item
            label="Причина отклонения"
            required
            help="Укажите причину, по которой заявка отклоняется"
          >
            <TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Например: Недостаточно документов для подтверждения"
            />
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}