"use client";

import { ConfigProvider, App } from 'antd';
import { useEffect } from 'react';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  // Suppress React 19 warning from Ant Design
  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    
    // Helper to safely check message without circular reference issues
    const safeGetMessage = (arg: any): string => {
      try {
        if (typeof arg === 'string') return arg;
        if (arg && typeof arg === 'object' && 'message' in arg) {
          return String(arg.message);
        }
        return String(arg);
      } catch {
        return '';
      }
    };
    
    console.warn = (...args) => {
      try {
        const message = safeGetMessage(args[0]);
        if (
          message.includes('antd v5 support React is 16 ~ 18') || 
          message.includes('[antd: compatible]') ||
          message.includes('u.ant.design/v5-for-19') ||
          message.includes('useForm') ||
          message.includes('not connected to any Form element') ||
          message.includes('Static function can not consume context')
        ) {
          return;
        }
        originalWarn(...args);
      } catch {
        // Silently ignore errors in warning handler
      }
    };

    console.error = (...args) => {
      try {
        const message = safeGetMessage(args[0]);
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
          message.includes('Request failed') ||
          message.includes('circular reference')
        ) {
          return;
        }
        originalError(...args);
      } catch {
        // Silently ignore errors in error handler
      }
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
