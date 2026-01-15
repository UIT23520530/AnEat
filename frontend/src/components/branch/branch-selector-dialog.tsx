"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search, Check, AlertCircle } from "lucide-react";
import { useBranch } from "@/contexts/branch-context";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

export function BranchSelectorDialog() {
  const { isBranchSelectorOpen, closeBranchSelector, selectedBranch, setSelectedBranch } = useBranch();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  const loadBranches = useCallback(async (searchTerm: string = "") => {
    if (!isBranchSelectorOpen) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/home/branches", {
        params: {
          page: 1,
          limit: 50,
          ...(searchTerm && searchTerm.trim() ? { search: searchTerm.trim() } : {}),
        },
      });

      if (response.data?.success) {
        setBranches(response.data.data || []);
      } else {
        setError("Không thể tải danh sách cửa hàng");
      }
    } catch (error: any) {
      if (error.code === "ERR_NETWORK" || error.message?.includes("Network Error")) {
        setError("Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Backend có đang chạy không?\n2. Port có đúng không (3001)?\n3. CORS có được cấu hình đúng không?");
      } else if (error.response) {
        setError(`Lỗi từ server: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else {
        setError(error.message || "Đã xảy ra lỗi khi tải danh sách cửa hàng");
      }
    } finally {
      setLoading(false);
    }
  }, [isBranchSelectorOpen]);

  // Load branches when dialog opens (only once)
  useEffect(() => {
    if (isBranchSelectorOpen) {
      loadBranches("");
    } else {
      // Reset state when dialog closes
      setSearch("");
      setError(null);
      setBranches([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBranchSelectorOpen]);

  // Debounce search (only when search changes, not on initial load)
  useEffect(() => {
    if (!isBranchSelectorOpen || search === "") return;
    
    const timer = setTimeout(() => {
      loadBranches(search);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    closeBranchSelector();
  };

  return (
    <Dialog open={isBranchSelectorOpen} onOpenChange={closeBranchSelector}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chọn cửa hàng</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm cửa hàng..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Branch List */}
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
          ) : error ? null : branches.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không tìm thấy cửa hàng nào
            </div>
          ) : (
            <div className="space-y-2">
              {branches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleSelectBranch(branch)}
                  className={cn(
                    "w-full text-left p-4 rounded-lg border transition-colors",
                    "hover:bg-orange-50 hover:border-orange-300",
                    selectedBranch?.id === branch.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-4 w-4 text-orange-500" />
                        <h3 className="font-semibold text-base">{branch.name}</h3>
                        {selectedBranch?.id === branch.id && (
                          <Check className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{branch.address}</p>
                      <p className="text-sm text-muted-foreground">ĐT: {branch.phone}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
