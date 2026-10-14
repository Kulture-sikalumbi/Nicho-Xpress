-- Colorful catalog examples across photography, audio, lighting, footwear,
-- accessories, and home decor. These are sourcing references, not confirmed
-- local stock or landed-price offers; quote availability and pricing first.
insert into public.catalog_products (
  slug, name, description, category, search_terms, image_url,
  availability, price_zmw, is_published, sort_order, source_name, product_url
)
values
  (
    'fujifilm-instax-mini-12-pastel-blue',
    'Fujifilm Instax Mini 12 Instant Camera - Pastel Blue',
    'Pastel blue instant camera with automatic exposure and close-up mode. Other Mini 12 colors may be available; tell us your preference and we will confirm the full delivered price.',
    'Electronics',
    array['Fujifilm', 'Instax', 'Mini 12', 'instant camera', 'pastel blue', 'blossom pink', 'mint green', 'lilac purple', 'photography'],
    'https://www.instax.com/mini_12/assets/images/pic_mini12_blue_01.png',
    'source_to_order', null, true, 1, 'Fujifilm Instax', 'https://www.instax.com/mini_12/en/'
  ),
  (
    'jbl-clip-4-pink-waterproof-speaker',
    'JBL Clip 4 Portable Bluetooth Speaker - Pink',
    'Compact pink Bluetooth speaker with an integrated clip and IP67 water and dust protection. Ask us to check the color and full delivered price.',
    'Electronics',
    array['JBL', 'Clip 4', 'pink', 'portable speaker', 'Bluetooth speaker', 'waterproof', 'IP67', 'music'],
    'https://www.jbl.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw473aaf83/JBL_CLIP4_HERO_STANDARD_PINK_0738_x2.png?sh=535&sw=535',
    'source_to_order', null, true, 2, 'JBL', 'https://www.jbl.com/JBLCLIP4PINKAM.html'
  ),
  (
    'philips-hue-lightstrip-plus-2m-color',
    'Philips Hue Lightstrip Plus 2m - White and Color Ambiance',
    'Flexible 2m smart lightstrip with color-changing light. We will confirm the current kit, compatibility and full delivered price before you decide.',
    'Home & living',
    array['Philips Hue', 'Lightstrip Plus', '2m', 'LED strip', 'RGB', 'color changing', 'smart lighting', 'home decor'],
    'https://www.assets.signify.com/is/image/Signify/18032702hq_pim?hei=960&qlt=82&wid=1280',
    'source_to_order', null, true, 3, 'Philips Hue', 'https://www.philips-hue.com/en-au/p/hue-white-and-color-ambiance-lightstrip-plus-2m-base-kit-with-power-supply/8718699703585'
  ),
  (
    'harman-kardon-aura-studio-4-transparent-speaker',
    'Harman Kardon Aura Studio 4 Bluetooth Speaker',
    'Transparent dome speaker with Bluetooth audio and animated ambient lighting. Ask us to check the current listing and full delivered price.',
    'Electronics',
    array['Harman Kardon', 'Aura Studio 4', 'transparent speaker', 'Bluetooth', 'ambient lighting', 'home audio'],
    'https://www.harmankardon.com/dw/image/v2/BFND_PRD/on/demandware.static/-/Sites-masterCatalog_Harman/default/dw69e29a75/HK_AURA_STUDIO_4_BLACK_HERO_CLOUD_41834_x7.png?sh=535&sw=535',
    'source_to_order', null, true, 4, 'Harman Kardon', 'https://www.harmankardon.com/AURASTUDIO4.html'
  ),
  (
    'nike-air-force-1-retro-coastal-blue',
    'Nike Air Force 1 Retro - Coastal Blue',
    'Nike Air Force 1 Retro in a coastal blue and natural colorway. Share your shoe size and we will check supplier availability and the full delivered price.',
    'Fashion & footwear',
    array['Nike', 'Air Force 1', 'AF1', 'Retro', 'Coastal Blue', 'blue sneakers', 'shoes', 'trainers'],
    'https://static.nike.com/a/images/t_web_pdp_936_v2/f_auto%2Cu_9ddf04c7-2a9a-4d76-add1-d15af8f0263d%2Cc_scale%2Cfl_relative%2Cw_1.0%2Ch_1.0%2Cfl_layer_apply/9f1c30d7-3c6f-418a-880b-2b38d035efba/AIR%2BFORCE%2B1%2BRETRO.png',
    'source_to_order', null, true, 5, 'Nike', 'https://www.nike.com/t/air-force-1-retro-mens-shoes-HHFDABtS/IM5757-400'
  ),
  (
    'crocs-classic-clog-pink-milk',
    'Crocs Classic Clog - Pink Milk',
    'Lightweight pink clogs with a pivoting heel strap and room for Jibbitz charms. Tell us your size and we will confirm the current color and full quote.',
    'Fashion & footwear',
    array['Crocs', 'Classic Clog', 'Pink Milk', 'pink clogs', 'Jibbitz', 'water-friendly shoes', 'sandals'],
    'https://media.crocs.com/image/upload/q_auto/f_auto/c_fill%2Cw_800/v1/products/10001_6ZW_ALT100',
    'source_to_order', null, true, 6, 'Crocs', 'https://www.crocs.com/p/classic-clog/10001.html?cgid=footwear&cid=6ZW'
  ),
  (
    'logitech-pebble-mouse-2-tonal-rose',
    'Logitech Pebble Mouse 2 M350s - Tonal Rose',
    'Slim, portable Bluetooth mouse in tonal rose. We will confirm the current model and full delivered price before you decide.',
    'Electronics',
    array['Logitech', 'Pebble Mouse 2', 'M350s', 'Tonal Rose', 'pink mouse', 'Bluetooth mouse', 'wireless mouse'],
    'https://resource.logitech.com/w_544%2Ch_466%2Car_7%3A6%2Cc_pad%2Cq_auto%2Cf_auto%2Cdpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/pebble-mouse-2-m350s/2026-refresh/gallery/pebble-mouse-2-m350s-tonal-rose-top-angle-gallery-1.png',
    'source_to_order', null, true, 7, 'Logitech', 'https://www.logitech.com/en-us/shop/p/pebble-2-m350s-wireless-mouse.910-007023'
  ),
  (
    'lego-botanicals-pretty-pink-flower-bouquet-10342',
    'LEGO Botanicals Pretty Pink Flower Bouquet (10342)',
    'A colorful 749-piece flower bouquet building set with adjustable stems. We will check current supplier availability and the full delivered price.',
    'Home & living',
    array['LEGO', 'Botanicals', 'Pretty Pink Flower Bouquet', '10342', 'flower set', 'pink flowers', 'building kit', 'home decor'],
    'https://www.lego.com/cdn/cs/set/assets/blt1bcb187351a12753/10342_WEB_PRI_NOBG.png?dpr=1&fit=bounds&format=jpg&height=1500&quality=80&width=1500',
    'source_to_order', null, true, 8, 'LEGO', 'https://www.lego.com/en-us/product/pretty-pink-flower-bouquet-10342'
  )
on conflict (slug) do nothing;
