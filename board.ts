import type { DinoCard, Role } from './types';

export type SlotId = 'topLeft' | 'topRight' | 'leftFlex' | 'leftAlpha' | 'rightAlpha' | 'rightFlex' | 'bottomLeft' | 'bottomElder' | 'bottomRight';
export type BoardState = Record<SlotId, DinoCard | null>;

export const SLOTS: { id: SlotId; area: string; accepts: Role[] }[] = [
  { id: 'topLeft', area: 'topLeft', accepts: ['Bruiser'] },
  { id: 'topRight', area: 'topRight', accepts: ['Hunter'] },
  { id: 'leftFlex', area: 'leftFlex', accepts: ['Bruiser', 'Hunter', 'Elder'] },
  { id: 'leftAlpha', area: 'leftAlpha', accepts: ['Alpha'] },
  { id: 'rightAlpha', area: 'rightAlpha', accepts: ['Alpha'] },
  { id: 'rightFlex', area: 'rightFlex', accepts: ['Bruiser', 'Hunter', 'Elder'] },
  { id: 'bottomLeft', area: 'bottomLeft', accepts: ['Hunter'] },
  { id: 'bottomElder', area: 'bottomElder', accepts: ['Elder'] },
  { id: 'bottomRight', area: 'bottomRight', accepts: ['Bruiser'] },
];

export const ADJACENCIES: [SlotId, SlotId][] = [
  ['topLeft', 'leftFlex'], ['topLeft', 'leftAlpha'],
  ['topRight', 'rightFlex'], ['topRight', 'rightAlpha'],
  ['leftFlex', 'leftAlpha'], ['leftFlex', 'bottomLeft'], ['leftFlex', 'bottomElder'],
  ['leftAlpha', 'rightAlpha'], ['leftAlpha', 'bottomElder'],
  ['rightAlpha', 'rightFlex'], ['rightAlpha', 'bottomElder'],
  ['rightFlex', 'bottomRight'], ['rightFlex', 'bottomElder'],
  ['bottomLeft', 'bottomElder'], ['bottomRight', 'bottomElder'],
];

export function emptyBoard(): BoardState {
  return { topLeft: null, topRight: null, leftFlex: null, leftAlpha: null, rightAlpha: null, rightFlex: null, bottomLeft: null, bottomElder: null, bottomRight: null };
}

export function canPlace(role: Role, slotId: SlotId) {
  return SLOTS.find(s => s.id === slotId)?.accepts.includes(role) ?? false;
}

export function slotLabel(slotId: SlotId) {
  return ({ topLeft: 'Bruiser', topRight: 'Hunter', leftFlex: 'Flex', leftAlpha: 'Alpha', rightAlpha: 'Alpha', rightFlex: 'Flex', bottomLeft: 'Hunter', bottomElder: 'Elder', bottomRight: 'Bruiser' } as Record<SlotId, string>)[slotId];
}
