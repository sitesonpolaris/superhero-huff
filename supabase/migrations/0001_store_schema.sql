-- Superhero Huff store schema
-- Catalog is public-read; everything else is admin or service-role only.

create extension if not exists pgcrypto;

-- Admins -----------------------------------------------------------------
create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated, anon;

create policy "admins read admins" on public.admins for select to authenticated using ((select public.is_admin()));

-- Catalog ----------------------------------------------------------------
create table public.collections (
  slug text primary key,
  name text not null,
  tagline text,
  issue int not null default 0,
  cover text,
  active boolean not null default true
);

create table public.categories (
  slug text primary key,
  name text not null,
  sort int not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  compare_at_price numeric(10, 2) check (compare_at_price is null or compare_at_price >= 0),
  collection_slug text references public.collections (slug) on update cascade on delete set null,
  categories text[] not null default '{}',
  is_new boolean not null default false,
  featured boolean not null default false,
  active boolean not null default true,
  images jsonb not null default '[]'::jsonb,
  weight_oz numeric(8, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_collection_idx on public.products (collection_slug);
create index products_categories_idx on public.products using gin (categories);

create table public.variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  sku text,
  size text,
  color text,
  price numeric(10, 2) not null check (price >= 0),
  stock int check (stock is null or stock >= 0), -- null = not tracked
  image text,
  sort int not null default 0,
  active boolean not null default true
);
create index variants_product_idx on public.variants (product_id);

create table public.settings (
  id int primary key default 1 check (id = 1),
  flat_shipping_cents int not null default 800,
  free_shipping_threshold_cents int, -- null = no free shipping
  store_email text,
  announcement text,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (1);

-- Orders -----------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  number bigint not null unique default nextval('public.order_number_seq'),
  email text not null,
  user_id uuid references auth.users (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'fulfilled', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal_cents int not null default 0,
  shipping_cents int not null default 0,
  tax_cents int not null default 0,
  total_cents int not null default 0,
  stripe_session_id text unique,
  stripe_payment_intent text,
  shipping_name text,
  shipping_address jsonb,
  carrier text,
  tracking_number text,
  notes text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz
);
create index orders_user_idx on public.orders (user_id);
create index orders_email_idx on public.orders (lower(email));
create index orders_status_idx on public.orders (status, created_at desc);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.variants (id) on delete set null,
  name text not null,
  size text,
  color text,
  image text,
  unit_price_cents int not null,
  quantity int not null check (quantity > 0)
);
create index order_items_order_idx on public.order_items (order_id);

-- Inbox ------------------------------------------------------------------
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  handled boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

-- updated_at trigger -----------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger settings_touch before update on public.settings for each row execute function public.touch_updated_at();

-- Stock decrement (called by the Stripe webhook with the service role) ----
create or replace function public.decrement_stock(p_variant uuid, p_qty int)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.variants set stock = greatest(stock - p_qty, 0)
  where id = p_variant and stock is not null;
$$;
revoke all on function public.decrement_stock(uuid, int) from public, anon, authenticated;

-- RLS --------------------------------------------------------------------
alter table public.collections enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.variants enable row level security;
alter table public.settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.contact_messages enable row level security;
alter table public.subscribers enable row level security;

-- Public catalog reads
create policy "public read collections" on public.collections for select to anon, authenticated using (active or (select public.is_admin()));
create policy "public read categories" on public.categories for select to anon, authenticated using (true);
create policy "public read products" on public.products for select to anon, authenticated using (active or (select public.is_admin()));
create policy "public read variants" on public.variants for select to anon, authenticated using (active or (select public.is_admin()));
create policy "public read settings" on public.settings for select to anon, authenticated using (true);

-- Admin writes
create policy "admin write collections" on public.collections for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin write categories" on public.categories for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin write products" on public.products for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin write variants" on public.variants for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin write settings" on public.settings for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Orders: customers see their own; admins see and update all
create policy "own or admin read orders" on public.orders for select to authenticated
  using (user_id = (select auth.uid()) or (select public.is_admin()));
create policy "admin update orders" on public.orders for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "own or admin read order items" on public.order_items for select to authenticated
  using (exists (
    select 1 from public.orders o
    where o.id = order_id and (o.user_id = (select auth.uid()) or (select public.is_admin()))
  ));

-- Inbox: admins only (inserts go through the server with the service role)
create policy "admin all contact" on public.contact_messages for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "admin all subscribers" on public.subscribers for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

-- Storage: public product image bucket, admin-managed --------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;

create policy "admin upload product images" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "admin update product images" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
create policy "admin delete product images" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()));
