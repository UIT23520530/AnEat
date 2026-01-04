import { Request, Response } from 'express';
import { ShipmentService } from '../../models/shipment.service';
import { ShipmentStatus } from '@prisma/client';

export class LogisticsStaffController {
  // GET /api/logistics/shipments - Lấy danh sách chuyến hàng
  static async getShipments(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      // Nếu có user thì filter theo assignedToId, không thì lấy tất cả
      const params: any = { ...req.query };
      if (userId) params.assignedToId = userId;

      const result = await ShipmentService.getShipments(params);

      res.json({
        success: true,
        message: 'Lấy danh sách chuyến hàng thành công',
        data: result.data,
        meta: result.meta,
      });
    } catch (error: any) {
      // Log chi tiết lỗi ra console để debug
      console.error('Lỗi khi lấy danh sách chuyến hàng:', error);
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy danh sách chuyến hàng',
        error: error.message,
        stack: error.stack,
      });
    }
  }

  // GET /api/logistics/shipments/:id - Lấy chi tiết chuyến hàng
  static async getShipmentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const shipment = await ShipmentService.getShipmentById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy chuyến hàng',
        });
      }

      return res.json({
        success: true,
        message: 'Lấy thông tin chuyến hàng thành công',
        data: shipment,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thông tin chuyến hàng',
        error: error.message,
      });
    }
  }

  // PATCH /api/logistics/shipments/:id/status - Cập nhật trạng thái chuyến hàng
  static async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = (req as any).user?.id;

      if (!status || !Object.values(ShipmentStatus).includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Trạng thái không hợp lệ',
        });
      }

      const shipment = await ShipmentService.updateStatus(id, status, userId);

      return res.json({
        success: true,
        message: `Cập nhật trạng thái thành ${status} thành công`,
        data: shipment,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật trạng thái chuyến hàng',
        error: error.message,
      });
    }
  }

  // PATCH /api/logistics/shipments/:id - Cập nhật thông tin chuyến hàng
  static async updateShipment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const shipment = await ShipmentService.updateShipment(id, updateData);

      res.json({
        success: true,
        message: 'Cập nhật thông tin chuyến hàng thành công',
        data: shipment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi cập nhật thông tin chuyến hàng',
        error: error.message,
      });
    }
  }

  // GET /api/logistics/shipments/stats - Thống kê chuyến hàng
  static async getStats(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const stats = await ShipmentService.getShipmentStats(userId);

      res.json({
        success: true,
        message: 'Lấy thống kê thành công',
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi lấy thống kê',
        error: error.message,
      });
    }
  }

  // POST /api/logistics/shipments/:id/confirm-delivery - Xác nhận giao hàng thành công
  static async confirmDelivery(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { notes } = req.body;

      const shipment = await ShipmentService.updateStatus(id, ShipmentStatus.DELIVERED, userId);

      if (notes) {
        await ShipmentService.updateShipment(id, { notes });
      }

      res.json({
        success: true,
        message: 'Xác nhận giao hàng thành công',
        data: shipment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Lỗi khi xác nhận giao hàng',
        error: error.message,
      });
    }
  }
}
