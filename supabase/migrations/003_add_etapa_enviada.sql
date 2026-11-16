-- Formaliza as etapas válidas do pipeline (inclui a nova etapa "Enviada",
-- criada quando uma proposta é marcada como enviada) e trava a coluna
-- contra valores fora da lista usada pelo Kanban do CRM e pelo Funil.
alter table public.clients add constraint clients_etapa_check
  check (etapa in ('Prospecção','Qualificação','Proposta','Enviada','Negociação','Ganho','Perdido'));
