import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAssignedOrders,
  updateOrderStatus,
} from '../controllers/staff.controller';
import { authenticate, isStaff, validate } from '../middleware';

const router = Router();

// All routes require staff authentication
router.use(authenticate);
router.use(isStaff);

/**
 * @route   GET /api/v1/staff/orders
 * @desc    Get assigned orders
 * @access  Staff only
 */
router.get('/orders', getAssignedOrders);

/**
 * @route   PUT /api/v1/staff/orders/:orderId
 * @desc    Update order status
 * @access  Staff only
 */
router.put(
  '/orders/:orderId',
  [
    body('status')
      .isIn(['PENDING', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'])
      .withMessage('Invalid order status'),
  ],
  validate,
  updateOrderStatus
);

export default router;
