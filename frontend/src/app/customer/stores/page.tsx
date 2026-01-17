"use client";

import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Phone, Mail, Search, AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useBranch } from "@/contexts/branch-context";
import { Button } from "@/components/ui/button";
import { createSlug } from "@/lib/utils";

interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
}

export default function StoresPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { selectedBranch, setSelectedBranch } = useBranch();

  const loadBranches = async (searchTerm: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/home/branches", {
        params: {
          page: 1,
          limit: 100,
          ...(searchTerm && searchTerm.trim() ? { search: searchTerm.trim() } : {}),
        },
      });

      if (response.data?.success) {
        setBranches(response.data.data || []);
      } else {
        setError("Không thể tải danh sách cửa hàng");
      }
    } catch (error: any) {
      setError("Đã xảy ra lỗi khi tải danh sách cửa hàng");
    } finally {
      setLoading(false);
    }
  };

  // Load branches on mount (only once)
  useEffect(() => {
    loadBranches("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter branches client-side
  const filteredBranches = branches.filter((branch) => {
    if (!search.trim()) return true;
    
    // Normalize both for better matching
    const normSearch = createSlug(search.trim().toLowerCase());
    const normName = createSlug(branch.name.toLowerCase());
    const normAddress = createSlug(branch.address.toLowerCase());
    
    // Check both hyphenated and non-hyphenated versions for better accuracy
    return (
      normName.includes(normSearch) || 
      normAddress.includes(normSearch) ||
      normName.replace(/-/g, "").includes(normSearch.replace(/-/g, "")) ||
      normAddress.replace(/-/g, "").includes(normSearch.replace(/-/g, ""))
    );
  });

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
  };


  return (
    <PublicLayout>
      <div className="min-h-screen bg-slate-50/50 py-12">
        <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-center">Cửa hàng</h1>
          <p className="text-lg text-muted-foreground text-center mb-8">
            Tìm cửa hàng AnEat gần bạn nhất
          </p>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-8">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <Input
                placeholder="Tìm cửa hàng AnEat (tên đường, quận, thành phố)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 pr-4 py-6 bg-white border-gray-200 focus:border-orange-500 focus:ring-orange-500 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-700"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-8">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Loading */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : (
            <>
              {/* Branches Grid */}
              {filteredBranches.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBranches.map((branch) => (
                    <Card
                      key={branch.id}
                      className={`transition-all hover:shadow-lg flex flex-col h-full ${
                        selectedBranch?.id === branch.id
                          ? "border-orange-500 border-2"
                          : ""
                      }`}
                    >
                      <CardContent className="pt-6 flex-1 flex flex-col">
                        <div className="space-y-4 flex-1 flex flex-col">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-5 w-5 text-orange-500" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg mb-1">{branch.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">
                                {branch.address}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2 pt-2 border-t">
                            {branch.phone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{branch.phone}</span>
                              </div>
                            )}
                            {branch.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{branch.email}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-auto pt-4">
                            <Button
                              variant={selectedBranch?.id === branch.id ? "default" : "outline"}
                              className={`w-full ${
                                selectedBranch?.id === branch.id
                                  ? "bg-orange-500 hover:bg-orange-600 text-white border-none"
                                  : "bg-white border-orange-500 text-orange-500 hover:bg-orange-50 hover:text-orange-600"
                              }`}
                              onClick={() => handleSelectBranch(branch)}
                            >
                              {selectedBranch?.id === branch.id
                                ? "Đã chọn"
                                : "Chọn cửa hàng này"}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">
                    Không tìm thấy cửa hàng nào
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}
