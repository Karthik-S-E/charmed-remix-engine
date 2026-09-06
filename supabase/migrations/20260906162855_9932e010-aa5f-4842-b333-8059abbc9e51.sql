alter table public.products add column if not exists sale_price numeric default null;
alter table public.products add column if not exists badge text check (badge in ('sale','sold-out','new')) default null;

insert into public.products (
  slug, name, design_number, colors, color_images, style, occasion, price, sale_price, gender, age_range, sizes, in_stock, stock_quantity, description, main_image, meesho_url, flipkart_url, badge
) values
(
  'ethnic-kurta-set-boy', 'Ethnic Kurta Set', 'KK001',
  array['Mustard','Navy'], jsonb_build_object('Mustard','https://placehold.co/600x600/e8a838/ffffff?text=Mustard+Kurta','Navy','https://placehold.co/600x600/1a2b4a/ffffff?text=Navy+Kurta'),
  'Kurta Pyjama', 'Festive', 1299, null, 'boy', '2-8 Years', array['2-3Y','4-5Y','6-8Y'], true, 24,
  'Cotton kurta pyjama set with subtle embroidery and a comfortable elasticated waist.',
  'https://placehold.co/600x600/e8a838/ffffff?text=Ethnic+Kurta+Set', 'https://meesho.com', 'https://flipkart.com', null
),
(
  'floral-lehenga-girl', 'Floral Lehenga Choli', 'KK002',
  array['Pink','Peach'], jsonb_build_object('Pink','https://placehold.co/600x600/d66c8c/ffffff?text=Pink+Lehenga','Peach','https://placehold.co/600x600/f5c0a3/ffffff?text=Peach+Lehenga'),
  'Lehenga Choli', 'Wedding', 1899, 1599, 'girl', '3-10 Years', array['3-4Y','5-6Y','7-8Y','9-10Y'], true, 18,
  'Lightweight floral lehenga with a matching dupatta and sequin details.',
  'https://placehold.co/600x600/d66c8c/ffffff?text=Floral+Lehenga', 'https://meesho.com', 'https://flipkart.com', 'sale'
),
(
  'bandhgala-jacket-boy', 'Bandhgala Jacket Set', 'KK003',
  array['Royal Blue'], jsonb_build_object('Royal Blue','https://placehold.co/600x600/2244aa/ffffff?text=Bandhgala'),
  'Jacket Set', 'Party', 2499, null, 'boy', '4-12 Years', array['4-5Y','6-7Y','8-9Y','10-12Y'], false, 0,
  'Velvet bandhgala jacket with white cotton shirt and tailored trousers.',
  'https://placehold.co/600x600/2244aa/ffffff?text=Bandhgala+Jacket', 'https://meesho.com', 'https://flipkart.com', 'sold-out'
),
(
  'cotton-frock-girl', 'Printed Cotton Frock', 'KK004',
  array['Mint Green','Yellow'], jsonb_build_object('Mint Green','https://placehold.co/600x600/88c9a1/ffffff?text=Mint+Frock','Yellow','https://placehold.co/600x600/f4d03f/ffffff?text=Yellow+Frock'),
  'Frock', 'Casual', 799, null, 'girl', '1-6 Years', array['1-2Y','3-4Y','5-6Y'], true, 32,
  'Soft cotton frock with hand-block prints and a comfy back button placket.',
  'https://placehold.co/600x600/88c9a1/ffffff?text=Printed+Cotton+Frock', 'https://meesho.com', 'https://flipkart.com', 'new'
)
on conflict (slug) do nothing;
