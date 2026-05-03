import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { CARDS } from './lib/cards';
import { SLOTS, canPlace, emptyBoard, BoardState, SlotId, ADJACENCIES, slotLabel } from './lib/board';
import { calculateScore, getLinkClass } from './lib/scoring';
import './styles.css';

function drawChoices(round: number, usedIds: Set<string>) {
  const available = CARDS.filter(c => !usedIds.has(c.id));
  const offset = (round * 7) % Math.max(1, available.length);
  return [available[offset % available.length], available[(offset + 5) % available.length], available[(offset + 11) % available.length]].filter(Boolean);
}

function rosterCounts(board: BoardState) {
  const counts = { Alpha: 0, Bruiser: 0, Hunter: 0, Elder: 0 };
  Object.values(board).forEach(card => { if (card) counts[card.role] += 1; });
  return counts;
}

const TARGET = { Alpha: 2, Bruiser: 3, Hunter: 3, Elder: 1 };

function App() {
  const [board, setBoard] = useState<BoardState>(emptyBoard());
  const [round, setRound] = useState(1);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [movingSlot, setMovingSlot] = useState<SlotId | null>(null);
  const [draftedIds, setDraftedIds] = useState<Set<string>>(new Set<string>());
  const [lockedChoices, setLockedChoices] = useState(() => drawChoices(1, new Set()));

  const score = useMemo(() => calculateScore(board), [board]);
  const counts = rosterCounts(board);
  const selectedChoice = lockedChoices.find(c => c.id === selectedChoiceId) || null;
  const finished = draftedIds.size >= 9;

  function advanceRound(nextDrafted: Set<string>) {
    const nextRound = round + 1;
    setRound(nextRound);
    setLockedChoices(drawChoices(nextRound, nextDrafted));
    setSelectedChoiceId(null);
  }

  function handleSlotClick(slotId: SlotId) {
    const targetCard = board[slotId];

    if (selectedChoice) {
      if (!canPlace(selectedChoice.role, slotId)) return;
      if (targetCard) return;
      const nextBoard = { ...board, [slotId]: selectedChoice };
      const nextDrafted = new Set(draftedIds);
      nextDrafted.add(selectedChoice.id);
      setBoard(nextBoard);
      setDraftedIds(nextDrafted);
      if (nextDrafted.size < 9) advanceRound(nextDrafted);
      else setSelectedChoiceId(null);
      return;
    }

    if (movingSlot) {
      if (movingSlot === slotId) { setMovingSlot(null); return; }
      const movingCard = board[movingSlot];
      if (!movingCard) { setMovingSlot(null); return; }
      const destinationCard = board[slotId];
      if (!canPlace(movingCard.role, slotId)) return;
      if (destinationCard && !canPlace(destinationCard.role, movingSlot)) return;
      setBoard({ ...board, [slotId]: movingCard, [movingSlot]: destinationCard });
      setMovingSlot(null);
      return;
    }

    if (targetCard) setMovingSlot(slotId);
  }

  function resetGame() {
    const empty = emptyBoard();
    const used = new Set<string>();
    setBoard(empty);
    setRound(1);
    setDraftedIds(used);
    setSelectedChoiceId(null);
    setMovingSlot(null);
    setLockedChoices(drawChoices(1, used));
  }

  return <main className="app">
    <header className="hero">
      <div>
        <p className="eyebrow">Prototype MVP</p>
        <h1>Dino Dominion</h1>
        <p>Draft prehistoric beasts, place them legally, and optimize Pack Chemistry.</p>
      </div>
      <button onClick={resetGame}>New Draft</button>
    </header>

    <section className="layout">
      <aside className="panel">
        <h2>{finished ? 'Final Board' : `Round ${round} / 9`}</h2>
        <div className="score-grid">
          <div><span>Power</span><b>{score.power}</b></div>
          <div><span>Chem</span><b>{score.chemistry}</b></div>
          <div><span>Total</span><b>{score.total}</b></div>
        </div>
        <h3>Roster</h3>
        {Object.entries(TARGET).map(([role, target]) => <div className="roster" key={role}>
          <span>{role}</span><b className={counts[role as keyof typeof counts] === target ? 'complete' : ''}>{counts[role as keyof typeof counts]} / {target}</b>
        </div>)}
        <h3>Draft choices</h3>
        {finished ? <p className="muted">Draft complete. Click cards on the board to swap and optimize.</p> : <div className="choices">
          {lockedChoices.map(card => <button key={card.id} className={`choice ${selectedChoiceId === card.id ? 'selected' : ''}`} onClick={() => setSelectedChoiceId(card.id)}>
            <b>{card.name}</b><span>{card.role} · {card.tier} · {card.power}</span><small>{card.era} · {card.habitat} · {card.diet} · {card.bloodline}</small>
          </button>)}
        </div>}
        <p className="hint">Select a draft card, then choose a legal empty slot. To rearrange, click a placed card, then click another legal slot.</p>
      </aside>

      <section className="board-wrap">
        <div className="board">
          {SLOTS.map(slot => {
            const card = board[slot.id];
            const selected = movingSlot === slot.id;
            const legalForChoice = selectedChoice ? canPlace(selectedChoice.role, slot.id) && !card : false;
            return <button key={slot.id} onClick={() => handleSlotClick(slot.id)} className={`slot ${selected ? 'moving' : ''} ${legalForChoice ? 'legal' : ''}`} style={{ gridArea: slot.area }}>
              <span className="slot-label">{slotLabel(slot.id)}</span>
              {card ? <div className="card">
                <b>{card.name}</b>
                <span>{card.role} · {card.tier}</span>
                <strong>{card.power}</strong>
                <small>{card.era}</small><small>{card.habitat}</small><small>{card.diet}</small><small>{card.bloodline}</small>
                <em className={score.cardChem[card.id] >= 4 ? 'dot green-dot' : score.cardChem[card.id] >= 2 ? 'dot yellow-dot' : 'dot'}>{score.cardChem[card.id] || 0}</em>
              </div> : <span className="empty">{slot.accepts.join(' / ')}</span>}
            </button>
          })}
        </div>
        <div className="links">
          <h3>Live links</h3>
          {ADJACENCIES.map(([a,b]) => {
            const left = board[a], right = board[b];
            if (!left || !right) return null;
            const link = getLinkClass(left, right, a, b);
            return <div key={`${a}-${b}`} className={`link ${link.kind}`}><span>{left.name} ↔ {right.name}</span><b>{link.matches.length ? link.matches.join(', ') : 'No link'}</b></div>
          })}
        </div>
      </section>
    </section>
  </main>;
}

createRoot(document.getElementById('root')!).render(<App />);
