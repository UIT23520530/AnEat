"use client";

import React from "react";
import { Modal, Button } from "antd";
import { EyeOutlined, PrinterOutlined } from "@ant-design/icons";
import { TemplateDTO } from "@/services/admin-template.service";

interface TemplatePreviewModalProps {
  open: boolean;
  onClose: () => void;
  template: TemplateDTO | null;
  onPrint: (template: TemplateDTO) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  open,
  onClose,
  template,
  onPrint,
}) => {
  if (!template) return null;

  // Replace placeholders with sample data
  const getSampleContent = () => {
    let content = template.content;

    // Sample data for iteration
    const sampleItems = [
      { name: 'Gà Rán Giòn (2 miếng)', quantity: 2, price: '35,000đ', total: '70,000đ' },
      { name: 'Khoai Tây Chiên (Lớn)', quantity: 1, price: '25,000đ', total: '25,000đ' },
      { name: 'Pepsi Tươi (Lớn)', quantity: 2, price: '15,000đ', total: '30,000đ' }
    ];

    // Handle {{#items}}...{{/items}} block
    const itemsBlockRegex = /{{#items}}([\s\S]*?){{\/items}}/g;
    content = content.replace(itemsBlockRegex, (match, innerContent) => {
      return sampleItems.map(item => {
        let itemRow = innerContent;
        itemRow = itemRow.replace(/{{name}}/g, item.name);
        itemRow = itemRow.replace(/{{quantity}}/g, item.quantity);
        itemRow = itemRow.replace(/{{price}}/g, item.price);
        itemRow = itemRow.replace(/{{total}}/g, item.total);
        return itemRow;
      }).join('');
    });

    // Common placeholders - clean, no extra bold
    content = content.replace(/{{billNumber}}/g, 'BILL-2026-0001');
    content = content.replace(/{{billId}}/g, 'BILL-2026-0001');
    content = content.replace(/{{orderNumber}}/g, 'ORD-2026-0001');
    content = content.replace(/{{orderId}}/g, 'ORD-2026-0001');
    content = content.replace(/{{receiptNumber}}/g, 'REC-2026-0001');
    content = content.replace(/{{customerName}}/g, 'Nguyễn Văn A');
    content = content.replace(/{{customerPhone}}/g, '0901234567');
    content = content.replace(/{{customerAddress}}/g, '123 Nguyễn Huệ, Quận 1, TP.HCM');
    content = content.replace(/{{address}}/g, '123 Nguyễn Huệ, Quận 1, TP.HCM');

    // Financial - keep consistent formatting
    content = content.replace(/{{total}}/g, '125,000đ');
    content = content.replace(/{{grandTotal}}/g, '125,000đ'); // Matched with sample items
    content = content.replace(/{{subtotal}}/g, '113,636đ');
    content = content.replace(/{{tax}}/g, '11,364đ');
    content = content.replace(/{{discount}}/g, '0đ');
    content = content.replace(/{{finalTotal}}/g, '125,000đ');

    content = content.replace(/{{date}}/g, new Date().toLocaleDateString('vi-VN'));
    content = content.replace(/{{time}}/g, new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }));
    content = content.replace(/{{tableNumber}}/g, 'Bàn 5');
    content = content.replace(/{{branchName}}/g, 'AnEat - Chi nhánh Quận 1');
    content = content.replace(/{{branchAddress}}/g, '456 Lê Lợi, Quận 1, TP.HCM');
    content = content.replace(/{{branchPhone}}/g, '028 3822 1111');
    content = content.replace(/{{staffName}}/g, 'Trần Thị B');
    content = content.replace(/{{paymentMethod}}/g, 'Tiền mặt');

    // Fallback for simple {{items}} placeholder if block syntax wasn't used
    const sampleItemsTable = `
      <table style="width: 100%; border-collapse: collapse; margin: 10px 0;">
        <thead>
          <tr style="border-bottom: 1px solid #ddd;">
            <th style="text-align: left; padding: 8px;">Món</th>
            <th style="text-align: center; padding: 8px;">SL</th>
            <th style="text-align: right; padding: 8px;">Giá</th>
            <th style="text-align: right; padding: 8px;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${sampleItems.map(item => `
            <tr>
              <td style="padding: 6px 8px;">${item.name}</td>
              <td style="text-align: center; padding: 6px 8px;">${item.quantity}</td>
              <td style="text-align: right; padding: 6px 8px;">${item.price}</td>
              <td style="text-align: right; padding: 6px 8px;">${item.total}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const sampleItemsList = sampleItems.map(i => `${i.quantity} ${i.name} ${i.total}`).join('<br/>');

    content = content.replace(/{{items}}/g, sampleItemsTable);
    content = content.replace(/{{itemsList}}/g, sampleItemsList);

    // Report specific
    content = content.replace(/{{reportDate}}/g, new Date().toLocaleDateString('vi-VN'));
    content = content.replace(/{{totalSales}}/g, '15,000,000đ');
    content = content.replace(/{{revenue}}/g, '13,500,000đ');
    content = content.replace(/{{profit}}/g, '3,200,000đ');
    content = content.replace(/{{orderCount}}/g, '45');

    return content;
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <EyeOutlined style={{ fontSize: 20, color: "#52c41a" }} />
          <span className="text-lg font-semibold">Xem trước: {template.name}</span>
        </div>
      }
      open={open}
      onCancel={onClose}
      width={900}
      centered
      maskClosable={false}
      footer={[
        <Button key="close" onClick={onClose}>
          Đóng
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<PrinterOutlined />}
          onClick={() => onPrint(template)}
        >
          In mẫu
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Warning */}
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Chế độ xem trước:</strong> Đây là bản xem trước với dữ liệu mẫu. Dữ liệu thực tế sẽ được điền khi sử dụng.
          </p>
        </div>

        {/* Preview with better styling */}
        <div
          style={{
            maxHeight: '70vh',
            overflow: 'auto',
            backgroundColor: '#f8f9fa',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}
        >
          <div
            id="template-preview-content"
            className="template-preview-wrapper"
            style={{
              maxWidth: '800px',
              margin: '0 auto',
              backgroundColor: 'white',
              padding: '40px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderRadius: '4px',
            }}
            dangerouslySetInnerHTML={{ __html: getSampleContent() }}
          />
        </div>
      </div>

      {/* Enhanced Template Styles */}
      <style jsx global>{`
        .template-preview-wrapper {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #1f2937;
        }
        
        .template-preview-wrapper h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 20px 0;
          color: #111827;
          text-align: center;
        }
        
        .template-preview-wrapper h2 {
          font-size: 22px;
          font-weight: 600;
          margin: 24px 0 16px 0;
          color: #374151;
        }
        
        .template-preview-wrapper h3 {
          font-size: 18px;
          font-weight: 600;
          margin: 20px 0 12px 0;
          color: #4b5563;
        }
        
        .template-preview-wrapper p {
          margin: 8px 0;
          line-height: 1.7;
        }
        
        .template-preview-wrapper strong {
          font-weight: 600;
          color: #111827;
        }
        
        .template-preview-wrapper table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
        }
        
        .template-preview-wrapper table th,
        .template-preview-wrapper table td {
          padding: 10px 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .template-preview-wrapper table th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #d1d5db;
        }
        
        .template-preview-wrapper table tr:hover {
          background-color: #f9fafb;
        }
        
        .template-preview-wrapper ul, 
        .template-preview-wrapper ol {
          margin: 12px 0;
          padding-left: 24px;
        }
        
        .template-preview-wrapper li {
          margin: 6px 0;
        }
        
        .template-preview-wrapper .invoice,
        .template-preview-wrapper .header,
        .template-preview-wrapper .info,
        .template-preview-wrapper .items,
        .template-preview-wrapper .total,
        .template-preview-wrapper .footer {
          margin: 16px 0;
        }
        
        .template-preview-wrapper .total {
          border-top: 2px solid #374151;
          padding-top: 16px;
          margin-top: 20px;
        }
        
        .template-preview-wrapper .total > div {
          display: flex;
          justify-content: space-between;
          padding: 4px 0;
          font-size: 14px;
        }
        
        .template-preview-wrapper .total > div:last-child {
          font-weight: 700;
          font-size: 16px;
          padding-top: 8px;
          border-top: 1px solid #e5e7eb;
          margin-top: 8px;
        }
        
        .template-preview-wrapper .footer {
          text-align: center;
          margin-top: 32px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          color: #6b7280;
          font-size: 13px;
        }

        .template-preview-wrapper .address {
          background: #f9fafb;
          padding: 12px 16px;
          margin: 12px 0;
          border-radius: 4px;
          border-left: 3px solid #3b82f6;
        }

        .template-preview-wrapper .promo {
          background: #fef2f2;
          color: #991b1b;
          padding: 12px;
          text-align: center;
          margin: 16px 0;
          border-radius: 4px;
          font-weight: 600;
        }

        .template-preview-wrapper .discount {
          color: #111827;
          font-weight: 600;
        }

        .template-preview-wrapper .summary {
          margin: 20px 0;
          padding: 16px;
          background: #f9fafb;
          border-radius: 4px;
        }

        .template-preview-wrapper .row {
          display: flex;
          justify-content: space-between;
          margin: 8px 0;
          padding: 4px 0;
        }
      `}</style>
    </Modal>
  );
};
