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
    achievements.js        regras e deduplicação das pequenas conquistas
    babyStatus.js          medidas, vacinas, consultas e lembretes dos bebês
    breastfeeding.js       mamadas, extração e estoque de leite
    babyHealth.js          sintomas e histórico clínico dos bebês
    planner.js             agenda por fase, recorrências e avisos
    diapers.js             trocas com urina, fezes e frequência diária
    sleep.js               sono noturno, cochilos, médias e dicas contextuais
    vaccines.js            vacinas marcadas e tomadas por bebê
    content.js             conteúdo editorial padrão: sugestões, artigos, FAQ
    cms.js                 camada editável: o que o painel publica vence content.js
    icons.js               conjunto de ícones SVG (traço de 1.7 em grade 24)
    ui.js                  toast, bottom sheet, carrossel, gráficos SVG, helpers
    notify.js              central de avisos do sininho (sem push, sem permissão)
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
| `#/home` | Início | Adapta-se à fase: anel do ciclo, semanas de gestação ou idade do bebê; no pós-parto, oferece atalhos para crescimento e vacinas |
| `#/ciclo` | Calendário contextual | Ciclo e fertilidade para Tentantes; status, vacinas e consultas no Florescer Baby |
| `#/adicionar` | Ações do botão central | Tentante escolhe teste ou registro; Gestante escolhe registro, sintoma ou nascimento |
| `#/teste-gravidez` | Teste de gravidez | Salva data e resultado positivo, negativo ou inconclusivo e mantém o histórico recente |
| `#/flor` | IA Flor | Conversa sobre ciclo, menstruação, hormônios e fertilidade; base local offline e, com autorização, resposta da IA |
| `#/acolhimento` | Um minuto com a Flor | Abre sozinha depois de um teste negativo: acolhimento, espaço para desabafo, preparo do próximo ciclo ou silêncio |
| `#/como-voce-esta` | Um momento seu | A pergunta diária da Flor sobre a mãe, com humor, espaço para escrever e uma devolutiva acolhedora |
| `#/momento/:id` | Da Flor para você | A carta da Flor no dia de um momento da jornada: nascimento, primeiros dias, seis meses, um ano |
| `#/jornada` | Minha jornada | Linha do tempo montada sozinha: tentativa, teste positivo, ultrassons, sexo, nascimento, primeiro banho, sorriso, passos |
| `#/materiais` | E-books e materiais | Estante dos PDFs servidos em `/ebooks/`, cadastrados pelo painel |
| `#/relacao` | Registrar Relação | Registro privado de data e proteção, sem exigir o preenchimento do diário completo |
| `#/gestacao-inicio` | Configuração da gestação | DUM/DPP, tipo de gestação, nomes dos bebês e última ultrassonografia |
| `#/diario-gestacional` | Diário Gestacional | Reúne todos os registros da gestação em um documento único e gera o PDF pela impressão do aparelho |
| `#/status-bebe` | Status do bebê | Peso, altura, próxima vacina e próxima consulta, com seleção do bebê |
| `#/crescimento-bebe` | Gráfico de crescimento | Evolução de peso, altura e perímetro cefálico por bebê |
| `#/amamentacao` | Amamentação | Cronômetro da mamada, lado utilizado, extração e estoque de leite |
| `#/fraldas` | Fraldas | Registro de urina e fezes com frequência diária por bebê |
| `#/sono` | Meu sono | Sono noturno, cochilos, total diário, médias e dicas por fase |
| `#/vacinas-bebe` | Vacinas do bebê | Histórico de vacinas marcadas e tomadas, doses e lembretes |
| `#/saude-bebe` | Registro de Saúde | Sintomas, medicamentos, alergias, internações, consultas e exames do bebê |
| `#/agenda` | Novo compromisso | Consultas, pré-natal, ultrassons, exames, vacinas, medicamentos e vitaminas |
| `#/boas-vindas` | Transição de fase | Celebra a entrada no Florescer escolhido e encaminha para a Home |
| `#/registro` | Registro diário | Diário da tentante ou Diário da Mamãe; na gestação guarda humor, emoções, pensamentos, gratidão e fotos |
| `#/registro?s=sintomas` | Controle de Sintomas | Tela separada para sintomas, pressão arterial, peso, glicemia e observações do dia |
| `#/dicas` | Sugestões | Conteúdo escolhido para a fase do ciclo, com favoritos |
| `#/biblioteca`, `#/artigo/:id` | Biblioteca | 8 artigos revisados, com leitura, marcadores e bloqueio Premium |
| `#/comunidade`, `#/post/:id`, `#/novo-post` | Comunidade | Feed com filtros, curtidas, comentários, publicação, denúncia e desafio da semana |
| `#/relatorios` | Relatórios | Duração dos ciclos, curva de temperatura, sintomas frequentes e exportação para consulta |
| `#/perfil` | Perfil | Dados do quiz editáveis, jornada afetiva, acesso à conta |
| `#/premium` | Premium | Vitrine de planos e benefícios; as assinaturas ainda não abriram e a tela não cobra nem libera nada |
| `#/configuracoes` | Configurações | Tema, fase lútea, mudança de fase, backup e exclusão de dados |
| `#/avisos` | Avisos | Central do sininho: o que está esperando por ela, com dispensar e limpar |
| `#/lembretes` | Preferências de avisos | Escolhe quais avisos aparecem no sininho |
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
- **Registrar Relação** salva data e proteção, preserva os outros dados do dia e marca um coração no calendário;
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

