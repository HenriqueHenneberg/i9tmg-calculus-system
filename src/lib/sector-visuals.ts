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
