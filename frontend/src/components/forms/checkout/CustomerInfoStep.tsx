"use client";

import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface CustomerInfoStepProps {
  form: UseFormReturn<any>;
}

export function CustomerInfoStep({ form }: CustomerInfoStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Họ và tên</FormLabel>
            <FormControl>
              <Input placeholder="Nguyễn Văn A" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Số điện thoại</FormLabel>
            <FormControl>
              <Input placeholder="0123456789" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Địa chỉ</FormLabel>
            <FormControl>
              <Input
                placeholder="Số 1, Đường ABC, Phường XYZ, Quận 1, TP.HCM"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
