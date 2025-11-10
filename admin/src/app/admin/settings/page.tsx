'use client';

import { useState } from 'react';
import { Card, Form, Input, Button, Switch, Select, Divider, message, Row, Col, Space } from 'antd';
import { 
  SettingOutlined, 
  BellOutlined, 
  LockOutlined, 
  GlobalOutlined,
  SaveOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layouts/AdminLayout';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

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

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // Здесь будет API запрос для сохранения настроек
      console.log('Saving settings:', values);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Имитация API запроса
      message.success('Настройки успешно сохранены');
    } catch (error) {
      message.error('Ошибка при сохранении настроек');
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
            <SettingOutlined style={{ marginRight: '12px' }} />
            Настройки
          </h1>
          <p style={{ color: '#8c8c8c', marginTop: '8px' }}>
            Управление настройками системы и профиля
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            name: 'Администратор',
            email: 'admin@hummii.com',
            phone: '+7 (999) 123-45-67',
            language: 'ru',
            emailNotifications: true,
            pushNotifications: true,
            smsNotifications: false,
            twoFactorAuth: false,
          }}
        >
          <Row gutter={[16, 16]}>
            {/* Профиль */}
            <Col xs={24} lg={12}>
              <motion.div variants={itemVariants}>
                <Card
                  title={
                    <Space>
                      <UserOutlined />
                      <span>Профиль</span>
                    </Space>
                  }
                  bordered={false}
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <Form.Item
                    label="Имя"
                    name="name"
                    rules={[{ required: true, message: 'Введите имя' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Ваше имя" size="large" />
                  </Form.Item>

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

                  <Form.Item
                    label="Телефон"
                    name="phone"
                  >
                    <Input prefix={<PhoneOutlined />} placeholder="+7 (999) 123-45-67" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Язык"
                    name="language"
                  >
                    <Select size="large">
                      <Select.Option value="ru">Русский</Select.Option>
                      <Select.Option value="en">English</Select.Option>
                      <Select.Option value="kk">Қазақша</Select.Option>
                    </Select>
                  </Form.Item>
                </Card>
              </motion.div>
            </Col>

            {/* Уведомления */}
            <Col xs={24} lg={12}>
              <motion.div variants={itemVariants}>
                <Card
                  title={
                    <Space>
                      <BellOutlined />
                      <span>Уведомления</span>
                    </Space>
                  }
                  bordered={false}
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <Form.Item
                    label="Email уведомления"
                    name="emailNotifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="Push уведомления"
                    name="pushNotifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Form.Item
                    label="SMS уведомления"
                    name="smsNotifications"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Divider />

                  <div style={{ marginTop: '24px' }}>
                    <h4 style={{ marginBottom: '16px' }}>Типы уведомлений:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Новые пользователи</span>
                        <Switch defaultChecked />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Заявки на модерацию</span>
                        <Switch defaultChecked />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Системные события</span>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Безопасность */}
            <Col xs={24}>
              <motion.div variants={itemVariants}>
                <Card
                  title={
                    <Space>
                      <LockOutlined />
                      <span>Безопасность</span>
                    </Space>
                  }
                  bordered={false}
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  <Row gutter={[24, 0]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Двухфакторная аутентификация"
                        name="twoFactorAuth"
                        valuePropName="checked"
                      >
                        <Switch />
                      </Form.Item>
                      <p style={{ color: '#8c8c8c', fontSize: '13px', marginTop: '-16px' }}>
                        Дополнительный уровень защиты для вашего аккаунта
                      </p>
                    </Col>
                    <Col xs={24} md={12}>
                      <Button 
                        type="default" 
                        icon={<LockOutlined />}
                        size="large"
                        block
                      >
                        Изменить пароль
                      </Button>
                    </Col>
                  </Row>

                  <Divider />

                  <div style={{ marginTop: '16px' }}>
                    <h4 style={{ marginBottom: '12px' }}>Активные сессии:</h4>
                    <div style={{ 
                      background: '#fafafa', 
                      padding: '16px', 
                      borderRadius: '8px',
                      marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>Chrome на Windows</div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Москва, Россия • Активна сейчас
                          </div>
                        </div>
                        <Button type="text" danger size="small">
                          Завершить
                        </Button>
                      </div>
                    </div>
                    <div style={{ 
                      background: '#fafafa', 
                      padding: '16px', 
                      borderRadius: '8px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>Safari на iPhone</div>
                          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                            Алматы, Казахстан • 2 часа назад
                          </div>
                        </div>
                        <Button type="text" danger size="small">
                          Завершить
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </Col>

            {/* Кнопки действий */}
            <Col xs={24}>
              <motion.div variants={itemVariants}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}>
                    <div style={{ color: 'white' }}>
                      <h3 style={{ color: 'white', margin: 0, marginBottom: '4px' }}>
                        Сохранить изменения?
                      </h3>
                      <p style={{ color: 'rgba(255,255,255,0.9)', margin: 0, fontSize: '14px' }}>
                        Не забудьте сохранить настройки перед выходом
                      </p>
                    </div>
                    <Space>
                      <Button 
                        size="large"
                        onClick={() => form.resetFields()}
                      >
                        Отменить
                      </Button>
                      <Button 
                        type="primary"
                        size="large"
                        icon={<SaveOutlined />}
                        loading={loading}
                        htmlType="submit"
                        style={{
                          background: 'white',
                          color: '#667eea',
                          borderColor: 'white',
                        }}
                      >
                        Сохранить настройки
                      </Button>
                    </Space>
                  </div>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </Form>
      </motion.div>
    </AdminLayout>
  );
}
