// src/app/admin/stores/page.tsx
import { AdminLayout } from "@/components/layouts/admin-layout"
import { StoresView } from "@/components/features/stores/StoresView"
import { Store } from "@/types"
import { getStores } from "@/lib/actions/store.action";


export default async function AdminStoresPage() {
  // 1. Fetch dữ liệu trên server
  const stores = await getStores()
  return (
      <AdminLayout>
        <StoresView initialStores={stores} />
      </AdminLayout>
  )
}