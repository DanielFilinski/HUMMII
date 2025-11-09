"use client";

import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Head from 'next/head';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(12, 'Пароль должен содержать минимум 12 символов'),
  code: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', code: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'requires_2fa') {
          setShowTwoFactor(true);
        } else {
          message.error('Ошибка входа: ' + error.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head><title>Вход в админ панель | Hummii</title></Head>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <motion.div className="absolute inset-0"
          style={{ background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }} style={{ position: 'relative', zIndex: 1 }}>
          <Card className="w-[450px] shadow-2xl" style={{
            borderRadius: '24px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <div className="text-center mb-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }} className="mb-4">
                <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                  <UserOutlined style={{ fontSize: '40px', color: 'white' }} />
                </div>
              </motion.div>
              <motion.h1 className="text-3xl font-bold" initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                Hummii Admin
              </motion.h1>
              <motion.p className="text-gray-600 mt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}>
                Панель управления платформой
              </motion.p>
            </div>
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <Form.Item label={<span className="font-semibold">Email</span>}
                  validateStatus={errors.email ? 'error' : ''} help={errors.email?.message}>
                  <Controller name="email" control={control}
                    render={({ field }) => (
                      <Input {...field} size="large"
                        prefix={<UserOutlined style={{ color: '#667eea' }} />}
                        disabled={showTwoFactor} placeholder="admin@hummii.com"
                        style={{ borderRadius: '12px' }} />
                    )} />
                </Form.Item>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <Form.Item label={<span className="font-semibold">Пароль</span>}
                  validateStatus={errors.password ? 'error' : ''} help={errors.password?.message}>
                  <Controller name="password" control={control}
                    render={({ field }) => (
                      <Input.Password {...field} size="large"
                        prefix={<LockOutlined style={{ color: '#667eea' }} />}
                        disabled={showTwoFactor} placeholder="Введите пароль"
                        style={{ borderRadius: '12px' }} />
                    )} />
                </Form.Item>
              </motion.div>
              {showTwoFactor && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Form.Item label={<span className="font-semibold">2FA Code</span>}
                    validateStatus={errors.code ? 'error' : ''} help={errors.code?.message}>
                    <Controller name="code" control={control}
                      render={({ field }) => (
                        <Input {...field} size="large"
                          prefix={<SafetyOutlined style={{ color: '#667eea' }} />}
                          placeholder="000000" maxLength={6} style={{ borderRadius: '12px' }} />
                      )} />
                  </Form.Item>
                </motion.div>
              )}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                <Button type="primary" htmlType="submit" size="large" loading={isLoading} block
                  style={{
                    borderRadius: '12px', height: '48px', fontSize: '16px', fontWeight: 600,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none',
                    marginTop: '24px'
                  }}>
                  {showTwoFactor ? 'Подтвердить' : 'Войти'}
                </Button>
              </motion.div>
            </Form>
          </Card>
        </motion.div>
      </div>
    </>
  );
}
