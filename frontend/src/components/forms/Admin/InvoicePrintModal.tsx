"use client";

import React from "react";
import { Modal, Button } from "antd";
import { PrinterOutlined } from "@ant-design/icons";
import ThermalPrintReceipt from "@/components/invoice/ThermalPrintReceipt";

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
  invoice: Invoice | null;
  onConfirmPrint: () => void;
  getPaymentMethodText: (method: string | null) => string;
}

export const InvoicePrintModal: React.FC<InvoicePrintModalProps> = ({
  open,
  onClose,
  invoice,
  onConfirmPrint,
  getPaymentMethodText,
}) => {
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
        {invoice && (
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
        )}
      </Modal>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
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
          #thermal-receipt {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            margin: 0;
            box-shadow: none;
          }
        }
      `}</style>
    </>
  );
};
