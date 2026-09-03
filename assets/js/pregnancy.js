/**
 * Guia educativo semanal da gestação.
 * Comprimento e peso são aproximações populacionais, não medidas clínicas.
 * Referências editoriais: guia semana a semana do NHS, INTERGROWTH-21st e
 * Linha de Cuidado do Pré-natal de Baixo Risco do Ministério da Saúde.
 */

const GROWTH = [
  [4, .2, 0, 'semente de morango', '🍓'], [5, .3, 0, 'semente de maçã', '🍎'],
  [6, .6, 0, 'grão de romã', '🍎'], [7, 1, 0, 'mirtilo', '🫐'],
  [8, 1.6, 1, 'framboesa', '🍓'], [9, 2.3, 2, 'cereja', '🍒'],
  [10, 3.1, 4, 'morango', '🍓'], [11, 4.1, 7, 'figo', '🍈'],
  [12, 5.4, 14, 'limão', '🍋'], [13, 7.4, 23, 'pêssego', '🍑'],
  [14, 8.5, 43, 'nectarina', '🍑'], [15, 10.1, 70, 'maçã', '🍎'],
  [16, 11.6, 100, 'abacate', '🥑'], [17, 13, 140, 'pera', '🍐'],
  [18, 14.2, 190, 'maracujá', '🍋'], [19, 15.3, 240, 'manga', '🥭'],
  [20, 25.6, 300, 'banana', '🍌'], [21, 26.7, 360, 'romã', '🍎'],
  [22, 27.8, 430, 'mamão pequeno', '🍈'], [23, 28.9, 500, 'toranja', '🍊'],
  [24, 30, 600, 'melão pequeno', '🍈'], [25, 34.6, 660, 'mamão', '🍈'],
  [26, 35.6, 760, 'coco', '🥥'], [27, 36.6, 875, 'mamão', '🍈'],
  [28, 37.6, 1005, 'abacaxi pequeno', '🍍'], [29, 38.6, 1153, 'melão médio', '🍈'],
  [30, 39.9, 1319, 'coco grande', '🥥'], [31, 41.1, 1502, 'abacaxi', '🍍'],
  [32, 42.4, 1702, 'melão', '🍈'], [33, 43.7, 1918, 'abacaxi', '🍍'],
  [34, 45, 2146, 'melão cantalupo', '🍈'], [35, 46.2, 2383, 'melão amarelo', '🍈'],
  [36, 47.4, 2622, 'mamão grande', '🍈'], [37, 48.6, 2859, 'jaca pequena', '🍈'],
  [38, 49.8, 3083, 'melão grande', '🍈'], [39, 50.7, 3288, 'melancia pequena', '🍉'],
  [40, 51.2, 3462, 'melancia', '🍉'],
];

