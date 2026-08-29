import { FormaPagamento } from "./types";

// As categorias agora vêm dinamicamente do banco (13 categorias reais, ver
// useStore().categorias), então a cor é escolhida por hash determinístico do
// nome em vez de um mapa fixo — assim qualquer categoria nova já recebe uma
// cor consistente sem precisar editar este arquivo.
const paleta = [
  "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  "bg-red-500/10 text-red-700 dark:text-red-400",
  "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400",
  "bg-lime-500/10 text-lime-700 dark:text-lime-400",
  "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
];

export function getCategoriaColor(nome: string): string {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = (hash * 31 + nome.charCodeAt(i)) >>> 0;
  }
  return paleta[hash % paleta.length];
}

export const formaPagamentoColors: Record<FormaPagamento, string> = {
  Dinheiro: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  Cartão: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  Pix: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
};
