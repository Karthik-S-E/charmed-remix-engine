export function whatsappShareUrl(productName: string, url: string) {
  const text = `Hi! I'm interested in "${productName}". Can you help me with this? ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function whatsappOrderUrl(productName: string, size: string, url: string) {
  const text = `Hi! I'd like to order "${productName}" (Size: ${size}). More details: ${url}`;
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
