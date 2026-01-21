"use client"

import { Modal, Descriptions, Space, Avatar, Tag, Button, Divider } from "antd"
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  ShopOutlined,
  CalendarOutlined,
  LoginOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from "@ant-design/icons"
import { StaffDTO } from "@/types/staff"
import dayjs from "dayjs"

interface StaffDetailModalProps {
  staff: StaffDTO | null
  open: boolean
  onCancel: () => void
}

export default function StaffDetailModal({ staff, open, onCancel }: StaffDetailModalProps) {
  if (!staff) return null

  return (
    <Modal
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <UserOutlined className="text-orange-500" />
          <span>Hồ sơ chi tiết nhân viên</span>
        </div>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={800}
      centered
      className="staff-detail-modal"
    >
      <div className="py-2">
        {/* Header Profile */}
        <div className="flex items-center gap-6 mb-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <Avatar 
            size={100} 
            src={staff.avatar || null} 
            icon={<UserOutlined />} 
            className="border-4 border-white shadow-xl"
          />
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">{staff.name}</h2>
            <div className="flex items-center gap-3">
              <Tag color="blue" className="px-3 py-0.5 rounded-full font-semibold border-none">
                NHÂN VIÊN
              </Tag>
              <Tag 
                color={staff.isActive ? "success" : "default"} 
                icon={staff.isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                className="px-3 py-0.5 rounded-full font-semibold border-none"
              >
                {staff.isActive ? "ĐANG LÀM VIỆC" : "ĐÃ NGHỈ VIỆC"}
              </Tag>
            </div>
            <div className="mt-2 text-slate-500 flex items-center gap-2">
              <ShopOutlined />
              <span className="font-medium">{staff.branch?.name || "Chi nhánh chưa gán"}</span>
              <span className="text-xs text-slate-400">({staff.branch?.code || "N/A"})</span>
            </div>
          </div>
        </div>

        <Descriptions bordered column={2} className="overflow-hidden rounded-2xl border-slate-100 shadow-sm">

          <Descriptions.Item label={<div className="flex items-center gap-2"><UserOutlined className="text-slate-400"/> ID Hệ thống</div>} span={2}>
            <span className="font-mono text-xs text-slate-400 uppercase tracking-tighter">{staff.id}</span>
          </Descriptions.Item>

          <Descriptions.Item label={<div className="flex items-center gap-2"><MailOutlined className="text-blue-500"/> Email</div>}>
            <span className="font-medium text-slate-700">{staff.email}</span>
          </Descriptions.Item>
          
          <Descriptions.Item label={<div className="flex items-center gap-2"><PhoneOutlined className="text-green-500"/> Số điện thoại</div>}>
            <span className="font-medium text-slate-700">{staff.phone || "---"}</span>
          </Descriptions.Item>

          <Descriptions.Item label={<div className="flex items-center gap-2"><CalendarOutlined className="text-purple-500"/> Ngày gia nhập</div>} span={2}>
            <span className="font-medium text-slate-700">
              {dayjs(staff.createdAt).format("DD/MM/YYYY")} 
              <span className="text-slate-400 text-xs ml-2">
                ({dayjs(staff.createdAt).fromNow()})
              </span>
            </span>
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-8 flex justify-end">
          <Button 
            onClick={onCancel} 
            className="px-10 h-11 rounded-xl bg-slate-100 border-none text-slate-600 font-bold hover:bg-slate-200 transition-all"
          >
            ĐÓNG
          </Button>
        </div>
      </div>
    </Modal>
  )
}
