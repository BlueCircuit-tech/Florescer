# Florescer — Fertilidade & Maternidade

> “Mais do que acompanhar ciclos, nós acompanhamos sonhos.”

PWA de acompanhamento de ciclo menstrual, fertilidade, gestação e pós-parto, construído a partir do briefing da Marcele. Funciona offline, é instalável no celular e guarda **todos os dados apenas no aparelho da usuária** — não há servidor, conta ou envio de informações.

Sem build, sem dependências de runtime: HTML, CSS e módulos ES nativos.

---

## Como rodar

O app precisa de um servidor HTTP (módulos ES e service worker não funcionam em `file://`).

```bash
npm run dev
```

Depois abra <http://localhost:4173>. Qualquer servidor estático serve (`npx serve .`, `python -m http.server`, Live Server do VS Code).

Publicar na Vercel:

```bash
npm run deploy
```

Regerar os ícones do PWA a partir da marca:

```bash
npm run icons
```

---

## Estrutura

```
index.html                 casca do app (appbar, view, tabbar, sheet, toast)
manifest.webmanifest       manifesto do PWA (ícones, atalhos, standalone)
sw.js                      service worker: offline + atualização em segundo plano
vercel.json                cabeçalhos de cache e segurança
assets/
  css/app.css              sistema de design (tokens, componentes, telas)
  js/
    app.js                 boot: registra telas, tema, service worker, instalação
    router.js              rotas por hash (#/rota/param?query)
    store.js               estado + persistência em localStorage + export/import
    cycle.js               motor de datas, ciclo, gestação e pós-parto
    content.js             conteúdo editorial: sugestões, artigos, FAQ, comunidade
    icons.js               conjunto de ícones SVG (traço de 1.7 em grade 24)
    ui.js                  toast, bottom sheet, gráficos SVG, helpers
    notify.js              lembretes locais (Notification API)
    screens/               uma tela por arquivo
icons/                     SVG da marca + PNGs gerados (192, 512, maskable, badge)
tools/make-icons.mjs       gerador de PNG sem dependências (rasteriza a flor)
supabase/                  schema do banco (migrations + seed) — ver supabase/README.md
```

Cada tela exporta `{ id, tab?, render(rota) }` e devolve `{ appbar, html, mount(root) }`. O roteador cuida de appbar, tab ativa, rolagem e transição.

---

## Telas

| Rota | Tela | O que faz |
|---|---|---|
| `#/inicio` | Boas-vindas + quiz | 7 passos que definem fase, datas do ciclo, desafio e preferências |
| `#/home` | Início | Adapta-se à fase: anel do ciclo, semanas de gestação ou idade do bebê |
| `#/ciclo` | Calendário | Qualquer mês, com menstruação registrada, previsão, janela fértil, ovulação e marcações |
| `#/registro` | Registro diário | Fluxo, humor, sintomas, intimidade, temperatura basal, muco, teste de ovulação e observações |
| `#/dicas` | Sugestões | Conteúdo escolhido para a fase do ciclo, com favoritos |
| `#/biblioteca`, `#/artigo/:id` | Biblioteca | 8 artigos revisados, com leitura, marcadores e bloqueio Premium |
| `#/comunidade`, `#/post/:id`, `#/novo-post` | Comunidade | Feed com filtros, curtidas, comentários, publicação, denúncia e desafio da semana |
| `#/relatorios` | Relatórios | Duração dos ciclos, curva de temperatura, sintomas frequentes e exportação para consulta |
| `#/perfil` | Perfil | Dados do quiz editáveis, jornada afetiva, acesso à conta |
| `#/premium` | Premium | Planos, benefícios e gestão da assinatura |
| `#/configuracoes` | Configurações | Tema, fase lútea, mudança de fase, backup e exclusão de dados |
| `#/lembretes` | Lembretes | Permissão de notificação, tipos de aviso, horário e pré-visualização |
| `#/privacidade`, `#/ajuda`, `#/sobre` | Institucionais | LGPD, FAQ e informações do app |

---

## Motor de ciclo

Implementado em `assets/js/cycle.js`, com as regras usadas por apps de referência:

- **Duração média** calculada a partir dos últimos 6 ciclos registrados (limitada a 18–45 dias); antes disso, usa o valor informado no cadastro.
- **Menstruações** detectadas automaticamente a partir dos dias com fluxo, agrupando intervalos de até 2 dias.
- **Ovulação** = próxima menstruação − fase lútea (14 dias por padrão, ajustável em Configurações).
- **Janela fértil** = ovulação − 5 dias até ovulação + 1.
- **Confiança da previsão** cresce com o número de ciclos e cai com a variação entre eles.
- **Gestação**: DPP pela regra de Naegele (DUM + 280 dias), com semanas, trimestre e tamanho do bebê.
- **Pós-parto**: idade do bebê em dias, semanas ou meses, com destaque para o puerpério.

Quando um ciclo passa muito do previsto sem registro, o app projeta ciclos teóricos em vez de mostrar “dia 71”.

---

## PWA

- Instalável (`manifest.webmanifest`, ícones normais e *maskable*, atalhos para “Registrar” e “Ciclo”).
- Offline completo: a casca é pré-carregada na instalação do service worker; HTML usa rede-primeiro e os demais arquivos respondem do cache e revalidam em segundo plano.
- Banner de nova versão quando há atualização, e banner de instalação no primeiro uso.
- Tema claro em todos os aparelhos: o app não segue o modo escuro do sistema, para manter a identidade da marca.
- Lembretes locais via Notification API — janela fértil, menstruação, registro diário e sugestão do dia, no horário escolhido. Não há push de servidor: os avisos são agendados no próprio aparelho.

---

## Dados e privacidade

Hoje o app é local. O schema que leva os dados para o Supabase (tabelas, RLS, funções de ciclo e conteúdo editorial) está pronto em [`supabase/`](supabase/README.md) — falta a camada de autenticação e a troca do `store.js`.

- Tudo é gravado em `localStorage`, na chave `florescer:v1`.
- **Exportar** gera um `.json` completo; **Importar** restaura em qualquer aparelho; **Apagar tudo** remove de forma definitiva (Configurações › Privacidade e dados).
- Nenhuma requisição sai do dispositivo — não há analytics, rastreamento ou contas.
- As publicações da comunidade são locais; o conteúdo inicial do feed é ilustrativo.

---

## Limites conhecidos (para a próxima fase)

- Comunidade e assinatura são locais: entram em produção com backend, autenticação e cobrança pela loja.
- Notificações dependem do app instalado; push em segundo plano exige servidor e chaves VAPID.
- O relatório para consulta é exportado em texto; a versão em PDF fica para a próxima iteração.

---

O Florescer é uma ferramenta de acompanhamento e educação em saúde. **Não realiza diagnóstico, não substitui consulta médica e não deve ser usado como método contraceptivo.**
# Florescer
