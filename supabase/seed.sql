-- =============================================================
--  Florescer — conteúdo inicial (idempotente: pode rodar de novo)
--  Catálogos, artigos, sugestões, FAQ, diretrizes, desafio e feed de boas-vindas.
-- =============================================================

-- -------------------------------------------------------------
-- Sintomas do registro diário
-- -------------------------------------------------------------
insert into public.symptom_catalog (id, label, sort_order) values
  ('colicas',        'Cólicas',         1),
  ('seios',          'Seios sensíveis', 2),
  ('inchaco',        'Inchaço',         3),
  ('dor_cabeca',     'Dor de cabeça',   4),
  ('acne',           'Acne',            5),
  ('sono',           'Sono',            6),
  ('energia',        'Energia alta',    7),
  ('enjoo',          'Enjoo',           8),
  ('dor_lombar',     'Dor lombar',      9),
  ('tpm',            'TPM',            10),
  ('libido',         'Libido alta',    11),
  ('cansaco',        'Cansaço',        12)
on conflict (id) do update set label = excluded.label, sort_order = excluded.sort_order;

-- -------------------------------------------------------------
-- Artigos da biblioteca
-- -------------------------------------------------------------
insert into public.articles (id, category, title, excerpt, icon, gradient, read_minutes, is_premium, phases, sort_order) values
  ('periodo-fertil', 'Ciclo', 'Como identificar o seu período fértil',
   'Os três sinais que o corpo dá — e como combiná-los para acertar a janela.',
   'leaf', 'var(--grad-leaf)', 6, false, '{tentante}', 1),

  ('alimentacao-fertilidade', 'Nutrição', 'Alimentação e fertilidade: o que a ciência apoia',
   'Nutrientes, padrões alimentares e o que realmente faz diferença antes de engravidar.',
   'leaf', 'var(--grad-leaf)', 7, true, '{tentante}', 2),

  ('ansiedade-espera', 'Bem-estar', 'A espera de duas semanas sem se perder na ansiedade',
   'O que fazer entre a ovulação e o teste, quando cada sintoma vira suspeita.',
   'moon', 'var(--grad-lilac)', 5, false, '{tentante}', 3),

  ('entender-ciclo', 'Ciclo', 'As quatro fases do ciclo menstrual',
   'O que acontece com os hormônios, a energia e o humor em cada etapa.',
   'flower', 'var(--grad-rose)', 5, false, '{tentante,posparto}', 4),

  ('primeiro-trimestre', 'Gestação', 'Primeiro trimestre: o que esperar',
   'Exames, sintomas comuns e sinais que pedem contato com o obstetra.',
   'pregnant', 'var(--grad-rose)', 6, false, '{gravida}', 5),

  ('amamentacao', 'Pós-parto', 'Amamentação nas primeiras semanas',
   'Pega correta, livre demanda e quando procurar um banco de leite.',
   'bottle', 'var(--grad-lilac)', 6, false, '{posparto}', 6),

  ('saude-mental-posparto', 'Pós-parto', 'Baby blues ou depressão pós-parto?',
   'Como diferenciar e por que pedir ajuda cedo muda tudo.',
   'heart', 'var(--grad-lilac)', 5, true, '{posparto}', 7),

  ('quando-procurar-especialista', 'Ciclo', 'Quando procurar um especialista em fertilidade',
   'Os prazos aceitos pelas sociedades médicas e os sinais que antecipam a consulta.',
   'shield', 'var(--grad-rose)', 4, false, '{tentante}', 8)
on conflict (id) do update set
  category = excluded.category, title = excluded.title, excerpt = excluded.excerpt,
  icon = excluded.icon, gradient = excluded.gradient, read_minutes = excluded.read_minutes,
  is_premium = excluded.is_premium, phases = excluded.phases, sort_order = excluded.sort_order;