const MILESTONES = [
  [5, 'O tubo neural e as estruturas que darão origem ao coração estão começando a se formar.', 'Os hormônios podem trazer sono, seios sensíveis e mais vontade de urinar.', 'Inicie o pré-natal e confirme com sua equipe a suplementação indicada para você.'],
  [7, 'Cérebro, medula, coração, fígado e rins avançam rapidamente; os brotos dos membros aparecem.', 'Enjoo, cansaço, sensibilidade a cheiros e oscilações de humor são comuns.', 'Faça refeições menores ao longo do dia e mantenha água por perto.'],
  [9, 'Braços, pernas, dedos e traços do rosto ganham definição enquanto os órgãos continuam se formando.', 'O útero cresce, mesmo que a barriga ainda quase não apareça; o enjoo pode estar mais intenso.', 'Descanse quando puder e não use medicamentos sem orientação profissional.'],
  [11, 'Os principais órgãos estão formados e entram em uma longa fase de crescimento e amadurecimento.', 'O volume de sangue aumenta e podem surgir tontura, calor e constipação.', 'Levante-se devagar, priorize fibras e leve seus sintomas para a consulta.'],
  [13, 'Rins já produzem urina, reflexos se desenvolvem e órgãos reprodutivos continuam a diferenciação.', 'A placenta assume a produção hormonal e o enjoo pode começar a diminuir.', 'Retome atividades leves somente conforme a orientação da sua equipe de pré-natal.'],
  [15, 'Fígado e baço trabalham, as articulações se movem e os músculos do rosto ficam mais ativos.', 'A barriga começa a aparecer; gengivas sensíveis e nariz congestionado podem ocorrer.', 'Cuide da saúde bucal e avise o dentista de que está gestante.'],
  [17, 'O sistema nervoso coordena movimentos, os ossos endurecem e a audição começa a se desenvolver.', 'O crescimento do útero pode causar desconforto nos ligamentos laterais da barriga.', 'Mude de posição com calma e converse com a equipe se a dor for forte ou persistente.'],
  [19, 'Conexões cerebrais dos sentidos avançam e os pulmões formam estruturas respiratórias.', 'Você pode perceber os primeiros movimentos, além de dor lombar e alterações na pele.', 'Observe os movimentos sem comparar com outras gestações: cada bebê tem seu ritmo.'],
  [21, 'O sistema digestivo pratica a deglutição e o exame morfológico consegue observar os principais órgãos.', 'Os movimentos tendem a ficar mais claros e o centro de gravidade começa a mudar.', 'Anote perguntas para o ultrassom morfológico e para a próxima consulta.'],
  [23, 'Pulmões formam vasos e iniciam a produção de substâncias importantes para respirar após o nascimento.', 'Azia, cãibras, calor e contrações de treinamento podem aparecer.', 'Alongamentos leves e boa hidratação podem ajudar, se estiverem liberados para você.'],
  [25, 'Ouvido interno amadurece, pálpebras se definem e pulmões seguem em intenso desenvolvimento.', 'O peso da barriga pode aumentar o desconforto nas costas, costelas e pelve.', 'Alterne posições e use apoio para dormir de forma confortável.'],
  [27, 'Cérebro e pulmões amadurecem rapidamente; os olhos podem abrir e responder à luz.', 'Sono fragmentado, inchaço leve e falta de ar aos esforços podem surgir.', 'Observe inchaço súbito, dor de cabeça forte ou alteração visual e procure avaliação.'],
  [29, 'O cérebro forma novos sulcos, a medula produz células do sangue e os pulmões continuam amadurecendo.', 'Azia, dor nas costas e cansaço podem aumentar com o início do terceiro trimestre.', 'Reserve pausas no dia e mantenha o calendário de consultas do terceiro trimestre.'],
  [31, 'A maioria dos órgãos funciona, enquanto cérebro e pulmões ainda precisam amadurecer e o bebê ganha gordura.', 'A barriga maior pode dificultar o sono e causar mais pressão na bexiga.', 'Experimente uma rotina de desaceleração antes de dormir e apoios entre as pernas.'],
  [33, 'Anticorpos passam pela placenta e os ossos endurecem, embora o crânio permaneça flexível para o parto.', 'Falta de ar, refluxo e inchaço leve podem ficar mais presentes.', 'Comece a organizar documentos, rede de apoio e itens essenciais para a maternidade.'],
  [35, 'Rins estão maduros e os pulmões se aproximam da maturidade; o ganho de gordura acelera.', 'Pode haver pressão pélvica, cansaço e contrações de treinamento mais perceptíveis.', 'Converse sobre plano de parto e sinais que indicam quando procurar a maternidade.'],
  [37, 'O bebê pratica sugar, engolir e respirar; os pulmões estão quase maduros.', 'Quando o bebê desce, respirar pode ficar mais fácil, mas a vontade de urinar aumenta.', 'Deixe contatos e trajeto da maternidade acessíveis e mantenha as consultas semanais.'],
  [40, 'Os órgãos estão preparados para a vida fora do útero, embora cérebro e pulmões continuem se desenvolvendo.', 'Pressão pélvica, contrações e mudanças no corrimento podem indicar aproximação do parto.', 'Siga as orientações da sua maternidade sobre contrações, perda de líquido e movimentos do bebê.'],
];

