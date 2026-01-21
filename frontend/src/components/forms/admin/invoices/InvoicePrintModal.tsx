"use client";

import React from "react";
import { Modal, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import ThermalPrintReceipt from "@/components/invoice/ThermalPrintReceipt";
import { PrintSettings } from "@/services/admin-template.service";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  unitPrice: number;
  total: number;
  image?: string;
}

interface Invoice {
  billNumber: string;
  orderNumber: string;
  date: string;
  time: string;
  branchName: string;
  branchAddress: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: "cash" | "card" | "transfer" | "momo" | null;
  staffName: string;
  notes?: string;
}

interface InvoicePrintModalProps {
  open: boolean;
  onClose: () => void;
  invoice?: Invoice | null;
  onConfirmPrint: () => void;
  getPaymentMethodText?: (method: string | null) => string;
  customHtmlContent?: string;
  isTemplatePreview?: boolean;
  printSettings?: PrintSettings;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  open,
  onClose,
  invoice,
  onConfirmPrint,
  getPaymentMethodText,
  customHtmlContent,
  isTemplatePreview = false,
  printSettings,
}) => {
  // Generate print CSS from settings
  const generatePrintCss = () => {
    if (!printSettings) {
      // Default thermal receipt settings
      return `
        @page {
          size: A4;
          margin: 20mm;
        }
        body * {
          visibility: hidden;
        }
        #thermal-receipt,
        #thermal-receipt * {
          visibility: visible;
        }
        #thermal-receipt img {
          visibility: visible !important;
        }
        #thermal-receipt {
          position: fixed;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          margin: 0;
          box-shadow: none;
          width: 80mm;
        }
      `;
    }

    const {
      pageSize = 'A4',
      pageWidth,
      pageHeight,
      marginTop = '20mm',
      marginRight = '20mm',
      marginBottom = '20mm',
      marginLeft = '20mm',
      contentWidth = '80mm',
      customCss = '',
    } = printSettings;

    let pageSizeValue = pageSize;
    if (pageSize === 'custom' && pageWidth && pageHeight) {
      pageSizeValue = `${pageWidth} ${pageHeight}`;
    }

    return `
      @page {
        size: ${pageSizeValue};
        margin-top: ${marginTop};
        margin-right: ${marginRight};
        margin-bottom: ${marginBottom};
        margin-left: ${marginLeft};
      }
      body * {
        visibility: hidden;
      }
      #thermal-receipt,
      #thermal-receipt * {
        visibility: visible;
      }
      #thermal-receipt img {
        visibility: visible !important;
      }
      #thermal-receipt {
        position: fixed;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        margin: 0;
        box-shadow: none;
        width: ${contentWidth};
        ${customCss}
      }
    `;
  };

  return (
    <>
      <Modal
        title={
          <span className="text-lg font-semibold">
            Xem trước in hóa đơn
          </span>
        }
        open={open}
        onCancel={onClose}
        width={400}
        centered
        footer={[
          <Button key="cancel" onClick={onClose}>
            Hủy
          </Button>,
          <Button
            key="print"
            type="primary"
            icon={<PrinterOutlined />}
            onClick={onConfirmPrint}
            className="bg-blue-500 hover:bg-blue-600"
          >
            In hóa đơn
          </Button>,
        ]}
      >
        {customHtmlContent ? (
          <div
            id="thermal-receipt"
            style={isTemplatePreview ? {
              maxHeight: '70vh',
              overflow: 'auto',
              maxWidth: '100%',
              margin: '0 auto',
              padding: '20px',
              background: 'white',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'black',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)'
            } : {
              maxHeight: '70vh',
              overflow: 'auto',
              width: '80mm',
              margin: '0 auto',
              padding: '4mm',
              background: 'white',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: '1.5',
              color: 'black',
              boxShadow: '0 0 5px rgba(0,0,0,0.1)'
            }}
            dangerouslySetInnerHTML={{ __html: customHtmlContent }}
          />
        ) : invoice && getPaymentMethodText ? (
          <div style={{ maxHeight: '70vh', overflow: 'auto' }}>
            <ThermalPrintReceipt
              billNumber={invoice.billNumber}
              orderNumber={invoice.orderNumber}
              date={invoice.date}
              time={invoice.time}
              branchName={invoice.branchName}
              branchAddress={invoice.branchAddress}
              customerName={invoice.customerName}
              customerPhone={invoice.customerPhone}
              customerAddress={invoice.customerAddress}
              items={invoice.items}
              subtotal={invoice.subtotal}
              tax={invoice.tax}
              discount={invoice.discount}
              total={invoice.total}
              paymentMethod={getPaymentMethodText(invoice.paymentMethod)}
              staffName={invoice.staffName}
              notes={invoice.notes}
            />
          </div>
        ) : null}
      </Modal>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          ${generatePrintCss()}
        }
      `}</style>
    </>
  );
};
