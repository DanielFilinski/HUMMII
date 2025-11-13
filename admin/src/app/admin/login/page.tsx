"use client";

import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
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
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
      }}>
        <Card
          style={{
            width: '100%',
            maxWidth: '420px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '72px',
              height: '72px',
              margin: '0 auto 20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}>
              <UserOutlined style={{ fontSize: '36px', color: 'white' }} />
            </div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Hummii Admin
            </h1>
            <p style={{
              color: '#666',
              fontSize: '14px',
              margin: 0,
            }}>
              Панель управления платформой
            </p>
          </div>

          <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
            <Form.Item
              label={<span style={{ fontWeight: 600 }}>Email</span>}
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    size="large"
                    prefix={<UserOutlined style={{ color: '#667eea' }} />}
                    disabled={showTwoFactor}
                    placeholder="admin@hummii.com"
                    style={{ borderRadius: '8px' }}
                  />
                )}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ fontWeight: 600 }}>Пароль</span>}
              validateStatus={errors.password ? 'error' : ''}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    size="large"
                    prefix={<LockOutlined style={{ color: '#667eea' }} />}
                    disabled={showTwoFactor}
                    placeholder="Введите пароль"
                    style={{ borderRadius: '8px' }}
                  />
                )}
              />
            </Form.Item>

            {showTwoFactor && (
              <Form.Item
                label={<span style={{ fontWeight: 600 }}>2FA Code</span>}
                validateStatus={errors.code ? 'error' : ''}
                help={errors.code?.message}
              >
                <Controller
                  name="code"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      size="large"
                      prefix={<SafetyOutlined style={{ color: '#667eea' }} />}
                      placeholder="000000"
                      maxLength={6}
                      style={{ borderRadius: '8px' }}
                    />
                  )}
                />
              </Form.Item>
            )}

            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={isLoading}
              block
              style={{
                borderRadius: '8px',
                height: '44px',
                fontSize: '15px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                marginTop: '8px',
              }}
            >
              {showTwoFactor ? 'Подтвердить' : 'Войти'}
            </Button>
          </Form>
        </Card>
      </div>
    </>
  );
}
