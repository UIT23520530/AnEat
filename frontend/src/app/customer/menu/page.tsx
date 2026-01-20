"use client";

import { useState, useEffect } from "react";
import { PublicLayout } from "@/components/layouts/public-layout";
import { ProductCard } from "@/components/cart/product-card";
import { CategoriesFilter } from "@/components/product/categories-filter";
import { Product } from "@/types";
import { useCart } from "@/contexts/cart-context";
import { useToast } from "@/hooks/use-toast";
import { createSlug } from "@/lib/utils";
import { Truck, MapPin, Search, Loader2, RotateCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api-client";
import { useBranch } from "@/contexts/branch-context";

interface CategoryResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  image: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    products: number;
  };
}

interface CategoriesResponse {
  success: boolean;
  code: number;
  message: string;
  data: CategoryResponse[];
}

interface Category {
  id: string;
  name: string;
  image: string;
}

// Fallback categories nếu API fail
const fallbackCategories: Category[] = [
  {
    id: "all",
    name: "Tất cả",
    image: "🍽️",
  },
  {
    id: "combo",
    name: "Combo",
    image: "🍱",
  },
  {
    id: "ga-chien",
    name: "Gà chiên",
    image: "🍗",
  },
  {
    id: "my-y",
    name: "Mỳ ý",
    image: "🍝",
  },
  {
    id: "burger",
    name: "Burger",
    image: "🍔",
  },
  {
    id: "khoai-tay",
    name: "Khoai tây",
    image: "🍟",
  },
  {
    id: "kem",
    name: "Kem",
    image: "🍦",
  },
  {
    id: "thuc-uong",
    name: "Thức uống",
    image: "🥤",
  },
];

// Map API response sang Category format
const mapToCategory = (apiCategory: CategoryResponse): Category => {
  return {
    id: apiCategory.id,
    name: apiCategory.name,
    image: apiCategory.image || "🍽️", // Fallback emoji nếu không có image
  };
};

interface ProductOptionResponse {
  id: string;
  name: string;
  description: string | null;
  price: number; // Price in cents
  type: string; // SIZE, TOPPING, SAUCE, OTHER
  isRequired: boolean;
  isAvailable: boolean;
  order: number;
}

interface ProductResponse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  price: number; // Price in cents
  image: string | null;
  quantity: number;
  isAvailable: boolean;
  categoryId: string | null;
  category: {
    id: string;
    code: string;
    name: string;
  } | null;
  branchId: string;
  branch: {
    id: string;
    code: string;
    name: string;
  };
  options?: ProductOptionResponse[]; // Options cho sản phẩm
  createdAt: string;
  updatedAt: string;
  stockStatus?: string;
  canOrder?: boolean;
}

interface ProductsResponse {
  success: boolean;
  code: number;
  message: string;
  data: ProductResponse[];
  meta: {
    currentPage: number;
    totalPages: number;
    limit: number;
    totalItems: number;
    branch: {
      id: string;
      name: string;
      code: string;
    };
  };
}

// Fallback products nếu API fail
const fallbackProducts: Product[] = [
  {
    id: "1",
    name: "Combo Gà Rán",
    slug: "combo-ga-ran",
    description: "2 miếng gà rán, 1 khoai tây chiên, 1 nước ngọt.",
    basePrice: 89000,
    priceAfterTax: 97900,
    taxPercentage: 10,
    category: "combo",
    image: `/assets/fried-chicken-combo.jpg`,
    isAvailable: true,
    isPromotion: true,
  },
  {
    id: "2",
    name: "Cánh Gà Cay",
    slug: "canh-ga-cay",
    description: "5 cánh gà chiên giòn với sốt cay đặc biệt.",
    basePrice: 79000,
    priceAfterTax: 86900,
    taxPercentage: 10,
    category: "ga-chien",
    image: `/assets/spicy-chicken-wings.png`,
    isAvailable: true,
    isPromotion: false,
  },
];

// Helper function để tạo slug từ name
const createSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

// Map API response sang Product type
const mapToProduct = (apiProduct: ProductResponse): Product => {
  const basePrice = apiProduct.price; // Giá đã là VND
  const taxPercentage = 10; // Mặc định 10%
  const priceAfterTax = Math.round(basePrice * (1 + taxPercentage / 100));

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    slug: createSlugFromName(apiProduct.name),
    description: apiProduct.description || "",
    basePrice: basePrice,
    priceAfterTax: priceAfterTax,
    taxPercentage: taxPercentage,
    category: apiProduct.category?.id || "all", // Sử dụng categoryId để filter
    image: apiProduct.image || "/placeholder.svg",
    isAvailable: apiProduct.isAvailable && apiProduct.quantity > 0,
    isPromotion: false, // Có thể thêm logic để xác định promotion
  };
};

type SortOption = "newest" | "bestselling" | "low-price";

// Normalize search text: remove accents, convert to lowercase, replace spaces with hyphens
const normalizeSearchText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD") // Decompose Vietnamese characters
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritical marks
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .trim();
};

