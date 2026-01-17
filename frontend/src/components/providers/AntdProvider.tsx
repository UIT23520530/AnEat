"use client";

import { ConfigProvider, App } from 'antd';
import { useEffect } from 'react';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  // Suppress React 19 warning from Ant Design
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    console.warn = (...args) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('antd v5 support React is 16 ~ 18') || 
        message.includes('[antd: compatible]') ||
        message.includes('u.ant.design/v5-for-19') ||
        message.includes('useForm') ||
        message.includes('not connected to any Form element')
      ) {
        return;
      }
      originalWarn(...args);
    };

    console.error = (...args) => {
      const message = args[0]?.toString() || '';
      if (
        message.includes('antd v5 support React is 16 ~ 18') || 
        message.includes('[antd: compatible]') ||
        message.includes('u.ant.design/v5-for-19') ||
        message.includes('useForm') ||
        message.includes('not connected to any Form element') ||
        message.includes('Delete failed') ||
        message.includes('Update failed') ||
        message.includes('Failed to update bill') ||
        message.includes('AxiosError') ||
        message.includes('Request failed')
      ) {
        return;
      }
      originalError(...args);
    };
    
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#3B82F6',
          colorSuccess: '#10B981',
          colorWarning: '#F59E0B',
          colorError: '#EF4444',
          colorInfo: '#3B82F6',
          borderRadius: 8,
          fontFamily: "'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        },
        components: {
          Button: {
            colorPrimary: '#3B82F6',
          },
          Table: {
            colorBgContainer: '#ffffff',
          },
        },
      }}
      prefixCls="ant"
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