insert into public.article_contents (article_id, body) values
('periodo-fertil', $json$[
  ["p","A janela fértil são os cinco dias antes da ovulação mais o dia dela e o seguinte. Os espermatozoides sobrevivem até cinco dias no corpo; o óvulo, cerca de 24 horas. Por isso a chance de gravidez começa antes da ovulação, não depois."],
  ["h2","1. Muco cervical"],
  ["p","É o sinal mais acessível e não custa nada. Ao longo do ciclo o muco muda de seco para pegajoso, depois cremoso, aquoso e finalmente elástico e transparente, parecido com clara de ovo. Esse último é o muco fértil: ele nutre e transporta os espermatozoides."],
  ["h2","2. Temperatura basal"],
  ["p","Medida ao acordar, antes de qualquer atividade, sempre no mesmo horário. Depois da ovulação ela sobe entre 0,2 e 0,5 °C e permanece alta até a menstruação. Atenção: a temperatura confirma que a ovulação aconteceu, ela não avisa antes. Serve para entender o padrão dos seus ciclos."],
  ["h2","3. Teste de ovulação"],
  ["p","Detecta o pico do hormônio LH, que antecede a ovulação em 24 a 36 horas. Faça entre 10h e 20h, com pelo menos duas horas sem urinar. Comece alguns dias antes da ovulação estimada pelo app."],
  ["h2","Juntando tudo"],
  ["li","Muco tipo clara de ovo mais teste positivo indicam os melhores dias para tentar."],
  ["li","Relações a cada 1 ou 2 dias durante a janela, sem transformar em obrigação."],
  ["li","Registre tudo no app: com 3 ciclos as previsões já ficam bem mais precisas."],
  ["note","Se você tem menos de 35 anos e está há mais de 12 meses tentando (ou mais de 6 meses, acima de 35), procure um especialista em reprodução humana."]
]$json$::jsonb),

('alimentacao-fertilidade', $json$[
  ["p","Não existe alimento mágico, mas existe padrão alimentar associado a melhores desfechos: mais vegetais, grãos integrais, gorduras boas e proteínas variadas; menos ultraprocessados, açúcar e gordura trans."],
  ["h2","Ácido fólico"],
  ["p","A recomendação é iniciar a suplementação pelo menos um a três meses antes de engravidar, porque o tubo neural do bebê se fecha nas primeiras semanas, muitas vezes antes de a gravidez ser descoberta. A dose certa é indicada pelo seu médico."],
  ["h2","Ferro, cálcio e vitamina D"],
  ["li","Ferro: carnes, feijão, lentilha e folhas escuras, sempre com vitamina C junto."],
  ["li","Cálcio: laticínios, gergelim, brócolis e tofu."],
  ["li","Vitamina D: exposição solar orientada e dosagem no exame de sangue."],
  ["h2","Cafeína e álcool"],
  ["p","Estudos sugerem manter a cafeína abaixo de 200 mg por dia (cerca de duas xícaras de café) e evitar o álcool no período de tentativa."],
  ["note","Este conteúdo é educativo. Ajustes de dieta e suplementos devem ser feitos com nutricionista ou médico."]
]$json$::jsonb),

('ansiedade-espera', $json$[
  ["p","O período entre a ovulação e o dia do teste é conhecido como espera de duas semanas. É a fase em que a ansiedade costuma aparecer com mais força, porque os sintomas iniciais da gravidez e da TPM são praticamente os mesmos."],
  ["h2","Combine uma data para testar"],
  ["p","Testar cedo demais gera resultados falsos negativos e frustração. O ideal é esperar o primeiro dia de atraso. Marque a data no app e trate-a como um compromisso com você."],
  ["h2","Três práticas simples"],
  ["li","Respiração 4-7-8, três rodadas, sempre que a espiral de pensamento começar."],
  ["li","Movimento leve diário: 20 minutos de caminhada mudam o humor e o sono."],
  ["li","Reduza a busca por sintomas na internet a uma vez por dia, em horário definido."],
  ["h2","Quando pedir ajuda"],
  ["p","Se a ansiedade atrapalha o sono, o trabalho ou a relação, psicoterapia faz diferença real. Buscar apoio faz parte do cuidado com a fertilidade, não é exagero."]
]$json$::jsonb),