const MATERNAL_CHANGES = [
  {
    until: 6,
    symptoms: 'Seios sensíveis, sono, cansaço e vontade frequente de urinar podem surgir. Algumas gestantes ainda não sentem nada.',
    hormones: 'Após a implantação, o hCG começa a aumentar. Progesterona e estrogênio ajudam a manter o endométrio e apoiam o início da formação da placenta.',
    belly: 'O útero ainda fica protegido dentro da pelve. Em geral não há barriga de gestante visível; o que pode aparecer é um leve inchaço abdominal.',
  },
  {
    until: 10,
    symptoms: 'Enjoo, sensibilidade a cheiros, cansaço, azia, mais saliva e oscilações de humor são comuns, com intensidade muito variável.',
    hormones: 'O hCG sobe rapidamente e costuma se aproximar do pico. Progesterona e estrogênio permanecem altos, o que pode contribuir para enjoo, sono e digestão mais lenta.',
    belly: 'O útero está crescendo, mas continua principalmente dentro da pelve. Roupas podem apertar por inchaço antes de a barriga se tornar evidente.',
  },
  {
    until: 13,
    symptoms: 'Enjoo e cansaço podem começar a aliviar, embora azia, constipação, tontura e sensibilidade nas mamas ainda possam continuar.',
    hormones: 'O hCG tende a estabilizar ou diminuir após o pico. A placenta assume progressivamente a produção de progesterona e estrogênio.',
    belly: 'Perto do fim do trimestre, o útero começa a subir acima da pelve. Uma pequena curva pode aparecer, mas também é normal a barriga quase não mudar.',
  },
  {
    until: 17,
    symptoms: 'Mais disposição, congestão nasal, gengivas sensíveis, aumento do apetite e desconforto leve nos ligamentos laterais podem ocorrer.',
    hormones: 'Progesterona e estrogênio seguem sustentando a gestação. A relaxina deixa ligamentos mais flexíveis, enquanto o volume de sangue continua aumentando.',
    belly: 'O útero já pode ser percebido acima do osso púbico e a barriga tende a ficar mais arredondada. O momento em que ela aparece varia bastante.',
  },
  {
    until: 22,
    symptoms: 'Movimentos do bebê podem começar a ser percebidos. Dor lombar, mudanças na pele, cãibras e maior apetite também são frequentes.',
    hormones: 'Estrogênio e progesterona continuam aumentando. Alterações hormonais e maior circulação podem modificar pele, cabelos, gengivas e secreções.',
    belly: 'O útero cresce em direção ao umbigo e muda aos poucos o centro de gravidade. A barriga fica mais evidente, sem existir um tamanho ou formato ideal.',
  },
  {
    until: 27,
    symptoms: 'Azia, falta de ar leve aos esforços, cãibras, dor nas costas e contrações de treinamento irregulares podem aparecer.',
    hormones: 'Hormônios produzidos pela placenta alteram o uso da glicose para priorizar energia ao bebê. É uma das razões para o rastreamento de diabetes gestacional nesta fase.',
    belly: 'O útero costuma ultrapassar o umbigo. O crescimento pode esticar a pele e aumentar a pressão nas costas, costelas e pelve.',
  },
  {
    until: 32,
    symptoms: 'Sono fragmentado, refluxo, falta de ar leve, pressão na bexiga e inchaço discreto no fim do dia podem se tornar mais presentes.',
    hormones: 'Progesterona ajuda a manter o útero relaxado, mas também torna a digestão mais lenta. Relaxina e mudanças posturais podem aumentar a sensação de instabilidade.',
    belly: 'A barriga cresce para cima e para a frente conforme o bebê ganha peso. Apoios para dormir e mudanças de posição podem trazer mais conforto.',
  },
  {
    until: 36,
    symptoms: 'Cansaço, azia, pressão nas costelas, contrações de treinamento e maior dificuldade para encontrar posição confortável são comuns.',
    hormones: 'Estrogênio, progesterona, relaxina e prolactina participam da preparação para o nascimento e a amamentação. Pode haver saída de colostro, mas sua ausência é normal.',
    belly: 'O útero se aproxima de sua altura máxima e pode pressionar diafragma e estômago. O formato depende da posição do bebê e das características do corpo.',
  },
  {
    until: 40,
    symptoms: 'Pressão pélvica, vontade de urinar, sono leve, corrimento aumentado e contrações irregulares podem ocorrer enquanto o corpo se prepara para o parto.',
    hormones: 'Mudanças graduais em prostaglandinas, estrogênio e receptores de oxitocina ajudam a preparar colo do útero e contrações, mas não permitem prever o dia exato do parto.',
    belly: 'Se o bebê descer para a pelve, a barriga pode parecer mais baixa e respirar pode ficar mais fácil. Isso pode acontecer dias ou semanas antes do parto, ou apenas durante ele.',
  },
];

