import { state } from './state.js';
import { toDisplay, includeInRange, matchCrossRange } from './utils.js';
import { renderList, renderDetails } from './render.js';
import { attachRuntimeAPI } from './runtime.js';
import {
  loadPersistedUI,
  savePersistedUI,
  readFilterValues,
  applyFilterValues,
  loadPersistedCards,
  savePersistedCards,
} from './persistence.js';
import { createGameModule } from './game.js';

function getElements() {
  return {
    menuScreen: document.getElementById('menuScreen'),
    cardListScreen: document.getElementById('cardListScreen'),
    shopScreen: document.getElementById('shopScreen'),
    playScreen: document.getElementById('playScreen'),
    openPlayBtn: document.getElementById('openPlayBtn'),
    openCardListBtn: document.getElementById('openCardListBtn'),
    openShopBtn: document.getElementById('openShopBtn'),
    createCardBtn: document.getElementById('createCardBtn'),
    toggleEditModeBtn: document.getElementById('toggleEditModeBtn'),
    backToMenuFromCards: document.getElementById('backToMenuFromCards'),
    backToMenuFromShop: document.getElementById('backToMenuFromShop'),
    backToMenuFromPlay: document.getElementById('backToMenuFromPlay'),
    startPrepBtn: document.getElementById('startPrepBtn'),
    nextPhaseBtn: document.getElementById('nextPhaseBtn'),
    endTurnBtn: document.getElementById('endTurnBtn'),

    boardRoot: document.getElementById('boardRoot'),
    playerHand: document.getElementById('playerHand'),
    playSelectedInfo: document.getElementById('playSelectedInfo'),
    playLog: document.getElementById('playLog'),
    playerInspiration: document.getElementById('playerInspiration'),
    cpuInspiration: document.getElementById('cpuInspiration'),
    prepStatus: document.getElementById('prepStatus'),
    handHint: document.getElementById('handHint'),
    interruptModal: document.getElementById('interruptModal'),
    interruptTitle: document.getElementById('interruptTitle'),
    interruptText: document.getElementById('interruptText'),
    interruptActions: document.getElementById('interruptActions'),

    searchInput: document.getElementById('searchInput'),
    factionFilter: document.getElementById('factionFilter'),
    typeFilter: document.getElementById('typeFilter'),
    crossesFilter: document.getElementById('crossesFilter'),
    faithMin: document.getElementById('faithMin'),
    faithMax: document.getElementById('faithMax'),
    strengthMin: document.getElementById('strengthMin'),
    strengthMax: document.getElementById('strengthMax'),
    withEffectOnly: document.getElementById('withEffectOnly'),
    onlyWhiteCross: document.getElementById('onlyWhiteCross'),
    resetFilters: document.getElementById('resetFilters'),
    sortSelect: document.getElementById('sortSelect'),
    sortDirBtn: document.getElementById('sortDirBtn'),

    resultList: document.getElementById('resultList'),
    resultCount: document.getElementById('resultCount'),
    emptyState: document.getElementById('emptyState'),
    cardPreview: document.getElementById('cardPreview'),

    templateCard: document.getElementById('templateCard'),
    overlayName: document.getElementById('overlayName'),
    overlayCrosses: document.getElementById('overlayCrosses'),
    overlayFaith: document.getElementById('overlayFaith'),
    overlayStrength: document.getElementById('overlayStrength'),
    overlayEffect: document.getElementById('overlayEffect'),
    overlaySetId: document.getElementById('overlaySetId'),

    previewType: document.getElementById('previewType'),
    previewFaction: document.getElementById('previewFaction'),
    previewSet: document.getElementById('previewSet'),
    previewId: document.getElementById('previewId'),
    previewCrosses: document.getElementById('previewCrosses'),
    previewFaith: document.getElementById('previewFaith'),
    previewStrength: document.getElementById('previewStrength'),
    previewEffect: document.getElementById('previewEffect'),
    togglePreviewBtn: document.getElementById('togglePreviewBtn'),

    editPanel: document.getElementById('editPanel'),
    editTitle: document.getElementById('editTitle'),
    editHint: document.getElementById('editHint'),
    editForm: document.getElementById('editForm'),
    editId: document.getElementById('editId'),
    editName: document.getElementById('editName'),
    editFaction: document.getElementById('editFaction'),
    editSet: document.getElementById('editSet'),
    editType: document.getElementById('editType'),
    editCrosses: document.getElementById('editCrosses'),
    editWhiteCross: document.getElementById('editWhiteCross'),
    editFaith: document.getElementById('editFaith'),
    editStrength: document.getElementById('editStrength'),
    editEffect: document.getElementById('editEffect'),
    saveCardBtn: document.getElementById('saveCardBtn'),
    deleteCardBtn: document.getElementById('deleteCardBtn'),
    cancelEditBtn: document.getElementById('cancelEditBtn'),
  };
}

