/** Explicações educativas para a fase estimada do ciclo da tentante. */
const CYCLE_PHASE_GUIDES = {
  menstrual: {
    title: 'Seu corpo está iniciando um novo ciclo',
    body: 'A queda de estrogênio e progesterona faz o endométrio, a camada interna do útero, se desprender e sair como menstruação.',
    notice: 'Cólicas, cansaço, sensibilidade e mudanças no intestino podem aparecer, mas cada corpo vive essa fase de um jeito.',
    care: 'Registrar fluxo e sintomas ajuda a reconhecer seu padrão. Dor incapacitante ou sangramento muito intenso merecem avaliação profissional.',
  },
  follicular: {
    title: 'Novos folículos estão amadurecendo',
    body: 'O cérebro libera FSH para estimular os ovários. Enquanto alguns folículos crescem, o estrogênio tende a subir e o endométrio começa a se reconstruir.',
    notice: 'A energia pode aumentar e o muco cervical pode passar de seco ou cremoso para mais úmido conforme a ovulação se aproxima.',
    care: 'Observe seu muco sem buscar um padrão perfeito. Sono, estresse, medicamentos e outros fatores podem mudar os sinais do ciclo.',
  },
  fertile: {
    title: 'Seu corpo se aproxima da ovulação',
    body: 'Com o estrogênio mais alto, o muco cervical costuma ficar úmido, transparente e elástico, criando um ambiente que facilita a sobrevivência dos espermatozoides.',
    notice: 'Sensação de umidade, aumento da libido ou leve desconforto pélvico podem ocorrer, mas também é normal não perceber mudanças.',
    care: 'A janela fértil do app é uma estimativa. Muco e teste de LH acrescentam pistas, mas não confirmam sozinhos que a ovulação aconteceu.',
  },
  ovulation: {
    title: 'Hoje é a ovulação estimada',
    body: 'Um pico do hormônio LH costuma estimular a liberação de um óvulo pelo ovário. Depois de liberado, ele geralmente pode ser fecundado por cerca de 12 a 24 horas.',
    notice: 'Algumas mulheres sentem uma pontada leve de um lado ou notam muco mais elástico; muitas não sentem nada.',
    care: 'Esta data é uma previsão baseada no seu ciclo, não uma confirmação. A temperatura basal costuma indicar a ovulação apenas depois que ela ocorreu.',
  },
  luteal: {
    title: 'Seu corpo está na fase após a ovulação estimada',
    body: 'O folículo que liberou o óvulo passa a produzir progesterona, hormônio que ajuda a manter o endométrio preparado para uma possível implantação.',
    notice: 'Sensibilidade nas mamas, inchaço, sono ou mudanças de humor podem aparecer. Esses sinais se parecem com TPM e não confirmam gravidez.',
    care: 'Um teste tende a ser mais confiável a partir do atraso menstrual. Se a menstruação não vier, siga as instruções do teste ou procure orientação.',
  },
};

export function cyclePhaseGuide(phase) {
  return CYCLE_PHASE_GUIDES[phase] || CYCLE_PHASE_GUIDES.follicular;
}
