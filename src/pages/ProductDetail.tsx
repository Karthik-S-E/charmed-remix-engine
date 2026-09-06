import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ShoppingBag, MessageCircle, ExternalLink } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import QuantitySelector from "@/components/QuantitySelector";
import { getProductBySlug, getRelatedProducts } from "@/lib/products";
import { whatsappOrderUrl } from "@/lib/whatsapp";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addItem } = useCart();
  const { toast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    Promise.all([getProductBySlug(slug), getRelatedProducts(slug)])
      .then(([p, r]) => {
        setProduct(p);
        setRelated(r);
        setSelectedColor(p?.colors?.[0] ?? null);
        setSelectedSize(p?.sizes?.[0] ?? null);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const currentImage = useMemo(() => {
    if (!product) return "";
    if (selectedColor && product.color_images?.[selectedColor]) {
      return product.color_images[selectedColor];
    }
    return product.main_image || "";
  }, [product, selectedColor]);

  const isSoldOut = product?.badge === "sold-out" || !product?.in_stock || product?.stock_quantity === 0;

  const handleAddToBag = () => {
    if (!product || isSoldOut) return;
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast({ title: "Select a size", variant: "destructive" });
      return;
    }
    const parts = [product.name];
    if (selectedSize) parts.push(`Size: ${selectedSize}`);
    if (selectedColor) parts.push(`Color: ${selectedColor}`);
    const itemName = parts.join(" · ");
    addItem(
      {
        slug: `${product.slug}-${selectedSize || "default"}-${selectedColor || "default"}`,
        name: itemName,
        price: product.price,
        image: currentImage || product.main_image || "",
      },
      quantity
    );
    toast({ title: "Added to bag", description: itemName });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24 text-center">
        <h1 className="text-2xl font-light text-foreground mb-4">Product not found</h1>
        <Link to="/shop" className="text-sm underline text-muted-foreground hover:text-foreground">Browse all products</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
        <div className="bg-muted aspect-[3/4]">
          {currentImage ? (
            <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
          )}
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-light text-foreground mb-2">{product.name}</h1>
          {product.design_number && (
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Design: {product.design_number}</p>
          )}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-2xl font-light text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
            {product.originalPrice && (
              <span className="text-lg text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            {isSoldOut ? "Sold out" : product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left in stock` : "In stock"} · {product.gender} · {product.age_range}
          </p>
          <p className="text-base text-foreground/90 leading-relaxed mb-8">{product.description}</p>

          {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Color {selectedColor ? `· ${selectedColor}` : ""}</label>
              <div className="flex flex-wrap gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      "px-4 py-2 text-sm border transition-colors",
                      selectedColor === color ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"
                    )}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className="mb-6">
              <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-2">Size</label>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "px-4 py-2 text-sm border transition-colors",
                      selectedSize === size ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:border-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-8">
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
            <button
              onClick={handleAddToBag}
              disabled={isSoldOut}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <ShoppingBag className="w-4 h-4" />
              {isSoldOut ? "Sold Out" : "Add to Bag"}
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={whatsappOrderUrl(product.name, selectedSize || "Not selected", `${window.location.origin}/product/${product.slug}`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle className="w-4 h-4" /> Order on WhatsApp
            </a>
            {product.meesho_url && (
              <a
                href={product.meesho_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Meesho <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {product.flipkart_url && (
              <a
                href={product.flipkart_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Flipkart <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="text-2xl font-light text-foreground mb-8">You may also like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {related.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="group block">
                <div className="bg-muted aspect-[3/4] overflow-hidden mb-4">
                  {p.main_image ? (
                    <img src={p.main_image} alt={p.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
                  )}
                </div>
                <h3 className="text-base font-light text-foreground mb-1">{p.name}</h3>
                <p className="text-sm text-muted-foreground">₹{p.price.toLocaleString("en-IN")}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
