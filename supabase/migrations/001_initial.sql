-- Perfis dos usuários
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  role text default 'socio',
  initials text,
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Trigger para criar perfil automático no signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, initials)
  values (new.id, new.raw_user_meta_data->>'name', upper(left(coalesce(new.raw_user_meta_data->>'name', new.email), 1)));
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Clientes / CRM
create table public.clients (
  id uuid primary key default gen_random_uuid(),
  empresa text not null,
  segmento text,
  contato text,
  email text,
  telefone text,
  cidade text,
  cargo text,
  origem text,
  etapa text default 'Prospecção',
  valor numeric(12,2),
  responsavel text,
  score int check (score >= 0 and score <= 100),
  created_at timestamptz default now()
);
alter table public.clients enable row level security;
create policy "Authenticated users full access to clients" on public.clients
  for all using (auth.role() = 'authenticated');

-- Atividades dos clientes
create table public.client_activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients on delete cascade,
  type text,
  icon text,
  color text,
  text text not null,
  created_at timestamptz default now()
);
alter table public.client_activities enable row level security;
create policy "Authenticated users full access to activities" on public.client_activities
  for all using (auth.role() = 'authenticated');

-- Catálogo de serviços
create table public.services_catalog (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  valor numeric(12,2) not null,
  ativo boolean default true,
  created_at timestamptz default now()
);
alter table public.services_catalog enable row level security;
create policy "Authenticated users full access to services_catalog" on public.services_catalog
  for all using (auth.role() = 'authenticated');

-- Propostas
create table public.proposals (
  id uuid primary key default gen_random_uuid(),
  numero text unique,
  client_id uuid references public.clients on delete set null,
  empresa text,
  cnpj text,
  contato text,
  cargo text,
  prazo text,
  validade text,
  desconto numeric(5,2) default 0,
  total numeric(12,2),
  status text default 'rascunho' check (status in ('rascunho','enviada','aceita','recusada')),
  created_at timestamptz default now()
);
alter table public.proposals enable row level security;
create policy "Authenticated users full access to proposals" on public.proposals
  for all using (auth.role() = 'authenticated');

-- Serviços de cada proposta
create table public.proposal_services (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references public.proposals on delete cascade,
  nome text not null,
  descricao text,
  valor numeric(12,2) not null
);
alter table public.proposal_services enable row level security;
create policy "Authenticated users full access to proposal_services" on public.proposal_services
  for all using (auth.role() = 'authenticated');

-- Tarefas / Agenda
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  client_id uuid references public.clients on delete set null,
  time text,
  type text,
  date date not null,
  created_at timestamptz default now()
);
alter table public.tasks enable row level security;
create policy "Authenticated users full access to tasks" on public.tasks
  for all using (auth.role() = 'authenticated');

-- Dados de exemplo
insert into public.services_catalog (nome, descricao, valor) values
  ('BPO Financeiro', 'Gestão financeira completa e relatórios mensais', 3500),
  ('Planejamento Estratégico', 'Workshop + roadmap de 12 meses', 8000),
  ('Reestruturação de Processos', 'Mapeamento e redesenho de fluxos operacionais', 6000),
  ('Consultoria Comercial', 'Estruturação do time e processo de vendas', 5500),
  ('Implementação de CRM', 'Configuração e treinamento de ferramenta CRM', 4000),
  ('Mentoria de Liderança', 'Sessões individuais com gestores-chave', 2800);