('entender-ciclo', $json$[
  ["p","O ciclo começa no primeiro dia da menstruação e termina no dia anterior à menstruação seguinte. A duração típica vai de 21 a 35 dias."],
  ["h2","Menstrual (dias 1 a 5)"],
  ["p","O endométrio descama. Energia mais baixa, possível cólica. É a fase de acolher o próprio ritmo."],
  ["h2","Folicular (dias 6 a 13)"],
  ["p","O estrogênio sobe e os folículos amadurecem. Disposição, humor e libido tendem a melhorar."],
  ["h2","Ovulatória (por volta do dia 14)"],
  ["p","O pico de LH libera o óvulo. É a fase de maior fertilidade, com muco elástico e transparente."],
  ["h2","Lútea (dias 15 a 28)"],
  ["p","A progesterona domina e prepara o útero. Se não houver implantação, ela cai e a menstruação vem. Sintomas de TPM aparecem aqui."]
]$json$::jsonb),

('primeiro-trimestre', $json$[
  ["p","As primeiras 13 semanas concentram a formação dos órgãos do bebê e boa parte dos sintomas mais intensos da gestação."],
  ["h2","Sintomas comuns"],
  ["li","Enjoo e sensibilidade a cheiros, especialmente pela manhã."],
  ["li","Sono e cansaço fora do comum: o corpo está trabalhando muito."],
  ["li","Seios doloridos e vontade frequente de urinar."],
  ["h2","Consultas e exames"],
  ["p","A primeira consulta idealmente acontece até a 8ª semana, com exames de sangue, tipagem, sorologias e a primeira ultrassonografia para datar a gestação."],
  ["note","Procure atendimento imediato em caso de sangramento com cólica forte, febre alta ou dor abdominal intensa."]
]$json$::jsonb),

('amamentacao', $json$[
  ["p","A amamentação é aprendida, por você e pelo bebê. Dor persistente e fissuras quase sempre indicam problema de pega, e não peito fraco."],
  ["h2","Sinais de pega correta"],
  ["li","Boca bem aberta, abocanhando também a aréola, não só o mamilo."],
  ["li","Queixo encostado na mama e lábio inferior virado para fora."],
  ["li","Deglutição audível e ritmada, sem estalos."],
  ["h2","Livre demanda"],
  ["p","Nas primeiras semanas o bebê mama de 8 a 12 vezes por dia. A produção funciona por estímulo: quanto mais ele mama, mais leite o corpo produz."],
  ["note","Bancos de leite humano oferecem orientação gratuita. Procure o mais próximo se a dor não passar ou se houver dúvida sobre o ganho de peso do bebê."]
]$json$::jsonb),

('saude-mental-posparto', $json$[
  ["p","Cerca de 8 em cada 10 mulheres sentem tristeza, choro fácil e irritabilidade nos primeiros dias após o parto. Isso é o baby blues, ligado à queda hormonal, e costuma passar em até duas semanas."],
  ["h2","Quando é mais que blues"],
  ["li","Sintomas que passam de duas semanas ou pioram com o tempo."],
  ["li","Desinteresse pelo bebê, culpa intensa ou sensação de incapacidade."],
  ["li","Alterações importantes de sono e apetite além do esperado com recém-nascido."],
  ["h2","O que fazer"],
  ["p","Fale com o obstetra ou com a equipe da maternidade. Depressão pós-parto tem tratamento eficaz, inclusive compatível com a amamentação. Contar para alguém de confiança é o primeiro passo."],
  ["note","Em caso de pensamentos de morte ou de machucar a si mesma ou ao bebê, procure ajuda imediatamente. No Brasil, o CVV atende pelo 188, 24 horas."]
]$json$::jsonb),

