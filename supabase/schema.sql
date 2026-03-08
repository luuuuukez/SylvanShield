-- ============================================================
-- MotoSafe – Database Schema
-- ============================================================

-- ============================================================
-- TABLES
-- ============================================================

-- profiles: extends auth.users (1-to-1)
create table public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  name           varchar,
  phone          varchar,
  avatar_url     varchar,
  role           varchar not null default 'worker'
                   check (role in ('worker', 'supervisor')),
  created_at     timestamp not null default now()
);

-- safety_contacts: per-user emergency contacts
create table public.safety_contacts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  name       varchar,
  phone      varchar,
  email      varchar,
  is_active  boolean not null default false
);

-- work_sessions: individual shift records
create table public.work_sessions (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.profiles(id) on delete cascade,
  safety_contact_id     uuid references public.safety_contacts(id),
  start_time            timestamp,
  expected_end_time     timestamp,
  actual_end_time       timestamp,
  status                varchar not null
                          check (status in ('active', 'grace_period', 'alert_sent', 'completed')),
  last_known_latitude   decimal,
  last_known_longitude  decimal,
  created_at            timestamp not null default now()
);

-- alerts: triggered when a session reaches alert_sent state
create table public.alerts (
  id            uuid primary key default gen_random_uuid(),
  session_id    uuid not null references public.work_sessions(id) on delete cascade,
  triggered_at  timestamp not null default now(),
  reason        varchar,
  status        varchar
);

-- alert_notifications: delivery records for each alert channel
create table public.alert_notifications (
  id               uuid primary key default gen_random_uuid(),
  alert_id         uuid not null references public.alerts(id) on delete cascade,
  channel          varchar,   -- e.g. 'sms', 'email', 'push'
  recipient        varchar,
  sent_at          timestamp,
  delivery_status  varchar    -- e.g. 'sent', 'delivered', 'failed'
);

-- audit_logs: immutable action trail
create table public.audit_logs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  action_type  varchar,
  description  text,
  created_at   timestamp not null default now()
);

-- ============================================================
-- ROW-LEVEL SECURITY
-- ============================================================

alter table public.profiles           enable row level security;
alter table public.safety_contacts    enable row level security;
alter table public.work_sessions      enable row level security;
alter table public.alerts             enable row level security;
alter table public.alert_notifications enable row level security;
alter table public.audit_logs         enable row level security;

-- Helper: returns true when the calling user has role = 'supervisor'
create or replace function public.is_supervisor()
returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'supervisor'
  );
$$;

-- ---------- profiles ----------
create policy "Users can read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_supervisor());

create policy "Users can update own profile"
  on public.profiles for update
  using (id = auth.uid());

-- ---------- safety_contacts ----------
create policy "Users can read own safety_contacts"
  on public.safety_contacts for select
  using (user_id = auth.uid());

create policy "Users can insert own safety_contacts"
  on public.safety_contacts for insert
  with check (user_id = auth.uid());

create policy "Users can update own safety_contacts"
  on public.safety_contacts for update
  using (user_id = auth.uid());

create policy "Users can delete own safety_contacts"
  on public.safety_contacts for delete
  using (user_id = auth.uid());

-- ---------- work_sessions ----------
create policy "Users can read own work_sessions"
  on public.work_sessions for select
  using (user_id = auth.uid() or public.is_supervisor());

create policy "Users can insert own work_sessions"
  on public.work_sessions for insert
  with check (user_id = auth.uid());

create policy "Users can update own work_sessions"
  on public.work_sessions for update
  using (user_id = auth.uid());

-- ---------- alerts ----------
create policy "Users can read own alerts"
  on public.alerts for select
  using (
    session_id in (
      select id from public.work_sessions
      where user_id = auth.uid()
    )
    or public.is_supervisor()
  );

create policy "System can insert alerts"
  on public.alerts for insert
  with check (
    session_id in (
      select id from public.work_sessions
      where user_id = auth.uid()
    )
  );

-- ---------- alert_notifications ----------
create policy "Users can read own alert_notifications"
  on public.alert_notifications for select
  using (
    alert_id in (
      select a.id from public.alerts a
      join public.work_sessions s on s.id = a.session_id
      where s.user_id = auth.uid()
    )
    or public.is_supervisor()
  );

-- ---------- audit_logs ----------
create policy "Users can read own audit_logs"
  on public.audit_logs for select
  using (user_id = auth.uid() or public.is_supervisor());

create policy "System can insert audit_logs"
  on public.audit_logs for insert
  with check (user_id = auth.uid());

-- ============================================================
-- TRIGGER: auto-create profile on new auth.users insert
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- TRIGGER: enforce single active safety_contact per user
-- Unsets is_active on all other contacts for the same user
-- when a contact is set to is_active = true.
-- ============================================================

create or replace function public.enforce_single_active_contact()
returns trigger
language plpgsql as $$
begin
  if new.is_active = true then
    update public.safety_contacts
    set    is_active = false
    where  user_id = new.user_id
      and  id <> new.id
      and  is_active = true;
  end if;
  return new;
end;
$$;

create trigger trg_single_active_contact
  before insert or update on public.safety_contacts
  for each row execute function public.enforce_single_active_contact();

-- ============================================================
-- TRIGGER: insert audit_log on work_session status changes
-- ============================================================

create or replace function public.log_session_status_change()
returns trigger
language plpgsql security definer as $$
begin
  if (tg_op = 'INSERT') or (old.status is distinct from new.status) then
    insert into public.audit_logs (user_id, action_type, description)
    values (
      new.user_id,
      'session_status_change',
      'Session ' || new.id || ' status → ' || new.status
    );
  end if;
  return new;
end;
$$;

create trigger trg_session_status_audit
  after insert or update on public.work_sessions
  for each row execute function public.log_session_status_change();