export default function MenuPage() {
  const { selectedBranch, openBranchSelector, setSelectedBranch } = useBranch();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderType, setOrderType] = useState<"DELIVERY" | "PICKUP">("PICKUP");
  const [showAddressPrompt, setShowAddressPrompt] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { addToCart } = useCart();
  const { toast } = useToast();

  // Load order type from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrderType = localStorage.getItem("orderType") as "DELIVERY" | "PICKUP" | null;
      if (savedOrderType) {
        setOrderType(savedOrderType);
        // Show address prompt for delivery
        if (savedOrderType === "DELIVERY" && !deliveryAddress) {
          setShowAddressPrompt(true);
          // Show toast to remind user to enter address
          toast({
            title: "Vui lòng nhập địa chỉ giao hàng",
            description: "Nhập địa chỉ để chúng tôi giao hàng đến bạn",
            className: "bg-blue-50 border-blue-200",
          });
        }
        // Clear from localStorage after reading
        localStorage.removeItem("orderType");
      }
    }
  }, [toast]);

  // Auto-refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedBranch?.id) {
        console.log("Tab visible again, refreshing products...");
        setRefreshKey(prev => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [selectedBranch?.id]);

  // Auto-select first branch if none selected
  useEffect(() => {
    const autoSelectBranch = async () => {
      if (selectedBranch) return; // Đã có branch rồi thì không cần làm gì

      try {
        // Lấy danh sách branches
        const branchesResponse = await apiClient.get("/home/branches", {
          params: {
            page: 1,
            limit: 20, // Lấy nhiều branches để tìm branch có products
          },
        });

        if (branchesResponse.data?.success && branchesResponse.data.data?.length > 0) {
          const branches = branchesResponse.data.data;

          // Tìm branch có products bằng cách thử fetch products
          for (const branch of branches) {
            try {
              const productsResponse = await apiClient.get("/home/products", {
                params: {
                  branchId: branch.id,
                  page: 1,
                  limit: 1, // Chỉ cần kiểm tra có products hay không
                },
              });

              if (productsResponse.data?.success && productsResponse.data.data?.length > 0) {
                console.log("Auto-selecting branch with products:", branch.name);
                setSelectedBranch({
                  id: branch.id,
                  code: branch.code,
                  name: branch.name,
                  address: branch.address,
                  phone: branch.phone,
                  email: branch.email,
                });
                return; // Đã tìm thấy branch có products, dừng lại
              }
            } catch (err) {
              // Branch này không có products hoặc có lỗi, thử branch tiếp theo
              continue;
            }
          }

          // Nếu không tìm thấy branch nào có products, chọn branch đầu tiên
          if (branches.length > 0) {
            const firstBranch = branches[0];
            console.log("No branch with products found, selecting first branch:", firstBranch.name);
            setSelectedBranch({
              id: firstBranch.id,
              code: firstBranch.code,
              name: firstBranch.name,
              address: firstBranch.address,
              phone: firstBranch.phone,
              email: firstBranch.email,
            });
          }
        }
      } catch (err: any) {
        console.error("Error auto-selecting branch:", err);
        // Không hiển thị lỗi, để user tự chọn branch
      }
    };

    autoSelectBranch();
  }, [selectedBranch, setSelectedBranch]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await apiClient.get<CategoriesResponse>("/home/categories");

        if (response.data.success && response.data.data) {
          const mappedCategories = response.data.data.map(mapToCategory);
          // Thêm "Tất cả" ở đầu danh sách
          setCategories([
            {
              id: "all",
              name: "Tất cả",
              image: "🍽️",
            },
            ...mappedCategories,
          ]);
        } else {
          setCategories(fallbackCategories);
        }
      } catch (err: any) {
        console.error("Error fetching categories:", err);
        // Fallback to mock data
        setCategories(fallbackCategories);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      // Chỉ fetch khi đã có branchId
      if (!selectedBranch?.id) {
        console.log("No branch selected, skipping product fetch");
        setProducts([]);
        return;
      }

      console.log("Fetching products for branch:", selectedBranch.id);

      try {
        setProductsLoading(true);
        setProductsError(null);

        // Map sortOption sang API sort format
        let sortParam = "name";
        if (sortOption === "newest") {
          sortParam = "-createdAt";
        } else if (sortOption === "bestselling") {
          // API không có soldCount, tạm dùng -createdAt
          sortParam = "-createdAt";
        } else if (sortOption === "low-price") {
          sortParam = "price";
        }

        const params: any = {
          branchId: selectedBranch.id,
          page: 1,
          limit: 100, // Lấy nhiều sản phẩm để filter client-side
          sort: sortParam,
        };

        // Thêm categoryId nếu không phải "all"
        if (selectedCategory !== "all") {
          params.categoryId = selectedCategory;
        }

        // Thêm search nếu có
        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        const response = await apiClient.get<ProductsResponse>("/home/products", {
          params,
        });

        console.log("Products API response:", response.data);

        if (response.data.success && response.data.data) {
          const mappedProducts = response.data.data.map(mapToProduct);
          console.log(`Loaded ${mappedProducts.length} products`);
          setProducts(mappedProducts);
        } else {
          console.warn("API returned unsuccessful response:", response.data);
          setProductsError("Không thể tải sản phẩm");
          setProducts([]);
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
        });
        setProductsError(
          err.response?.data?.message ||
          "Đã xảy ra lỗi khi tải sản phẩm. Vui lòng thử lại sau."
        );
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedBranch?.id, selectedCategory, sortOption, refreshKey]);

  const handleConfirmAddress = () => {
    if (deliveryAddress.trim()) {
      toast({
        title: "Đã xác nhận địa chỉ",
        description: `Địa chỉ giao hàng: ${deliveryAddress}`,
        className: "bg-green-50 border-green-200",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      quantity: 1,
      image: product.image || "/placeholder.svg",
    });

    toast({
      title: "Đã thêm vào giỏ hàng",
      description: `${product.name} đã được thêm vào giỏ hàng của bạn`,
      className: "bg-green-50 border-green-200",
    });
  };

  // Products đã được filter từ API, filter thêm search client-side
  const filteredProducts = products.filter((product) => {
    if (!searchQuery.trim()) return true;

    // Tạo slug từ input tìm kiếm (chữ thường, không dấu, có gạch nối)
    const searchSlug = createSlugFromName(searchQuery.trim());

    // So sánh với slug của sản phẩm, kiểm tra slug tồn tại
    return typeof product.slug === "string" && product.slug.includes(searchSlug);
  });

  return (
    <PublicLayout>
      <div className="min-h-screen bg-orange-50">
        {/* Delivery Address Input - Sticky - Only show for DELIVERY */}
        {orderType === "DELIVERY" && (
          <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex justify-center">
                <div className="bg-white rounded-xl shadow-md p-4 w-full max-w-4xl">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-orange-500">
                      <Truck className="h-5 w-5" />
                      <span className="font-semibold">Giao đến:</span>
                    </div>
                    <div className="flex-1 relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Nhập địa chỉ giao hàng của bạn..."
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleConfirmAddress();
                          }
                        }}
                        className="pl-10 pr-4 py-2 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 w-full"
                      />
                    </div>
                    <Button
                      onClick={handleConfirmAddress}
                      className="bg-orange-500 text-white hover:bg-orange-600 rounded-lg px-6 py-2 font-semibold uppercase whitespace-nowrap"
                    >
                      Xác nhận
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Categories - Sticky */}
          <div className={`sticky ${orderType === "DELIVERY" ? "top-28" : "top-16"} z-30 bg-orange-50 pb-4 mb-6 flex justify-center`}>
            <CategoriesFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Search and Sort Section */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Search Bar */}
              <div className="flex-1 w-full sm:w-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Tìm kiếm món ăn yêu thích..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-2.5 rounded-full border-gray-200 bg-white focus:border-orange-500 focus:ring-orange-500 w-full"
                />
              </div>

              {/* Sort Buttons */}
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setSortOption("newest")}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${sortOption === "newest"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                  Mới nhất
                </button>
                <button
                  onClick={() => setSortOption("bestselling")}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${sortOption === "bestselling"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                  Bán chạy
                </button>
                <button
                  onClick={() => setSortOption("low-price")}
                  className={`px-5 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${sortOption === "low-price"
                    ? "bg-orange-500 text-white shadow-md"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                    }`}
                >
                  Giá mềm
                </button>

                {/* Refresh Button */}
                {selectedBranch && (
                  <button
                    onClick={() => setRefreshKey(prev => prev + 1)}
                    disabled={productsLoading}
                    className="p-2.5 rounded-full bg-white text-gray-600 hover:bg-gray-50 border border-gray-200 transition-all duration-200 disabled:opacity-50"
                    title="Làm mới danh sách"
                  >
                    <RotateCw className={`h-5 w-5 ${productsLoading ? 'animate-spin' : ''}`} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Branch Selection Required */}
          {!selectedBranch && (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm mb-8">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-orange-500" />
                </div>
                <div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">
                    Vui lòng chọn cửa hàng
                  </p>
                  <p className="text-gray-500 text-sm mb-4">
                    Bạn cần chọn cửa hàng để xem thực đơn
                  </p>
                  <Button
                    onClick={openBranchSelector}
                    className="bg-orange-500 text-white hover:bg-orange-600"
                  >
                    Chọn cửa hàng
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {productsLoading && selectedBranch && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          )}

          {/* Error State */}
          {productsError && selectedBranch && !productsLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{productsError}</p>
            </div>
          )}

          {/* Product Count */}
          {!productsLoading && selectedBranch && filteredProducts.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-600 text-sm">
                Tìm thấy <span className="font-semibold text-orange-500">{filteredProducts.length}</span> sản phẩm
                {selectedCategory !== "all" && (
                  <span className="ml-2">
                    trong danh mục <span className="font-semibold">{categories.find(c => c.id === selectedCategory)?.name}</span>
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Products Grid */}
          {!productsLoading && selectedBranch && filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          ) : !productsLoading && selectedBranch && filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-gray-700 text-lg font-semibold mb-2">
                    Không tìm thấy sản phẩm nào
                  </p>
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? (
                      <>Thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc</>
                    ) : (
                      <>Hãy thử chọn danh mục khác</>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </PublicLayout>
  );
}
