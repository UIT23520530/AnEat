"use client";

interface Category {
  id: string;
  name: string;
  image: string;
}

interface CategoriesFilterProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoriesFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoriesFilterProps) {
  return (
    <div className="flex justify-center mb-8">
      <div className="flex gap-2 items-center overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`px-6 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all duration-200 ${
              selectedCategory === category.id
                ? "bg-orange-500 text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}