('quando-procurar-especialista', $json$[
  ["p","A recomendação geral é investigar após 12 meses de tentativas sem sucesso para mulheres com menos de 35 anos, e após 6 meses a partir dos 35."],
  ["h2","Antecipe a consulta se"],
  ["li","Seus ciclos são muito irregulares ou ausentes."],
  ["li","Você tem diagnóstico de endometriose, SOP ou já fez cirurgia pélvica."],
  ["li","Houve dois ou mais abortos espontâneos."],
  ["li","Há histórico de tratamento oncológico ou doença da tireoide."],
  ["h2","O que levar"],
  ["p","Leve o histórico dos seus ciclos. O relatório do Florescer pode ser exportado e mostrado na consulta: dados de vários meses ajudam muito o especialista."]
]$json$::jsonb)
on conflict (article_id) do update set body = excluded.body;

-- -------------------------------------------------------------
-- Sugestões diárias
-- -------------------------------------------------------------
insert into public.tips (category, body, phases, cycle_phases) values
  ('bem', 'Menstruação pede menos cobrança. Bolsa de água morna no abdômen e um alongamento leve ajudam mais que qualquer meta de produtividade hoje.', '{"tentante"}', '{"menstrual"}'),
  ('nutri', 'Nesta fase o ferro cai. Feijão, lentilha e folhas escuras com um pouco de vitamina C (limão, laranja) melhoram a absorção.', '{"tentante"}', '{"menstrual"}'),
  ('bem', 'Registrar o fluxo dos primeiros dias é o que mais melhora a precisão das previsões. Dois toques e pronto.', '{"tentante"}', '{"menstrual"}'),
  ('bem', 'A energia costuma subir agora. É um bom momento para retomar o exercício que você gosta — sem exageros.', '{"tentante"}', '{"follicular"}'),
  ('nutri', 'Gorduras boas (abacate, azeite, castanhas) participam da produção hormonal. Meia unidade de abacate por dia já é um ótimo começo.', '{"tentante"}', '{"follicular"}'),
  ('fert', 'Você está na janela fértil. Relações a cada 1 ou 2 dias nesse período são a recomendação mais comum — e tiram o peso do "dia certo".', '{"tentante"}', '{"fertile"}'),
  ('fert', 'Muco com aparência de clara de ovo é um dos sinais mais confiáveis de fertilidade. Se aparecer, registre: entra na sua análise de padrões.', '{"tentante"}', '{"fertile"}'),
  ('bem', 'Na janela fértil, o descanso importa tanto quanto a tentativa. Um chá morno e dormir 30 minutos mais cedo já muda o seu dia.', '{"tentante"}', '{"fertile"}'),
  ('fert', 'Dia estimado da ovulação. A temperatura basal costuma subir de 0,2 a 0,5 °C só depois que ela acontece — por isso ela confirma, não antecipa.', '{"tentante"}', '{"ovulation"}'),
  ('bem', 'A espera entre a ovulação e o teste é a parte mais difícil. Combine com você mesma uma data para testar e proteja os dias até lá.', '{"tentante"}', '{"luteal"}'),
  ('bem', 'Ansiedade na espera é esperada. Experimente a respiração 4-7-8: inspire por 4s, segure 7s, solte em 8s. Três rodadas.', '{"tentante"}', '{"luteal"}'),
  ('nutri', 'Se a TPM aperta, reduza cafeína e ultraprocessados nesta semana e aumente magnésio: banana, aveia, sementes de abóbora.', '{"tentante"}', '{"luteal"}'),
  ('nutri', 'Ácido fólico antes da gestação reduz risco de malformações no bebê. Converse com seu médico sobre a suplementação certa para você.', '{"tentante"}', '{"any"}'),
  ('bem', 'Sono curto altera hormônios do ciclo. Sete a oito horas por noite é uma das mudanças com maior impacto na fertilidade.', '{"tentante"}', '{"any"}'),
  ('fert', 'Meça a temperatura basal sempre no mesmo horário, ao acordar, antes de levantar. É a constância que faz a curva contar a história.', '{"tentante"}', '{"any"}'),
  ('bem', 'Anotar três coisas boas do dia reduz o cortisol — e o cortisol influencia o ciclo. Use o campo de observações do seu registro.', '{"tentante"}', '{"any"}'),
  ('nutri', 'Ômega-3 duas vezes por semana (sardinha, salmão) apoia a qualidade dos óvulos e ajuda a reduzir inflamação.', '{"tentante"}', '{"any"}'),
  ('fert', 'Ciclos entre 21 e 35 dias são considerados regulares. Variações de até 4 dias entre um ciclo e outro são normais.', '{"tentante"}', '{"any"}'),
  ('bem', 'Beba água ao longo do dia: a hidratação ajuda com inchaço, cansaço e contrações de treinamento.', '{"gravida"}', '{"any"}'),
  ('nutri', 'Refeições menores e mais frequentes costumam aliviar o enjoo e a azia da gestação.', '{"gravida"}', '{"any"}'),
  ('bem', 'Caminhadas leves e alongamento liberado pelo seu médico ajudam com sono e dor lombar.', '{"gravida"}', '{"any"}'),
  ('fert', 'Anote as dúvidas que surgirem durante a semana e leve a lista para a consulta — ninguém lembra de tudo na hora.', '{"gravida"}', '{"any"}'),
  ('fert', 'Contar os movimentos do bebê no mesmo horário do dia, a partir do 3º trimestre, é um cuidado simples e valioso.', '{"gravida"}', '{"any"}'),
  ('bem', 'Durma quando o bebê dormir sempre que possível. Não é preguiça: é recuperação.', '{"posparto"}', '{"any"}'),
  ('nutri', 'Amamentar aumenta a necessidade de água e de calorias. Deixe uma garrafa e um lanche por perto na poltrona.', '{"posparto"}', '{"any"}'),
  ('bem', 'Tristeza e choro nas primeiras semanas são comuns. Se durarem mais de duas semanas ou pesarem demais, procure ajuda — isso é cuidado, não fraqueza.', '{"posparto"}', '{"any"}'),
  ('fert', 'A menstruação pode demorar a voltar durante a amamentação, mas a ovulação pode acontecer antes dela. Converse sobre contracepção na consulta.', '{"posparto"}', '{"any"}'),
  ('bem', 'Aceite ajuda concreta: alguém que segure o bebê 40 minutos enquanto você toma banho e come com calma muda o dia.', '{"posparto"}', '{"any"}')
