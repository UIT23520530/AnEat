"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import React, { JSX, useState } from "react";

// Lazy load StoreForm (chúng ta sẽ tạo ở bước 3)
const StoreForm = dynamic(() => import("./forms/StoresForm"), {
  loading: () => <div className="p-4 text-center">Đang tải form...</div>,
});

// Mapping giữa tên bảng và Component Form tương ứng
const forms: {
  [key: string]: (type: "create" | "update", data?: any) => JSX.Element;
} = {
  store: (type, data) => <StoresForm type={type} data={data} />,
  // Thêm các form khác vào đây: teacher, student, v.v.
};

const FormModal = ({
  table,
  type,
  data,
  id,
}: {
  table: "store" | "teacher" | "student"; // Cập nhật danh sách các bảng của bạn
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";

  const [open, setOpen] = useState(false);

  const Form = () => {
    if (type === "delete" && id) {
      return (
        // Trong Next.js thực tế, đây sẽ là <form action={deleteServerAction}>
        <form action="" className="p-4 flex flex-col gap-4">
          <span className="text-center font-medium text-lg">
            Bạn có chắc chắn muốn xóa {table} này không? <br/> Dữ liệu sẽ bị mất vĩnh viễn.
          </span>
          <div className="flex justify-center gap-4 mt-4">
             <button type="button" onClick={() => setOpen(false)} className="bg-gray-300 text-black py-2 px-4 rounded-md border-none w-max">
              Hủy
            </button>
            <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max">
              Xóa
            </button>
          </div>
        </form>
      );
    } 
    
    if (type === "create" || type === "update") {
      return forms[table] ? forms[table](type, data) : "Không tìm thấy Form!";
    }
    
    return "Loại hành động không hợp lệ";
  };

  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor} hover:opacity-80 transition-opacity`}
        onClick={() => setOpen(true)}
      >
        {/* Đảm bảo bạn có các icon này trong thư mục public */}
        <Image src={`/${type}.png`} alt={type} width={16} height={16} />
      </button>
      {open && (
        <div className="w-screen h-screen fixed left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%] max-h-[90vh] overflow-y-auto">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="Close" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;