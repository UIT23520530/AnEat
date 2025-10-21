"use client";

import { ConfigProvider, App } from 'antd';
import { useEffect } from 'react';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  // Suppress React 19 warning from Ant Design
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      if (
        typeof args[0] === 'string' && 
        (args[0].includes('antd v5 support React is 16 ~ 18') || 
         args[0].includes('[antd: compatible]'))
      ) {
        return;
      }
      originalWarn(...args);
    };
    
    return () => {
      console.warn = originalWarn;
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
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
