-- Adiciona campo de condições de pagamento à tabela proposals
alter table public.proposals add column if not exists condicoes text;
