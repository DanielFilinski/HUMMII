"use client";

import { Refine } from "@refinedev/core";
import routerProvider from "@refinedev/nextjs-router";
import dataProvider from "@refinedev/simple-rest";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App as AntdApp, ConfigProvider } from "antd";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export default function Home() {
  return (
    <AntdRegistry>
      <ConfigProvider>
        <AntdApp>
          <Refine
            routerProvider={routerProvider}
            dataProvider={dataProvider(`${API_URL}/api/v1`)}
            resources={[
              {
                name: "dashboard",
                list: "/",
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
            }}
          >
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: '100vh',
              padding: '20px',
              textAlign: 'center'
            }}>
              <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1890ff' }}>
                🎉 Hummii Admin Panel
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#666', maxWidth: '600px' }}>
                Welcome to the Hummii administrative panel. The basic setup is complete and ready for future development.
              </p>
              <div style={{ 
                marginTop: '2rem', 
                padding: '1.5rem', 
                background: '#f5f5f5', 
                borderRadius: '8px',
                maxWidth: '500px'
              }}>
                <h3 style={{ marginBottom: '1rem' }}>✅ System Status</h3>
                <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                  <li style={{ padding: '0.5rem 0' }}>✓ Next.js 14 - Running</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Refine.dev - Configured</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ Ant Design - Ready</li>
                  <li style={{ padding: '0.5rem 0' }}>✓ TypeScript - Enabled</li>
                </ul>
              </div>
              <p style={{ marginTop: '2rem', color: '#999' }}>
                API Endpoint: <code>{API_URL}</code>
              </p>
            </div>
          </Refine>
        </AntdApp>
      </ConfigProvider>
    </AntdRegistry>
  );
}

