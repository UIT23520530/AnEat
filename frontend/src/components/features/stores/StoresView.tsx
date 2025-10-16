// src/components/features/stores/StoresView.tsx

"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Trash, Search } from "lucide-react";

import { StoresForm } from "@/components/forms/StoresForm";
import { Store } from "@/types";
import { deleteStore } from "@/lib/actions/store.action";


interface StoresViewProps {
  initialStores: Store[];
}

export function StoresView({ initialStores }: StoresViewProps) {
  // State chỉ dành cho UI (dialog, store được chọn, nội dung search), không chứa danh sách store
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleDeleteStore = () => {
    if (!selectedStore) return;

    startTransition(async () => {
      await deleteStore(selectedStore.id);
      setIsDeleteDialogOpen(false);
      setSelectedStore(null);
    });
  };

  const filteredStores = initialStores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
      store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-3xl">
            <CardTitle>All Stores</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8 w-full sm:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Store
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Store</DialogTitle>
                    <DialogDescription>Create a new store location.</DialogDescription>
                  </DialogHeader>
                  <StoresForm onSuccess={() => setIsAddDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Info</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStores.map((store) => (
                <TableRow key={store.id}>
                  <TableCell className="font-medium">
                    <div className="font-bold">{store.name}</div>
                    <div className="text-sm text-muted-foreground">{store.email}</div>
                    <div className="text-sm text-muted-foreground">{store.phone}</div>
                  </TableCell>
                  <TableCell>{store.address}</TableCell>
                  <TableCell>{store.manager}</TableCell>
                  <TableCell>
                    <Badge variant={store.status === "active" ? "default" : "outline"}>
                      {store.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedStore(store);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => {
                        setSelectedStore(store);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Store Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Store: {selectedStore?.name}</DialogTitle>
            <DialogDescription>Update the details for this store.</DialogDescription>
          </DialogHeader>
          <StoresForm store={selectedStore!} onSuccess={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Delete Store Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Store: {selectedStore?.name}</DialogTitle>
            <DialogDescription>
              Are you sure? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteStore} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}