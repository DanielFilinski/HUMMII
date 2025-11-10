'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Row, Col, Divider } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined,
  CameraOutlined,
  SaveOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layouts/AdminLayout';
import type { UploadChangeParam } from 'antd/es/upload';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

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

  const handleAvatarChange = (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      // Получить URL загруженного файла
      setAvatarUrl(info.file.response?.url || '');
      message.success('Аватар успешно загружен');
    } else if (info.file.status === 'error') {
      message.error('Ошибка загрузки аватара');
    }
  };

  const handleProfileSave = async (values: any) => {
    setLoading(true);
    try {
      console.log('Saving profile:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Профиль успешно обновлен');
    } catch (error) {
      message.error('Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      console.log('Changing password:', values);
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Пароль успешно изменен');
      passwordForm.resetFields();
    } catch (error) {
      message.error('Ошибка при изменении пароля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '600', margin: 0 }}>
            <UserOutlined style={{ marginRight: '12px' }} />
            Профиль администратора
          </h1>
          <p style={{ color: '#8c8c8c', marginTop: '8px' }}>
            Управление личной информацией и настройками аккаунта
          </p>
        </div>

        <Row gutter={[16, 16]}>
          {/* Аватар и основная информация */}
          <Col xs={24} lg={8}>
            <motion.div variants={itemVariants}>
              <Card
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  textAlign: 'center',
                }}
              >
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                  <Avatar
                    size={120}
                    icon={<UserOutlined />}
                    src={avatarUrl}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  />
                  <Upload
                    name="avatar"
                    showUploadList={false}
                    action="/api/upload"
                    onChange={handleAvatarChange}
                  >
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                      }}
                    />
                  </Upload>
                </div>
                <h2 style={{ margin: '16px 0 8px' }}>Администратор</h2>
                <p style={{ color: '#8c8c8c', marginBottom: '16px' }}>admin@hummii.com</p>
                
                <Divider />
                
                <div style={{ textAlign: 'left' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#8c8c8c' }}>Роль:</span>
                    <span style={{ float: 'right', fontWeight: '500' }}>Супер Администратор</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#8c8c8c' }}>Статус:</span>
                    <span style={{ float: 'right', color: '#52c41a', fontWeight: '500' }}>Активен</span>
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ color: '#8c8c8c' }}>Дата регистрации:</span>
                    <span style={{ float: 'right', fontWeight: '500' }}>01.01.2025</span>
                  </div>
                  <div>
                    <span style={{ color: '#8c8c8c' }}>Последний вход:</span>
                    <span style={{ float: 'right', fontWeight: '500' }}>Сегодня, 14:30</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>

          {/* Форма профиля */}
          <Col xs={24} lg={16}>
            <motion.div variants={itemVariants}>
              <Card
                title="Личная информация"
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  marginBottom: '16px',
                }}
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleProfileSave}
                  initialValues={{
                    name: 'Администратор',
                    email: 'admin@hummii.com',
                    phone: '+7 (999) 123-45-67',
                    position: 'Супер Администратор',
                  }}
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Имя"
                        name="name"
                        rules={[{ required: true, message: 'Введите имя' }]}
                      >
                        <Input prefix={<UserOutlined />} placeholder="Ваше имя" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Должность"
                        name="position"
                      >
                        <Input prefix={<UserOutlined />} placeholder="Должность" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                          { required: true, message: 'Введите email' },
                          { type: 'email', message: 'Неверный формат email' },
                        ]}
                      >
                        <Input prefix={<MailOutlined />} placeholder="email@example.com" size="large" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Телефон"
                        name="phone"
                      >
                        <Input prefix={<PhoneOutlined />} placeholder="+7 (999) 123-45-67" size="large" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large"
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      Сохранить изменения
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>

            {/* Форма смены пароля */}
            <motion.div variants={itemVariants}>
              <Card
                title="Изменить пароль"
                bordered={false}
                style={{
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                }}
              >
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={handlePasswordChange}
                >
                  <Form.Item
                    label="Текущий пароль"
                    name="currentPassword"
                    rules={[{ required: true, message: 'Введите текущий пароль' }]}
                  >
                    <Input.Password 
                      prefix={<LockOutlined />} 
                      placeholder="Введите текущий пароль" 
                      size="large" 
                    />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Новый пароль"
                        name="newPassword"
                        rules={[
                          { required: true, message: 'Введите новый пароль' },
                          { min: 8, message: 'Пароль должен быть не менее 8 символов' },
                        ]}
                      >
                        <Input.Password 
                          prefix={<LockOutlined />} 
                          placeholder="Введите новый пароль" 
                          size="large" 
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Подтвердите пароль"
                        name="confirmPassword"
                        dependencies={['newPassword']}
                        rules={[
                          { required: true, message: 'Подтвердите новый пароль' },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue('newPassword') === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(new Error('Пароли не совпадают'));
                            },
                          }),
                        ]}
                      >
                        <Input.Password 
                          prefix={<LockOutlined />} 
                          placeholder="Подтвердите пароль" 
                          size="large" 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginBottom: 0 }}>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      size="large"
                      icon={<LockOutlined />}
                      loading={loading}
                      danger
                    >
                      Изменить пароль
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </motion.div>
    </AdminLayout>
  );
}
