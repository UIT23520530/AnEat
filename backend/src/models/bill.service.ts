import { prisma } from '../db';
import { Prisma, BillStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

/**
 * Bill Service - Business logic for bill management
 * Following API_GUIDELINES.md Level 3 standards
 */

// ==================== TYPES ====================

export interface BillDTO {
  id: string;
  billNumber: string;
  status: BillStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  changeAmount: number;
  notes: string | null;
  internalNotes: string | null;
  isEdited: boolean;
  editCount: number;
  lastEditedAt: Date | null;
  printedCount: number;
  lastPrintedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  order?: OrderSummaryDTO;
  branch?: BranchSummaryDTO;
  issuedBy?: UserSummaryDTO;
}

export interface BillHistoryDTO {
  id: string;
  version: number;
  billNumber: string;
  status: BillStatus;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string | null;
  paymentMethod: PaymentMethod | null;
  paymentStatus: PaymentStatus;
  paidAmount: number;
  changeAmount: number;
  notes: string | null;
  internalNotes: string | null;
  editReason: string;
  changedFields: string;
  editedBy: UserSummaryDTO;
  createdAt: Date;
}

interface OrderSummaryDTO {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  items?: OrderItemDTO[];
}

interface OrderItemDTO {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

interface BranchSummaryDTO {
  id: string;
  code: string;
  name: string;
  address: string;
}

interface UserSummaryDTO {
  id: string;
  name: string;
  email: string;
}

export interface CreateBillInput {
  orderId: string;
  subtotal: number;
  taxAmount?: number;
  discountAmount?: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  notes?: string;
  internalNotes?: string;
  issuedById: string;
  branchId: string;
}

export interface UpdateBillInput {
  status?: BillStatus;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  paidAmount?: number;
  notes?: string;
  internalNotes?: string;
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
  }>;
  discount?: number;
  subtotal?: number;
  tax?: number;
  totalAmount?: number;
  editReason: string; // Required for audit trail
  editedById: string;
}

export interface BillQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  status?: BillStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  branchId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

// ==================== MAPPERS (DTO) ====================

const mapBillToDTO = (bill: any): BillDTO => {
  return {
    id: bill.id,
    billNumber: bill.billNumber,
    status: bill.status,
    subtotal: bill.subtotal,
    taxAmount: bill.taxAmount,
    discountAmount: bill.discountAmount,
    total: bill.total,
    customerName: bill.customerName,
    customerPhone: bill.customerPhone,
    customerEmail: bill.customerEmail,
    customerAddress: bill.customerAddress,
    paymentMethod: bill.paymentMethod,
    paymentStatus: bill.paymentStatus,
    paidAmount: bill.paidAmount,
    changeAmount: bill.changeAmount,
    notes: bill.notes,
    internalNotes: bill.internalNotes,
    isEdited: bill.isEdited,
    editCount: bill.editCount,
    lastEditedAt: bill.lastEditedAt,
    printedCount: bill.printedCount,
    lastPrintedAt: bill.lastPrintedAt,
    createdAt: bill.createdAt,
    updatedAt: bill.updatedAt,
    ...(bill.order && {
      order: {
        id: bill.order.id,
        orderNumber: bill.order.orderNumber,
        status: bill.order.status,
        total: bill.order.total,
        items: bill.order.items?.map((item: any) => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
          },
        })),
      },
    }),
    ...(bill.branch && {
      branch: {
        id: bill.branch.id,
        code: bill.branch.code,
        name: bill.branch.name,
        address: bill.branch.address,
      },
    }),
    ...(bill.issuedBy && {
      issuedBy: {
        id: bill.issuedBy.id,
        name: bill.issuedBy.name,
        email: bill.issuedBy.email,
      },
    }),
  };
};