No Florescer Baby, o botão `+` oferece **Registrar status do bebê**, **Registrar amamentação**, **Registrar fralda**, **Registro de Saúde** e **Diário da Mamãe**. O status permite:

- selecionar qual bebê será acompanhado quando houver múltiplos nomes;
- registrar peso atual em quilogramas, altura e perímetro cefálico em centímetros;
- informar a próxima vacina, sua data e descrição opcional;
- informar a próxima consulta, sua data e descrição opcional;
- atualizar o mesmo bebê na mesma data sem criar duplicatas.
- visualizar gráficos individuais da evolução de peso, altura e perímetro cefálico.

O **Diário da Mamãe** do pós-parto é diferente do diário gestacional e registra somente humor, emoções/sentimentos, conquistas, gratidão e observações. Sintomas permanecem no Controle de Sintomas, e medidas ou cuidados dos bebês permanecem no Status do bebê.

O registro de **Amamentação** possui cronômetro com iniciar, pausar, continuar e reiniciar; seleção do lado esquerdo, direito ou ambos; volume extraído na sessão; e total do estoque de leite guardado. Cada mamada é preservada como um item independente e pode ser associada a um bebê específico.

O registro de **Fraldas** guarda cada troca com data, horário, urina, fezes e observações opcionais. A frequência diária de trocas, urina e fezes é calculada automaticamente e separada por bebê.

A tela **Vacinas do bebê** reúne vacinas marcadas e tomadas, dose e observações. Agendamentos antigos do Status do bebê aparecem automaticamente e sem duplicação; vacinas marcadas alimentam o calendário e os lembretes do dia anterior e do próprio dia.

O registro de **Sono**, disponível nas três fases pelo botão central, soma sono noturno e cochilos, calcula a média dos sete registros mais recentes e apresenta dicas diferentes para Tentante, Gestação e pós-parto.

O **Registro de Saúde** mantém um histórico separado por bebê, data e horário. Cada entrada pode reunir sintomas, medicamentos administrados, alergias, internações, consultas e exames, sem substituir os registros anteriores.

