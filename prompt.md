 (
  slug, name, description, category, search_terms, image_url,
  availability, price_zmw, is_published, sort_order, source_name, product_url
)
values
  -- STREAMING_CHUNK:Inserting colorful lifestyle & audio items...
  (
    'fujifilm-instax-mini-12-pastel-blue',
    'Fujifilm Instax Mini 12 Instant Camera (Pastel Blue)',
    'Vibrant pastel instant camera with automatic exposure and close-up mode. Ready for pickup in Lusaka & Ndola.',
    'Electronics',
    array['Fujifilm', 'Instax', 'Mini 12', 'instant camera', 'pastel blue', 'camera', 'photography'],
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
    'in_stock_local', 1650.00, true, 40, 'Fujifilm', 'https://instax.com/'
  ),
  (
    'jbl-clip-4-pink-waterproof-speaker',
    'JBL Clip 4 Ultra-Portable Bluetooth Speaker (Pink)',
    'Bold pink ultra-portable waterproof speaker with integrated carabiner. Perfect for outdoor adventures across Zambia.',
    'Electronics',
    array['JBL', 'Clip 4', 'pink', 'Bluetooth speaker', 'waterproof', 'portable sound'],
    'https://images.unsplash.com/photo-1564424224827-d24b6d445229?auto=format&fit=crop&w=600&q=80',
    'in_stock_local', 1250.00, true, 50, 'JBL', 'https://www.jbl.com/'
  ),
  (
    'philips-hue-rgb-light-strip-plus',
    'Philips Hue Smart RGB LED Light Strip Plus (2m)',
    'Transform your room with 16 million colors and sync with music. Ideal vibrant accent lighting during load shedding.',
    'Solar',
    array['Philips Hue', 'RGB', 'LED strip', 'smart lights', 'colors', 'home automation'],
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
    'in_stock_local', 1350.00, true, 60, 'Philips', 'https://www.philips-hue.com/'
  ),

  -- STREAMING_CHUNK:Inserting overseas colorful collectibles and gear...
  (
    'harman-kardon-aura-studio-4-speaker',
    'Harman Kardon Aura Studio 4 Transparent Bluetooth Speaker',
    'Stunning transparent dome speaker with diamond ambient lighting and 360-degree sound. Available via direct import.',
    'Electronics',
    array['Harman Kardon', 'Aura Studio 4', 'transparent speaker', 'bluetooth', 'ambient lighting'],
    'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80',
    'source_to_order', null, true, 110, 'Harman Kardon', 'https://www.harmankardon.com/'
  ),
  (
    'nike-air-force-1-triple-white',
    'Nike Air Force 1 07 Triple White Sneakers',
    'Iconic clean white sneakers. Provide your shoe size for a custom delivered price quote anywhere in Zambia.',
    'Fashion',
    array['Nike', 'Air Force 1', 'sneakers', 'white shoes', 'streetwear', 'fashion'],
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    'source_to_order', null, true, 120, 'Nike', 'https://www.nike.com/'
