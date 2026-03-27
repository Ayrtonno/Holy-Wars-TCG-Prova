import { state } from './state.js';
import { toDisplay, includeInRange, matchCrossRange } from './utils.js';
import { renderList, renderDetails } from './render.js';
import { attachRuntimeAPI } from './runtime.js';
import { loadPersistedUI, savePersistedUI, readFilterValues, applyFilterValues } from './persistence.js';
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
  const serialBySet = {};
  cards.forEach((card) => {
    const setKey = toDisplay(card.set, 'NO_SET');
    const next = (serialBySet[setKey] || 0) + 1;
    serialBySet[setKey] = next;
    state.serialById[card.id] = String(next).padStart(4, '0');
  });
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

  const onSelectCard = (cardId) => {
    state.selectedId = cardId;
    renderList(state, els, onSelectCard);
    renderDetails(state, els);
    persistNow();
  };

  const renderAll = () => {
    state.filtered = filterCards(els);
    if (!state.filtered.some((c) => c.id === state.selectedId)) {
      state.selectedId = state.filtered[0]?.id || null;
    }
    renderList(state, els, onSelectCard);
    renderDetails(state, els);
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
    });
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
  const targetScreen = persisted?.screen || 'menu';
  showScreen(els, targetScreen, false);
  if (targetScreen === 'play') game.renderAll();
  attachRuntimeAPI(state);
}
