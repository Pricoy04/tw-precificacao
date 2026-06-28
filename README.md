# Sistema de Precificação — TW Consultoria Empresarial

Calculadora de preço de venda baseada no **método do markup divisor**, usado para precificar produtos e serviços considerando custo, impostos, despesas e margem de lucro desejada.

Roda 100% no navegador (HTML + CSS + JavaScript). Não precisa de servidor nem banco de dados.

## Como usar localmente

Abra o arquivo `index.html` com um duplo clique — ele abre no navegador. Pronto.

## Como funciona o cálculo

O preço de venda é obtido por:

```
Soma dos percentuais = Impostos% + Despesas variáveis% + Despesas fixas% + Margem%
Markup divisor       = 1 - (Soma dos percentuais ÷ 100)
Preço de venda       = Custo ÷ Markup divisor
```

Todos os percentuais incidem **sobre o preço de venda** (não sobre o custo). Se a soma deles chegar a 100% ou mais, o cálculo fica impossível e o sistema avisa.

### Campos de entrada
- **Custo total** — quanto custa para você produzir/entregar (matéria-prima, mão de obra etc.).
- **Impostos sobre venda** — percentual conforme o regime tributário (Simples Nacional, Lucro Presumido etc.).
- **Despesas variáveis** — comissão de vendas, taxa de cartão, frete.
- **Despesas fixas / administrativas** — rateio dos custos fixos sobre o faturamento.
- **Margem de lucro desejada** — o lucro líquido que você quer no fim.

## Publicar na internet (grátis)

Opções, da mais simples para a mais robusta:
- **GitHub Pages** — em *Settings → Pages*, selecione a branch `main` e a pasta raiz. O site fica no ar em poucos minutos.
- **Vercel** ou **Netlify** — conecte o repositório e o deploy é automático.

## Próximos passos sugeridos

- Salvar precificações (histórico) — exige adicionar armazenamento.
- Cadastro de produtos/serviços.
- Login para a equipe.
- Exportar resultado em PDF.

## Estrutura

```
tw-precificacao/
├── index.html   # toda a aplicação (interface + cálculo)
├── README.md
└── .gitignore
```
