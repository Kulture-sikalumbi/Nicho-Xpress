-- More source examples for the shop-first home page. These are references,
-- not confirmed stock or landed-price offers; all prices stay unset until quoted.
-- Refresh only the original placeholder copy; preserve any staff edits.
update public.catalog_products
set description = case slug
  when 'apple-airpods-pro-3' then 'Apple wireless earbuds with noise cancellation. Confirm the exact version and full delivered price with us.'
  when 'nintendo-switch-2' then 'Nintendo Switch 2 gaming console. Ask us to confirm the package and full delivered price.'
  when 'nike-air-force-1-07-white-black' then 'Classic white and black Nike sneakers. Tell us your shoe size and we will confirm the listing and full quote.'
  when 'soundcore-q20i-headphones' then 'Wireless over-ear headphones with noise cancelling. Tell us your preferred colour and we will confirm the full quote.'
end
where slug in (
  'apple-airpods-pro-3',
  'nintendo-switch-2',
  'nike-air-force-1-07-white-black',
  'soundcore-q20i-headphones'
)
  and description like 'Example retailer listing%';

insert into public.catalog_products (
  slug, name, description, category, search_terms, image_url,
  availability, price_zmw, is_published, sort_order, source_name, product_url
)
values
  (
    'samsung-galaxy-tab-s10-fe-blue',
    'Samsung Galaxy Tab S10 FE - Blue',
    'A blue Samsung tablet with S Pen. Confirm the exact model, storage and full delivered price with us.',
    'Phones & tech',
    array['Samsung', 'Galaxy', 'Tab S10 FE', 'tablet', 'S Pen', 'Android', 'blue'],
    'https://images.samsung.com/kdp/goods/2025/07/03/4b69e758-c578-46b7-a3f6-70a38dfe0051.jpg',
    'source_to_order', null, true, 50, 'Samsung',
    'https://www.samsung.com/us/tablets/galaxy-tab-s/galaxy-tab-s10-fe-blue-128gb-sm-x520nlbaxar/'
  ),
  (
    'shein-black-tailored-blazer',
    'SHEIN BAE Padded-Shoulder Blazer - Black',
    'A tailored black blazer from SHEIN. Tell us your size and we will confirm the current listing and full quote.',
    'Fashion & footwear',
    array['SHEIN', 'Shein', 'blazer', 'jacket', 'women', 'clothing', 'fashion', 'black'],
    'https://img.ltwebstatic.com/images3_pi/2021/09/27/1632704898feb9d5b4bc01e171adf0f315c1351999_thumbnail_600x.jpg',
    'source_to_order', null, true, 60, 'SHEIN',
    'https://br.shein.com/Padded-Shoulder-Flap-Detail-Solid-Blazer-p-4388651-cat-1739.html'
  ),
  (
    'ecoflow-delta-3-plus-portable-power-station',
    'EcoFlow DELTA 3 Plus Power Station',
    'A portable backup power station with solar charging options. Ask us to check the package and delivered price.',
    'Power & solar',
    array['EcoFlow', 'DELTA 3 Plus', 'power station', 'solar', 'backup power', 'portable generator'],
    'https://us.ecoflow.com/cdn/shop/files/ecoflow-us-ecoflow-delta-3-plus-portable-power-station-standalone-delta-3-plus-1179495741.png?v=1755573843&width=1240',
    'source_to_order', null, true, 70, 'EcoFlow',
    'https://us.ecoflow.com/products/delta-3-plus-portable-power-station?variant=55720539258953'
  ),
  (
    'ikea-roedflik-gray-green-desk-lamp',
    'IKEA RÖDFLIK Desk Lamp - Gray-green',
    'An adjustable gray-green desk lamp with brass-coloured details. We will check the current product and quote before you decide.',
    'Home & living',
    array['IKEA', 'RODFLIK', 'RÖDFLIK', 'desk lamp', 'home', 'lighting', 'gray green'],
    'https://www.ikea.com.tw/dairyfarm/tw/images/270/1327045_PE944344_S5.jpg',
    'source_to_order', null, true, 80, 'IKEA',
    'https://www.ikea.com/us/en/p/roedflik-desk-lamp-gray-green-70582716/'
  )
on conflict (slug) do nothing;