const BABY_WEEK_DETAILS = [
  [1, 'A contagem da gestação começa', 'Ainda não existe embrião. A idade gestacional começa no primeiro dia da última menstruação para padronizar o acompanhamento.', 'O útero elimina o endométrio do ciclo anterior e já começa a se preparar para um novo ciclo.', 'Por isso a contagem médica costuma começar cerca de duas semanas antes da fecundação.'],
  [2, 'O corpo se prepara para ovular', 'Ainda não há embrião. Nos ovários, folículos amadurecem e um deles geralmente se torna dominante.', 'Perto do fim desta semana, o ovário pode liberar o óvulo que será fecundado.', 'A data exata da ovulação varia, mesmo em ciclos considerados regulares.'],
  [3, 'Fecundação e primeira viagem', 'Se houver fecundação, óvulo e espermatozoide formam uma única célula, que se divide enquanto segue pela trompa em direção ao útero.', 'Esse pequeno conjunto de células já consegue se dividir rapidamente e começa a se organizar em camadas.', 'Os cromossomos que vieram do óvulo e do espermatozoide já reúnem as instruções genéticas do futuro bebê.'],
  [4, 'A implantação está acontecendo', 'O blastocisto se fixa no endométrio. Bolsa amniótica, saco vitelino e estruturas iniciais da placenta começam a se organizar.', 'As células começam a assumir funções diferentes, preparando as bases do corpo e dos tecidos de apoio.', 'É nessa fase que o hCG começa a subir e um teste de gravidez pode se tornar positivo.'],
  [5, 'Coração e sistema nervoso começam', 'O tubo neural, que dará origem ao cérebro e à medula, está se formando. O tubo cardíaco e a placenta também avançam.', 'O embrião cresce muito rápido e começa a estabelecer uma circulação primitiva.', 'Mesmo minúsculo, ele já possui três camadas celulares que darão origem a todos os órgãos.'],
  [6, 'Pequenos brotos aparecem', 'O coração primitivo pulsa, o tubo neural está se fechando e surgem brotos que formarão braços e pernas.', 'Pode fazer movimentos espontâneos muito discretos, ainda impossíveis de serem sentidos.', 'A cabeça parece grande porque o cérebro está se desenvolvendo em ritmo intenso.'],
  [7, 'Cérebro e rosto ganham estrutura', 'Regiões do cérebro se diferenciam; olhos, narinas, boca e ouvido interno começam a tomar forma.', 'Os membros crescem e podem fazer pequenas flexões, ainda sem coordenação.', 'Uma pequena extensão no final da coluna desaparece conforme o corpo se desenvolve.'],
  [8, 'As bases dos órgãos estão presentes', 'Coração, rins, fígado e sistema digestivo continuam se organizando. Dedos começam a se separar, ainda unidos por membranas.', 'O embrião consegue se curvar e realizar movimentos simples dentro da bolsa.', 'As pálpebras começam a se formar e permanecerão fechadas por várias semanas.'],
  [9, 'O corpo fica mais reconhecível', 'Cotovelos, joelhos, dedos e traços do rosto ficam mais definidos. Estruturas reprodutivas internas começam a se diferenciar.', 'Já movimenta braços e pernas e pode levar as mãos em direção ao rosto.', 'A pequena cauda embrionária praticamente desapareceu.'],
  [10, 'Começa o período fetal', 'As estruturas fundamentais dos órgãos estão estabelecidas e entram em fase de crescimento e amadurecimento.', 'Consegue dobrar membros, girar o corpo e abrir a boca, embora você ainda não sinta.', 'A partir desta fase, o termo feto passa a ser usado com mais frequência.'],
  [11, 'Dedos livres e movimentos ativos', 'Dedos das mãos e dos pés estão separados; unhas e folículos de cabelo começam a se desenvolver.', 'Pode se esticar, rolar e engolir pequenas quantidades de líquido amniótico.', 'A cabeça ainda representa quase metade do comprimento do corpo.'],
  [12, 'Reflexos entram em ação', 'Rins começam a produzir urina, intestinos ficam no abdome e medula óssea inicia funções importantes.', 'Abre e fecha as mãos, mexe os dedos e reage ao toque com movimentos reflexos.', 'Os batimentos são muito mais rápidos que os de um adulto.'],
  [13, 'Crescimento e amadurecimento', 'Cordas vocais, ossos e músculos continuam se desenvolvendo; o fígado e o pâncreas já exercem funções iniciais.', 'Faz movimentos de sucção e leva as mãos à boca durante seus ensaios motores.', 'As impressões digitais começam a ganhar padrões próprios.'],
  [14, 'Expressões começam a aparecer', 'Músculos do rosto e pescoço se fortalecem; uma fina camada de pelos, o lanugo, começa a surgir.', 'Pode franzir a testa, fazer caretas, sugar e movimentar os olhos sob as pálpebras.', 'Os movimentos são frequentes no ultrassom, mesmo que ainda não sejam percebidos.'],
  [15, 'O esqueleto fica mais firme', 'Ossos acumulam minerais, couro cabeludo forma padrões de cabelo e o sistema auditivo continua amadurecendo.', 'Move braços e pernas com mais amplitude e pratica movimentos respiratórios com líquido amniótico.', 'Embora os olhos permaneçam fechados, já pode perceber luz intensa através da barriga.'],
  [16, 'Movimentos mais coordenados', 'Músculos, ossos e conexões nervosas trabalham juntos; olhos e orelhas se aproximam da posição final.', 'Consegue segurar o cordão por instantes, chutar, virar e coordenar melhor braços e pernas.', 'Algumas gestantes começam a sentir movimentos como bolhas, mas para muitas isso acontece depois.'],
  [17, 'Proteção para a pele', 'Começam a se formar gordura corporal e vernix, camada protetora que ajudará a cuidar da pele no líquido amniótico.', 'Pratica engolir, sugar e movimentos cada vez mais variados.', 'Sons internos, como coração e digestão da mãe, fazem parte do ambiente sonoro do bebê.'],
  [18, 'Audição em desenvolvimento', 'Ouvido interno e conexões com o cérebro avançam; nervos começam a receber uma camada protetora chamada mielina.', 'Pode bocejar, soluçar, chutar e reagir a vibrações ou sons mais fortes.', 'Soluços podem ser percebidos mais adiante como movimentos pequenos e ritmados.'],
  [19, 'Os sentidos criam conexões', 'Áreas cerebrais ligadas a visão, audição, tato, paladar e olfato se especializam.', 'Alterna períodos de movimento e repouso e explora o espaço ao redor com mãos e pés.', 'A vernix cobre cada vez mais a pele e evita que ela fique constantemente encharcada.'],
  [20, 'Metade do caminho estimado', 'Estruturas observadas no ultrassom morfológico estão mais definidas; sistema digestivo pratica deglutição.', 'Engole líquido amniótico, chuta e pode responder a sons conhecidos.', 'O mecônio, que será a primeira evacuação após o nascimento, começa a se acumular no intestino.'],
  [21, 'Movimentos ficam mais fortes', 'Medula óssea participa da produção de células sanguíneas e o sistema digestivo segue amadurecendo.', 'Faz ciclos de sono e vigília e pode mudar de posição muitas vezes ao dia.', 'O ritmo de atividade do bebê nem sempre acompanha os horários de sono da mãe.'],
  [22, 'Pulmões constroem seus caminhos', 'Vias respiratórias se ramificam; sobrancelhas e pálpebras estão formadas e o pâncreas amadurece.', 'Toca o rosto, segura os pés e responde a sons com mudanças de movimento.', 'A voz da mãe chega ao bebê também pelas vibrações do próprio corpo.'],
  [23, 'Pele e pulmões amadurecem', 'Vasos dos pulmões se desenvolvem e a pele ainda fina começa gradualmente a ganhar mais gordura.', 'Pratica movimentos respiratórios e pode reagir ao toque feito sobre a barriga.', 'Os movimentos respiratórios são treino: o oxigênio ainda chega pela placenta.'],
  [24, 'Novas estruturas respiratórias', 'Pulmões formam estruturas onde ocorrerão trocas gasosas e iniciam produção de surfactante, ainda em pouca quantidade.', 'Pode piscar, soluçar e apresentar respostas mais consistentes a sons.', 'As papilas gustativas funcionam e o líquido amniótico carrega sabores da alimentação materna.'],
  [25, 'Equilíbrio e orientação', 'O sistema vestibular, ligado ao equilíbrio, amadurece; narinas começam a se abrir e pulmões seguem se preparando.', 'Percebe mudanças de posição da mãe e responde a vozes ou ruídos familiares.', 'Movimento durante o dia pode embalar o bebê, que às vezes fica mais ativo quando a mãe repousa.'],
  [26, 'Olhos começam a abrir', 'Retina, cérebro e pulmões avançam; cílios e sobrancelhas estão mais visíveis.', 'Abre os olhos por períodos curtos e alterna momentos mais claros de sono e atividade.', 'A cor dos olhos ainda pode mudar depois do nascimento.'],
  [27, 'Cérebro em rápido crescimento', 'Córtex cerebral cria conexões, pulmões produzem mais surfactante e o sistema nervoso controla melhor o corpo.', 'Reconhece padrões sonoros, chuta com força e pratica sucção e deglutição.', 'Esta semana marca a transição aproximada para o terceiro trimestre.'],
  [28, 'Mais controle dos sentidos', 'O cérebro forma sulcos, medula óssea assume mais produção de sangue e olhos continuam amadurecendo.', 'Pisca, percebe luz, reage a sons e pode mudar a expressão do rosto.', 'O sono já inclui fases diferentes, inclusive períodos parecidos com o sono REM.'],
  [29, 'Músculos ganham força', 'Cérebro, pulmões e músculos amadurecem enquanto uma camada maior de gordura se forma sob a pele.', 'Estica o corpo, dá chutes mais firmes e ajusta a posição quando encontra espaço.', 'Movimentos podem parecer diferentes conforme o espaço diminui, mas devem manter o padrão habitual.'],
  [30, 'Cérebro e sangue amadurecem', 'Medula óssea se torna a principal produtora de glóbulos vermelhos; cérebro ganha novas conexões.', 'Consegue acompanhar luz com os olhos e agarrar estruturas próximas, como o cordão.', 'O lanugo começa a diminuir enquanto a gordura ajuda no controle futuro da temperatura.'],
  [31, 'Todos os sentidos trabalham', 'Conexões cerebrais se multiplicam e pupilas respondem à luz; pulmões ainda seguem amadurecendo.', 'Vira a cabeça, suga o polegar e responde de formas diferentes a luz e sons.', 'O bebê recebe sabores, sons e ritmos do ambiente, mas ainda passa grande parte do tempo dormindo.'],
  [32, 'Ganho de peso acelera', 'Unhas estão formadas, pele fica menos enrugada e sistemas digestivo e respiratório fazem seus ensaios.', 'Pratica respirar, engolir e sugar em sequências mais coordenadas.', 'O espaço menor muda o tipo de movimento: giros amplos podem dar lugar a empurrões e alongamentos.'],
  [33, 'Recebendo proteção materna', 'Anticorpos atravessam a placenta; ossos endurecem, enquanto o crânio permanece flexível para o nascimento.', 'Mantém ciclos de sono, abre e fecha os olhos e pratica movimentos respiratórios.', 'A flexibilidade dos ossos do crânio ajuda a passagem pelo canal de parto e permite crescimento do cérebro.'],
  [34, 'Pulmões perto da maturidade', 'Pulmões e sistema nervoso central avançam; vernix fica mais espessa e gordura corporal aumenta.', 'Aperta as mãos, reage a vozes e coordena melhor sucção e deglutição.', 'As unhas podem chegar às pontas dos dedos antes mesmo do nascimento.'],
  [35, 'Preparação para nascer', 'Rins estão maduros, fígado realiza funções importantes e pulmões se aproximam da maturidade.', 'Treina sucção com força e pode se acomodar com a cabeça voltada para a pelve.', 'A posição pode mudar e só a avaliação profissional confirma como o bebê está apresentado.'],
  [36, 'Ajustando a posição', 'Pulmões seguem produzindo surfactante e o ganho de gordura ajuda a manter a temperatura depois do parto.', 'Engole, suga, respira em treino e faz movimentos fortes dentro do espaço disponível.', 'Muitos bebês estão de cabeça para baixo, mas há variações que a equipe acompanha.'],
  [37, 'Início do período a termo', 'Órgãos estão preparados para continuar a adaptação fora do útero, embora cérebro e pulmões ainda amadureçam.', 'Pratica respirar, piscar, agarrar e procurar com a boca durante movimentos reflexos.', 'A partir desta semana a gestação é considerada a termo inicial, mas cada dia ainda contribui para o amadurecimento.'],
  [38, 'Últimos ajustes', 'Pulmões, cérebro e fígado refinam funções; parte do lanugo e da vernix diminui.', 'Mantém um padrão próprio de sono e movimento e possui reflexo de preensão firme.', 'O intestino guarda mecônio, normalmente eliminado apenas depois do nascimento.'],
  [39, 'Pronto para a adaptação', 'Uma reserva maior de gordura protege o corpo e os órgãos estão preparados para assumir novas funções após o parto.', 'Coordena sucção, deglutição e movimentos respiratórios de treino.', 'Mesmo com pouco espaço, o padrão habitual de movimentos deve continuar sendo percebido.'],
  [40, 'A data prevista chegou', 'Cérebro e pulmões continuam amadurecendo até o nascimento e também depois dele.', 'Responde a sons, luz e toque e mantém reflexos importantes para os primeiros contatos e mamadas.', 'A data provável é uma estimativa: poucos bebês nascem exatamente nesse dia.'],
];

