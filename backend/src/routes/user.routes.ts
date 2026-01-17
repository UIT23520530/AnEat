import { Router } from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser, getUsersStats } from '../controllers/admin/user.controller';
import { authenticate, isAdmin } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/v1/users/stats
 * @desc    Get users statistics
 * @access  Admin only
 */
router.get('/stats', isAdmin, getUsersStats);

/**
 * @route   GET /api/v1/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/', isAdmin, getAllUsers);

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID
 * @access  Admin only
 */
router.get('/:id', isAdmin, getUserById);

/**
 * @route   POST /api/v1/users
 * @desc    Create new user
 * @access  Admin only
 */
router.post('/', isAdmin, createUser);

/**
 * @route   PUT /api/v1/users/:id
 * @desc    Update user
 * @access  Admin only
 */
router.put('/:id', isAdmin, updateUser);

/**
 * @route   DELETE /api/v1/users/:id
 * @desc    Delete user (soft delete)
 * @access  Admin only
 */
router.delete('/:id', isAdmin, deleteUser);

export default router;
