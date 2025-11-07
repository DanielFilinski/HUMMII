'use client';

import { useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme } from 'antd';
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={260}
        style={{
          backgroundColor: token.colorBgContainer,
          borderRight: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <motion.div
          initial={{ x: -260 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4">
            <h1 className="text-xl font-bold">Hummii Admin</h1>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname?.split('/')[2] || 'dashboard']}
            items={menuItems}
            style={{ border: 'none' }}
          />
        </motion.div>
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: token.colorBgContainer,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Button type="text">
                <Avatar size="small" icon={<UserOutlined />} />
                <span className="ml-2">{user?.name || 'Администратор'}</span>
              </Button>
            </Dropdown>
          </motion.div>
        </Header>
        
        <Content style={{ margin: '24px', minHeight: 280 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </Content>
      </Layout>
    </Layout>
  );
}