# Nicho-Xpress

The first web prototype for a Zambia-focused overseas sourcing concierge. It introduces the service, explains the request and quote journey, and captures item requests in Supabase once configured.

## Connect Supabase

The project URL is in `.env.local`. Add the project's **publishable key** to `SUPABASE_PUBLISHABLE_KEY` there (older projects can use their anon key as `SUPABASE_ANON_KEY`). In Supabase, open the SQL Editor and run the migrations in order:

1. [`supabase/migrations/202610140001_create_custom_sourcing_requests.sql`](supabase/migrations/202610140001_create_custom_sourcing_requests.sql) for customer requests.
2. [`supabase/migrations/202610140002_staff_inbox_access.sql`](supabase/migrations/202610140002_staff_inbox_access.sql) for the private staff inbox.
3. [`supabase/migrations/202610140003_store_catalog_search.sql`](supabase/migrations/202610140003_store_catalog_search.sql) for published product search.
4. [`supabase/migrations/202610140004_seed_source_examples.sql`](supabase/migrations/202610140004_seed_source_examples.sql) for retailer links and a few sample products.
5. [`supabase/migrations/202610140005_seed_marketplace_examples.sql`](supabase/migrations/202610140005_seed_marketplace_examples.sql) for more example listings across tech, fashion, power and home.
6. [`supabase/migrations/202610140006_seed_reference_catalog_products.sql`](supabase/migrations/202610140006_seed_reference_catalog_products.sql) for the six reference items from the marketplace prototype.
7. [`supabase/migrations/202610140007_request_reference_images.sql`](supabase/migrations/202610140007_request_reference_images.sql) for private customer product-photo attachments in sourcing requests.
8. [`supabase/migrations/202610140008_seed_colorful_catalog_products.sql`](supabase/migrations/202610140008_seed_colorful_catalog_products.sql) for eight colorful listings across tech, fashion, lighting and home decor.

The intake endpoint uses the publishable key from a server route. Its RLS policy permits anonymous inserts only; anonymous visitors cannot read, update, or delete requests. Product photos go into a private Storage bucket that only allowlisted staff can read. Never put a `service_role` or secret key in this app's client code.

## Enable product identification

Set `GEMINI_API_KEY` in `.env.local` for local development and in the hosting provider's server environment for deployment. The key stays in the server route; do not prefix it with `NEXT_PUBLIC_`. The assistant uses Gemini to interpret typed descriptions or product photos, then searches the published catalog using the interpreted product terms. It still offers a sourcing request if Gemini or the catalog is unavailable. The server also accepts the existing `Gemini_API_KEY` spelling.

## Set up the staff inbox

1. Add an operator account in Supabase **Authentication → Users** with email and password sign-in.
2. Run [`supabase/migrations/202610140002_staff_inbox_access.sql`](supabase/migrations/202610140002_staff_inbox_access.sql) in the SQL Editor if it has not already been run.
3. Add the account to the staff allowlist, replacing the sample email below:

   ```sql
   insert into public.nicho_xpress_staff (user_id)
   select id from auth.users where lower(email) = lower('admin@example.com')
   on conflict (user_id) do nothing;
   ```

4. Open `/admin/login` and sign in with that account.

Only allowlisted staff accounts can read customer requests. Staff can update order status; anonymous visitors cannot read or change requests.

## Add store listings

Run the catalog migrations above in order. Migrations 004–006 add fourteen sample listings from Apple, Nintendo, Nike, soundcore, Samsung, SHEIN, EcoFlow, IKEA, and the prototype catalog. Migration 008 adds eight colorful examples across several product types. All examples are marked `source_to_order` and have no ZMW price; each is a sourcing reference, not a promise of current availability or price. Nicho-Xpress should confirm the item and full delivery quote before the customer decides whether to order. You can update or unpublish the samples in Supabase's Table Editor under `public.catalog_products`, then add your own listings. Fill in the name, slug, category, and useful `search_terms` (brand, model, common spelling); set `is_published` to `true` when ready to show the listing. `availability` accepts `in_zambia` or `source_to_order`. `price_zmw` is optional and represents the listed item price only; freight and other costs are confirmed in the customer's quote. Searches without a match, and searches made while the catalogue is unavailable, still let customers send the item or product link as a custom request.

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Current scope

The item request form saves customer requests to Supabase after the first migration and publishable key are configured. The smart assistant uses Gemini to interpret text or a photo, searches published catalog listings, and routes unmatched items into personal sourcing requests. Overseas delivery is shown as an estimate and confirmed with the quote. Product photos are sent to Gemini for identification when the customer checks an item and are attached to requests for staff review after migration 007. Staff can sign in to review requests and update their status after the staff migration and allowlist setup. Quotes are still prepared and sent manually; payment, supplier, shipping, and customer order tracking are not connected yet. Add rate limiting or a CAPTCHA before promoting the public form widely.