function prenatalStep(week) {
  if (week < 8) return { name: 'Primeira consulta de pré-natal', when: 'O quanto antes', note: 'Avaliação inicial e solicitação dos exames de rotina.' };
  if (week < 11) return { name: 'Exames iniciais e ultrassom de datação', when: 'Entre 8 e 12 semanas', note: 'A agenda depende da avaliação da sua equipe.' };
  if (week < 14) return { name: 'Ultrassom do 1º trimestre', when: 'Entre 11 e 13 semanas + 6 dias', note: 'Converse sobre rastreamento e translucência nucal.' };
  if (week < 18) return { name: 'Consulta de pré-natal', when: 'Até a 28ª semana, em geral mensal', note: 'Revisão de sintomas, pressão, peso e exames.' };
  if (week < 23) return { name: 'Ultrassom morfológico do 2º trimestre', when: 'Em geral entre 18 e 22 semanas', note: 'Avalia estruturas e desenvolvimento fetal.' };
  if (week < 28) return { name: 'Rastreamento de diabetes gestacional', when: 'Em geral entre 24 e 28 semanas', note: 'Pode incluir glicemia ou teste de tolerância, conforme indicação.' };
  if (week < 31) return { name: 'Exames do 3º trimestre', when: 'Por volta de 28 a 30 semanas', note: 'A equipe pode repetir hemograma, sorologias e urocultura.' };
  if (week < 36) return { name: 'Consulta de pré-natal', when: 'Da 28ª à 36ª semana, em geral quinzenal', note: 'A frequência pode mudar conforme cada gestação.' };
  if (week < 37) return { name: 'Avaliação da posição do bebê', when: 'Por volta da 36ª semana', note: 'Também é um bom momento para revisar o plano de parto.' };
  if (week <= 40) return { name: 'Consulta de pré-natal', when: 'No termo, em geral semanal', note: 'Inclui bem-estar materno, movimentos e sinais de trabalho de parto.' };
  return { name: 'Avaliação da gestação prolongada', when: 'Conforme orientação da equipe', note: 'O acompanhamento após a DPP deve ser individualizado.' };
}

