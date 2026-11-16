-- Registra quando a proposta foi de fato enviada e aceita, pra números
-- de "receita do mês" e "propostas enviadas no mês" no Dashboard refletirem
-- a data real do evento, em vez da data de criação da proposta.
alter table public.proposals add column if not exists sent_at timestamptz;
alter table public.proposals add column if not exists accepted_at timestamptz;
