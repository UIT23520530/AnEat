// src/components/forms/StoresForm.tsx

"use client";

import { useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createStore, updateStore } from "@/lib/actions/store.action";
import { Store } from "@/types";

// Component con để hiển thị trạng thái loading của form
function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending 
        ? (isEditing ? "Saving Changes..." : "Creating Store...") 
        : (isEditing ? "Save Changes" : "Create Store")}
    </Button>
  );
}

interface StoresFormProps {
  store?: Store; // `store` là optional, nếu có -> edit mode
  onSuccess?: () => void; // Callback để đóng dialog
}

export function StoresForm({ store, onSuccess }: StoresFormProps) {
  // Quyết định action nào sẽ được gọi: update hoặc create
  const actionToPerform = store ? updateStore.bind(null, store.id) : createStore;

  return (
    <form
      action={async (formData) => {
        await actionToPerform(formData);
        if (onSuccess) {
          onSuccess();
        }
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Store Name</Label>
        <Input id="name" name="name" defaultValue={store?.name} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input id="address" name="address" defaultValue={store?.address} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={store?.phone} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={store?.email} required />
      </div>
       <div className="space-y-2">
        <Label htmlFor="manager">Manager</Label>
        <Input id="manager" name="manager" defaultValue={store?.manager} required />
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton isEditing={!!store} />
      </div>
    </form>
  );
}