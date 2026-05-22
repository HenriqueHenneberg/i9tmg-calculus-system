import type { SectorId } from "@/lib/industrial-data";

interface SectorVisual {
  image: string;
  focus: string;
  keyword: string;
}

const defaultVisual: SectorVisual = {
  image: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=70",
  focus: "center",
  keyword: "Operacao industrial",
};

const visuals: Record<string, SectorVisual> = {
  mecanica: {
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Conjuntos mecanicos",
  },
  eletrica: {
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Motores e paineis",
  },
  hidraulica: {
    image: "https://images.unsplash.com/photo-1581093806997-124204d9fa9d?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Bombas e tubulacoes",
  },
  producao: {
    image: "https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Linha produtiva",
  },
  pneumatica: {
    image: "https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Ar comprimido",
  },
  estrutural: {
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Estruturas metalicas",
  },
  termodinamica: {
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Processo termico",
  },
  instrumentacao: {
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Sinais e sensores",
  },
  automacao: {
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Controle industrial",
  },
  manutencao: {
    image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Confiabilidade",
  },
  logistica: {
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Fluxo e estoque",
  },
  qualidade: {
    image: "https://images.unsplash.com/photo-1581093458791-9d42e65f7d63?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Inspecao tecnica",
  },
  planejamento: {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Plano e capacidade",
  },
  energia: {
    image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Energia e consumo",
  },
  equipamentos_mistura_90: {
    image: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Projeto Mistura 90",
  },
  elevadores_mistura_90: {
    image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=70",
    focus: "center",
    keyword: "Elevadores industriais",
  },
};

export function getSectorVisual(sectorId: SectorId): SectorVisual {
  return visuals[String(sectorId)] || defaultVisual;
}