O calendário muda para **Calendário do bebê** durante o pós-parto. Medidas aparecem no dia do registro; vacinas e consultas aparecem nas datas agendadas, com resumo dos próximos cuidados. Os avisos entram na central do sininho no dia anterior e no próprio dia. Vacinas e consultas possuem controles independentes na tela de preferências.

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
- **Avisos no sininho, sem push.** Veja a seção [Avisos](#avisos) abaixo.
- Agenda inteligente por fase: tentantes organizam consultas, exames e tratamentos; gestantes também recebem pré-natal e ultrassons; no pós-parto entram vacinas e compromissos associados à mãe ou a cada bebê.
- Medicamentos e vitaminas aceitam recorrência diária por até um ano. Cada compromisso pode avisar no mesmo dia, um, dois ou sete dias antes.
- Pequenas conquistas entram na central assim que são desbloqueadas. As mensagens são específicas para Tentante, Gestação e Florescer Baby.
- No Florescer Baby, vacinas e consultas aparecem no aviso do dia anterior e do próprio dia, e levam ao calendário do bebê.

### Pequenas conquistas

O avaliador em `assets/js/achievements.js` é executado sempre que um registro diário ou uma relação é salva. As conquistas são persistidas, adicionadas à jornada e nunca repetidas:

- primeiro registro, 7 registros e 30 registros;
- primeira relação, 5 relações e 10 relações;
- primeiro ciclo completo e 3 ciclos acompanhados.

Conquistas de ciclos e relações são exclusivas da fase Tentante. Marcos de registros usam mensagens próprias para acompanhamento do ciclo, memórias da gestação ou rotina de cuidado no pós-parto.

Um ciclo é considerado completo quando um novo início de menstruação confirma o intervalo do ciclo anterior. A configuração **Avisos › Pequenas conquistas** permite desativar apenas esses avisos, sem remover os marcos da jornada.

---

## Minha jornada

A linha do tempo não pede que ela registre nada de novo: [`assets/js/timeline.js`](assets/js/timeline.js) **reúne sozinho** o que já está espalhado pelo app — início da tentativa, teste positivo, ultrassons já realizados, descoberta do sexo, fotos da barriga (com a semana gestacional de cada uma), nascimento, primeiro banho, sorriso, passos e os demais marcos do bebê.

O módulo só lê: nenhuma função dele escreve no estado. Marcos futuros ficam de fora, datas inválidas são descartadas sem derrubar a tela, e um marco que ela mesma anotou não duplica o automático — o nascimento, por exemplo, declara os apelidos (`nasceu`, `nasceram`, `nascimento`) que o app usa ao registrar o parto, e a comparação tolera um dia de diferença por causa de fuso horário.

Os marcos da mãe têm o mesmo peso visual dos do bebê, e a cor do ponto diz a fase: verde para a tentativa, rosa para a gestação, lilás para o bebê.

Dois marcos novos entraram para fechar a lista pedida: **primeiro banho**, em `DEVELOPMENT_MILESTONES`, e a **descoberta do sexo**, um passo opcional no perfil da gestação que guarda a data em que ela soube (escolher "prefiro deixar surpresa" não cria marco nenhum).

## E-books e materiais

Os PDFs ficam em [`ebooks/`](ebooks/README.md) e são servidos junto com o app em `/ebooks/<arquivo>`. O catálogo — título, resumo, arquivo, páginas, se é exclusivo do Premium e para quais fases aparece — é editado em **Painel da administradora › E-books e materiais**, sem mexer em código.

**O catálogo está vazio de propósito.** Os arquivos foram enviados por WhatsApp e ainda não entraram no repositório; enquanto não entrarem, a tela diz que nada foi publicado em vez de mostrar uma estante falsa. Para publicar: colocar o PDF na pasta, cadastrar no painel, pronto.

Limites conhecidos: o material não entra no cache offline do service worker (precisa de internet na primeira abertura) e ainda não é exportado pelo `cms.toSql()`, porque a tabela correspondente não existe no schema do Supabase.

## Avisos

O Florescer **não usa push nem notificação do sistema, e nunca pede permissão para isso.** Os avisos ficam dentro do app: aparecem no sininho da Home, com a contagem de quantos estão esperando, e abrem em `#/avisos`.

### Por que não há push

Um PWA só entrega push com servidor próprio, chaves VAPID e a permissão do navegador — e, mesmo com tudo isso, o aviso depende de o sistema não ter encerrado o app em segundo plano. Na prática é um lembrete que pode simplesmente não chegar, somado a um pedido de permissão logo no começo do uso. A central interna é o oposto: funciona offline, não depende de autorização nenhuma e nada precisa sair do aparelho.

### Como funciona

A cada abertura (e ao voltar para o app), `syncNotices()` em [`assets/js/notify.js`](assets/js/notify.js) recalcula o que vale para hoje — janela fértil, menstruação prevista para amanhã, dia ainda não registrado, sugestão do dia, vacinas e consultas dos bebês e compromissos da agenda — e guarda só o que ainda não existe. O identificador carrega o dia (`fertile:2026-10-05`), então o mesmo aviso nunca entra duas vezes, por mais vezes que ela abra o app. Avisos com mais de 30 dias saem sozinhos.

Entrar na central marca tudo como lido; cada aviso pode ser dispensado no X, e o ícone da lixeira limpa a lista (o que ainda valer para hoje volta na próxima abertura). O que aparece é escolhido em **Configurações › Avisos**.

## Diário Gestacional

No fim da gestação (a partir da semana 36) e durante todo o pós-parto, a Home oferece o diário; ele também fica permanentemente na Central de Recursos. A tela reúne **tudo o que foi registrado entre a DUM e o nascimento** — humor, emoções, pensamentos, gratidão, observações, sintomas, pressão, peso, glicemia, fotos da barriga e de exames — agrupado por semana gestacional, com capa, resumo em números, marcos da jornada e a lista de consultas, exames e testes.

A montagem dos dados fica em [`assets/js/pregnancyDiary.js`](assets/js/pregnancyDiary.js), separada da apresentação. O recorte vai de `DPP − 280` (a DUM, semana 0) até a data de nascimento, ou até hoje se o bebê ainda não nasceu — registros fora dessa janela não entram, e registros vazios não viram página.

### Por que impressão, e não uma biblioteca de PDF

O botão **Gerar o PDF** chama `window.print()`; a usuária escolhe "Salvar como PDF" na janela do próprio sistema. É um passo a mais do que um download direto, e foi uma troca deliberada:

- o Florescer não tem etapa de build e precisa funcionar offline — uma biblioteca de PDF somaria centenas de KB ao shell do service worker;
- a impressão do navegador entrega texto selecionável e pesquisável; `html2canvas` e similares rasterizam tudo;
- a paginação, as fotos embutidas e as fontes são resolvidas pelo navegador, não por código de layout escrito à mão em coordenadas;
- nada sai do aparelho: não existe servidor de geração de PDF no caminho, e dados de saúde são dado sensível (LGPD, art. 11).

O bloco `@media print` no fim de [`assets/css/app.css`](assets/css/app.css) desmonta a moldura do aparelho (altura fixa, `overflow:hidden`, `position:absolute`) para o documento fluir em páginas A4, esconde a navegação e preserva as cores da marca com `print-color-adjust:exact`. A capa ocupa a primeira página sozinha, o cabeçalho de semana nunca fica órfão no fim de uma página e **nenhum dia é partido entre duas páginas**.

## IA Flor

### A personalidade

A Flor é **uma amiga mais experiente** — não uma médica, não um manual, não uma influenciadora. A missão dela é informar com responsabilidade e acolher com carinho: linguagem simples, gentil e respeitosa, em segunda pessoa, sem infantilizar e sem apelido. Acolhe primeiro, informa depois. E admite quando não sabe.

A definição fica em [`assets/js/florVoice.js`](assets/js/florVoice.js), importado **tanto pelo app quanto por [`api/flor.js`](api/flor.js)**: a personalidade da resposta escrita à mão e a do modelo saem do mesmo arquivo, então não existe uma Flor no conteúdo local e outra na IA.

O que ela **nunca** faz: julgar, prometer, minimizar e mandar relaxar. Essas quatro regras não vivem só no texto — `FLOR_FORBIDDEN` as traduz em expressão regular, e [`tests/flor-voice.test.js`](tests/flor-voice.test.js) varre com elas **todo o conteúdo escrito do app** (base do ciclo, base da gestação, cartas da jornada, mensagens diárias, acolhimento, dicas, artigos, missões, nutrição, pré-natal). Se alguém escrever "vai dar certo", "relaxa que" ou "você deveria ter" num texto novo, a suíte quebra antes de a frase chegar numa mulher que está esperando há dois anos.

### Os momentos da jornada

> O Florescer nasceu para cuidar da mulher que sonha com a maternidade — e essa essência precisa sobreviver até o fim da jornada.

É mais fácil dizer do que sustentar. No pós-parto, todo mundo passa a perguntar do bebê, e um app de maternidade escorrega naturalmente para pesos, percentis e marcos de desenvolvimento. As cartas da Flor existem para segurar o app na essência: elas chegam quando algo acontece, e **falam com ela**.

As três que a Marcele escreveu estão no app palavra por palavra:

| Quando | O que a Flor escreve |
|---|---|
| No dia do nascimento | *Hoje nasceu um bebê, mas também nasce uma mãe. Você não precisa acertar tudo. Seu bebê não precisa de uma mãe perfeita — ele precisa de você.* |
| Nos primeiros dias em casa | *Talvez hoje tenha sido um dia difícil. Talvez você tenha chorado. Talvez esteja cansada. Respire, um dia de cada vez.* |
| Aos seis meses | *Olhe para trás. Veja tudo o que vocês já viveram juntos. Você conseguiu.* |

Em volta delas, [`assets/js/florMoments.js`](assets/js/florMoments.js) cobre o resto da jornada com a mesma voz: uma semana, os quarenta dias, um ano; na gestação, o fim do primeiro trimestre, a metade do caminho, o terceiro trimestre, as 37 semanas e a DPP que passou; e, para quem tenta há mais de um ano, uma carta que diz que a culpa não é dela.

**Cada carta tem uma janela, não um dia exato.** Se ela registrar o nascimento quatro dias depois, a carta do nascimento já passou — mas a dos primeiros dias ainda a alcança. Um teste percorre os 400 primeiros dias de pós-parto e confirma que a sequência não tem buraco. Cada carta é entregue **uma vez só, para sempre**, e ler já conta: sair da tela sem tocar em nada não a traz de volta. As principais entram na jornada do perfil.

No dia de uma carta, a pergunta diária fica de fora — duas mensagens no mesmo dia tirariam o peso das duas.

Três testes guardam a essência: nenhuma carta mede o bebê (peso, gramas, centímetros, percentil), nenhuma compara, e toda carta de pós-parto precisa falar com ela — não com ele.

### A mensagem diária

Todo mundo manda mensagem perguntando do bebê, e quase ninguém pergunta dela. Então uma vez por dia a Flor pergunta — e essa é a única tela do app que não quer dado nenhum:

> **Mamãe, como você está hoje?**
> Essa pergunta pode parecer simples, mas faz toda a diferença. Muitas mães recebem mensagem perguntando do bebê, e quase ninguém pergunta por elas.

A pergunta aparece em três lugares, sempre com o mesmo texto: um cartão no topo da Home, um aviso no sininho e a tela `#/como-voce-esta`. Responder é opcional, "Hoje não, obrigada" não tem custo nenhum, e a pergunta some do dia assim que ela responde ou dispensa — o app não insiste.

[`assets/js/florDaily.js`](assets/js/florDaily.js) guarda as mensagens por fase (gestante, pós-parto e tentante), com uma pergunta âncora para a estreia e variações para os dias seguintes, escolhidas por um hash da data: a mesma o dia inteiro, diferente a cada dia. Quando ela responde, o humor e o texto entram no diário do dia (somando, nunca substituindo) e a Flor devolve uma palavra à altura — humor baixo oferece um caminho (acolhimento, apoio psicológico) em vez de um conselho, e humor alto é guardado sem virar cobrança para amanhã. O texto passa pela mesma rede de sinais de alerta do resto do app, no aparelho.

Ela controla isso em **Configurações › Avisos › Mensagem diária da Flor**.

A Flor responde dúvidas sobre ciclo, menstruação, hormônios e período fértil e, na gestação, sobre consultas, exames, vitaminas, sintomas e parto. São duas camadas, nessa ordem:

1. **Base local** — temas escritos à mão, que funcionam offline e sem custo: o ciclo em [`assets/js/florAssistant.js`](assets/js/florAssistant.js) e a gestação em [`assets/js/florPregnancy.js`](assets/js/florPregnancy.js). Antes de qualquer coisa, a pergunta passa por uma lista de sinais de alerta (pensamentos de se machucar, sangramento intenso, dor forte, movimento reduzido do bebê, sinais de pré-eclâmpsia, trabalho de parto prematuro): nesses casos a resposta é sempre local, orienta procurar atendimento no mesmo dia e **nunca sai do aparelho**.
2. **Modelo de linguagem** ([`api/flor.js`](api/flor.js)) — só é chamado se a usuária autorizar e se a pergunta não tiver sinal de alerta. Se falhar, cair a rede ou o modelo recusar, o app volta para a resposta local sem mostrar erro.

### A Flor na gestação

Os temas de gestação vivem em [`florPregnancy.js`](assets/js/florPregnancy.js) e cobrem consultas de pré-natal, exames por trimestre, ultrassons, beta-hCG, teste de tolerância à glicose, estreptococo B, vacinas, vitaminas, enjoo, azia, desconfortos da barriga, movimentos do bebê, alimentação, remédios, exercício, peso, sono, sexo, viagens, sinais de trabalho de parto e mala da maternidade.

Três limites estão fixados em teste, não só no texto:

- **explicar para que um exame serve é permitido; dizer o que o resultado dela significa, nunca.** `beta-hcg` e `exames-gestacao` afirmam isso dentro da própria resposta;
- **explicar para que uma vitamina serve é permitido; dizer dose, marca ou duração, nunca.** Um teste varre todas as respostas procurando `mg`, `mcg`, `ml`, `UI` e formas de prescrição;
- **toda resposta clínica devolve a decisão para a equipe.** Um teste percorre cada tema e exige a presença de consulta, equipe, médico, maternidade, profissional ou laboratório — a única exceção é `gestacao-semana`, que só conta as semanas.

A base também desempata por fase: "cólica" responde cólica menstrual para quem está tentando e desconfortos do útero crescendo para quem está grávida. Isso vem de um peso em `askFlor` (`phaseBonus`), não de listas separadas de busca.

### Personalização

[`florProfile.js`](assets/js/florProfile.js) monta, a cada interação, um retrato dela a partir do que o app já guardou: fase, semana e trimestre da gestação, situação de cada etapa do pré-natal (atrasada, na janela, agendada, feita), sintomas e emoções mais registrados, se ela escreve no diário, o objetivo escolhido no cadastro, há quanto tempo tenta, quantos artigos leu e sobre quais temas, e o assunto da última resposta.

Isso muda, na prática:

- **a abertura da conversa** — um convite que aponta o que mais importa hoje (uma etapa de pré-natal fora da janela, a reta final, a janela fértil em curso);
- **as perguntas sugeridas** — o bloco do trimestre em vez de uma lista fixa, com a etapa atrasada entrando na frente;
- **o encadeamento** — a Flor não sugere de volta o assunto que acabou de responder;
- **as respostas** — consultas, exames e ultrassons citam a etapa real dela, incluindo o que já está agendado e para quando.

**O que a IA recebe é menos do que isso, de propósito.** Para o servidor vão apenas a pergunta, até 6 mensagens anteriores e o resumo em números — na gestação, semana, dia, trimestre, DPP e se é gestação múltipla. Sintomas, diário, humor, leituras, objetivos e nome continuam só no aparelho: a personalização que usa dado sensível acontece em `florProfile.js`, offline, e o resultado dela nunca é enviado.

### Configurar o backend

O endpoint roda como função serverless na Vercel e usa a API da OpenAI.

1. Instalar as dependências: `npm install`.
2. Comprar crédito em [platform.openai.com › Billing](https://platform.openai.com/settings/organization/billing/overview) (mínimo US$ 5) e criar a chave em [API keys](https://platform.openai.com/api-keys). A assinatura do ChatGPT **não** dá acesso à API — são produtos separados.
3. Guardar a chave como variável de ambiente na Vercel (Settings › Environment Variables), com o nome `OPENAI_API_KEY`. Localmente, um arquivo `.env.local` na raiz com `OPENAI_API_KEY=sk-...`.
4. Rodar com a função ativa: `npm run dev:api` (o `npm run dev` serve só os arquivos estáticos e a IA fica indisponível).

| Variável | Obrigatória | Padrão | Para quê |
| --- | --- | --- | --- |
| `OPENAI_API_KEY` | sim | — | chave da API; sem ela o endpoint responde `503 ia_indisponivel` e o app usa só a base local |
| `FLOR_MODEL` | não | `gpt-5-mini` | trocar de modelo sem mexer no código (`gpt-5.1` dá respostas mais elaboradas e custa ~8x mais) |

**Custo.** Cada pergunta manda ~900 tokens de entrada e recebe ~200 de saída. Com `gpt-5-mini` (US$ 0,25 / US$ 2,00 por milhão de tokens) isso dá cerca de US$ 0,0006 por pergunta — aproximadamente 7 mil perguntas em US$ 5. Vale definir um limite de gasto mensal no painel da OpenAI e deixar o *auto recharge* desligado.

### O que sai do aparelho

Quando a IA está ativa, o pedido leva **apenas**:

- o texto da pergunta (máximo 500 caracteres);
- até 6 mensagens anteriores da conversa;
- um resumo numérico: para quem está tentando, fase, dia do ciclo, média e datas estimadas de ovulação, janela fértil e próxima menstruação; na gestação, semana, dia, trimestre, data provável do parto e se é gestação múltipla.

Nunca saem nome, registros do diário, sintomas, humor, fotos, medidas dos bebês ou qualquer outro dado do `localStorage`. O resumo é montado em [`assets/js/florClient.js`](assets/js/florClient.js) e revalidado no servidor por `describeCycle`, que descarta tudo que não seja número ou data real — uma data como `2026-13-45` ou um texto injetado no lugar do dia do ciclo não chega ao modelo.

A chave da API existe só no ambiente do servidor; o PWA nunca a enxerga. O service worker ignora `/api/` de propósito: resposta de IA em cache viraria resposta errada depois.

### Acolhimento depois de um teste negativo

Registrar um resultado negativo não devolve mais a usuária à Home com um toast: o app abre `#/acolhimento`, onde a Flor fala primeiro e só então oferece quatro caminhos — ser acolhida, escrever o que está sentindo, preparar o próximo ciclo ou ficar em silêncio. Nenhum deles exige uma ação para terminar.

O texto e as contas ficam em [`assets/js/comfort.js`](assets/js/comfort.js), fora da tela, para poderem ser revisados e testados. As regras de conteúdo estão fixadas em [`tests/comfort.test.js`](tests/comfort.test.js): a Flor não promete resultado, não culpa a usuária, não manda relaxar e não indica suplemento — o ácido fólico, por exemplo, é sempre encaminhado ao médico.

O desabafo é somado às observações do dia, sem apagar o que já estava lá, e passa pela mesma lista de sinais de alerta da Flor antes de ser guardado. Se aparecer um sinal, a tela mostra na hora o encaminhamento ao CVV (188) — tudo no aparelho, sem enviar nada ao servidor. Um negativo antigo também continua acessível: no histórico de testes, os negativos são tocáveis e reabrem esta tela.

### Limites do prompt

O prompt do sistema proíbe diagnóstico, indicação de medicamento ou dose, interpretação de exame e afirmações do tipo "você está grávida". Limita a resposta a 120 palavras, exige português do Brasil e manda deixar claro quando algo é estimativa. O endpoint ainda aplica um limite de 12 perguntas por minuto por IP, por instância da função.

---

## Dados e privacidade

Hoje o app é local. O schema-base planejado para o Supabase (tabelas, RLS, funções de ciclo e conteúdo editorial) está em [`supabase/`](supabase/README.md). Ainda faltam a camada de autenticação, a troca do `store.js` e a modelagem dos novos dados descritos abaixo.

- Tudo é gravado em `localStorage`, na chave `florescer:v1`.
- O perfil inclui fase, DUM, DPP, tipo de gestação, nomes dos bebês, ultrassonografia opcional e data do nascimento.
- Testes de gravidez ficam em `pregnancyTests`; registros diários continuam em `logs`, identificados por `YYYY-MM-DD`.
- Relações usam o campo `intercourse` do próprio registro diário; por isso, o atalho e o calendário nunca substituem humor, fluxo ou observações já existentes.
- Conquistas desbloqueadas ficam em `achievements` e também aparecem na jornada do perfil.
- Medidas e cuidados dos bebês ficam em `babyStatus`, separados por bebê e data, e originam os eventos do calendário.
- Mamadas, extrações e estoque ficam em `breastfeedingLogs`, em ordem cronológica.
- Informações clínicas dos bebês ficam em `babyHealthRecords`, preservadas como eventos independentes.
- Compromissos e tratamentos ficam em `calendarEvents`, com fase, categoria, pessoa, recorrência e antecedência do lembrete.
- Trocas de fralda ficam em `diaperLogs`, permitindo calcular a frequência diária por bebê.
- Sono noturno, cochilos e totais diários ficam em `sleepLogs`.
- Vacinas marcadas e tomadas ficam em `babyVaccines`; agendamentos antigos em `babyStatus` continuam compatíveis.
- Fotos da ultrassonografia, barriga e exames são comprimidas como JPEG antes de serem armazenadas localmente.
- **Exportar** gera um `.json` completo; **Importar** restaura em qualquer aparelho; **Apagar tudo** remove de forma definitiva (Configurações › Privacidade e dados).
- Não há analytics, rastreamento ou contas. A única requisição que sai do dispositivo é a pergunta para a IA Flor, e só depois de a usuária autorizar — o que vai nela está detalhado na seção [IA Flor](#ia-flor).
- A comunidade mostra apenas as publicações da própria usuária, guardadas neste aparelho. Não há conteúdo semeado nem perfis de exemplo.

---

## Limites conhecidos (para a próxima fase)

- A comunidade só mostra o que a própria usuária escreve: o feed entre pessoas depende de backend e autenticação.
- As assinaturas não estão abertas: a vitrine do Premium existe, a cobrança ainda não. O acesso para testes é liberado no painel da administradora.
- Os avisos não aparecem fora do app: por decisão de projeto, não há push (ver [Avisos](#avisos)).
- O Diário Gestacional já sai em PDF pela impressão do aparelho; o relatório de ciclos para consulta continua em texto.
- Imagens ainda usam `localStorage`; uma galeria maior deverá migrar os arquivos para IndexedDB ou Storage quando o backend for conectado.
- O schema Supabase planejado ainda precisa receber os novos campos de testes, gestação múltipla, nomes e imagens antes da integração com o app local.

---

## Testes

A suíte usa `node:test` e cobre atualmente 92 cenários, incluindo:

- datas, ciclo, janela fértil, gestação e pós-parto;
- cálculo entre DUM e DPP;
- registro de teste positivo e mudança para o Florescer Gestação;
- campos e persistência do perfil gestacional;
- múltiplos nomes e formatação das saudações;
- pluralização da contagem regressiva em gestações múltiplas;
- separação entre Diário da Mamãe e Controle de Sintomas;
- opções contextuais do botão principal para Gestantes;
- opção Registrar Relação para Tentantes e preservação dos dados do dia;
- coração acessível no calendário;
- limiares e deduplicação das pequenas conquistas;
- notificações de conquistas contextualizadas por fase e privacidade das relações;
- registro do nascimento e mudança para o Florescer Baby;
- status individual dos bebês, atualização sem duplicidade e validação das medidas;
- evolução de peso, altura e perímetro cefálico separada por bebê;
- eventos de vacina e consulta no calendário pós-parto;
- mensagens de lembrete para o dia anterior às vacinas e consultas;
- tempo, lado, extração e estoque dos registros de amamentação;
- urina, fezes e frequência diária das trocas de fralda;
- totais, médias e dicas contextuais dos registros de sono;
- histórico, calendário e lembretes das vacinas dos bebês;
- sintomas, medicamentos, alergias, internações, consultas e exames dos bebês;
- categorias por fase, recorrências e notificações da agenda inteligente;
- mensagens de boas-vindas e conteúdo dos registros.

---

O Florescer é uma ferramenta de acompanhamento e educação em saúde. **Não realiza diagnóstico, não substitui consulta médica e não deve ser usado como método contraceptivo.**
