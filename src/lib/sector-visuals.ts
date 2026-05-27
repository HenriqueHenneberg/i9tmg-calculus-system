import type { SectorId } from "@/lib/industrial-data";

interface SectorVisual {
  fallbackImage: string;
  localImages: string[];
  focus: string;
  keyword: string;
}

function userImages(baseName: string) {
  return [
    `/i9-user-images/${baseName}.jpg`,
    `/i9-user-images/${baseName}.png`,
    `/i9-user-images/${baseName}.webp`,
    `/i9-user-images/${baseName}.svg`,
  ];
}

const defaultVisual: SectorVisual = {
  fallbackImage: "/i9-wallpaper.svg",
  localImages: userImages("setor-industrial"),
  focus: "center",
  keyword: "Operacao industrial",
};

const visuals: Record<string, SectorVisual> = {
  mecanica: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-mecanica"),
    focus: "center",
    keyword: "Conjuntos mecanicos",
  },
  eletrica: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-eletrica"),
    focus: "center",
    keyword: "Motores e paineis",
  },
  hidraulica: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-hidraulica"),
    focus: "center",
    keyword: "Bombas e tubulacoes",
  },
  producao: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-producao"),
    focus: "center",
    keyword: "Linha produtiva",
  },
  pneumatica: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-pneumatica"),
    focus: "center",
    keyword: "Ar comprimido",
  },
  estrutural: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-estrutural"),
    focus: "center",
    keyword: "Estruturas metalicas",
  },
  termodinamica: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-termodinamica"),
    focus: "center",
    keyword: "Processo termico",
  },
  instrumentacao: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-instrumentacao"),
    focus: "center",
    keyword: "Sinais e sensores",
  },
  automacao: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-automacao"),
    focus: "center",
    keyword: "Controle industrial",
  },
  manutencao: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-manutencao"),
    focus: "center",
    keyword: "Confiabilidade",
  },
  logistica: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-logistica"),
    focus: "center",
    keyword: "Fluxo e estoque",
  },
  qualidade: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-qualidade"),
    focus: "center",
    keyword: "Inspecao tecnica",
  },
  planejamento: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-planejamento"),
    focus: "center",
    keyword: "Plano e capacidade",
  },
  energia: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-energia"),
    focus: "center",
    keyword: "Energia e consumo",
  },
  quimica: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-quimica"),
    focus: "center",
    keyword: "Quimica industrial",
  },
  metalurgia: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-metalurgia"),
    focus: "center",
    keyword: "Forno e laminacao",
  },
  alimentos_bebidas: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-alimentos-bebidas"),
    focus: "center",
    keyword: "Linha de alimentos",
  },
  mineracao: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-mineracao"),
    focus: "center",
    keyword: "Mineracao e correias",
  },
  papel_celulose: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-papel-celulose"),
    focus: "center",
    keyword: "Papel e celulose",
  },
  saneamento: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-saneamento"),
    focus: "center",
    keyword: "ETA e ETE",
  },
  seguranca_processos: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-seguranca-processos"),
    focus: "center",
    keyword: "Seguranca de processos",
  },
  refrigeracao: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-refrigeracao"),
    focus: "center",
    keyword: "Refrigeracao industrial",
  },
  embalagem: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-embalagem"),
    focus: "center",
    keyword: "Embalagem e paletizacao",
  },
  utilidades: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-utilidades"),
    focus: "center",
    keyword: "Utilidades industriais",
  },
  equipamentos_mistura_90: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-projeto-mistura-90"),
    focus: "center",
    keyword: "Projeto Mistura 90",
  },
  elevadores_mistura_90: {
    fallbackImage: "/i9-wallpaper.svg",
    localImages: userImages("setor-elevadores-industriais"),
    focus: "center",
    keyword: "Elevadores industriais",
  },
};

export function getSectorVisual(sectorId: SectorId): SectorVisual {
  return visuals[String(sectorId)] || defaultVisual;
}

export function getSectorBackgroundImage(visual: SectorVisual): string {
  return [...visual.localImages, visual.fallbackImage].map((image) => `url("${image}")`).join(", ");
}
