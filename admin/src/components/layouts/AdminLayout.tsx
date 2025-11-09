'use client';

import { useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme, Badge } from 'antd';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  FileProtectOutlined,
  SettingOutlined,
  LogoutOutlined,
  AuditOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();

  // Проверка аутентификации
  useEffect(() => {
    if (!isAuthenticated && !pathname?.includes('/admin/login')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, pathname, router]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
      onClick: () => router.push('/admin/dashboard'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Пользователи',
      onClick: () => router.push('/admin/users'),
    },
    {
      key: 'moderation',
      icon: <FileProtectOutlined />,
      label: 'Модерация',
      onClick: () => router.push('/admin/moderation'),
    },
    {
      key: 'audit-logs',
      icon: <AuditOutlined />,
      label: 'Аудит логи',
      onClick: () => router.push('/admin/audit-logs'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
      onClick: () => router.push('/admin/settings'),
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => router.push('/admin/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: logout,
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Sider
        width={260}
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)',
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden',
        }}
      >
        <motion.div
          initial={{ x: -260, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
        >
          <div className="p-6" style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
          }}>
            <motion.h1 
              className="text-2xl font-bold"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              Hummii Admin
            </motion.h1>
            <p className="text-sm opacity-80 mt-1">Панель управления</p>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname?.split('/')[2] || 'dashboard']}
            items={menuItems}
            style={{ 
              border: 'none', 
              background: 'transparent',
              marginTop: '16px',
            }}
            className="admin-menu"
          />
        </motion.div>
      </Sider>
      
      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            padding: '0 32px',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderBottom: 'none',
            boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold text-gray-800">
              Добро пожаловать, {user?.name || 'Администратор'}!
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex items-center gap-4"
          >
            <Badge count={3} offset={[-5, 5]}>
              <Button 
                type="text" 
                icon={<BellOutlined style={{ fontSize: '20px' }} />}
                style={{ 
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                }}
              />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button 
                type="text"
                style={{
                  height: 'auto',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Avatar 
                  size={32} 
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {user?.name?.charAt(0) || 'A'}
                </Avatar>
                <span className="font-medium">{user?.name || 'Администратор'}</span>
              </Button>
            </Dropdown>
          </motion.div>
        </Header>
        
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {children}
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
}