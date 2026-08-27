# Florescer — Fertilidade & Maternidade

> “Mais do que acompanhar ciclos, nós acompanhamos sonhos.”

PWA de acompanhamento de ciclo menstrual, fertilidade, gestação e pós-parto, construído a partir do briefing da Marcele. A experiência se adapta automaticamente entre **Florescer Tentante**, **Florescer Gestação** e **Florescer Baby**. Funciona offline, é instalável no celular e guarda **todos os dados apenas no aparelho da usuária** — não há servidor, conta ou envio de informações.

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

Regerar os ícones do PWA a partir de `icons/logo.png` (a logo oficial):

```bash
npm run icons:docker
```

O mesmo resultado com `npm run icons`, se você tiver `sharp` instalado (`npm i -D sharp`).

Executar os testes automatizados:

```bash
npm test
```

Para acompanhar alterações durante o desenvolvimento:

```bash
npm run test:watch
```

---

## Estrutura

```
index.html                 casca do app (appbar, view, tabbar, sheet, toast) — só o PWA
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
    pregnancy.js           guia semanal, contagem regressiva e validações da gestação
    pregnancyTest.js       registro de testes e transição Tentante → Gestação
    pregnancyProfile.js    questionário e dados compartilhados da gestação
    postpartum.js          registro do nascimento e transição para o Florescer Baby
    babies.js              múltiplos nomes, formatação e saudação pós-parto
    media.js               compressão local de ultrassonografias e fotos do diário
    content.js             conteúdo editorial padrão: sugestões, artigos, FAQ
    cms.js                 camada editável: o que o painel publica vence content.js
    icons.js               conjunto de ícones SVG (traço de 1.7 em grade 24)
    ui.js                  toast, bottom sheet, carrossel, gráficos SVG, helpers
    notify.js              lembretes locais (Notification API)
    screens/               uma tela por arquivo (inclui admin.js)
icons/                     logo.png (marca oficial) + PNGs gerados a partir dela
tools/make-icons.mjs       gera os ícones do PWA a partir da logo
supabase/                  schema do banco (migrations + seed) — ver supabase/README.md
```

Cada tela exporta `{ id, tab?, render(rota) }` e devolve `{ appbar, html, mount(root) }`. O roteador cuida de appbar, tab ativa, rolagem e transição.

---

## Telas

| Rota | Tela | O que faz |
|---|---|---|
| `#/inicio` | Boas-vindas + quiz | Questionário contextual que define fase, dados do ciclo, gestação ou pós-parto e preferências |
| `#/home` | Início | Adapta-se à fase: anel do ciclo, semanas de gestação ou idade do bebê |
| `#/ciclo` | Calendário | Qualquer mês, com menstruação registrada, previsão, janela fértil, ovulação e marcações |
| `#/adicionar` | Ações do botão central | Tentante escolhe teste ou registro; Gestante escolhe registro, sintoma ou nascimento |
| `#/teste-gravidez` | Teste de gravidez | Salva data e resultado positivo, negativo ou inconclusivo e mantém o histórico recente |
| `#/gestacao-inicio` | Configuração da gestação | DUM/DPP, tipo de gestação, nomes dos bebês e última ultrassonografia |
| `#/boas-vindas` | Transição de fase | Celebra a entrada no Florescer escolhido e encaminha para a Home |
| `#/registro` | Registro diário | Diário da tentante ou Diário da Mamãe; na gestação guarda humor, emoções, pensamentos, gratidão e fotos |
| `#/registro?s=sintomas` | Controle de Sintomas | Tela separada para sintomas, pressão arterial, peso, glicemia e observações do dia |
| `#/missoes` | Missões Diárias | Cinco cuidados diários com progresso, pontos, níveis, sequência e lembretes |
| `#/dicas` | Sugestões | Conteúdo escolhido para a fase do ciclo, com favoritos |
| `#/biblioteca`, `#/artigo/:id` | Biblioteca | 8 artigos revisados, com leitura, marcadores e bloqueio Premium |
| `#/comunidade`, `#/post/:id`, `#/novo-post` | Comunidade | Feed com filtros, curtidas, comentários, publicação, denúncia e desafio da semana |
| `#/relatorios` | Relatórios | Duração dos ciclos, curva de temperatura, sintomas frequentes e exportação para consulta |
| `#/perfil` | Perfil | Dados do quiz editáveis, jornada afetiva, acesso à conta |
| `#/premium` | Premium | Planos, benefícios e gestão da assinatura |
| `#/configuracoes` | Configurações | Tema, fase lútea, mudança de fase, backup e exclusão de dados |
| `#/lembretes` | Lembretes | Permissão de notificação, tipos de aviso, horário e pré-visualização |
| `#/privacidade`, `#/ajuda`, `#/sobre` | Institucionais | LGPD, FAQ e informações do app |
| `#/admin` | Painel da administradora | Edita sugestões, artigos, FAQ, diretrizes, benefícios, desafio e preços; modera a comunidade; exporta o conteúdo em JSON e em SQL |

