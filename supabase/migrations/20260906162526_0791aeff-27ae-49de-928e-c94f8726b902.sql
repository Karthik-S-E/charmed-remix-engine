drop policy if exists "Users can read own or admin all profiles" on public.profiles;
create policy "Users can read own or admin all profiles"
on public.profiles for select to authenticated
using (
  id = auth.uid()
  or exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'::public.app_role
  )
);

drop policy if exists "Users can read own or admin all roles" on public.user_roles;
create policy "Users can read own roles"
on public.user_roles for select to authenticated
using (user_id = auth.uid());

drop policy if exists "Admins can manage products" on public.products;
create policy "Admins can manage products"
on public.products for all to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'::public.app_role
  )
);

drop policy if exists "Admins can manage brand settings" on public.brand_settings;
create policy "Admins can manage brand settings"
on public.brand_settings for all to authenticated
using (
  exists (
    select 1 from public.user_roles
    where user_id = auth.uid()
      and role = 'admin'::public.app_role
  )
);

drop function if exists public.has_role(uuid, public.app_role);

revoke execute on function public.handle_new_user from public, authenticated;
revoke execute on function public.handle_new_user_role from public, authenticated;
