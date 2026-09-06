alter table public.products add column if not exists slug text;
update public.products set slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')) where slug is null;
alter table public.products alter column slug set not null;
alter table public.products add constraint products_slug_unique unique (slug);

insert into public.brand_settings (store_name, tagline)
values ('Kandamma Kids', 'Ethnic wear for little ones')
on conflict do nothing;
