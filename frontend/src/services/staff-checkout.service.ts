/**
 * Staff Checkout Service
 * Handles staff order payment flow with MoMo integration
 * Uses shared backend APIs but with staff-specific redirect logic
 */

import staffOrderService from './staff-order.service'
import { createMoMoPayment, createMoMoPosPayment } from './payment.service'

export interface CreateOrderParams {
  items: Array<{
    productId: string
    quantity: number
    price: number
    name: string
    options?: string
  }>
  customerId?: string
  promotionCode?: string
  paymentMethod: 'CASH' | 'E_WALLET' | 'CARD'
  notes?: string
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'
  deliveryAddress?: string
}

export interface PaymentResult {
  success: boolean
  redirectUrl?: string
  error?: string
}

class StaffCheckoutService {
  /**
   * Create order and handle payment
   * Routes to staff-specific success/failure pages
   */
  static async createOrderAndPay(
    params: CreateOrderParams,
    total: number
  ): Promise<PaymentResult> {
    try {
      // Create order in database
      const orderResponse = await staffOrderService.createOrder({
        items: params.items,
        customerId: params.customerId,
        promotionCode: params.promotionCode,
        paymentMethod: params.paymentMethod,
        notes: params.notes,
        orderType: params.orderType,
        deliveryAddress: params.deliveryAddress,
      })

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || 'Không thể tạo đơn hàng')
      }

      const createdOrder = orderResponse.data

      // Handle payment based on method
      if (params.paymentMethod === 'E_WALLET') {
        return this.handleMoMoPayment(createdOrder, total)
      } else if (params.paymentMethod === 'CARD') {
        return this.handleMoMoPosPayment(createdOrder, total, params.paymentMethod)
      } else {
        // Cash payment - already marked as PAID in createOrder
        return {
          success: true,
          redirectUrl: `/staff/checkout/success?orderId=${createdOrder.id}&orderNumber=${createdOrder.orderNumber}&total=${total}`,
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Có lỗi xảy ra',
      }
    }
  }

  /**
   * Handle MoMo E-Wallet payment
   */
  static async handleMoMoPayment(createdOrder: any, total: number): Promise<PaymentResult> {
    try {
      // Backup order data to sessionStorage for recovery if needed
      sessionStorage.setItem(
        'staffOrderBackup',
        JSON.stringify({
          orderId: createdOrder.id,
          orderNumber: createdOrder.orderNumber,
          total: total,
          paymentMethod: 'E_WALLET',
        })
      )

      // Build staff failure URL for callback
      const failureUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/staff/checkout/failure?orderId=${createdOrder.id}&orderNumber=${createdOrder.orderNumber}&total=${total}&message=${encodeURIComponent('Thanh toán bị hủy')}`

      const data = await createMoMoPayment({
        amount: total,
        orderInfo: `Thanh toán đơn hàng ${createdOrder.orderNumber} tại AnEat`,
        returnUrl: failureUrl,
      })

      if (data?.data?.payUrl) {
        // Update payment status will be handled by MoMo callback
        return {
          success: true,
          redirectUrl: data.data.payUrl,
        }
      } else {
        // Update payment status to FAILED
        await staffOrderService.updatePaymentStatus(createdOrder.id, 'FAILED')
        return {
          success: false,
          redirectUrl: failureUrl,
          error: 'Không lấy được link thanh toán MoMo!',
        }
      }
    } catch (error: any) {
      return {
        success: false,
        redirectUrl: `/staff/checkout/failure?orderId=${createdOrder.id}&orderNumber=${createdOrder.orderNumber}&total=${total}&message=${encodeURIComponent(error.message || 'Lỗi thanh toán')}`,
        error: error.message,
      }
    }
  }

  /**
   * Handle MoMo POS (QR Code) payment
   */
  static async handleMoMoPosPayment(
    createdOrder: any,
    total: number,
    paymentCode: string
  ): Promise<PaymentResult> {
    try {
      // Build staff failure URL for callback
      const failureUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/staff/checkout/failure?orderId=${createdOrder.id}&orderNumber=${createdOrder.orderNumber}&total=${total}&message=${encodeURIComponent('Thanh toán bị hủy')}`

      const data = await createMoMoPosPayment({
        amount: total,
        orderInfo: `Thanh toán đơn hàng ${createdOrder.orderNumber} tại AnEat (POS)`,
        paymentCode: paymentCode.trim(),
        returnUrl: failureUrl,
      })

      if (data?.data?.payUrl) {
        return {
          success: true,
          redirectUrl: data.data.payUrl,
        }
      } else {
        await staffOrderService.updatePaymentStatus(createdOrder.id, 'FAILED')
        return {
          success: false,
          redirectUrl: failureUrl,
          error: 'Không lấy được link thanh toán MoMo POS!',
        }
      }
    } catch (error: any) {
      return {
        success: false,
        redirectUrl: `/staff/checkout/failure?orderId=${createdOrder.id}&orderNumber=${createdOrder.orderNumber}&total=${total}&message=${encodeURIComponent(error.message || 'Lỗi thanh toán')}`,
        error: error.message,
      }
    }
  }

  /**
   * Retry payment with MoMo (from failure page)
   */
  static async retryMoMoPayment(orderId: string, orderNumber: string, total: number): Promise<PaymentResult> {
    try {
      // Build staff failure URL for callback
      const failureUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/staff/checkout/failure?orderId=${orderId}&orderNumber=${orderNumber}&total=${total}&message=${encodeURIComponent('Thanh toán bị hủy')}`

      const data = await createMoMoPayment({
        amount: total,
        orderInfo: `Thanh toán đơn hàng ${orderNumber} tại AnEat`,
        returnUrl: failureUrl,
      })

      if (data?.data?.payUrl) {
        return {
          success: true,
          redirectUrl: data.data.payUrl,
        }
      } else {
        return {
          success: false,
          error: 'Không lấy được link thanh toán MoMo!',
        }
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Không thể tạo liên kết thanh toán mới',
      }
    }
  }

  /**
   * Get order for checkout context
   */
  static async getOrderForCheckout(orderId: string) {
    try {
      const response = await staffOrderService.getOrderById(orderId)
      if (response.success && response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error('Get order error:', error)
      return null
    }
  }

  /**
   * Get backup order from sessionStorage
   */
  static getBackupOrder() {
    try {
      const backup = sessionStorage.getItem('staffOrderBackup')
      return backup ? JSON.parse(backup) : null
    } catch (error) {
      console.error('Parse backup error:', error)
      return null
    }
  }

  /**
   * Clear backup order from sessionStorage
   */
  static clearBackupOrder() {
    sessionStorage.removeItem('staffOrderBackup')
  }
}

export const staffCheckoutService = StaffCheckoutService
export default staffCheckoutService
