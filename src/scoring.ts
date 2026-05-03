import type { DinoCard } from './types';
import type { BoardState, SlotId } from './board';
import { ADJACENCIES } from './board';

const TRAITS: (keyof Pick<DinoCard, 'era' | 'habitat' | 'diet' | 'bloodline'>)[] = ['era', 'habitat', 'diet', 'bloodline'];

export function getLinkClass(a: DinoCard, b: DinoCard, slotA?: SlotId, slotB?: SlotId) {
  if (a.role === 'Alpha' && b.role === 'Alpha') return { kind: 'none', matches: [] as string[] };
  const matches = TRAITS.filter(t => a[t] === b[t]).map(t => `${t}: ${a[t]}`);
  const kind = matches.length >= 2 ? 'green' : matches.length === 1 ? 'yellow' : 'none';
  return { kind, matches };
}

export function calculateScore(board: BoardState) {
  const cards = Object.values(board).filter(Boolean) as DinoCard[];
  const power = cards.reduce((sum, c) => sum + c.power, 0);
  const cardChem: Record<string, number> = {};
  cards.forEach(c => cardChem[c.id] = 0);
  let edgeMatches = 0;

  ADJACENCIES.forEach(([a, b]) => {
    const left = board[a], right = board[b];
    if (!left || !right) return;
    const link = getLinkClass(left, right, a, b);
    edgeMatches += link.matches.length;
    cardChem[left.id] += link.matches.length;
    cardChem[right.id] += link.matches.length;
  });

  const dotBonus = Object.values(cardChem).reduce((sum, count) => sum + (count >= 4 ? 11 : count >= 2 ? 6 : 0), 0);
  const chemistry = edgeMatches + dotBonus;
  return { power, chemistry, total: power + chemistry, cardChem, edgeMatches, dotBonus };
}
