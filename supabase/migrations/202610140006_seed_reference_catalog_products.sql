-- Add the six product examples shown by the standalone marketplace HTML.
-- Its prices, local-stock badges, and delivery promises are prototype values,
-- so these examples stay source-to-order with no published price until verified.
insert into public.catalog_products (
  slug, name, description, category, search_terms, image_url,
  availability, price_zmw, is_published, sort_order, source_name, product_url
)
values
  (
    'solar-power-generator-1200w-pure-sine-wave',
    'Solar Power Generator 1200W (Pure Sine Wave)',
    'Solar backup power generator. Tell us what you want to power and we can check the model and full delivered price.',
    'Solar',
    array['solar', 'generator', '1200W', 'pure sine wave', 'backup power', 'load shedding', 'power station'],
    'https://images.unsplash.com/photo-1620714223084-8fcacc6dfd8d?auto=format&fit=crop&w=600&q=80',
    'source_to_order', null, true, 90, null, null
  ),
  (
    'playstation-5-slim-1tb-console',
    'PlayStation 5 Slim 1TB Console',
    'PlayStation 5 Slim 1TB console. We will confirm the package, current availability and full delivered price.',
    'Electronics',
    array['Sony', 'PlayStation', 'PS5', 'PS5 Slim', '1TB', 'console', 'gaming', 'DualSense'],
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=600&q=80',
    'source_to_order', null, true, 100, null, null
  ),
  (
    'sony-wh-1000xm5-anc-wireless-headphones',
    'Sony WH-1000XM5 ANC Wireless Headphones',
    'Sony wireless over-ear headphones with noise cancellation. We will check the current listing and full delivered price.',
    'Electronics',
    array['Sony', 'WH-1000XM5', 'headphones', 'wireless', 'Bluetooth', 'ANC', 'noise cancelling', 'UK import'],
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    'source_to_order', null, true, 110, null, null
  ),
  (
    'anker-100w-foldable-solar-charger-panel',
    'Anker 100W Foldable Solar Charger Panel',
    'Foldable 100W solar charger panel for laptops and portable power stations. Ask us to check the listing and full delivered price.',
    'Solar',
    array['Anker', '100W', 'foldable', 'solar charger', 'solar panel', 'laptop', 'portable power station'],
    'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
    'source_to_order', null, true, 120, null, null
  ),
  (
    'apple-iphone-15-pro-256gb-titanium',
    'Apple iPhone 15 Pro 256GB Titanium',
    'Apple iPhone 15 Pro 256GB in titanium. We will confirm the exact model, current availability and full delivered price.',
    'Electronics',
    array['Apple', 'iPhone', 'iPhone 15 Pro', '256GB', 'Titanium', 'smartphone', 'dual SIM'],
    'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    'source_to_order', null, true, 130, null, null
  ),
  (
    'nike-air-force-1-07-triple-white',
    'Nike Air Force 1 07 Triple White',
    'Classic white Nike Air Force 1 07 sneakers. Share your shoe size and we will check the current listing and full quote.',
    'Fashion',
    array['Nike', 'Air Force 1', 'AF1', '07', 'Triple White', 'sneakers', 'trainers', 'shoes'],
    'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80',
    'source_to_order', null, true, 140, null, null
  )
on conflict (slug) do nothing;