function showScreen(els, name, persist) {
  const map = {
    menu: els.menuScreen,
    cards: els.cardListScreen,
    shop: els.shopScreen,
    play: els.playScreen,
  };
  Object.values(map).forEach((screen) => screen && screen.classList.add('hidden'));
  if (map[name]) map[name].classList.remove('hidden');
  state.currentScreen = name;
  if (persist) persist();
}

function populateFilters(els, cards) {
  const factions = [...new Set(cards.map((c) => c.faction))].sort();
  const types = [...new Set(cards.map((c) => c.type))].sort();
  const prevFaction = els.factionFilter.value;
  const prevType = els.typeFilter.value;

  els.factionFilter.innerHTML = '<option value=\"\">Tutte</option>';
  els.typeFilter.innerHTML = '<option value=\"\">Tutti</option>';

  factions.forEach((faction) => {
    const opt = document.createElement('option');
    opt.value = faction;
    opt.textContent = faction;
    els.factionFilter.appendChild(opt);
  });

  types.forEach((type) => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = type;
    els.typeFilter.appendChild(opt);
  });

  if (factions.includes(prevFaction)) els.factionFilter.value = prevFaction;
  if (types.includes(prevType)) els.typeFilter.value = prevType;
}

function filterCards(els) {
  const q = els.searchInput.value.trim().toLowerCase();
  const faction = els.factionFilter.value;
  const type = els.typeFilter.value;
  const crosses = els.crossesFilter.value;
  const withEffectOnly = els.withEffectOnly.checked;
  const onlyWhiteCross = els.onlyWhiteCross.checked;

  return state.cards.filter((card) => {
    if (q) {
      const hay = `${card.name} ${card.effectText || ''} ${card.type} ${card.faction}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (faction && card.faction !== faction) return false;
    if (type && card.type !== type) return false;
    if (!matchCrossRange(card, crosses)) return false;
    if (onlyWhiteCross && !card.crossesIsWhite) return false;
    if (!includeInRange(card.faith, els.faithMin.value, els.faithMax.value)) return false;
    if (!includeInRange(card.strength, els.strengthMin.value, els.strengthMax.value)) return false;
    if (withEffectOnly && !card.effectText) return false;
    return true;
  });
}

async function loadCards(els) {
  const persisted = loadPersistedCards();
  if (Array.isArray(persisted) && persisted.length) return persisted;

  try {
    const res = await fetch('./data/cards.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    els.resultList.innerHTML = `<div class="emptyState">Impossibile caricare data/cards.json. Avvia il server locale e ricarica.</div>`;
    els.resultCount.textContent = 'errore';
    console.error(err);
    return null;
  }
}

function buildSerialBySet(cards) {
  state.serialById = {};
  const serialBySet = {};
  cards.forEach((card) => {
    const setKey = toDisplay(card.set, 'NO_SET');
    const next = (serialBySet[setKey] || 0) + 1;
    serialBySet[setKey] = next;
    state.serialById[card.id] = String(next).padStart(4, '0');
  });
}

function cardRarityValue(card) {
  if (card.crossesIsWhite) return 11;
  if (typeof card.crosses === 'number') return card.crosses;
  return null;
}

function compareText(a, b) {
  return a.localeCompare(b, 'it', { sensitivity: 'base' });
}

function sortCards(cards, sortKey, sortDir) {
  const list = [...cards];
  const dir = sortDir === 'desc' ? -1 : 1;
  list.sort((a, b) => {
    if (sortKey === 'set') {
      const cmp = compareText(toDisplay(a.set, ''), toDisplay(b.set, ''));
      if (cmp !== 0) return cmp * dir;
      return compareText(a.name, b.name) * dir;
    }
    if (sortKey === 'rarity') {
      const av = cardRarityValue(a);
      const bv = cardRarityValue(b);
      if (av == null && bv != null) return 1;
      if (av != null && bv == null) return -1;
      if (av != null && bv != null && av !== bv) return (av - bv) * dir;
      return compareText(a.name, b.name) * dir;
    }
    if (sortKey === 'strength') {
      const av = a.strength;
      const bv = b.strength;
      if (av == null && bv != null) return 1;
      if (av != null && bv == null) return -1;
      if (av != null && bv != null && av !== bv) return (av - bv) * dir;
      return compareText(a.name, b.name) * dir;
    }
    if (sortKey === 'faith') {
      const av = a.faith;
      const bv = b.faith;
      if (av == null && bv != null) return 1;
      if (av != null && bv == null) return -1;
      if (av != null && bv != null && av !== bv) return (av - bv) * dir;
      return compareText(a.name, b.name) * dir;
    }
    const cmp = compareText(a.name, b.name);
    if (cmp !== 0) return cmp * dir;
    return compareText(toDisplay(a.set, ''), toDisplay(b.set, '')) * dir;
  });
  return list;
}

function parseOptionalInt(value) {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function makeUniqueId(cards, candidate, currentId) {
  const base = candidate || 'custom_card';
  let id = base;
  let i = 2;
  while (cards.some((c) => c.id === id && c.id !== currentId)) {
    id = `${base}_${i}`;
    i += 1;
  }
  return id;
}

function buildCardFromForm(els, cards, currentId) {
  const name = els.editName.value.trim();
  const faction = els.editFaction.value.trim();
  const type = els.editType.value.trim();

  if (!name || !faction || !type) {
    return { error: 'Compila Nome, Fazione e Tipo.' };
  }

  const rawId = els.editId.value.trim();
  const fallbackId = `custom_${slugify(name) || 'card'}`;
  const id = makeUniqueId(cards, rawId || fallbackId, currentId);
  const setValue = els.editSet.value.trim() || null;
  const whiteCross = els.editWhiteCross.checked;
  const crossesValue = whiteCross ? null : parseOptionalInt(els.editCrosses.value);
  const faithValue = parseOptionalInt(els.editFaith.value);
  const strengthValue = parseOptionalInt(els.editStrength.value);

  return {
    card: {
      id,
      name,
      faction,
      set: setValue,
      type,
      crosses: crossesValue,
      crossesRaw: whiteCross ? 'White' : (crossesValue == null ? null : String(crossesValue)),
      crossesIsWhite: whiteCross,
      crossesKind: whiteCross ? 'white' : 'numeric',
      faith: faithValue,
      faithRaw: faithValue == null ? null : String(faithValue),
      faithKind: 'numeric',
      strength: strengthValue,
      effectText: els.editEffect.value.trim(),
    },
  };
}

function fillEditForm(els, card) {
  els.editId.value = card?.id || '';
  els.editName.value = card?.name || '';
  els.editFaction.value = card?.faction || '';
  els.editSet.value = card?.set || '';
  els.editType.value = card?.type || '';
  els.editWhiteCross.checked = Boolean(card?.crossesIsWhite);
  els.editCrosses.value = card?.crosses ?? '';
  els.editCrosses.disabled = els.editWhiteCross.checked;
  els.editFaith.value = card?.faith ?? '';
  els.editStrength.value = card?.strength ?? '';
  els.editEffect.value = card?.effectText || '';
}

function updatePreviewToggle(els) {
  if (!els.togglePreviewBtn) return;
  els.togglePreviewBtn.textContent = state.showCardArt ? 'Nascondi anteprima' : 'Mostra anteprima';
  els.templateCard.classList.toggle('hidden', !state.showCardArt);
}

export async function initApp() {
  const els = getElements();
  const persisted = loadPersistedUI();

  const persistNow = () => {
    savePersistedUI({
      screen: state.currentScreen,
      selectedId: state.selectedId,
      filters: readFilterValues(els),
    });
  };

  const cards = await loadCards(els);
  if (!cards) {
    showScreen(els, 'menu', false);
    return;
  }

  state.cards = cards;
  const game = createGameModule({
    state,
    cards: state.cards,
    els,
    onStateChange: persistNow,
  });
  game.init();

  buildSerialBySet(state.cards);
  populateFilters(els, state.cards);

  applyFilterValues(els, persisted?.filters);
  state.selectedId = persisted?.selectedId || null;

  const syncEditPanel = () => {
    if (!els.editPanel) return;
    const editing = state.editMode;
    els.editPanel.classList.toggle('hidden', !editing);

    if (!editing) {
      return;
    }

    els.emptyState.classList.add('hidden');
    els.cardPreview.classList.add('hidden');

    if (state.isCreating) {
      els.editTitle.textContent = 'Nuova carta';
      els.editHint.textContent = 'Compila i campi per creare una nuova carta.';
      els.deleteCardBtn.classList.add('hidden');
    } else if (state.editingId) {
      els.editTitle.textContent = 'Modifica carta';
      els.editHint.textContent = 'Modifica i campi e salva le modifiche.';
      els.deleteCardBtn.classList.remove('hidden');
    } else {
      els.editTitle.textContent = 'Modifica carta';
      els.editHint.textContent = 'Clicca una carta per modificarla.';
      els.deleteCardBtn.classList.add('hidden');
      fillEditForm(els, null);
    }
  };

  const setEditMode = (enabled) => {
    state.editMode = enabled;
    els.toggleEditModeBtn.textContent = enabled ? 'Esci modifica' : 'Modalità modifica';
    if (!enabled) {
      state.isCreating = false;
      state.editingId = null;
    } else if (state.selectedId && !state.isCreating) {
      const card = state.cards.find((c) => c.id === state.selectedId);
      if (card) {
        state.editingId = card.id;
        fillEditForm(els, card);
      }
    }
    syncEditPanel();
  };

  const onSelectCard = (cardId) => {
    state.selectedId = cardId;
    if (state.editMode) {
      const card = state.cards.find((c) => c.id === cardId);
      if (card) {
        state.isCreating = false;
        state.editingId = card.id;
        fillEditForm(els, card);
      }
    }
    renderAll();
  };

  const renderAll = () => {
    const sortKey = els.sortSelect?.value || 'name';
    const sortDir = els.sortDirBtn?.dataset?.dir || 'asc';
    state.filtered = sortCards(filterCards(els), sortKey, sortDir);
    if (!state.filtered.some((c) => c.id === state.selectedId)) {
      state.selectedId = state.filtered[0]?.id || null;
    }
    renderList(state, els, onSelectCard);
    renderDetails(state, els);
    updatePreviewToggle(els);
    syncEditPanel();
    persistNow();
  };

  const trigger = [
    els.searchInput,
    els.factionFilter,
    els.typeFilter,
    els.crossesFilter,
    els.faithMin,
    els.faithMax,
    els.strengthMin,
    els.strengthMax,
    els.withEffectOnly,
    els.onlyWhiteCross,
    els.sortSelect,
  ];

  trigger.forEach((el) => {
    const ev = el.tagName === 'INPUT' && el.type === 'text' ? 'input' : 'change';
    el.addEventListener(ev, renderAll);
    if (ev !== 'input') el.addEventListener('input', renderAll);
  });

  els.resetFilters.addEventListener('click', () => {
    applyFilterValues(els, {
      search: '', faction: '', type: '', crosses: '',
      faithMin: '', faithMax: '', strengthMin: '', strengthMax: '',
      withEffectOnly: false, onlyWhiteCross: false,
      sortKey: 'name',
      sortDir: 'asc',
    });
    renderAll();
  });

  if (els.sortDirBtn) {
    if (!els.sortDirBtn.dataset.dir) {
      els.sortDirBtn.dataset.dir = 'asc';
      els.sortDirBtn.textContent = 'Crescente';
    }
    els.sortDirBtn.addEventListener('click', () => {
      const next = els.sortDirBtn.dataset.dir === 'asc' ? 'desc' : 'asc';
      els.sortDirBtn.dataset.dir = next;
      els.sortDirBtn.textContent = next === 'asc' ? 'Crescente' : 'Decrescente';
      renderAll();
    });
  }

  els.togglePreviewBtn.addEventListener('click', () => {
    state.showCardArt = !state.showCardArt;
    updatePreviewToggle(els);
  });

  els.toggleEditModeBtn.addEventListener('click', () => {
    setEditMode(!state.editMode);
    renderAll();
  });

  els.createCardBtn.addEventListener('click', () => {
    state.isCreating = true;
    state.editingId = null;
    fillEditForm(els, null);
    setEditMode(true);
    renderAll();
    els.editName.focus();
  });

  els.editWhiteCross.addEventListener('change', () => {
    els.editCrosses.disabled = els.editWhiteCross.checked;
    if (els.editWhiteCross.checked) {
      els.editCrosses.value = '';
    }
  });

  els.cancelEditBtn.addEventListener('click', () => {
    setEditMode(false);
    renderAll();
  });

  els.editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const currentId = state.isCreating ? null : state.editingId;
    const { card, error } = buildCardFromForm(els, state.cards, currentId);
    if (error) {
      alert(error);
      return;
    }

    if (state.isCreating) {
      state.cards = [...state.cards, card];
    } else {
      const idx = state.cards.findIndex((c) => c.id === currentId);
      if (idx === -1) {
        state.cards = [...state.cards, card];
      } else {
        state.cards = [...state.cards.slice(0, idx), card, ...state.cards.slice(idx + 1)];
      }
    }

    savePersistedCards(state.cards);
    buildSerialBySet(state.cards);
    populateFilters(els, state.cards);

    state.selectedId = card.id;
    state.editingId = card.id;
    state.isCreating = false;
    renderAll();
  });

  els.deleteCardBtn.addEventListener('click', () => {
    if (!state.editingId) return;
    const card = state.cards.find((c) => c.id === state.editingId);
    if (!card) return;
    if (!confirm(`Eliminare la carta "${card.name}"?`)) return;

    state.cards = state.cards.filter((c) => c.id !== state.editingId);
    savePersistedCards(state.cards);
    buildSerialBySet(state.cards);
    populateFilters(els, state.cards);

    state.selectedId = state.cards[0]?.id || null;
    state.editingId = null;
    state.isCreating = false;
    renderAll();
  });

  els.openPlayBtn.addEventListener('click', () => {
    showScreen(els, 'play', true);
    game.renderAll();
  });
  els.openCardListBtn.addEventListener('click', () => showScreen(els, 'cards', true));
  els.openShopBtn.addEventListener('click', () => showScreen(els, 'shop', true));
  els.backToMenuFromCards.addEventListener('click', () => showScreen(els, 'menu', true));
  els.backToMenuFromShop.addEventListener('click', () => showScreen(els, 'menu', true));
  els.backToMenuFromPlay.addEventListener('click', () => showScreen(els, 'menu', true));

  renderAll();
  const targetScreen = 'cards';
  showScreen(els, targetScreen, false);
  attachRuntimeAPI(state);
}