const formatLength = (cm) => cm < 1 ? `${Math.round(cm * 10)} mm` : `${String(cm).replace('.', ',')} cm`;
const formatWeight = (g) => g < 1 ? 'menos de 1 g' : g < 1000 ? `${g} g` : `${(g / 1000).toFixed(1).replace('.', ',')} kg`;

export function pregnancyCountdown(daysLeft, multiple = false) {
  const days = Math.trunc(Number(daysLeft));
  const love = multiple ? 'os amores da sua vida' : 'o amor da sua vida';
  if (days > 1) return `Faltam ${days} dias para você conhecer ${love}!`;
  if (days === 1) return `Falta 1 dia para você conhecer ${love}!`;
  if (days === 0) return `Hoje é a data prevista para você conhecer ${love}!`;
  return multiple ? 'A data prevista chegou — seus bebês podem chegar a qualquer momento!' : 'A data prevista chegou — seu bebê pode chegar a qualquer momento!';
}

export function pregnancyWeekGuide(inputWeek) {
  const week = Math.max(4, Math.min(40, Math.floor(Number(inputWeek) || 4)));
  const growth = GROWTH.find((row) => row[0] === week) || GROWTH[0];
  const milestone = MILESTONES.find((row) => week <= row[0]) || MILESTONES.at(-1);
  const maternal = MATERNAL_CHANGES.find((stage) => week <= stage.until) || MATERNAL_CHANGES.at(-1);
  return {
    week,
    fruit: growth[3],
    emoji: growth[4],
    length: formatLength(growth[1]),
    weight: formatWeight(growth[2]),
    development: milestone[1],
    mother: milestone[2],
    symptoms: maternal.symptoms,
    hormones: maternal.hormones,
    belly: maternal.belly,
    tip: milestone[3],
    nextExam: prenatalStep(inputWeek),
  };
}

