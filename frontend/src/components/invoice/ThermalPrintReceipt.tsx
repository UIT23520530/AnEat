/**
 * Thermal Print Receipt Component
 * For 80mm thermal printers (POS printers)
 * Generates print-ready receipt format
 */

import React from 'react';
import dayjs from 'dayjs';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface ReceiptProps {
  billNumber: string;
  orderNumber: string;
  date: string;
  time: string;
  branchName?: string;
  branchAddress?: string;
  customerName: string;
  customerPhone: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paidAmount?: number;
  changeAmount?: number;
  notes?: string;
  staffName: string;
}

const ThermalPrintReceipt: React.FC<ReceiptProps> = ({
  billNumber,
  orderNumber,
  date,
  time,
  branchName = 'AnEat Restaurant',
  branchAddress = 'Địa chỉ chi nhánh',
  customerName,
  customerPhone,
  items,
  subtotal,
  tax,
  discount,
  total,
  paymentMethod,
  paidAmount,
  changeAmount,
  notes,
  staffName,
}) => {
  return (
    <div
      id="thermal-receipt"
      style={{
        width: '80mm',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.5',
        padding: '10mm',
        margin: '0 auto',
        backgroundColor: 'white',
        color: 'black',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '10px' }}>
        <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>
          {branchName}
        </div>
        <div style={{ fontSize: '11px' }}>{branchAddress}</div>
        <div style={{ fontSize: '11px', marginTop: '2px' }}>
          Hotline: 1900-xxxx
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed black', margin: '10px 0' }}></div>

      {/* Bill Info */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Số HĐ:</span>
          <span style={{ fontWeight: 'bold' }}>{billNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Số ĐH:</span>
          <span>{orderNumber}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Ngày:</span>
          <span>{date} {time}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Thu ngân:</span>
          <span>{staffName}</span>
        </div>
      </div>

      {/* Customer Info */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Khách hàng:</span>
          <span>{customerName}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>SĐT:</span>
          <span>{customerPhone}</span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed black', margin: '10px 0' }}></div>

      {/* Items */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
          CHI TIẾT MÓN ĂN
        </div>
        {items.map((item, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ flex: 1 }}>{item.name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
              <span>
                {item.quantity} x {item.price.toLocaleString()}đ
              </span>
              <span style={{ fontWeight: 'bold' }}>
                {item.total.toLocaleString()}đ
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px dashed black', margin: '10px 0' }}></div>

      {/* Totals */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Tạm tính:</span>
          <span>{subtotal.toLocaleString()}đ</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>VAT (10%):</span>
          <span>{tax.toLocaleString()}đ</span>
        </div>
        {discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Giảm giá:</span>
            <span>-{discount.toLocaleString()}đ</span>
          </div>
        )}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '5px',
            paddingTop: '5px',
            borderTop: '1px solid black',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          <span>TỔNG CỘNG:</span>
          <span>{total.toLocaleString()}đ</span>
        </div>
      </div>

      {/* Payment Info */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Thanh toán:</span>
          <span>{paymentMethod}</span>
        </div>
        {paidAmount && paidAmount > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tiền khách đưa:</span>
              <span>{paidAmount.toLocaleString()}đ</span>
            </div>
            {changeAmount && changeAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tiền thừa:</span>
                <span>{changeAmount.toLocaleString()}đ</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Notes */}
      {notes && (
        <div style={{ marginBottom: '10px', fontSize: '11px' }}>
          <div style={{ fontWeight: 'bold' }}>Ghi chú:</div>
          <div>{notes}</div>
        </div>
      )}

      {/* Divider */}
      <div style={{ borderTop: '1px dashed black', margin: '10px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '11px', marginTop: '10px' }}>
        <div style={{ marginBottom: '5px' }}>
          Cảm ơn quý khách!
        </div>
        <div style={{ marginBottom: '5px' }}>
          Hẹn gặp lại!
        </div>
        <div style={{ marginTop: '10px', fontSize: '10px' }}>
          In lúc: {dayjs().format('DD/MM/YYYY HH:mm:ss')}
        </div>
      </div>
    </div>
  );
};

export default ThermalPrintReceipt;
