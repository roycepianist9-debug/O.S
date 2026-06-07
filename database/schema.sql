create extension if not exists "pgcrypto";

create table profiles (
  id uuid primary key,
  email text not null unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table dashboard_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  date date not null,
  cash_runway_months numeric,
  cash_balance numeric,
  sponsors_contacted integer not null default 0,
  active_collaborations integer not null default 0,
  videos_published integer not null default 0,
  concerts_performed integer not null default 0,
  opportunities_generated integer not null default 0,
  created_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  organization_type text not null,
  country text,
  city text,
  website text,
  linkedin text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  first_name text,
  last_name text,
  job_title text,
  email text,
  phone text,
  linkedin_url text,
  relationship_score integer check (relationship_score between 1 and 10),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table interactions (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete cascade,
  interaction_type text not null,
  subject text,
  summary text,
  next_action text,
  interaction_date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  priority text,
  status text not null default 'todo',
  due_date timestamptz,
  related_type text,
  related_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table sponsorship_opportunities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade,
  status text not null default 'Research',
  requested_value numeric,
  expected_value numeric,
  actual_value numeric,
  proposal_sent boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table deals (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  organization_id uuid references organizations(id) on delete set null,
  value_estimate numeric,
  stage text not null default 'Lead',
  probability integer check (probability between 0 and 100),
  expected_close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  opportunity_type text not null,
  country text,
  city text,
  organization_id uuid references organizations(id) on delete set null,
  description text,
  url text,
  deadline date,
  estimated_value numeric,
  status text not null default 'Research',
  priority_score numeric,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table opportunity_applications (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid references opportunities(id) on delete cascade,
  application_date date not null default current_date,
  status text not null default 'Draft',
  result text,
  notes text,
  created_at timestamptz not null default now()
);

create table cities (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  city text not null,
  cost_index numeric,
  music_score numeric,
  sponsor_score numeric,
  tourism_score numeric,
  network_score numeric,
  overall_score numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table city_costs (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references cities(id) on delete cascade,
  monthly_accommodation numeric,
  food_budget numeric,
  transport_budget numeric,
  total_monthly_cost numeric,
  last_updated timestamptz not null default now()
);

create table city_recommendations (
  id uuid primary key default gen_random_uuid(),
  city_id uuid references cities(id) on delete cascade,
  recommendation_type text not null,
  title text not null,
  description text,
  url text,
  created_at timestamptz not null default now()
);

create table content_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  platform text not null,
  content_type text not null,
  status text not null default 'Idea',
  publish_date timestamptz,
  views integer not null default 0,
  likes integer not null default 0,
  shares integer not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table content_ideas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  city_id uuid references cities(id) on delete set null,
  score numeric,
  status text not null default 'Backlog',
  created_at timestamptz not null default now()
);

create table outreach_campaigns (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  campaign_type text not null,
  target_count integer not null,
  cadence_quantity integer not null default 30,
  cadence_every_days integer not null default 2,
  start_date date not null default current_date,
  deadline date,
  status text not null default 'Active',
  created_at timestamptz not null default now()
);

create table outreach_messages (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references outreach_campaigns(id) on delete cascade,
  contact_id uuid references contacts(id) on delete set null,
  subject text,
  message_body text,
  ai_generated boolean not null default false,
  sent_at timestamptz,
  opened boolean not null default false,
  replied boolean not null default false,
  created_at timestamptz not null default now()
);

create table outreach_followups (
  id uuid primary key default gen_random_uuid(),
  message_id uuid references outreach_messages(id) on delete cascade,
  scheduled_date timestamptz not null,
  completed boolean not null default false,
  notes text
);

create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  event_type text not null,
  country text,
  city text,
  venue text,
  start_date timestamptz,
  end_date timestamptz,
  estimated_attendance integer,
  notes text,
  created_at timestamptz not null default now()
);

create table event_partners (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  organization_id uuid references organizations(id) on delete cascade,
  role text,
  notes text
);

create table event_outcomes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  revenue numeric,
  new_contacts integer not null default 0,
  new_opportunities integer not null default 0,
  media_mentions integer not null default 0,
  notes text
);

create table financial_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  currency text not null default 'EUR',
  balance numeric not null default 0,
  created_at timestamptz not null default now()
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references financial_accounts(id) on delete cascade,
  date date not null,
  type text not null,
  category text not null,
  amount numeric not null,
  description text,
  created_at timestamptz not null default now()
);

create table runway_forecasts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  scenario_name text not null,
  monthly_income numeric,
  monthly_expenses numeric,
  runway_months numeric,
  created_at timestamptz not null default now()
);

create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  created_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references ai_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table nonprofit_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  country text,
  category text not null,
  status text not null default 'Planning',
  budget numeric,
  impact_goal text,
  notes text,
  created_at timestamptz not null default now()
);

create table donors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  organization_id uuid references organizations(id) on delete set null,
  donation_total numeric not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid references donors(id) on delete cascade,
  project_id uuid references nonprofit_projects(id) on delete set null,
  amount numeric not null,
  donation_date date not null default current_date,
  notes text
);

create table royce_operating_memory (
  memory_key text primary key default 'primary',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table royce_actions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  action_type text not null default 'Update',
  source_text text,
  status text not null default 'Logged',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table royce_ai_tips (
  id uuid primary key default gen_random_uuid(),
  page text not null,
  section text,
  label text not null default 'AI Plan',
  content text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  dismissed_at timestamptz
);

create index organizations_type_country_idx on organizations(organization_type, country);
create index contacts_organization_id_idx on contacts(organization_id);
create index interactions_contact_date_idx on interactions(contact_id, interaction_date desc);
create index opportunities_status_priority_idx on opportunities(status, priority_score desc);
create index outreach_messages_campaign_sent_idx on outreach_messages(campaign_id, sent_at desc);
create index tasks_due_status_idx on tasks(due_date, status);
create index transactions_account_date_idx on transactions(account_id, date desc);
create index royce_actions_type_created_idx on royce_actions(action_type, created_at desc);
create index royce_ai_tips_page_created_idx on royce_ai_tips(page, created_at desc);