export function pregnancyBabyWeek(inputWeek) {
  const week = Math.max(1, Math.min(40, Math.floor(Number(inputWeek) || 1)));
  const detail = BABY_WEEK_DETAILS[week - 1];
  const guide = week >= 4 ? pregnancyWeekGuide(week) : null;
  const growth = week <= 2
    ? 'Ainda não há embrião para medir nesta etapa da contagem gestacional.'
    : week === 3
      ? 'O conjunto de células ainda é microscópico e não possui uma medida clínica útil.'
      : `Cerca de ${guide.length} e ${guide.weight}, com tamanho comparado a ${guide.fruit}.`;

  return {
    week,
    title: detail[1],
    organs: detail[2],
    ability: detail[3],
    curiosity: detail[4],
    growth,
    emoji: guide?.emoji || (week === 3 ? '✨' : '🌱'),
  };
}

/** Valida medições informadas pela usuária; não interpreta nem diagnostica resultados. */
export function validateSymptomMeasurements({ systolicPressure, diastolicPressure, weight, glucose }) {
  const values = [systolicPressure, diastolicPressure, weight, glucose].filter((value) => value != null);
  if (values.some((value) => !Number.isFinite(value))) return 'Use somente números válidos nas medições.';
  const hasSystolic = systolicPressure != null;
  const hasDiastolic = diastolicPressure != null;
  if (hasSystolic !== hasDiastolic) return 'Informe os dois valores da pressão arterial.';
  if (hasSystolic && (systolicPressure < 60 || systolicPressure > 250 || diastolicPressure < 40 || diastolicPressure > 150)) {
    return 'Pressão arterial fora do intervalo aceito para registro.';
  }
  if (hasSystolic && systolicPressure <= diastolicPressure) return 'A pressão sistólica deve ser maior que a diastólica.';
  if (weight != null && (weight < 25 || weight > 300)) return 'Peso fora do intervalo aceito (25–300 kg).';
  if (glucose != null && (glucose < 20 || glucose > 600)) return 'Glicemia fora do intervalo aceito (20–600 mg/dL).';
  return null;
}