const mapBillHistoryToDTO = (history: any): BillHistoryDTO => {
  return {
    id: history.id,
    version: history.version,
    billNumber: history.billNumber,
    status: history.status,
    subtotal: history.subtotal,
    taxAmount: history.taxAmount,
    discountAmount: history.discountAmount,
    total: history.total,
    customerName: history.customerName,
    customerPhone: history.customerPhone,
    customerEmail: history.customerEmail,
    customerAddress: history.customerAddress,
    paymentMethod: history.paymentMethod,
    paymentStatus: history.paymentStatus,
    paidAmount: history.paidAmount,
    changeAmount: history.changeAmount,
    notes: history.notes,
    internalNotes: history.internalNotes,
    editReason: history.editReason,
    changedFields: history.changedFields,
    editedBy: {
      id: history.editedBy.id,
      name: history.editedBy.name,
      email: history.editedBy.email,
    },
    createdAt: history.createdAt,
  };
};

// ==================== SERVICE METHODS ====================

export class BillService {
  /**
   * Generate unique bill number
   */
  private static async generateBillNumber(branchId: string): Promise<string> {
    const branch = await prisma.branch.findUnique({
      where: { id: branchId },
      select: { code: true },
    });

    if (!branch) {
      throw new Error('Branch not found');
    }

    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');

    // Count bills today
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await prisma.bill.count({
      where: {
        branchId,
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(4, '0');
    return `BILL-${branch.code}-${year}${month}${day}-${sequence}`;
  }

  /**
   * Create a new bill
   */
  static async createBill(data: CreateBillInput): Promise<BillDTO> {
    // Validate order exists and not already has a bill
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { bill: true },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.bill) {
      throw new Error('Bill already exists for this order');
    }

    const billNumber = await this.generateBillNumber(data.branchId);

    // Calculate total
    const subtotal = data.subtotal;
    const taxAmount = data.taxAmount || 0;
    const discountAmount = data.discountAmount || 0;
    const total = subtotal + taxAmount - discountAmount;
    const paidAmount = data.paidAmount || 0;
    const changeAmount = paidAmount > total ? paidAmount - total : 0;

    const bill = await prisma.bill.create({
      data: {
        billNumber,
        status: BillStatus.ISSUED,
        subtotal,
        taxAmount,
        discountAmount,
        total,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerEmail: data.customerEmail,
        customerAddress: data.customerAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
        paidAmount,
        changeAmount,
        notes: data.notes,
        internalNotes: data.internalNotes,
        orderId: data.orderId,
        branchId: data.branchId,
        issuedById: data.issuedById,
      },
      include: {
        order: true,
        branch: true,
        issuedBy: true,
      },
    });

    return mapBillToDTO(bill);
  }

  /**
   * Get bill statistics (system-wide or by branch)
   */
  static async getBillStats(branchId?: string, dateFrom?: Date, dateTo?: Date) {
    const where: any = {};

    if (branchId) {
      where.branchId = branchId;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [totalBills, paidBills, pendingBills, cancelledBills, refundedBills, totalRevenue] = await Promise.all([
      prisma.bill.count({ where }),
      prisma.bill.count({ where: { ...where, paymentStatus: 'PAID' } }),
      prisma.bill.count({ where: { ...where, paymentStatus: 'PENDING' } }),
      prisma.bill.count({ where: { ...where, status: 'CANCELLED' } }),
      prisma.bill.count({ where: { ...where, paymentStatus: 'REFUNDED' } }),
      prisma.bill.aggregate({
        where: { ...where, paymentStatus: 'PAID' },
        _sum: { total: true },
      }),
    ]);

    return {
      totalBills,
      paidBills,
      pendingBills,
      cancelledBills,
      refundedBills,
      totalRevenue: totalRevenue._sum.total || 0,
    };
  }

  /**
   * Get bill list with filters, pagination and sorting
   */
  static async getBillList(params: BillQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.BillWhereInput = {};

    if (params.status) {
      where.status = params.status;
    }

    if (params.paymentStatus) {
      where.paymentStatus = params.paymentStatus;
    }

    if (params.paymentMethod) {
      where.paymentMethod = params.paymentMethod;
    }

    if (params.branchId) {
      where.branchId = params.branchId;
    }

    if (params.search) {
      where.OR = [
        { billNumber: { contains: params.search, mode: 'insensitive' } },
        { customerName: { contains: params.search, mode: 'insensitive' } },
        { customerPhone: { contains: params.search, mode: 'insensitive' } },
        { order: { orderNumber: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) {
        where.createdAt.gte = params.dateFrom;
      }
      if (params.dateTo) {
        where.createdAt.lte = params.dateTo;
      }
    }

    // Build orderBy
    const orderBy: Prisma.BillOrderByWithRelationInput = {};
    if (params.sort) {
      const sortField = params.sort.startsWith('-')
        ? params.sort.slice(1)
        : params.sort;
      const sortOrder = params.sort.startsWith('-') ? 'desc' : 'asc';
      orderBy[sortField as keyof Prisma.BillOrderByWithRelationInput] = sortOrder;
    } else {
      orderBy.createdAt = 'desc'; // Default sort
    }

    // Execute queries
    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
              customer: true,
            },
          },
          branch: true,
          issuedBy: true,
        },
      }),
      prisma.bill.count({ where }),
    ]);

    const data = bills.map(mapBillToDTO);

    return {
      data,
      meta: {
        current_page: page,
        total_pages: Math.ceil(total / limit),
        limit,
        total_items: total,
      },
    };
  }

  /**
   * Get bill by ID
   */
  static async getBillById(id: string): Promise<BillDTO> {
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            customer: true,
          },
        },
        branch: true,
        issuedBy: true,
      },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    return mapBillToDTO(bill);
  }

  /**
   * Update bill with history tracking
   */
  static async updateBill(
    billId: string,
    data: UpdateBillInput
  ): Promise<BillDTO> {
    return await prisma.$transaction(async (tx) => {
      // Get current bill
      const currentBill = await tx.bill.findUnique({
        where: { id: billId },
      });

      if (!currentBill) {
        throw new Error('Bill not found');
      }

      // Create history snapshot
      const version = currentBill.editCount + 1;
      const changedFields: string[] = [];

      // If items provided, recompute financials to ensure consistency
      let recalculatedSubtotal = currentBill.subtotal;
      if (data.items && data.items.length > 0) {
        recalculatedSubtotal = data.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      }
      const incomingSubtotal = data.subtotal !== undefined ? data.subtotal : recalculatedSubtotal;
      const incomingDiscount = data.discount !== undefined ? data.discount : currentBill.discountAmount;
      const incomingTax = data.tax !== undefined ? data.tax : incomingSubtotal * 0.1;
      const incomingTotal = data.totalAmount !== undefined ? data.totalAmount : incomingSubtotal + incomingTax - incomingDiscount;

      // Track changed fields
      if (data.status !== undefined && data.status !== currentBill.status) {
        changedFields.push('status');
      }
      if (data.customerName !== undefined && data.customerName !== currentBill.customerName) {
        changedFields.push('customerName');
      }
      if (data.customerPhone !== undefined && data.customerPhone !== currentBill.customerPhone) {
        changedFields.push('customerPhone');
      }
      if (data.customerEmail !== undefined && data.customerEmail !== currentBill.customerEmail) {
        changedFields.push('customerEmail');
      }
      if (data.customerAddress !== undefined && data.customerAddress !== currentBill.customerAddress) {
        changedFields.push('customerAddress');
      }
      if (data.paymentMethod !== undefined && data.paymentMethod !== currentBill.paymentMethod) {
        changedFields.push('paymentMethod');
      }
      if (data.paymentStatus !== undefined && data.paymentStatus !== currentBill.paymentStatus) {
        changedFields.push('paymentStatus');
      }
      if (data.paidAmount !== undefined && data.paidAmount !== currentBill.paidAmount) {
        changedFields.push('paidAmount');
      }
      if (data.notes !== undefined && data.notes !== currentBill.notes) {
        changedFields.push('notes');
      }
      if (data.internalNotes !== undefined && data.internalNotes !== currentBill.internalNotes) {
        changedFields.push('internalNotes');
      }
      if (incomingDiscount !== currentBill.discountAmount) {
        changedFields.push('discountAmount');
      }
      if (incomingSubtotal !== currentBill.subtotal) {
        changedFields.push('subtotal');
      }
      if (incomingTax !== currentBill.taxAmount) {
        changedFields.push('taxAmount');
      }
      if (incomingTotal !== currentBill.total) {
        changedFields.push('total');
      }
      if (data.items && data.items.length > 0) {
        changedFields.push('items');
      }

      // Create history record with NEW values (not old values)
      await tx.billHistory.create({
        data: {
          version,
          billNumber: currentBill.billNumber,
          status: data.status !== undefined ? data.status : currentBill.status,
          subtotal: incomingSubtotal,
          taxAmount: incomingTax,
          discountAmount: incomingDiscount,
          total: incomingTotal,
          customerName: data.customerName !== undefined ? data.customerName : currentBill.customerName,
          customerPhone: data.customerPhone !== undefined ? data.customerPhone : currentBill.customerPhone,
          customerEmail: data.customerEmail !== undefined ? data.customerEmail : currentBill.customerEmail,
          customerAddress: data.customerAddress !== undefined ? data.customerAddress : currentBill.customerAddress,
          paymentMethod: data.paymentMethod !== undefined ? data.paymentMethod : currentBill.paymentMethod,
          paymentStatus: data.paymentStatus !== undefined ? data.paymentStatus : currentBill.paymentStatus,
          paidAmount: data.paidAmount !== undefined ? data.paidAmount : currentBill.paidAmount,
          changeAmount: data.paidAmount !== undefined 
            ? (data.paidAmount > incomingTotal 
              ? data.paidAmount - incomingTotal
              : 0)
            : currentBill.changeAmount,
          notes: data.notes !== undefined ? data.notes : currentBill.notes,
          internalNotes: data.internalNotes !== undefined ? data.internalNotes : currentBill.internalNotes,
          editReason: data.editReason,
          changedFields: JSON.stringify(changedFields),
          billId: currentBill.id,
          editedById: data.editedById,
        },
      });

      // Calculate new change amount if paidAmount changed
      let changeAmount = currentBill.changeAmount;
      if (data.paidAmount !== undefined) {
        changeAmount = data.paidAmount > currentBill.total 
          ? data.paidAmount - currentBill.total 
          : 0;
      }

      // Update order items if provided
      if (data.items && data.items.length > 0 && currentBill.orderId) {
        // Delete existing order items
        await tx.orderItem.deleteMany({
          where: { orderId: currentBill.orderId },
        });

        // Create new order items
        for (const item of data.items) {
          await tx.orderItem.create({
            data: {
              orderId: currentBill.orderId,
              productId: item.productId,
              quantity: item.quantity,
              price: item.unitPrice,
            },
          });
        }

        // Update order total to match recalculated subtotal
        await tx.order.update({
          where: { id: currentBill.orderId },
          data: {
            total: incomingSubtotal,
          },
        });
      }

      // Update bill
      const updatedBill = await tx.bill.update({
        where: { id: billId },
        data: {
          ...(data.status !== undefined && { status: data.status }),
          ...(data.customerName !== undefined && { customerName: data.customerName }),
          ...(data.customerPhone !== undefined && { customerPhone: data.customerPhone }),
          ...(data.customerEmail !== undefined && { customerEmail: data.customerEmail }),
          ...(data.customerAddress !== undefined && { customerAddress: data.customerAddress }),
          ...(data.paymentMethod !== undefined && { paymentMethod: data.paymentMethod }),
          ...(data.paymentStatus !== undefined && { paymentStatus: data.paymentStatus }),
          ...(data.paidAmount !== undefined && { 
            paidAmount: data.paidAmount,
            changeAmount: data.paidAmount > incomingTotal ? data.paidAmount - incomingTotal : 0,
          }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.internalNotes !== undefined && { internalNotes: data.internalNotes }),
          discountAmount: incomingDiscount,
          subtotal: incomingSubtotal,
          taxAmount: incomingTax,
          total: incomingTotal,
          isEdited: true,
          editCount: version,
          lastEditedAt: new Date(),
        },
        include: {
          order: {
            include: {
              items: {
                include: {
                  product: true,
                },
              },
            },
          },
          branch: true,
          issuedBy: true,
        },
      });

      return mapBillToDTO(updatedBill);
    });
  }

  /**
   * Print bill (increment print counter)
   */
  static async printBill(billId: string) {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        printedCount: { increment: 1 },
        lastPrintedAt: new Date(),
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        branch: true,
        issuedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return mapBillToDTO(updatedBill);
  }

  /**
   * Get bill history
   */
  static async getBillHistory(billId: string): Promise<BillHistoryDTO[]> {
    const histories = await prisma.billHistory.findMany({
      where: { billId },
      orderBy: { version: 'desc' },
      include: {
        editedBy: true,
      },
    });

    return histories.map(mapBillHistoryToDTO);
  }

  /**
   * Mark bill as printed
   */
  static async markAsPrinted(billId: string): Promise<BillDTO> {
    const bill = await prisma.bill.update({
      where: { id: billId },
      data: {
        printedCount: { increment: 1 },
        lastPrintedAt: new Date(),
      },
      include: {
        order: true,
        branch: true,
        issuedBy: true,
      },
    });

    return mapBillToDTO(bill);
  }

  /**
   * Get bill statistics for branch
   */
  static async getBranchBillStats(branchId: string, dateFrom?: Date, dateTo?: Date) {
    const where: Prisma.BillWhereInput = { branchId };

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = dateFrom;
      if (dateTo) where.createdAt.lte = dateTo;
    }

    const [
      totalBills,
      paidBills,
      totalRevenue,
      averageBillAmount,
    ] = await Promise.all([
      prisma.bill.count({ where }),
      prisma.bill.count({ where: { ...where, paymentStatus: PaymentStatus.PAID } }),
      prisma.bill.aggregate({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { ...where, paymentStatus: PaymentStatus.PAID },
        _avg: { total: true },
      }),
    ]);

    return {
      totalBills,
      paidBills,
      pendingBills: totalBills - paidBills,
      totalRevenue: totalRevenue._sum.total || 0,
      averageBillAmount: Math.round(averageBillAmount._avg.total || 0),
    };
  }

  /**
   * Find all bills with pagination (for staff bills-history page)
   */
  static async findAll(params: BillQueryParams) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.BillWhereInput = {};

    if (params.branchId) {
      where.branchId = params.branchId;
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.paymentStatus) {
      where.paymentStatus = params.paymentStatus;
    }

    if (params.search) {
      where.OR = [
        { billNumber: { contains: params.search, mode: 'insensitive' } },
        { customerName: { contains: params.search, mode: 'insensitive' } },
        { customerPhone: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.BillOrderByWithRelationInput = {
      [params.sort || 'createdAt']: params.order || 'desc',
    };

    const [bills, total] = await Promise.all([
      prisma.bill.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
              total: true,
            },
          },
          branch: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          issuedBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.bill.count({ where }),
    ]);

    return { bills: bills.map(mapBillToDTO), total };
  }

  /**
   * Find bill by ID with branch check
   */
  static async findById(id: string, branchId?: string) {
    const where: Prisma.BillWhereUniqueInput = { id };
    
    const bill = await prisma.bill.findUnique({
      where,
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        branch: true,
        issuedBy: true,
        histories: {
          orderBy: { version: 'desc' },
          include: {
            editedBy: true,
          },
        },
      },
    });

    if (!bill) {
      return null;
    }

    // Branch check
    if (branchId && bill.branchId !== branchId) {
      return null;
    }

    return mapBillToDTO(bill);
  }

  /**
   * Update bill with history tracking (for complaint handling)
   * Level 3: Transaction + History Snapshot
   */
  static async updateWithHistory(billId: string, data: {
    editReason: string;
    subtotal?: number;
    taxAmount?: number;
    discountAmount?: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    customerAddress?: string;
    notes?: string;
    internalNotes?: string;
    editedById: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get current bill
      const currentBill = await tx.bill.findUnique({
        where: { id: billId },
      });

      if (!currentBill) {
        throw new Error('Bill not found');
      }

      // 2. Detect changed fields
      const changedFields: string[] = [];
      if (data.subtotal !== undefined && data.subtotal !== currentBill.subtotal) changedFields.push('subtotal');
      if (data.taxAmount !== undefined && data.taxAmount !== currentBill.taxAmount) changedFields.push('taxAmount');
      if (data.discountAmount !== undefined && data.discountAmount !== currentBill.discountAmount) changedFields.push('discountAmount');
      if (data.customerName !== undefined && data.customerName !== currentBill.customerName) changedFields.push('customerName');
      if (data.customerPhone !== undefined && data.customerPhone !== currentBill.customerPhone) changedFields.push('customerPhone');
      if (data.customerEmail !== undefined && data.customerEmail !== currentBill.customerEmail) changedFields.push('customerEmail');
      if (data.customerAddress !== undefined && data.customerAddress !== currentBill.customerAddress) changedFields.push('customerAddress');
      if (data.notes !== undefined && data.notes !== currentBill.notes) changedFields.push('notes');
      if (data.internalNotes !== undefined && data.internalNotes !== currentBill.internalNotes) changedFields.push('internalNotes');

      // 3. Create history snapshot (save old version)
      const version = currentBill.editCount + 1;
      await tx.billHistory.create({
        data: {
          billId: currentBill.id,
          version,
          billNumber: currentBill.billNumber,
          status: currentBill.status,
          subtotal: currentBill.subtotal,
          taxAmount: currentBill.taxAmount,
          discountAmount: currentBill.discountAmount,
          total: currentBill.total,
          customerName: currentBill.customerName,
          customerPhone: currentBill.customerPhone,
          customerEmail: currentBill.customerEmail,
          customerAddress: currentBill.customerAddress,
          paymentMethod: currentBill.paymentMethod,
          paymentStatus: currentBill.paymentStatus,
          paidAmount: currentBill.paidAmount,
          changeAmount: currentBill.changeAmount,
          notes: currentBill.notes,
          internalNotes: currentBill.internalNotes,
          editReason: data.editReason,
          changedFields: JSON.stringify(changedFields),
          editedById: data.editedById,
        },
      });

      // 4. Calculate new total
      const newSubtotal = data.subtotal ?? currentBill.subtotal;
      const newTaxAmount = data.taxAmount ?? currentBill.taxAmount;
      const newDiscountAmount = data.discountAmount ?? currentBill.discountAmount;
      const newTotal = newSubtotal + newTaxAmount - newDiscountAmount;

      // 5. Update bill
      const updatedBill = await tx.bill.update({
        where: { id: billId },
        data: {
          ...(data.subtotal !== undefined && { subtotal: data.subtotal }),
          ...(data.taxAmount !== undefined && { taxAmount: data.taxAmount }),
          ...(data.discountAmount !== undefined && { discountAmount: data.discountAmount }),
          total: newTotal,
          ...(data.customerName !== undefined && { customerName: data.customerName }),
          ...(data.customerPhone !== undefined && { customerPhone: data.customerPhone }),
          ...(data.customerEmail !== undefined && { customerEmail: data.customerEmail }),
          ...(data.customerAddress !== undefined && { customerAddress: data.customerAddress }),
          ...(data.notes !== undefined && { notes: data.notes }),
          ...(data.internalNotes !== undefined && { internalNotes: data.internalNotes }),
          isEdited: true,
          editCount: version,
          lastEditedAt: new Date(),
        },
        include: {
          order: true,
          branch: true,
          issuedBy: true,
        },
      });

      return mapBillToDTO(updatedBill);
    });
  }
}