---

## Painel da administradora

Dois caminhos diretos:

- **Configurações › Administração** — primeira seção da tela;
- direto em `#/admin`.

Depois do primeiro login na sessão, um atalho também aparece na tela inicial.

Credenciais iniciais — **troque no primeiro acesso**, em Painel › Segurança:

| | |
|---|---|
| E-mail | `marcele@florescer.app` |
| Senha | `Florescer@2026` |

A senha não fica no código: guardamos apenas o SHA-256 de `florescer:v1:<e-mail>:<senha>`. Cada alteração feita no painel vale imediatamente no app e pode ser publicada no Supabase pelo SQL gerado em **Publicar e exportar**.

Enquanto o app for local, essa senha é uma tranca de interface: protege de acesso casual, não de quem tenha domínio técnico do aparelho. A proteção real vem com o Supabase Auth — a coluna `profiles.is_admin` e as políticas de administração já estão prontas em `supabase/migrations/20260806090300_admin.sql`.

---

## Fluxos por fase

### Florescer Tentante

O botão `+` da navbar abre uma escolha em vez de ir diretamente ao diário:

- **Adicionar um Teste** abre a tela de teste de gravidez, com data e resultados positivo, negativo ou inconclusivo;
- **Fazer um registro** abre o diário da tentante normalmente;
- os testes ficam em `pregnancyTests`, com os mais recentes visíveis na própria tela;
- um resultado positivo salva o teste, muda `profile.phase` para `gravida` e encaminha para o questionário do Florescer Gestação.

### Florescer Gestação

O questionário é o mesmo para novas usuárias que escolhem “Estou grávida” e para Tentantes após um teste positivo. Ele solicita:

- primeiro dia da última menstruação (DUM) ou data provável do parto (DPP);
- cálculo automático bidirecional: DPP = DUM + 280 dias, ou DUM = DPP − 280 dias;
- tipo de gestação: única ou gemelar/múltipla;
- nome do bebê, opcional;
- em gestações múltiplas, dois campos iniciais e inclusão de outros nomes para trigêmeos, quadrigêmeos ou mais;
- foto da última ultrassonografia, opcional.

A ultrassonografia é convertida para JPEG, reduzida para armazenamento local e nunca enviada para um servidor. A DPP alimenta as semanas, trimestre, guia de desenvolvimento e contagem regressiva da Home. Para gestações múltiplas, textos como “os amores da sua vida”, “seus bebês” e “cada bebê” são apresentados no plural.

O botão `+` da navbar da Gestante oferece três ações exclusivas:

- **Adicionar um Registro** abre o Diário da Mamãe, dedicado a humor, emoções, pensamentos, gratidão e memórias;
- **Adicionar um Sintoma** abre o Controle de Sintomas, separado do diário;
- **Registrar nascimento** abre uma confirmação antes de qualquer alteração.

### Florescer Baby

Ao confirmar o nascimento, o app:

- registra a data atual como `birthDate`;
- preserva os nomes e o histórico da gestação;
- muda `profile.phase` para `posparto`;
- adiciona um marco à jornada;
- abre a celebração de entrada no **Florescer Baby**.

O quiz inicial de pós-parto também permite cadastrar vários bebês. A Home usa os nomes em uma frase natural: `Olá, Lia e Liz!` ou `Olá, Lia, Liz e Theo!`. Dados antigos que possuem somente `babyName` continuam compatíveis; o novo modelo mantém `babyNames` e sincroniza o primeiro nome com o campo legado.

---

## Motor de ciclo

Implementado em `assets/js/cycle.js`, com as regras usadas por apps de referência:

