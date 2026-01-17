import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { prisma } from './db';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all localhost and local network IPs
    if (process.env.NODE_ENV === 'development') {
      // Allow localhost with any port
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }

      // Allow local network IPs (10.x.x.x, 192.168.x.x, 172.16-31.x.x)
      const localNetworkPattern = /^http:\/\/(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/;
      if (localNetworkPattern.test(origin)) {
        return callback(null, true);
      }

      // Also check CORS_ORIGIN env variable
      if (process.env.CORS_ORIGIN) {
        const allowedOrigins = process.env.CORS_ORIGIN.split(',');
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
      }
    }

    // In production, use CORS_ORIGIN env variable
    const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
    if (origin === allowedOrigin || allowedOrigin === '*') {
      return callback(null, true);
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}


app.get('/health', async (req: Request, res: Response) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'success',
      message: 'Server is healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Server is unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
    });
  }
});

// ==================== ROOT ROUTE ====================

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to AnEat API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      health: '/health',
      api: '/api/v1',
      docs: '/api/v1/docs',
    },
  });
});

// ==================== API ROUTES ====================

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import managerRoutes from './routes/manager.routes';
import staffRoutes from './routes/staff.routes';
import customerRoutes from './routes/customer.routes';
import categoryRoutes from './routes/category.routes';
import productRoutes from './routes/product.routes';
import stockRequestRoutes from './routes/stock-request.routes';
import promotionRoutes from './routes/promotion.routes';
import billRoutes from './routes/bill.routes';
import branchRoutes from './routes/branch.routes';
import managerCustomerRoutes from './routes/manager-customer.routes';
import dashboardRoutes from './routes/dashboard.routes';
import templateRoutes from './routes/template.routes';
import logisticsStaffRoutes from './routes/logistics-staff.routes';
import homeRoutes from './routes/home.routes';

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/manager', managerRoutes);
app.use('/api/v1/manager/branch', branchRoutes);
app.use('/api/v1/manager/customers', managerCustomerRoutes);
app.use('/api/v1/manager/bills', billRoutes);
app.use('/api/v1/manager/dashboard', dashboardRoutes);
app.use('/api/v1/manager/templates', templateRoutes);
app.use('/api/v1/staff', staffRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/logistics', logisticsStaffRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/stock-requests', stockRequestRoutes);
app.use('/api/v1/promotions', promotionRoutes);
app.use('/api/v1/home', homeRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  // Log error details (always log for debugging)
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Handle AppError (Operational Errors - 4xx)
  if (err instanceof Error && 'statusCode' in err && 'isOperational' in err) {
    const appError = err as any;
    return res.status(appError.statusCode).json({
      success: false,
      code: appError.statusCode,
      message: appError.message,
      ...(appError.errors && { errors: appError.errors }),
    });
  }

  // Handle System Errors (5xx)
  res.status(500).json({
    success: false,
    code: 500,
    message: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
