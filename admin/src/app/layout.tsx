import type { Metadata } from "next";
import { Suspense } from "react";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { App as AntApp, ConfigProvider } from 'antd';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import ruRU from 'antd/locale/ru_RU';
import './globals.css';

export const metadata: Metadata = {
  title: "Hummii Admin Panel",
  description: "Administrative panel for Hummii platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <AntdRegistry>
          <ConfigProvider
            locale={ruRU}
            theme={{
              token: {
                colorPrimary: '#1890ff',
                borderRadius: 6,
              },
            }}
          >
            <AntApp>
              <QueryProvider>
                <AuthProvider>
                  <Suspense>{children}</Suspense>
                </AuthProvider>
              </QueryProvider>
            </AntApp>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}

