export interface I9Segment {
  id: string;
  name: string;
  focus: string;
  equipmentFit: string[];
}

export interface I9SolutionFront {
  name: string;
  description: string;
  deliverables: string[];
}

export interface I9QualityRequirement {
  name: string;
  application: string;
}

export const i9Segments: I9Segment[] = [
  {
    id: "fertilizantes",
    name: "Fertilizantes",
    focus: "Plantas de mistura, transporte, peneiramento, dosagem, armazenamento e expedicao de materiais solidos.",
    equipmentFit: ["Elevadores de canecas", "Peneiras rotativas", "Transportadores", "Misturadores", "Ensacadeiras"],
  },
  {
    id: "mineracao",
    name: "Mineracao",
    focus: "Sistemas robustos de transporte, alimentacao e manuseio para ambientes abrasivos e exigentes.",
    equipmentFit: ["Transportadores", "Redlers", "Estruturas", "Chutes", "Peneiras"],
  },
  {
    id: "graos",
    name: "Graos & Sementes",
    focus: "Processamento, limpeza, armazenagem e expedicao com preservacao do produto e eficiencia operacional.",
    equipmentFit: ["Elevadores", "Correias", "Roscas", "Silos", "Peneiras"],
  },
  {
    id: "cimenteiro",
    name: "Cimenteiro",
    focus: "Transporte, dosagem e preparacao de materias-primas com alta durabilidade e capacidade.",
    equipmentFit: ["Transportadores", "Dosadores", "Pipe racks", "Chutes", "Estruturas"],
  },
  {
    id: "portuario",
    name: "Portuario",
    focus: "Carregamento, descarregamento e fluxo logistico de materiais a granel em operacao continua.",
    equipmentFit: ["Transportadores", "Trippers", "Elevadores", "Estruturas", "Sistemas de descarga"],
  },
  {
    id: "quimico_oleo",
    name: "Quimico & Oleo",
    focus: "Mistura, dosagem, transporte, filtracao e armazenamento com seguranca e conformidade tecnica.",
    equipmentFit: ["Tubulacoes", "Valvulas", "Flaps", "Tanques", "Misturadores"],
  },
];

export const i9SolutionFronts: I9SolutionFront[] = [
  {
    name: "Equipamentos",
    description: "Fabricacao de equipamentos de movimentacao, armazenamento, beneficiamento, estruturais e utilidades.",
    deliverables: ["Lista tecnica de componentes", "Memoria de calculo", "Criterios de selecao", "Pendencias de desenho"],
  },
  {
    name: "Sistemas Moveis",
    description: "Solucoes moveis para peneiramento, recobrimento, ensaque, Big-Bag e expedicao a granel.",
    deliverables: ["Capacidade operacional", "Layout modular", "Pontos de manutencao", "Parametros de operacao"],
  },
  {
    name: "Montagem & Manutencao",
    description: "Montagem industrial, revamps, retrofits e manutencao preditiva com equipe tecnica propria.",
    deliverables: ["Checklist de montagem", "Rastreabilidade de ativos", "Status de liberacao", "Plano de verificacao"],
  },
  {
    name: "Projetos",
    description: "Projetos conceituais, basicos e executivos para plantas industriais personalizadas.",
    deliverables: ["Premissas de processo", "Dimensionamento", "Relatorio executivo", "Pacote de engenharia"],
  },
  {
    name: "EPC / Turn Key",
    description: "Entrega integrada do projeto, aquisicao, construcao e liberacao pronta para operacao.",
    deliverables: ["Escopo consolidado", "Riscos e pendencias", "Materiais", "Indicadores de prazo/qualidade"],
  },
];

export const i9QualityRequirements: I9QualityRequirement[] = [
  {
    name: "Transparencia",
    application: "Mostrar premissas, formulas, inputs e fontes do calculo no relatorio.",
  },
  {
    name: "Pontualidade",
    application: "Separar pendencias para decisao rapida de engenharia, suprimentos e fabricacao.",
  },
  {
    name: "Comprometimento",
    application: "Gerar saida tecnica consistente, com rastreabilidade de equipamento, status e revisao.",
  },
  {
    name: "Seguranca",
    application: "Destacar itens criticos, cargas, tensoes, componentes mecanicos e dependencias de desenho.",
  },
  {
    name: "Melhoria continua",
    application: "Permitir alterar parametros e recalcular cenarios sem depender diretamente da planilha.",
  },
  {
    name: "Espirito de equipe",
    application: "Entregar PDF claro para engenharia, qualidade, compras, montagem e cliente final.",
  },
];

export const i9CompanyTimeline = [
  { year: "1988", event: "Inicio das operacoes em manutencao industrial." },
  { year: "1998", event: "Expansao para fabricacao de equipamentos." },
  { year: "2003", event: "Inicio dos projetos proprios de engenharia." },
  { year: "2011", event: "Divisao de engenharia basica e executiva." },
  { year: "2021", event: "Nova unidade fabril e ampliacao produtiva." },
  { year: "2024", event: "ISO 9001." },
  { year: "2025", event: "Aquisicao de guindaste." },
];
