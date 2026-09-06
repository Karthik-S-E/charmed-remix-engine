import { Link } from "react-router-dom";
import { ShoppingBag, MessageCircle, Eye } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/types";
import { whatsappShareUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const [selectedSize, setSelectedSize] = useState<string | null>(product.sizes?.[0] ?? null);
  const productUrl = `${window.location.origin}/product/${product.slug}`;
  const isSoldOut = product.badge === "sold-out" || !product.in_stock || product.stock_quantity === 0;

  const handleAddToBag = () => {
    if (isSoldOut) return;
    if (!selectedSize && product.sizes && product.sizes.length > 0) {
      toast({ title: "Select a size", description: "Please choose a size before adding to bag.", variant: "destructive" });
      return;
    }
    const name = selectedSize ? `${product.name} (${selectedSize})` : product.name;
    addItem({
      slug: `${product.slug}-${selectedSize || "default"}`,
      name,
      price: product.price,
      image: product.main_image || "",
    });
    toast({ title: "Added to bag", description: name });
  };

  return (
    <div className="group flex flex-col">
      <Link to={`/product/${product.slug}`} className="relative overflow-hidden bg-muted aspect-[3/4] block mb-4">
        {product.main_image ? (
          <img
            src={product.main_image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
        {product.badge && (
          <span className={cn(
            "absolute top-3 left-3 px-2 py-1 text-[10px] uppercase tracking-wider font-medium text-white",
            product.badge === "sale" && "bg-red-500",
            product.badge === "sold-out" && "bg-foreground",
            product.badge === "new" && "bg-emerald-600"
          )}>
            {product.badge}
          </span>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </Link>

      <div className="flex flex-col flex-1">
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-base font-light text-foreground leading-tight hover:underline">{product.name}</h3>
        </Link>
        <p className="text-xs text-muted-foreground mt-1">{product.style}{product.style && product.occasion ? " · " : ""}{product.occasion}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-sm font-medium text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</span>
          )}
        </div>
        <p className="text-xs mt-1 text-muted-foreground">
          {isSoldOut ? "Sold out" : product.stock_quantity <= 5 ? `Only ${product.stock_quantity} left` : "In stock"}
        </p>

        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "px-2 py-1 text-[10px] border transition-colors",
                  selectedSize === size
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:border-foreground"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleAddToBag}
            disabled={isSoldOut}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            <ShoppingBag className="w-3 h-3" />
            {isSoldOut ? "Sold Out" : "Add to Bag"}
          </button>
          <Link
            to={`/product/${product.slug}`}
            className="p-2 border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View product"
          >
            <Eye className="w-3 h-3" />
          </Link>
          <a
            href={whatsappShareUrl(product.name, productUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-border text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Share on WhatsApp"
          >
            <MessageCircle className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
