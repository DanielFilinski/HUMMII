'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Button, theme, Badge, Drawer } from 'antd';
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
  MenuOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';

const { Header, Sider, Content } = Layout;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { token } = theme.useToken();
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Проверка аутентификации
  useEffect(() => {
    if (!isAuthenticated && !pathname?.includes('/admin/login')) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, pathname, router]);

  const handleMenuClick = (path: string) => {
    console.log('Navigating to:', path);
    router.push(path);
    setDrawerVisible(false); // Закрываем drawer после клика
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Дашборд',
      onClick: () => handleMenuClick('/admin/dashboard'),
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'Пользователи',
      onClick: () => handleMenuClick('/admin/users'),
    },
    {
      key: 'moderation',
      icon: <FileProtectOutlined />,
      label: 'Модерация',
      onClick: () => handleMenuClick('/admin/moderation'),
    },
    {
      key: 'audit-logs',
      icon: <AuditOutlined />,
      label: 'Аудит логи',
      onClick: () => handleMenuClick('/admin/audit-logs'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки',
      onClick: () => handleMenuClick('/admin/settings'),
    },
  ];

  const handleLogout = () => {
    console.log('Logging out...');
    logout();
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Профиль',
      onClick: () => handleMenuClick('/admin/profile'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Выйти',
      onClick: handleLogout,
      danger: true,
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  const sidebarContent = (
    <motion.div
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ 
        padding: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
      }}>
        <motion.h1 
          style={{ 
            fontSize: '24px', 
            fontWeight: 'bold',
            margin: 0,
          }}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          Hummii Admin
        </motion.h1>
        <p style={{ 
          fontSize: '14px', 
          opacity: 0.9, 
          margin: '8px 0 0 0' 
        }}>
          Панель управления
        </p>
      </div>
      <Menu
        mode="inline"
        selectedKeys={[pathname?.split('/')[2] || 'dashboard']}
        items={menuItems}
        style={{ 
          border: 'none', 
          background: 'transparent',
          marginTop: '16px',
          flex: 1,
        }}
        className="admin-menu"
      />
    </motion.div>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Sider
        width={260}
        breakpoint="lg"
        collapsedWidth="0"
        style={{
          background: '#ffffff',
          borderRight: '1px solid #f0f0f0',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
        className="desktop-sidebar"
      >
        {sidebarContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        title={
          <div style={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            margin: '-24px -24px 0',
            padding: '16px 24px',
          }}>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Hummii Admin</h2>
            <p style={{ margin: '4px 0 0', fontSize: '12px', opacity: 0.9 }}>Панель управления</p>
          </div>
        }
        placement="left"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={280}
        bodyStyle={{ padding: 0 }}
        headerStyle={{ padding: '16px 24px', border: 'none' }}
        className="mobile-drawer"
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname?.split('/')[2] || 'dashboard']}
          items={menuItems}
          style={{ border: 'none', background: 'transparent', marginTop: '16px' }}
          className="admin-menu"
        />
      </Drawer>
      
      <Layout style={{ marginLeft: 260 }} className="main-layout">
        <Header
          style={{
            padding: '0 32px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #f0f0f0',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            height: '64px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
          >
            {/* Mobile Menu Button */}
            <Button
              type="text"
              icon={<MenuOutlined style={{ fontSize: '20px' }} />}
              onClick={() => setDrawerVisible(true)}
              className="mobile-menu-button"
              style={{
                display: 'none',
                width: '40px',
                height: '40px',
              }}
            />
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: '#262626',
              margin: 0,
            }}>
              Добро пожаловать, {user?.name || 'Администратор'}!
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
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
            
            <Dropdown 
              menu={{ items: userMenuItems }} 
              placement="bottomRight"
              trigger={['click']}
            >
              <Button 
                type="text"
                style={{
                  height: 'auto',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #f0f0f0',
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
                <span style={{ fontWeight: 500 }}>{user?.name || 'Администратор'}</span>
              </Button>
            </Dropdown>
          </motion.div>
        </Header>
        
        <Content style={{ 
          margin: '24px',
          padding: '24px',
          background: '#f5f7fa',
          minHeight: 'calc(100vh - 112px)',
          borderRadius: '8px',
        }}>
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