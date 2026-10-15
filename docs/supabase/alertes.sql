-- Abonnements aux notifications « ton résultat peut bouger » (projet Supabase de l'urne, UE).
-- Une ligne = l'adresse technique fournie par le navigateur et ses deux clés de chiffrement. Rien d'autre :
-- ni réponse, ni résultat, ni adresse IP, ni date. Accès seulement par fonctions protégées par le jeton
-- serveur (urne_check), table sans politique RLS : illisible avec la clé publique.
create schema if not exists alertes;
revoke all on schema alertes from public, anon, authenticated;

create table if not exists alertes.push (
  endpoint text primary key check (endpoint ~ '^https://' and length(endpoint) <= 1024),
  p256dh text not null check (length(p256dh) between 80 and 100),
  auth text not null check (length(auth) between 16 and 30)
);
alter table alertes.push enable row level security;
revoke all on alertes.push from public, anon, authenticated;

create or replace function public.alertes_push_add(p_token text, p_endpoint text, p_p256dh text, p_auth text)
returns boolean language plpgsql security definer set search_path to '' as $$
begin
  if not public.urne_check(p_token) then raise exception 'refusé'; end if;
  if (select count(*) from alertes.push) >= 200000 then return false; end if;
  insert into alertes.push (endpoint, p256dh, auth) values (p_endpoint, p_p256dh, p_auth)
  on conflict (endpoint) do update set p256dh = excluded.p256dh, auth = excluded.auth;
  return true;
end $$;

create or replace function public.alertes_push_remove(p_token text, p_endpoint text)
returns void language plpgsql security definer set search_path to '' as $$
begin
  if not public.urne_check(p_token) then raise exception 'refusé'; end if;
  delete from alertes.push where endpoint = p_endpoint;
end $$;

create or replace function public.alertes_push_list(p_token text, p_after text default '', p_limit int default 1000)
returns table(endpoint text, p256dh text, auth text) language plpgsql stable security definer set search_path to '' as $$
begin
  if not public.urne_check(p_token) then raise exception 'refusé'; end if;
  return query select a.endpoint, a.p256dh, a.auth from alertes.push a
    where a.endpoint > p_after order by a.endpoint limit least(greatest(p_limit, 1), 1000);
end $$;

-- Comme pour l'urne : appel avec la clé du projet, refusé sans le jeton serveur
revoke all on function public.alertes_push_add(text, text, text, text) from public, authenticated;
revoke all on function public.alertes_push_remove(text, text) from public, authenticated;
revoke all on function public.alertes_push_list(text, text, int) from public, authenticated;
grant execute on function public.alertes_push_add(text, text, text, text) to anon, service_role;
grant execute on function public.alertes_push_remove(text, text) to anon, service_role;
grant execute on function public.alertes_push_list(text, text, int) to anon, service_role;
