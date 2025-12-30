import { prisma } from '../db';
import { Prisma } from '@prisma/client';

interface StockTransactionQueryParams {
  page: number;
  limit: number;
  productId?: string;
  branchId?: string;
  type?: string;
  startDate?: Date;
  endDate?: Date;
}

interface CreateStockTransactionData {
  type: string;
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason?: string;
  reference?: string;
  productId: string;
  branchId: string;
  performedById: string;
  stockRequestId?: string;
  orderId?: string;
}

export class StockTransactionService {
  // Generate transaction number
  static async generateTransactionNumber(): Promise<string> {
    const today = new Date();
    const prefix = `ST${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}`;
    
    const lastTransaction = await prisma.stockTransaction.findFirst({
      where: {
        transactionNumber: {
          startsWith: prefix,
        },
      },
      orderBy: {
        transactionNumber: 'desc',
      },
    });

    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(lastTransaction.transactionNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  // Get all transactions
  static async findAll(params: StockTransactionQueryParams) {
    const { page, limit, productId, branchId, type, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const where: Prisma.StockTransactionWhereInput = {};

    if (productId) {
      where.productId = productId;
    }

    if (branchId) {
      where.branchId = branchId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = startDate;
      }
      if (endDate) {
        where.createdAt.lte = endDate;
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.stockTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          product: {
            select: {
              id: true,
              code: true,
              name: true,
              image: true,
            },
          },
          performedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          stockRequest: {
            select: {
              id: true,
              requestNumber: true,
            },
          },
          order: {
            select: {
              id: true,
              orderNumber: true,
            },
          },
        },
      }),
      prisma.stockTransaction.count({ where }),
    ]);

    return { transactions, total };
  }

  // Create transaction and update product quantity
  static async create(data: CreateStockTransactionData) {
    const transactionNumber = await this.generateTransactionNumber();

    return prisma.$transaction(async (tx) => {
      // Create transaction
      const transaction = await tx.stockTransaction.create({
        data: {
          ...data,
          transactionNumber,
        },
        include: {
          product: true,
          performedBy: true,
        },
      });

      // Update product quantity
      await tx.product.update({
        where: { id: data.productId },
        data: {
          quantity: data.newQuantity,
        },
      });

      // Update inventory if exists
      const inventory = await tx.inventory.findUnique({
        where: { productId: data.productId },
      });

      if (inventory) {
        await tx.inventory.update({
          where: { productId: data.productId },
          data: {
            quantity: data.newQuantity,
            lastRestocked: data.type === 'STOCK_IN' ? new Date() : undefined,
          },
        });
      }

      return transaction;
    });
  }

  // Get product stock history
  static async getProductHistory(productId: string, limit: number = 50) {
    return prisma.stockTransaction.findMany({
      where: { productId },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        performedBy: {
          select: {
            id: true,
            name: true,
          },
        },
        stockRequest: {
          select: {
            id: true,
            requestNumber: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
      },
    });
  }
}