on conflict (body) do update set
  category = excluded.category, phases = excluded.phases,
  cycle_phases = excluded.cycle_phases, active = true;

-- -------------------------------------------------------------
-- Perguntas frequentes
-- -------------------------------------------------------------
delete from public.faq;
insert into public.faq (question, answer, sort_order) values
  ('As previsões do app são exatas?',
   'São estimativas estatísticas com base nos seus registros. Quanto mais ciclos você registrar, mais precisas ficam. Elas não servem como método contraceptivo nem substituem avaliação médica.', 1),
  ('Meus dados ficam seguros?',
   'Seus registros são gravados na sua conta com regras de acesso por linha: nem outras usuárias nem a equipe conseguem ler o seu diário pela aplicação. Dados de saúde são tratados como sensíveis, conforme a LGPD.', 2),
  ('Como faço backup?',
   'Em Configurações › Privacidade e dados, use Exportar meus dados. Um arquivo .json é baixado com todo o seu histórico.', 3),
  ('Posso usar o Florescer como contraceptivo?',
   'Não. O app foi feito para quem quer engravidar ou acompanhar o ciclo. Métodos baseados em calendário têm alta taxa de falha para evitar gravidez.', 4),
  ('Como o app calcula a ovulação?',
   'Usamos a duração média dos seus últimos ciclos e uma fase lútea de 14 dias (ajustável). A janela fértil vai de 5 dias antes da ovulação até 1 dia depois.', 5),
  ('O que acontece se eu mudar de fase?',
   'No perfil você pode mudar entre tentante, grávida e pós-parto a qualquer momento. A tela inicial e o conteúdo se adaptam, e o histórico do ciclo é preservado.', 6);

