"use client";

import { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Head from 'next/head';

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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      code: '',
    },
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
      <Head>
        <title>Вход в админ панель | Hummii</title>
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-[400px] shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold">Админ панель Hummii</h1>
              <p className="text-gray-600">Вход в систему</p>
            </div>

            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
              <Form.Item 
                label="Email" 
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
                      disabled={showTwoFactor}
                      placeholder="Введите email"
                    />
                  )}
                />
              </Form.Item>

              <Form.Item 
                label="Пароль"
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
                      disabled={showTwoFactor}
                      placeholder="Введите пароль"
                    />
                  )}
                />
              </Form.Item>

              {showTwoFactor && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <Form.Item 
                    label="Код двухфакторной аутентификации"
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
                          maxLength={6}
                          placeholder="Введите код из приложения"
                        />
                      )}
                    />
                  </Form.Item>
                </motion.div>
              )}

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  size="large"
                  block
                  loading={isLoading}
                >
                  {showTwoFactor ? 'Подтвердить' : 'Войти'}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </motion.div>
      </div>
    </>
  );
}