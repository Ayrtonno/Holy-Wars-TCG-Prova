import { toDisplay, cardCrosses, cardFaith } from './utils.js';

const MINI_DECK_SPEC = [
  { name: 'Aquila Vorace', qty: 2 },
  { name: 'Golem di Pietra', qty: 2 },
  { name: 'Pioggia', qty: 1 },
];

const PLAYER_PHASES = ['inspiration', 'positioning', 'attack', 'end'];

const ZONES = [
  { id: 'cpu_temp_1', owner: 'cpu', kind: 'temp', label: 'Temp 1' },
  { id: 'cpu_temp_2', owner: 'cpu', kind: 'temp', label: 'Temp 2' },
  { id: 'cpu_attack_1', owner: 'cpu', kind: 'attack', label: 'Atk 1' },
  { id: 'cpu_attack_2', owner: 'cpu', kind: 'attack', label: 'Atk 2' },
  { id: 'cpu_attack_3', owner: 'cpu', kind: 'attack', label: 'Atk 3' },
  { id: 'cpu_defense_1', owner: 'cpu', kind: 'defense', label: 'Def 1' },
  { id: 'cpu_defense_2', owner: 'cpu', kind: 'defense', label: 'Def 2' },
  { id: 'cpu_defense_3', owner: 'cpu', kind: 'defense', label: 'Def 3' },
  { id: 'cpu_artifact_1', owner: 'cpu', kind: 'artifact', label: 'Art 1' },
  { id: 'cpu_building', owner: 'cpu', kind: 'building', label: 'Edificio' },
  { id: 'cpu_artifact_2', owner: 'cpu', kind: 'artifact', label: 'Art 2' },
  { id: 'cpu_artifact_3', owner: 'cpu', kind: 'artifact', label: 'Art 3' },
  { id: 'cpu_artifact_4', owner: 'cpu', kind: 'artifact', label: 'Art 4' },
  { id: 'cpu_grave', owner: 'cpu', kind: 'grave', label: 'Cimitero' },
  { id: 'cpu_exile', owner: 'cpu', kind: 'exile', label: 'Esiliate' },
  { id: 'cpu_deck', owner: 'cpu', kind: 'deck', label: 'Deck' },
  { id: 'cpu_extra', owner: 'cpu', kind: 'extra', label: 'Extra Deck' },

  { id: 'player_temp_1', owner: 'player', kind: 'temp', label: 'Temp 1' },
  { id: 'player_temp_2', owner: 'player', kind: 'temp', label: 'Temp 2' },
  { id: 'player_attack_1', owner: 'player', kind: 'attack', label: 'Atk 1' },
  { id: 'player_attack_2', owner: 'player', kind: 'attack', label: 'Atk 2' },
  { id: 'player_attack_3', owner: 'player', kind: 'attack', label: 'Atk 3' },
  { id: 'player_defense_1', owner: 'player', kind: 'defense', label: 'Def 1' },
  { id: 'player_defense_2', owner: 'player', kind: 'defense', label: 'Def 2' },
  { id: 'player_defense_3', owner: 'player', kind: 'defense', label: 'Def 3' },
  { id: 'player_artifact_1', owner: 'player', kind: 'artifact', label: 'Art 1' },
  { id: 'player_building', owner: 'player', kind: 'building', label: 'Edificio' },
  { id: 'player_artifact_2', owner: 'player', kind: 'artifact', label: 'Art 2' },
  { id: 'player_artifact_3', owner: 'player', kind: 'artifact', label: 'Art 3' },
  { id: 'player_artifact_4', owner: 'player', kind: 'artifact', label: 'Art 4' },
  { id: 'player_grave', owner: 'player', kind: 'grave', label: 'Cimitero' },
  { id: 'player_exile', owner: 'player', kind: 'exile', label: 'Esiliate' },
  { id: 'player_deck', owner: 'player', kind: 'deck', label: 'Deck' },
  { id: 'player_extra', owner: 'player', kind: 'extra', label: 'Extra Deck' },
];

const PLACEMENT_KINDS_BY_TYPE = {
  Santo: ['attack', 'defense'],
  Artefatto: ['artifact'],
  Edificio: ['building'],
  Benedizione: ['temp'],
  Maledizione: ['temp'],
};

const TEMPLATE_BY_TYPE = {
  Artefatto: './assets/templates/Artefatto.png',
  Benedizione: './assets/templates/Benedizione.png',
  Edificio: './assets/templates/Edificio.png',
  Innata: './assets/templates/Innata.png',
  Maledizione: './assets/templates/Maledizione.png',
  Santo: './assets/templates/Santo.png',
  Token: './assets/templates/Token.png',
};