-- -------------------------------------------------------------
-- Diretrizes da comunidade
-- -------------------------------------------------------------
delete from public.community_rules;
insert into public.community_rules (rule, sort_order) values
  ('Acolhimento em primeiro lugar: aqui ninguém julga a jornada de ninguém.', 1),
  ('Sem indicação de medicamentos, dosagens ou tratamentos.', 2),
  ('Nada de venda de produtos, serviços ou consultas.', 3),
  ('Respeite quem está em luto gestacional: use aviso de conteúdo sensível.', 4);

-- -------------------------------------------------------------
-- Desafio da semana
-- -------------------------------------------------------------
insert into public.challenges (id, title, description, days, active)
values ('11111111-1111-4111-8111-111111111111',
        '7 dias de autocuidado',
        'Um gesto de carinho por você a cada dia. Registre o seu no diário.',
        7, true)
on conflict (id) do update set title = excluded.title, description = excluded.description;

-- -------------------------------------------------------------
-- Feed de boas-vindas (posts editoriais, sem autora real)
-- -------------------------------------------------------------
insert into public.posts (id, user_id, author_name, author_avatar, phase, body, likes_count, is_seed, created_at) values
  ('22222222-2222-4222-8222-000000000001', null, 'Camila S.', '🌻', 'tentante',
   'Positivo no teste de ovulação pela primeira vez em 4 meses acompanhando por aqui! Entender o meu ciclo mudou tudo. 🥹🌿',
   86, true, now() - interval '1 hour'),
  ('22222222-2222-4222-8222-000000000002', null, 'Renata M.', '🤰', 'gravida',
   'Meninas, depois de 1 ano e 2 meses de tentativas... estou grávida! Não desistam. Cada ciclo é um recomeço. 💛',
   342, true, now() - interval '3 hours'),
  ('22222222-2222-4222-8222-000000000003', null, 'Aline B.', '🌷', 'tentante',
   'A dica de ontem sobre temperatura basal me fez finalmente entender o meu gráfico. Alguém mais mede todo dia às 6h? 😅',
   54, true, now() - interval '5 hours'),
  ('22222222-2222-4222-8222-000000000004', null, 'Paty L.', '🍼', 'posparto',
   '3 meses da Cecília hoje! Para quem está na madrugada amamentando: passa. E vale cada segundo. 🫶',
   198, true, now() - interval '8 hours'),
  ('22222222-2222-4222-8222-000000000005', null, 'Júlia R.', '🌸', 'tentante',
   'Ciclo 7 acompanhando aqui. Ainda sem positivo, mas hoje quero registrar outra coisa: aprendi a não me culpar. Isso também é avanço.',
   121, true, now() - interval '26 hours')
on conflict (id) do nothing;

insert into public.comments (id, post_id, user_id, author_name, author_avatar, body, created_at) values
  ('33333333-3333-4333-8333-000000000001', '22222222-2222-4222-8222-000000000001', null, 'Renata M.', '🤰',
   'Que notícia boa, Camila! Torcendo muito por você 💛', now() - interval '40 minutes'),
  ('33333333-3333-4333-8333-000000000002', '22222222-2222-4222-8222-000000000001', null, 'Aline B.', '🌷',
   'Você usou o teste em qual horário? Ainda me perco nisso.', now() - interval '20 minutes'),
  ('33333333-3333-4333-8333-000000000003', '22222222-2222-4222-8222-000000000002', null, 'Paty L.', '🍼',
   'Chorei aqui lendo. Felicidades!! 🫶', now() - interval '2 hours')
on conflict (id) do nothing;

-- os contadores dos posts semeados são acertados pelos triggers dos comentários
update public.posts p
   set comments_count = (select count(*) from public.comments c where c.post_id = p.id)
 where p.is_seed;
