import { useEffect, useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/products";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { Product } from "@/types";

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [gender, setGender] = useState<"all" | "boy" | "girl" | "unisex">("all");
  const [ageRange, setAgeRange] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    getProducts()
      .then(setProducts)
      .catch((err) => toast({ title: "Could not load products", description: err.message, variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const ageRanges = useMemo(
    () => Array.from(new Set(products.map((p) => p.age_range).filter(Boolean))).sort(),
    [products]
  );

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.design_number?.toLowerCase().includes(search.toLowerCase()) ||
        p.style?.toLowerCase().includes(search.toLowerCase()) ||
        p.occasion?.toLowerCase().includes(search.toLowerCase());
      const matchesGender = gender === "all" || p.gender === gender;
      const matchesAge = ageRange === "all" || p.age_range === ageRange;
      return matchesSearch && matchesGender && matchesAge;
    });
  }, [products, search, gender, ageRange]);

  return (
    <div className="min-h-screen bg-warm-bg">
      <div className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-light text-foreground">Shop</h1>
        <p className="text-sm text-muted-foreground mt-2">Find the perfect ethnic outfit for your little one.</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row gap-4 md:items-end md:justify-between mb-10">
          <div className="flex-1">
            <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Search</label>
            <Input
              placeholder="Search by name, design, style, occasion..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-md bg-background"
            />
          </div>
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as typeof gender)}
                className="px-4 py-2 border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All</option>
                <option value="boy">Boy</option>
                <option value="girl">Girl</option>
                <option value="unisex">Unisex</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Age Range</label>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="px-4 py-2 border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="all">All ages</option>
                {ageRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            No products match your filters.
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">{filtered.length} product{filtered.length !== 1 && "s"}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