function zoneById(id) {
  return ZONES.find((z) => z.id === id) || null;
}

function oppositeOwner(owner) {
  return owner === 'player' ? 'cpu' : 'player';
}

function columnOfZone(zoneId) {
  const m = zoneId.match(/_(\d)$/);
  return m ? Number(m[1]) : null;
}

function slotHtml(id) {
  return `<button class="slot" data-zone-id="${id}" type="button"></button>`;
}

function makeSideBoardHtml(side) {
  const p = side;
  const tempGroup = `
    <div class="zoneGroup zoneGroupTemp">
      <div class="zoneTitle">Benedizioni / Maledizioni</div>
      <div class="slots2 slotsTemp">${slotHtml(`${p}_temp_1`)}${slotHtml(`${p}_temp_2`)}</div>
    </div>
  `;
  const lineGroup = `
    <div class="zoneGroup zoneGroupLine">
      <div class="zoneTitle">Linea Attacco</div>
      <div class="slots3 slotsLine">${slotHtml(`${p}_attack_1`)}${slotHtml(`${p}_attack_2`)}${slotHtml(`${p}_attack_3`)}</div>
    </div>
    <div class="zoneGroup zoneGroupLine">
      <div class="zoneTitle">Linea Difesa</div>
      <div class="slots3 slotsLine">${slotHtml(`${p}_defense_1`)}${slotHtml(`${p}_defense_2`)}${slotHtml(`${p}_defense_3`)}</div>
    </div>
  `;
  const artifactGroup = `
    <div class="zoneGroup zoneGroupUtility">
      <div class="zoneTitle">Artefatti + Edificio</div>
      <div class="slots5 slotsArtifactX">
        ${slotHtml(`${p}_artifact_1`)}
        ${slotHtml(`${p}_building`)}
        ${slotHtml(`${p}_artifact_2`)}
        ${slotHtml(`${p}_artifact_3`)}
        ${slotHtml(`${p}_artifact_4`)}
      </div>
    </div>
  `;
  const resourceGroup = `
    <div class="zoneGroup zoneGroupResource">
      <div class="zoneTitle">Risorse</div>
      <div class="slots2 slotsResource4">
        ${slotHtml(`${p}_grave`)}
        ${slotHtml(`${p}_exile`)}
        ${slotHtml(`${p}_deck`)}
        ${slotHtml(`${p}_extra`)}
      </div>
    </div>
  `;

  // Layout in 4 colonne: temp, linee santi, artefatti+edificio, risorse.
  const leftCol = tempGroup;
  const centerCol = lineGroup;

  return `
    <section class="boardSide ${side}">
      <div class="zoneStack colTemp">${leftCol}</div>
      <div class="zoneStack colLines">${centerCol}</div>
      <div class="zoneStack colArtifacts">${artifactGroup}</div>
      <div class="zoneStack colResources">${resourceGroup}</div>
    </section>
  `;
}

function toInfoHtml(cardLike) {
  const card = cardLike.card || cardLike;
  const currentFaith = cardLike.currentFaith;
  const currentStrength = cardLike.currentStrength;
  return `
    <div><strong>${card.name}</strong></div>
    <div>Tipo: ${toDisplay(card.type)}</div>
    <div>Fede: ${toDisplay(currentFaith ?? cardFaith(card))}</div>
    <div>Forza: ${toDisplay(currentStrength ?? card.strength)}</div>
    <div>Croci: ${toDisplay(cardCrosses(card), '-')}</div>
    <div style="margin-top:6px;">${toDisplay(card.effectText, 'Nessun effetto.')}</div>
  `;
}

function getCardCost(card) {
  if (!card) return 0;
  if (card.type === 'Benedizione' || card.type === 'Maledizione') return 0;
  return typeof card.faith === 'number' ? card.faith : 0;
}