- **Duração média** calculada a partir dos últimos 6 ciclos registrados (limitada a 18–45 dias); antes disso, usa o valor informado no cadastro.
- **Menstruações** detectadas automaticamente a partir dos dias com fluxo, agrupando intervalos de até 2 dias.
- **Ovulação** = próxima menstruação − fase lútea (14 dias por padrão, ajustável em Configurações).
- **Janela fértil** = ovulação − 5 dias até ovulação + 1.
- **Confiança da previsão** cresce com o número de ciclos e cai com a variação entre eles.
- **Gestação**: DPP pela regra de Naegele (DUM + 280 dias), com semanas, trimestre, tamanho de referência e mensagens adaptadas para gestação única ou múltipla.
- **Pós-parto/Florescer Baby**: idade dos bebês em dias, semanas ou meses, com destaque para o puerpério e saudação personalizada.

Quando um ciclo passa muito do previsto sem registro, o app projeta ciclos teóricos em vez de mostrar “dia 71”.

---

## PWA

- Instalável (`manifest.webmanifest`, ícones normais e *maskable*, atalhos para “Registrar” e “Ciclo”).
- Offline completo: a casca é pré-carregada na instalação do service worker; HTML usa rede-primeiro e os demais arquivos respondem do cache e revalidam em segundo plano.
- Banner de nova versão quando há atualização, e banner de instalação no primeiro uso.
- Tema claro em todos os aparelhos: o app não segue o modo escuro do sistema, para manter a identidade da marca.
- Lembretes locais via Notification API — janela fértil, menstruação, registro diário, missões pendentes e sugestão do dia, no horário escolhido. Não há push de servidor: os avisos são agendados no próprio aparelho.

---

## Dados e privacidade

Hoje o app é local. O schema-base planejado para o Supabase (tabelas, RLS, funções de ciclo e conteúdo editorial) está em [`supabase/`](supabase/README.md). Ainda faltam a camada de autenticação, a troca do `store.js` e a modelagem dos novos dados descritos abaixo.

- Tudo é gravado em `localStorage`, na chave `florescer:v1`.
- O perfil inclui fase, DUM, DPP, tipo de gestação, nomes dos bebês, ultrassonografia opcional e data do nascimento.
- Testes de gravidez ficam em `pregnancyTests`; registros diários continuam em `logs`, identificados por `YYYY-MM-DD`.
- Fotos da ultrassonografia, barriga e exames são comprimidas como JPEG antes de serem armazenadas localmente.
- **Exportar** gera um `.json` completo; **Importar** restaura em qualquer aparelho; **Apagar tudo** remove de forma definitiva (Configurações › Privacidade e dados).
- Nenhuma requisição sai do dispositivo — não há analytics, rastreamento ou contas.
- As publicações da comunidade são locais; o conteúdo inicial do feed é ilustrativo.

---

## Limites conhecidos (para a próxima fase)

- Comunidade e assinatura são locais: entram em produção com backend, autenticação e cobrança pela loja.
- Notificações dependem do app instalado; push em segundo plano exige servidor e chaves VAPID.
- O relatório para consulta é exportado em texto; a versão em PDF fica para a próxima iteração.
- Imagens ainda usam `localStorage`; uma galeria maior deverá migrar os arquivos para IndexedDB ou Storage quando o backend for conectado.
- O schema Supabase planejado ainda precisa receber os novos campos de testes, gestação múltipla, nomes e imagens antes da integração com o app local.

---

## Testes

A suíte usa `node:test` e cobre atualmente 47 cenários, incluindo:

- datas, ciclo, janela fértil, gestação e pós-parto;
- cálculo entre DUM e DPP;
- registro de teste positivo e mudança para o Florescer Gestação;
- campos e persistência do perfil gestacional;
- múltiplos nomes e formatação das saudações;
- pluralização da contagem regressiva em gestações múltiplas;
- separação entre Diário da Mamãe e Controle de Sintomas;
- opções contextuais do botão principal para Gestantes;
- registro do nascimento e mudança para o Florescer Baby;
- missões diárias, mensagens de boas-vindas e conteúdo dos registros.

---

O Florescer é uma ferramenta de acompanhamento e educação em saúde. **Não realiza diagnóstico, não substitui consulta médica e não deve ser usado como método contraceptivo.**
