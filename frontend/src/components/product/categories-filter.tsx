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
      <div className="bg-[rgb(251,234,133)] rounded-2xl px-2 py-2 shadow-lg">
        <div className="flex gap-3 items-center overflow-x-auto">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`flex flex-col items-center justify-center min-w-[90px] px-4 py-2 rounded-2xl transition-all ${
                selectedCategory === category.id
                  ? "bg-white"
                  : "bg-transparent hover:bg-white/40"
              }`}
            >
              <span className="text-3xl mb-1">{category.image}</span>
              <span className="text-sm font-bold whitespace-nowrap text-gray-800">
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
