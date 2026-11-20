create index if not exists order_items_product_idx on public.order_items (product_id);
create index if not exists order_items_variant_idx on public.order_items (variant_id);

-- Admin write policies cover insert/update/delete only; reads use the public read policy (which already lets admins see inactive rows).
do $$
declare t text;
begin
  foreach t in array array['collections', 'categories', 'products', 'variants'] loop
    execute format('drop policy if exists "admin write %1$s" on public.%1$I', t);
    execute format('create policy "admin insert %1$s" on public.%1$I for insert to authenticated with check ((select public.is_admin()))', t);
    execute format('create policy "admin update %1$s" on public.%1$I for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format('create policy "admin delete %1$s" on public.%1$I for delete to authenticated using ((select public.is_admin()))', t);
  end loop;
end $$;
