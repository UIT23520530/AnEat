"use client";

import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";

interface PaymentStepProps {
  form: UseFormReturn<any>;
}

export function PaymentStep({ form }: PaymentStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="paymentMethod"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>Phương thức thanh toán</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-2"
              >
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="cod" />
                  </FormControl>
                  <FormLabel className="font-normal cursor-pointer">
                    Thanh toán khi nhận hàng (COD)
                  </FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                  <FormControl>
                    <RadioGroupItem value="card" disabled />
                  </FormControl>
                  <FormLabel className="font-normal text-muted-foreground">
                    Thanh toán bằng thẻ (Sắp có)
                  </FormLabel>
                </FormItem>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="promoCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mã giảm giá (nếu có)</FormLabel>
            <FormControl>
              <Input placeholder="ANEAT_PROMO" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