export function createGameModule({ cards, els, onStateChange }) {
  const game = {
    started: false,
    preparationDone: false,
    phase: 'setup',
    turnOwner: 'player',
    turnNumber: 0,
    uid: 1,
    selectedHandUid: null,
    awaitingInterrupt: false,
    zones: {},
    log: [],
    player: { hand: [], deck: [], inspiration: 10, peccato: 0, grave: [], exile: [], deckCount: 0, extraCount: 999 },
    cpu: { hand: [], deck: [], inspiration: 10, peccato: 0, grave: [], exile: [], deckCount: 0, extraCount: 999 },
    miniDeckCards: [],
  };

  function getActor(owner) {
    return owner === 'player' ? game.player : game.cpu;
  }

  function getZoneCard(zoneId) {
    return game.zones[zoneId] || null;
  }

  function setZoneCard(zoneId, cardInZone) {
    game.zones[zoneId] = cardInZone || null;
  }

  function pushLog(text) {
    game.log.unshift(text);
    game.log = game.log.slice(0, 120);
  }

  function setInfoHtml(html) {
    els.playSelectedInfo.innerHTML = html;
  }

  function byName(name) {
    return cards.find((c) => c.name.toLowerCase() === name.toLowerCase()) || null;
  }

  function buildMiniDeck() {
    const out = [];
    MINI_DECK_SPEC.forEach((spec) => {
      const c = byName(spec.name);
      if (!c) return;
      for (let i = 0; i < spec.qty; i += 1) out.push(c);
    });
    return out;
  }

  function nextUid() {
    const id = `G${String(game.uid).padStart(4, '0')}`;
    game.uid += 1;
    return id;
  }

  function createInstance(owner, card, faceDown = true) {
    return {
      uid: nextUid(),
      owner,
      card,
      faceDown,
      baseFaith: typeof card.faith === 'number' ? card.faith : null,
      currentFaith: typeof card.faith === 'number' ? card.faith : null,
      baseStrength: typeof card.strength === 'number' ? card.strength : null,
      currentStrength: typeof card.strength === 'number' ? card.strength : null,
      attackedThisTurn: false,
    };
  }

  function clearBoard() {
    game.zones = {};
    ZONES.forEach((z) => {
      game.zones[z.id] = null;
    });
    game.player.grave = [];
    game.cpu.grave = [];
    game.player.exile = [];
    game.cpu.exile = [];
  }

  function freeTempZone(owner) {
    const z1 = `${owner}_temp_1`;
    const z2 = `${owner}_temp_2`;
    if (!getZoneCard(z1)) return z1;
    if (!getZoneCard(z2)) return z2;
    return null;
  }

  function rainActive(owner) {
    const ids = [`${owner}_temp_1`, `${owner}_temp_2`];
    return ids.some((id) => {
      const inst = getZoneCard(id);
      return inst && inst.card.id === 'ANI_pioggia';
    });
  }

  function effectiveFaith(inst) {
    if (!inst || typeof inst.currentFaith !== 'number') return null;
    let v = inst.currentFaith;
    if (inst.card.type === 'Santo' && rainActive(inst.owner) && inst.currentFaith < inst.baseFaith) {
      v += 4;
    }
    return v;
  }

  function canPlaceInZone(instance, zone) {
    const allowed = PLACEMENT_KINDS_BY_TYPE[instance.card.type] || [];
    if (!allowed.includes(zone.kind)) return false;

    if (instance.card.type === 'Santo' && zone.kind === 'defense') {
      const col = columnOfZone(zone.id);
      const frontAttack = `${zone.owner}_attack_${col}`;
      if (!getZoneCard(frontAttack)) return false;
    }

    return true;
  }

  function drawCards(owner, amount) {
    const actor = getActor(owner);
    let drawn = 0;

    for (let i = 0; i < amount; i += 1) {
      if (actor.hand.length >= 8) {
        pushLog(`${owner === 'player' ? 'Player' : 'CPU'} raggiunge limite mano 8: pescata interrotta.`);
        break;
      }
      if (!actor.deck.length) {
        pushLog(`${owner === 'player' ? 'Player' : 'CPU'} non pu? pescare: deck esaurito.`);
        break;
      }
      actor.hand.push(actor.deck.shift());
      drawn += 1;
    }

    actor.deckCount = actor.deck.length;
    return drawn;
  }

  function moveToGrave(owner, inst, reasonText) {
    const actor = getActor(owner);
    actor.grave.push(inst);
    if (reasonText) pushLog(reasonText);
  }

  function resolveBlessCurseFromTemp(owner, zoneId) {
    const inst = getZoneCard(zoneId);
    if (!inst) return;

    if (inst.card.id === 'ANI_pioggia') {
      let affected = 0;
      Object.values(game.zones).forEach((zInst) => {
        if (!zInst || zInst.owner !== owner) return;
        if (zInst.card.type !== 'Santo') return;
        if (typeof zInst.currentFaith !== 'number' || typeof zInst.baseFaith !== 'number') return;
        if (zInst.currentFaith < zInst.baseFaith) {
          zInst.currentFaith += 4;
          affected += 1;
        }
      });
      pushLog(`Pioggia si risolve: +4 Fede ai santi feriti (${affected} bersagli).`);
    } else {
      pushLog(`${inst.card.name} si risolve.`);
    }

    setZoneCard(zoneId, null);
    moveToGrave(owner, inst, `${inst.card.name} viene mandata al Cimitero (non distrutta).`);
  }

  function placeFromHand(owner, handUid, zoneId, covered = false) {
    const actor = getActor(owner);
    const hand = actor.hand;
    const zone = zoneById(zoneId);
    if (!zone || zone.owner !== owner) return false;
    if (getZoneCard(zoneId)) return false;

    const idx = hand.findIndex((h) => h.uid === handUid);
    if (idx < 0) return false;

    const inst = hand[idx];
    if (!canPlaceInZone(inst, zone)) return false;
    if (covered && (inst.card.type === 'Benedizione' || inst.card.type === 'Maledizione')) return false;

    const cost = getCardCost(inst.card);
    if (actor.inspiration < cost) return false;

    actor.inspiration -= cost;
    hand.splice(idx, 1);
    inst.faceDown = covered;
    inst.attackedThisTurn = false;
    setZoneCard(zoneId, inst);

    pushLog(`${owner === 'player' ? 'Player' : 'CPU'} posiziona ${covered ? 'coperta' : 'scoperta'} ${inst.card.name} in ${zone.label}.`);

    if (!covered && (inst.card.type === 'Benedizione' || inst.card.type === 'Maledizione')) {
      resolveBlessCurseFromTemp(owner, zoneId);
    }

    return true;
  }

  function firstFreeZoneFor(owner, inst) {
    const kinds = PLACEMENT_KINDS_BY_TYPE[inst.card.type] || [];
    for (const kind of kinds) {
      for (const z of ZONES) {
        if (z.owner !== owner || z.kind !== kind) continue;
        if (getZoneCard(z.id)) continue;
        if (!canPlaceInZone(inst, z)) continue;
        return z.id;
      }
    }
    return null;
  }

  function runPreparationAuto(owner) {
    const actor = getActor(owner);
    const sorted = [...actor.hand].sort((a, b) => getCardCost(a.card) - getCardCost(b.card));

    for (const inst of sorted) {
      const z = firstFreeZoneFor(owner, inst);
      if (!z) continue;
      if (getCardCost(inst.card) <= actor.inspiration) {
        placeFromHand(owner, inst.uid, z, true);
      }
    }
  }

  function setupHandsAndDecks() {
    const pDeck = game.miniDeckCards.map((c) => createInstance('player', c, false));
    const cDeck = game.miniDeckCards.map((c) => createInstance('cpu', c, false));

    game.player.hand = pDeck.slice(0, 5);
    game.cpu.hand = cDeck.slice(0, 5);
    game.player.deck = pDeck.slice(5);
    game.cpu.deck = cDeck.slice(5);
    game.player.deckCount = game.player.deck.length;
    game.cpu.deckCount = game.cpu.deck.length;
    game.player.extraCount = 999;
    game.cpu.extraCount = 999;
    game.player.inspiration = 10;
    game.cpu.inspiration = 10;
    game.player.peccato = 0;
    game.cpu.peccato = 0;
    game.selectedHandUid = null;
  }

  function revealAllBoardCards() {
    Object.values(game.zones).forEach((inst) => {
      if (inst) inst.faceDown = false;
    });
  }

  function promoteDefenseToAttack(owner, column) {
    const atk = `${owner}_attack_${column}`;
    const def = `${owner}_defense_${column}`;
    if (getZoneCard(atk)) return;
    const d = getZoneCard(def);
    if (!d) return;
    setZoneCard(def, null);
    setZoneCard(atk, d);
    pushLog(`${owner === 'player' ? 'Player' : 'CPU'} promuove automaticamente un santo dalla difesa all'attacco.`);
  }

  function anyAttackers(owner) {
    return [1, 2, 3].some((i) => getZoneCard(`${owner}_attack_${i}`));
  }

  function resetAttackFlags(owner) {
    [1, 2, 3].forEach((i) => {
      const c = getZoneCard(`${owner}_attack_${i}`);
      if (c) c.attackedThisTurn = false;
    });
  }

  function handleSaintDefeat(zoneId) {
    const defeated = getZoneCard(zoneId);
    if (!defeated) return;

    const ownerActor = getActor(defeated.owner);
    if (typeof defeated.baseFaith === 'number' && defeated.card.type !== 'Token') {
      ownerActor.peccato += defeated.baseFaith;
      pushLog(`${defeated.owner === 'player' ? 'Player' : 'CPU'} accumula ${defeated.baseFaith} Peccato (${ownerActor.peccato}).`);
    }

    setZoneCard(zoneId, null);
    moveToGrave(defeated.owner, defeated, `${defeated.card.name} è sconfitto e va al Cimitero.`);

    const z = zoneById(zoneId);
    if (z?.kind === 'attack') {
      const col = columnOfZone(zoneId);
      if (col) promoteDefenseToAttack(z.owner, col);
    }
  }

  function performAttack(attackerZoneId, targetZoneId = null) {
    const attacker = getZoneCard(attackerZoneId);
    if (!attacker || attacker.card.type !== 'Santo') return;
    if (attacker.attackedThisTurn) return;

    const attackerOwner = attacker.owner;
    const defenderOwner = oppositeOwner(attackerOwner);

    if (!anyAttackers(defenderOwner)) {
      const defenderActor = getActor(defenderOwner);
      defenderActor.peccato += attacker.currentStrength || 0;
      attacker.attackedThisTurn = true;
      pushLog(`${attacker.card.name} attacca direttamente: +${attacker.currentStrength || 0} Peccato a ${defenderOwner}.`);
      return;
    }

    if (!targetZoneId) {
      targetZoneId = [1, 2, 3].map((i) => `${defenderOwner}_attack_${i}`).find((id) => getZoneCard(id));
    }

    const target = getZoneCard(targetZoneId);
    if (!target || target.owner !== defenderOwner || zoneById(targetZoneId)?.kind !== 'attack') {
      pushLog('Attacco non valido: bersaglio deve essere un santo avversario in attacco.');
      return;
    }

    const atkPower = typeof attacker.currentStrength === 'number' ? attacker.currentStrength : 0;

    attacker.attackedThisTurn = true;

    if (typeof target.currentFaith === 'number') target.currentFaith -= atkPower;

    pushLog(`${attacker.card.name} infligge ${atkPower} a ${target.card.name}.`);

    const targetDefeated = typeof target.currentFaith === 'number' && target.currentFaith <= 0;

    if (targetDefeated) {
      handleSaintDefeat(targetZoneId);
    }

    if (targetDefeated && attacker.card.id === 'ANI_aquila_vorace') {
      const ownerActor = getActor(attackerOwner);
      const stillThere = getZoneCard(attackerZoneId);
      if (stillThere && stillThere.uid === attacker.uid) {
        setZoneCard(attackerZoneId, null);
        ownerActor.hand.push(attacker);
        pushLog('Effetto Aquila Vorace: torna in mano dopo aver distrutto un santo.');
        const col = columnOfZone(attackerZoneId);
        if (col) promoteDefenseToAttack(attackerOwner, col);
      }
    }
  }

  function getActivatableForPlayer() {
    const out = [];
    game.player.hand.forEach((inst) => {
      if (inst.card.type === 'Benedizione' || inst.card.type === 'Maledizione') {
        const free = freeTempZone('player');
        if (free) out.push({ source: 'hand', zoneId: free, instance: inst });
      }
    });
    return out;
  }

  function activateManual(entry) {
    if (entry.source === 'hand') {
      placeFromHand('player', entry.instance.uid, entry.zoneId, false);
      pushLog(`Player attiva ${entry.instance.card.name} in finestra di risposta.`);
      renderAll();
      onStateChange();
    }
  }

  async function interruptPrompt() {
    const available = getActivatableForPlayer();
    if (!available.length) return false;

    game.awaitingInterrupt = true;
    els.interruptModal.classList.remove('hidden');
    els.interruptTitle.textContent = 'Finestra di Risposta';
    els.interruptText.textContent = 'L\'avversario sta eseguendo un\'azione. Vuoi interrompere e attivare una carta?';
    els.interruptActions.innerHTML = '';

    return new Promise((resolve) => {
      const done = (activated) => {
        els.interruptModal.classList.add('hidden');
        game.awaitingInterrupt = false;
        resolve(activated);
      };

      available.forEach((entry) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = `Attiva ${entry.instance.card.name}`;
        btn.addEventListener('click', () => {
          activateManual(entry);
          done(true);
        });
        els.interruptActions.appendChild(btn);
      });

      const skip = document.createElement('button');
      skip.type = 'button';
      skip.textContent = 'Passa';
      skip.addEventListener('click', () => done(false));
      els.interruptActions.appendChild(skip);
    });
  }

  function startTurn(owner) {
    game.turnOwner = owner;
    game.phase = 'inspiration';
    resetAttackFlags(owner);
    getActor(owner).inspiration = 10;

    pushLog(`Inizio turno ${owner === 'player' ? 'Player' : 'CPU'}.`);
    const drawn = drawCards(owner, 3);
    if (drawn > 0) pushLog(`${owner === 'player' ? 'Player' : 'CPU'} pesca ${drawn} carte.`);
  }

  async function runCpuTurn() {
    startTurn('cpu');
    renderAll();

    await interruptPrompt();

    const sorted = [...game.cpu.hand].sort((a, b) => getCardCost(a.card) - getCardCost(b.card));
    for (const inst of sorted) {
      const z = firstFreeZoneFor('cpu', inst);
      if (!z) continue;
      if (getCardCost(inst.card) <= game.cpu.inspiration) {
        placeFromHand('cpu', inst.uid, z, false);
        break;
      }
    }

    game.phase = 'attack';
    renderAll();

    for (const i of [1, 2, 3]) {
      const attackerZone = `cpu_attack_${i}`;
      if (!getZoneCard(attackerZone)) continue;
      await interruptPrompt();
      const possibleTargets = [1, 2, 3].map((n) => `player_attack_${n}`).filter((z) => getZoneCard(z));
      performAttack(attackerZone, possibleTargets[0] || null);
      renderAll();
    }

    game.phase = 'end';
    pushLog('Fine turno CPU.');
    game.turnNumber += 1;
    startTurn('player');
    renderAll();
    onStateChange();
  }

  function updateStatsAndHint() {
    els.playerInspiration.textContent = `Player Ispirazione: ${game.player.inspiration} | Peccato: ${game.player.peccato}`;
    els.cpuInspiration.textContent = `CPU Ispirazione: ${game.cpu.inspiration} | Peccato: ${game.cpu.peccato}`;

    if (!game.started) {
      els.prepStatus.textContent = 'Premi "Gioca" per avviare la preparazione.';
      els.handHint.textContent = 'Trascina le carte dalla mano negli slot durante Inspiration.';
      return;
    }

    els.prepStatus.textContent = `Turno ${game.turnNumber} ? Attivo: ${game.turnOwner.toUpperCase()} ? Fase: ${game.phase}`;
    if (game.phase === 'attack' && game.turnOwner === 'player') {
      els.handHint.textContent = 'Attacco: trascina un tuo Santo in attacco sul bersaglio avversario in attacco.';
    } else {
      els.handHint.textContent = 'Gioca carte trascinandole dalla mano agli slot validi.';
    }
  }

  function renderLog() {
    els.playLog.innerHTML = game.log.map((line) => `<div class="playLogEntry">${line}</div>`).join('');
  }

  function zoneCounterLabel(zoneId) {
    const z = zoneById(zoneId);
    if (!z) return '';
    const actor = getActor(z.owner);
    if (z.kind === 'grave') return `G:${actor.grave.length}`;
    if (z.kind === 'exile') return `E:${actor.exile.length}`;
    if (z.kind === 'deck') return `D:${actor.deckCount}`;
    if (z.kind === 'extra') return `X:${actor.extraCount}`;
    return '';
  }

  function renderBoard() {
    els.boardRoot.innerHTML = `${makeSideBoardHtml('cpu')}${makeSideBoardHtml('player')}`;
    const activatables = getActivatableForPlayer();
    const activeUids = new Set(activatables.map((a) => a.instance.uid));

    const slots = els.boardRoot.querySelectorAll('.slot');
    slots.forEach((slotEl) => {
      const zoneId = slotEl.getAttribute('data-zone-id');
      const zone = zoneById(zoneId);
      const inst = getZoneCard(zoneId);

      if (inst) {
        slotEl.classList.add('occupied');

        if (inst.faceDown) {
          const badge = zoneCounterLabel(zoneId);
          slotEl.innerHTML = `<div class="slotCard"><div class="miniBack ${inst.owner === 'cpu' ? 'cpuFacing' : ''}"></div></div>${badge ? `<span class="slotLabel">${badge}</span>` : ''}`;
        } else {
          const faith = toDisplay(inst.currentFaith, '-');
          const str = toDisplay(inst.currentStrength, '-');
          const glow = activeUids.has(inst.uid) ? 'activatable-glow' : '';
          const tpl = TEMPLATE_BY_TYPE[inst.card.type] || TEMPLATE_BY_TYPE.Santo;
          const stats = inst.card.type === 'Santo' || inst.card.type === 'Token'
            ? `F:${faith} â€¢ S:${str}`
            : `F:${faith}`;
          const badge = zoneCounterLabel(zoneId);
          slotEl.innerHTML = `<div class="slotCard"><div class="miniFace ${inst.owner === 'cpu' ? 'cpuFacing' : ''} ${glow}">
              <div class="miniCardBg" style="background-image:url('${tpl}')"></div>
              <div class="miniOverlay">
                <div class="miniName">${inst.card.name}</div>
                <div class="miniStats">${stats}</div>
              </div>
            </div></div>${badge ? `<span class="slotLabel">${badge}</span>` : ''}`;
        }

        if (inst.owner === 'player' && game.turnOwner === 'player' && game.phase === 'attack' && zone.kind === 'attack' && inst.card.type === 'Santo' && !inst.attackedThisTurn) {
          slotEl.draggable = true;
          slotEl.addEventListener('dragstart', (ev) => {
            ev.dataTransfer.setData('text/hw-attack-zone', zoneId);
            const targets = ['cpu_attack_1', 'cpu_attack_2', 'cpu_attack_3']
              .map((id) => els.boardRoot.querySelector(`.slot[data-zone-id=\"${id}\"]`))
              .filter(Boolean)
              .filter((el) => getZoneCard(el.getAttribute('data-zone-id')));
            targets.forEach((el) => el.classList.add('attack-target'));
          });
          slotEl.addEventListener('dragend', () => {
            els.boardRoot.querySelectorAll('.drop-ok,.attack-target,.selected').forEach((el) => {
              el.classList.remove('drop-ok', 'attack-target', 'selected');
            });
          });
        }
      } else {
        const badge = zoneCounterLabel(zoneId);
        slotEl.innerHTML = badge ? `<span class="slotLabel">${badge}</span>` : '';
      }

      if (!inst && zone.owner === 'player' && ['temp', 'attack', 'defense', 'artifact', 'building'].includes(zone.kind)) {
        slotEl.addEventListener('dragover', (ev) => {
          if (!game.started || game.turnOwner !== 'player' || game.phase !== 'inspiration') return;
          if (!ev.dataTransfer.types.includes('text/hw-hand-uid')) return;
          ev.preventDefault();
          slotEl.classList.add('selected');
        });
        slotEl.addEventListener('dragleave', () => slotEl.classList.remove('selected'));
        slotEl.addEventListener('drop', (ev) => {
          slotEl.classList.remove('selected');
          if (!game.started || game.turnOwner !== 'player' || game.phase !== 'inspiration') return;
          const uid = ev.dataTransfer.getData('text/hw-hand-uid');
          if (!uid) return;
          const ok = placeFromHand('player', uid, zoneId, false);
          if (ok) {
            renderAll();
            onStateChange();
          }
        });
      }

      if (zone.owner === 'cpu' && zone.kind === 'attack') {
        slotEl.addEventListener('dragover', (ev) => {
          if (!game.started || game.turnOwner !== 'player' || game.phase !== 'attack') return;
          if (!ev.dataTransfer.types.includes('text/hw-attack-zone')) return;
          if (!getZoneCard(zoneId)) return;
          ev.preventDefault();
          slotEl.classList.add('selected');
        });
        slotEl.addEventListener('dragleave', () => slotEl.classList.remove('selected'));
        slotEl.addEventListener('drop', (ev) => {
          slotEl.classList.remove('selected');
          if (!game.started || game.turnOwner !== 'player' || game.phase !== 'attack') return;
          const attackerZone = ev.dataTransfer.getData('text/hw-attack-zone');
          if (!attackerZone) return;
          performAttack(attackerZone, zoneId);
          renderAll();
          onStateChange();
        });
      }

      slotEl.addEventListener('click', () => {
        const c = getZoneCard(zoneId);
        if (!c) return;
        if (c.owner === 'cpu' && c.faceDown) {
          setInfoHtml('<div><strong>Carta coperta CPU</strong></div><div>Informazioni non visibili.</div>');
        } else {
          setInfoHtml(toInfoHtml(c));
        }
      });
    });

    els.boardRoot.addEventListener('dragend', () => {
      els.boardRoot.querySelectorAll('.drop-ok,.attack-target,.selected').forEach((el) => {
        el.classList.remove('drop-ok', 'attack-target', 'selected');
      });
    });
  }

  function renderHand() {
    els.playerHand.innerHTML = '';
    const frag = document.createDocumentFragment();
    const activatables = getActivatableForPlayer();
    const activeUids = new Set(activatables.map((a) => a.instance.uid));

    game.player.hand.forEach((inst) => {
      const card = inst.card;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'handCard';
      btn.draggable = game.started && game.turnOwner === 'player' && game.phase === 'inspiration';
      if (activeUids.has(inst.uid)) btn.classList.add('activatable-glow');

      btn.innerHTML = `
        <div class="hthumb">
          <div class="hthumbBg" style="background-image:url('${TEMPLATE_BY_TYPE[card.type] || TEMPLATE_BY_TYPE.Santo}')"></div>
          <div class="hthumbStats">F:${toDisplay(inst.currentFaith, '-')} | S:${toDisplay(inst.currentStrength, '-')}</div>
        </div>
        <div class="hcontent">
          <div class="hname">${card.name}</div>
          <div class="hmeta">${card.type} - Costo: ${getCardCost(card)}</div>
        </div>
      `;

      btn.addEventListener('dragstart', (ev) => {
        ev.dataTransfer.setData('text/hw-hand-uid', inst.uid);
        btn.classList.add('dragging');
        const slots = els.boardRoot.querySelectorAll('.slot');
        slots.forEach((slot) => {
          const zoneId = slot.getAttribute('data-zone-id');
          const zone = zoneById(zoneId);
          if (!zone || zone.owner !== 'player') return;
          if (getZoneCard(zoneId)) return;
          if (game.turnOwner !== 'player' || game.phase !== 'inspiration') return;
          if (canPlaceInZone(inst, zone)) slot.classList.add('drop-ok');
        });
      });
      btn.addEventListener('dragend', () => {
        btn.classList.remove('dragging');
        els.boardRoot.querySelectorAll('.drop-ok,.attack-target,.selected').forEach((el) => {
          el.classList.remove('drop-ok', 'attack-target', 'selected');
        });
      });

      btn.addEventListener('click', () => {
        setInfoHtml(toInfoHtml(inst));
      });

      frag.appendChild(btn);
    });

    els.playerHand.appendChild(frag);
  }

  function renderAll() {
    renderBoard();
    renderHand();
    updateStatsAndHint();
    renderLog();
  }

  function nextPhase() {
    if (!game.started || !game.preparationDone || game.turnOwner !== 'player' || game.phase === 'end') return;
    const idx = PLAYER_PHASES.indexOf(game.phase);
    const next = PLAYER_PHASES[Math.min(PLAYER_PHASES.length - 1, idx + 1)];
    game.phase = next;
    pushLog(`Player passa a fase: ${next}.`);

    if (next === 'end') {
      endTurn();
      return;
    }

    renderAll();
    onStateChange();
  }

  function endTurn() {
    if (!game.started || !game.preparationDone || game.turnOwner !== 'player') return;
    game.phase = 'end';
    pushLog('Fine turno Player.');
    renderAll();
    onStateChange();
    runCpuTurn();
  }

  function startPreparation() {
    clearBoard();
    setupHandsAndDecks();
    game.started = true;
    game.preparationDone = false;
    game.turnNumber = 1;
    game.phase = 'inspiration';
    game.turnOwner = 'player';

    runPreparationAuto('cpu');
    pushLog('Preparazione: CPU posiziona carte coperte. Ora scegli tu dove posizionare le tue (trascina dalla mano).');

    setInfoHtml('<strong>Preparazione</strong><div>Posiziona le tue carte coperte in campo. Premi di nuovo "Gioca" per confermare e rivelare.</div>');
    if (els.startPrepBtn) els.startPrepBtn.textContent = 'Conferma Preparazione';
    renderAll();
    onStateChange();
  }

  function finalizePreparation() {
    if (!game.started || game.preparationDone) return;
    game.preparationDone = true;

    revealAllBoardCards();
    pushLog('Reveal fine preparazione: le carte sul campo vengono rivelate.');

    const first = Math.random() < 0.5 ? 'player' : 'cpu';
    pushLog(`Lancio moneta: inizia ${first === 'player' ? 'Player' : 'CPU'}.`);

    if (first === 'player') {
      startTurn('player');
      game.turnNumber = 1;
      renderAll();
      onStateChange();
    } else {
      game.turnNumber = 1;
      runCpuTurn();
    }
    if (els.startPrepBtn) els.startPrepBtn.textContent = 'Nuova Partita';
  }

  function bindButtons() {
    if (els.startPrepBtn) {
      els.startPrepBtn.addEventListener('click', () => {
        if (!game.started) {
          startPreparation();
        } else if (!game.preparationDone) {
          finalizePreparation();
        } else {
          game.started = false;
          game.preparationDone = false;
          if (els.startPrepBtn) els.startPrepBtn.textContent = 'Gioca';
          startPreparation();
        }
      });
    }
    if (els.nextPhaseBtn) {
      els.nextPhaseBtn.addEventListener('click', nextPhase);
    }
    if (els.endTurnBtn) {
      els.endTurnBtn.addEventListener('click', endTurn);
    }
  }

  function init() {
    game.miniDeckCards = buildMiniDeck();
    clearBoard();
    bindButtons();
    setInfoHtml('Premi Gioca per avviare preparazione.');
    if (els.startPrepBtn) els.startPrepBtn.textContent = 'Gioca';
    pushLog('Modulo gioco inizializzato.');
    renderAll();
  }

  return {
    init,
    startPreparation,
    renderAll,
  };
}

