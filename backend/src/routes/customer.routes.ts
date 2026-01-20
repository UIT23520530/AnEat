import { Router } from 'express';
import { body } from 'express-validator';


import {
  getOrderHistory,
  createOrder,
  getMenu,
  getProfile,
  updateProfile,
  initiateMoMoPayment,
  handleMoMoIPN,
  updatePaymentStatus,
} from '../controllers/customer/customer.controller';

import { authenticate, isCustomer, validate } from '../middleware';

const router = Router();

router.post('/payment', initiateMoMoPayment);

// MoMo IPN callback - không cần authenticate vì MoMo gọi trực tiếp
router.post('/payment/momo-ipn', handleMoMoIPN);

// Update payment status from frontend (backup for IPN)
router.post('/payment/update-status', updatePaymentStatus); 

router.use(authenticate);

/**
 * @route   GET /api/v1/customer/profile
 * @desc    Get customer profile
 * @access  Customer only
 */
router.get('/profile', getProfile);

/**
 * @route   PUT /api/v1/customer/profile
 * @desc    Update customer profile
 * @access  Customer only
 */
router.put('/profile', updateProfile);

/**
 * @route   GET /api/v1/customer/orders
 * @desc    Get order history
 * @access  Customer only
 */
router.get('/orders', getOrderHistory);

/**
 * @route   POST /api/v1/customer/orders
 * @desc    Create new order
 * @access  Customer only
 */
router.post(
  '/orders',
  [
    body('branchId').notEmpty().withMessage('Branch ID is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  ],
  validate,
  createOrder
);

/**
 * @route   GET /api/v1/customer/menu
 * @desc    Get menu items
 * @access  Customer only
 */
router.get('/menu', getMenu);

export default router;
