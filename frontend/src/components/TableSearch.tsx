"use client";
import { Search } from "lucide-react";

const TableSearch = ({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
}: {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-white px-3 py-1.5 ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <Search className="h-4 w-4 text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
      />
    </div>
  );
};

export default TableSearch;