import express from 'express';
import { LogisticsStaffController } from '../controllers/logistics-staff/shipment.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Tất cả routes yêu cầu authentication với role LOGISTICS_STAFF
router.use(authenticate);

// Lấy danh sách chuyến hàng (có phân trang, tìm kiếm, filter)
router.get('/shipments', LogisticsStaffController.getShipments);

// Lấy thống kê chuyến hàng theo trạng thái
router.get('/shipments/stats', LogisticsStaffController.getStats);

// Lấy chi tiết một chuyến hàng
router.get('/shipments/:id', LogisticsStaffController.getShipmentById);

// Cập nhật trạng thái chuyến hàng (bắt đầu giao, giao xong, hoàn thành)
router.patch('/shipments/:id/status', LogisticsStaffController.updateStatus);

// Xác nhận giao hàng thành công
router.post('/shipments/:id/confirm-delivery', LogisticsStaffController.confirmDelivery);

// Cập nhật thông tin chuyến hàng (ghi chú, vấn đề)
router.patch('/shipments/:id', LogisticsStaffController.updateShipment);

export default router;
