import { Categoria, FormaPagamento } from "./types";

export const categoriaColors: Record<Categoria, string> = {
  Filtros: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Freios: "bg-red-500/10 text-red-700 dark:text-red-400",
  Suspensão: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  Elétrica: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  Motor: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  "Óleos e Fluidos": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Arrefecimento: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  Transmissão: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400",
};

export const formaPagamentoColors: Record<FormaPagamento, string> = {
  Dinheiro: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cartão: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Pix: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
};
