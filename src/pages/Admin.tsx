import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import type { Product, ProductGender, BrandSettings } from "@/types";

const emptyProduct: Partial<Product> = {
  name: "",
  slug: "",
  design_number: "",
  colors: [],
  color_images: {},
  style: "",
  occasion: "",
  price: 0,
  salePrice: null,
  gender: "unisex",
  age_range: "",
  sizes: [],
  in_stock: true,
  stock_quantity: 0,
  description: "",
  main_image: "",
  meesho_url: "",
  flipkart_url: "",
  badge: null,
};

export default function Admin() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [brand, setBrand] = useState<Partial<BrandSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [{ data: productsData }, { data: brandData }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("brand_settings").select("*").order("updated_at", { ascending: false }).limit(1).single(),
    ]);
    setProducts((productsData ?? []) as unknown as Product[]);
    setBrand((brandData ?? {}) as unknown as BrandSettings);
    setLoading(false);
  };

  const handleBrandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("brand_settings").upsert({
      ...brand,
      id: brand.id || undefined,
      updated_at: new Date().toISOString(),
    });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Brand settings saved" });
    loadData();
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const p = editing;
    if (!p.name || !p.gender || !p.age_range || !p.price) {
      toast({ title: "Missing fields", description: "Name, gender, age range and price are required.", variant: "destructive" });
      return;
    }
    const slugSource = (p.slug && p.slug.trim()) || p.name;
    const row = {
      id: p.id,
      name: p.name,
      slug: slugSource.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),

      design_number: p.design_number || null,
      colors: p.colors && p.colors.length ? p.colors : null,
      color_images: p.color_images && Object.keys(p.color_images).length ? p.color_images : null,
      style: p.style || null,
      occasion: p.occasion || null,
      price: Number(p.price),
      sale_price: p.salePrice ? Number(p.salePrice) : null,
      gender: p.gender,
      age_range: p.age_range,
      sizes: p.sizes && p.sizes.length ? p.sizes : null,
      in_stock: p.in_stock ?? true,
      stock_quantity: Number(p.stock_quantity ?? 0),
      description: p.description || null,
      main_image: p.main_image || null,
      meesho_url: p.meesho_url || null,
      flipkart_url: p.flipkart_url || null,
      badge: p.badge || null,
    };
    setSaving(true);
    const { error } = await supabase.from("products").upsert(row);
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: p.id ? "Product updated" : "Product created" });
    setEditing(null);
    loadData();
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Product deleted" });
    loadData();
  };

  const updateField = (key: keyof Product, value: unknown) => {
    setEditing((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const arrayField = (value: string) =>
    value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <h1 className="text-3xl md:text-4xl font-light text-foreground mb-8">Admin</h1>
      <Tabs defaultValue="products">
        <TabsList className="mb-8">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="brand">Brand Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          {editing ? (
            <form onSubmit={saveProduct} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" value={editing.name || ""} onChange={(e) => updateField("name", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (optional)</Label>
                  <Input id="slug" placeholder="auto-generated from name" value={editing.slug || ""} onChange={(e) => updateField("slug", e.target.value)} />

                </div>
                <div className="space-y-2">
                  <Label htmlFor="design_number">Design Number</Label>
                  <Input id="design_number" value={editing.design_number || ""} onChange={(e) => updateField("design_number", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender *</Label>
                  <select
                    id="gender"
                    value={editing.gender || "unisex"}
                    onChange={(e) => updateField("gender", e.target.value as ProductGender)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm"
                  >
                    <option value="boy">Boy</option>
                    <option value="girl">Girl</option>
                    <option value="unisex">Unisex</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_range">Age Range *</Label>
                  <Input id="age_range" value={editing.age_range || ""} onChange={(e) => updateField("age_range", e.target.value)} placeholder="e.g. 2-8 Years" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Input id="style" value={editing.style || ""} onChange={(e) => updateField("style", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occasion">Occasion</Label>
                  <Input id="occasion" value={editing.occasion || ""} onChange={(e) => updateField("occasion", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹) *</Label>
                  <Input id="price" type="number" min={0} value={editing.price ?? ""} onChange={(e) => updateField("price", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Sale Price (₹)</Label>
                  <Input id="sale_price" type="number" min={0} value={editing.salePrice ?? ""} onChange={(e) => updateField("salePrice", e.target.value ? Number(e.target.value) : null)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_quantity">Stock Quantity</Label>
                  <Input id="stock_quantity" type="number" min={0} value={editing.stock_quantity ?? 0} onChange={(e) => updateField("stock_quantity", Number(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge">Badge</Label>
                  <select
                    id="badge"
                    value={editing.badge || ""}
                    onChange={(e) => updateField("badge", e.target.value || null)}
                    className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm"
                  >
                    <option value="">None</option>
                    <option value="sale">Sale</option>
                    <option value="sold-out">Sold Out</option>
                    <option value="new">New</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="colors">Colors (comma separated)</Label>
                  <Input id="colors" value={editing.colors?.join(", ") || ""} onChange={(e) => updateField("colors", arrayField(e.target.value))} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sizes">Sizes (comma separated)</Label>
                  <Input id="sizes" value={editing.sizes?.join(", ") || ""} onChange={(e) => updateField("sizes", arrayField(e.target.value))} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="main_image">Main Image URL</Label>
                  <Input id="main_image" value={editing.main_image || ""} onChange={(e) => updateField("main_image", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="color_images">Color Images JSON</Label>
                  <Textarea
                    id="color_images"
                    value={editing.color_images ? JSON.stringify(editing.color_images, null, 2) : ""}
                    onChange={(e) => {
                      try {
                        const parsed = e.target.value ? JSON.parse(e.target.value) : {};
                        updateField("color_images", parsed);
                      } catch {
                        updateField("color_images", e.target.value ? editing.color_images : {});
                      }
                    }}
                    placeholder='{"Red": "https://...", "Blue": "https://..."}'
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={editing.description || ""} onChange={(e) => updateField("description", e.target.value)} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meesho_url">Meesho URL</Label>
                  <Input id="meesho_url" value={editing.meesho_url || ""} onChange={(e) => updateField("meesho_url", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flipkart_url">Flipkart URL</Label>
                  <Input id="flipkart_url" value={editing.flipkart_url || ""} onChange={(e) => updateField("flipkart_url", e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="in_stock"
                  checked={!!editing.in_stock}
                  onCheckedChange={(checked) => updateField("in_stock", checked === true)}
                />
                <Label htmlFor="in_stock" className="font-normal">In stock</Label>
              </div>
              <div className="flex gap-4">
                <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Product"}</Button>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setEditing({ ...emptyProduct })}>
                  <Plus className="w-4 h-4 mr-2" /> New Product
                </Button>
              </div>
              <div className="border border-border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Name</th>
                      <th className="text-left px-4 py-3 font-medium">Price</th>
                      <th className="text-left px-4 py-3 font-medium">Stock</th>
                      <th className="text-left px-4 py-3 font-medium">Badge</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-4 py-3">{p.name}</td>
                        <td className="px-4 py-3">₹{p.price}</td>
                        <td className="px-4 py-3">{p.in_stock ? p.stock_quantity : 0}</td>
                        <td className="px-4 py-3">{p.badge || "—"}</td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setEditing(p)} className="p-2 text-muted-foreground hover:text-foreground" aria-label="Edit">
                            <Pencil className="w-4 h-4 inline" />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="p-2 text-muted-foreground hover:text-destructive" aria-label="Delete">
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No products yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="brand">
          <form onSubmit={handleBrandSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name</Label>
              <Input id="store_name" value={brand.store_name || ""} onChange={(e) => setBrand((b) => ({ ...b, store_name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" value={brand.tagline || ""} onChange={(e) => setBrand((b) => ({ ...b, tagline: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input id="logo_url" value={brand.logo_url || ""} onChange={(e) => setBrand((b) => ({ ...b, logo_url: e.target.value }))} />
            </div>
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Brand Settings"}</Button>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
