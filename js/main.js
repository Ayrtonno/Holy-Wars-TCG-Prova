import { state } from './state.js';
import { toDisplay, includeInRange, matchCrossRange } from './utils.js';
import { renderList, renderDetails } from './render.js';
import { attachRuntimeAPI } from './runtime.js';
import {
  loadPersistedUI,
  savePersistedUI,
  readFilterValues,
  applyFilterValues,
} from './persistence.js';
import { createGameModule } from './game.js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from './config.js';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

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
    closeDetailsBtn: document.getElementById('closeDetailsBtn'),
    detailsBackdrop: document.getElementById('detailsBackdrop'),

    authBtn: document.getElementById('authBtn'),
    authModal: document.getElementById('authModal'),
    authEmail: document.getElementById('authEmail'),
    authPassword: document.getElementById('authPassword'),
    authLoginBtn: document.getElementById('authLoginBtn'),
    authLogoutBtn: document.getElementById('authLogoutBtn'),
    authCloseBtn: document.getElementById('authCloseBtn'),
    authStatusText: document.getElementById('authStatusText'),
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
  try {
    const data = await fetchCardsFromSupabase();
    if (Array.isArray(data) && data.length) return data;
  } catch (err) {
    console.warn('Supabase load failed, fallback to local JSON.', err);
  }

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

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function fetchCardsFromSupabase() {
  const { data, error } = await supabase.from('cards').select('*');
  if (error) throw error;
  return data || [];
}

async function insertCardSupabase(card) {
  const { data, error } = await supabase.from('cards').insert([card]).select('*');
  if (error) throw error;
  return data?.[0] || card;
}

async function updateCardSupabase(card, id) {
  const { data, error } = await supabase.from('cards').update(card).eq('id', id).select('*');
  if (error) throw error;
  return data?.[0] || card;
}

async function deleteCardSupabase(id) {
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw error;
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

function generateIdFromForm(els, cards, currentId) {
  const name = els.editName.value.trim();
  const setValue = els.editSet.value.trim();
  const prefixMatch = setValue.match(/^([A-Za-z]{2,4})/);
  const prefix = prefixMatch ? prefixMatch[1].toUpperCase() : '';
  const slug = slugify(name || 'card');
  const base = prefix ? `${prefix}_${slug}` : `custom_${slug}`;
  return makeUniqueId(cards, base, currentId);
}

function buildCardFromForm(els, cards, currentId) {
  const name = els.editName.value.trim();
  const faction = els.editFaction.value.trim();
  const type = els.editType.value.trim();

  if (!name || !faction || !type) {
    return { error: 'Compila Nome, Fazione e Tipo.' };
  }

  const id = state.isCreating
    ? generateIdFromForm(els, cards, currentId)
    : makeUniqueId(cards, els.editId.value.trim(), currentId);
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
  els.togglePreviewBtn.setAttribute('aria-label', state.showCardArt ? 'Nascondi anteprima' : 'Mostra anteprima');
  els.togglePreviewBtn.setAttribute('title', state.showCardArt ? 'Nascondi anteprima' : 'Mostra anteprima');
  const onIcon = els.togglePreviewBtn.querySelector('.iconPreviewOn');
  const offIcon = els.togglePreviewBtn.querySelector('.iconPreviewOff');
  if (onIcon && offIcon) {
    onIcon.classList.toggle('hidden', !state.showCardArt);
    offIcon.classList.toggle('hidden', state.showCardArt);
  }
  els.templateCard.classList.toggle('hidden', !state.showCardArt);
}

function updateAutoIdIfCreating(els) {
  if (!state.isCreating) return;
  els.editId.value = generateIdFromForm(els, state.cards, null);
}

export async function initApp() {
  const els = getElements();
  const persisted = loadPersistedUI();
  let currentUser = null;

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

  const mobileMq = window.matchMedia('(max-width: 1080px)');
  const setMobileDetailsOpen = (open) => {
    document.body.classList.toggle('mobile-details-open', open);
    if (els.detailsBackdrop) {
      els.detailsBackdrop.classList.toggle('hidden', !open);
    }
  };

  const maybeOpenMobileDetails = () => {
    if (mobileMq.matches) setMobileDetailsOpen(true);
  };

  const closeMobileDetails = () => setMobileDetailsOpen(false);

  mobileMq.addEventListener('change', (event) => {
    if (!event.matches) closeMobileDetails();
  });

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
      els.editId.readOnly = true;
      updateAutoIdIfCreating(els);
    } else if (state.editingId) {
      els.editTitle.textContent = 'Modifica carta';
      els.editHint.textContent = 'Modifica i campi e salva le modifiche.';
      els.deleteCardBtn.classList.remove('hidden');
      els.editId.readOnly = false;
    } else {
      els.editTitle.textContent = 'Modifica carta';
      els.editHint.textContent = 'Clicca una carta per modificarla.';
      els.deleteCardBtn.classList.add('hidden');
      fillEditForm(els, null);
      els.editId.readOnly = false;
    }
  };

  const syncAuthUI = () => {
    const authed = Boolean(currentUser);
    els.authStatusText.textContent = authed ? `Connesso: ${currentUser.email}` : 'Non autenticato';
    els.authLogoutBtn.classList.toggle('hidden', !authed);
    els.authLoginBtn.classList.toggle('hidden', authed);
    els.createCardBtn.disabled = !authed;
    els.toggleEditModeBtn.disabled = !authed;
    if (!authed && state.editMode) setEditMode(false);
  };

  const openAuthModal = () => {
    els.authModal.classList.remove('hidden');
    els.authEmail.focus();
  };

  const closeAuthModal = () => {
    els.authModal.classList.add('hidden');
  };

  const requireAuth = () => {
    if (currentUser) return true;
    openAuthModal();
    return false;
  };

  const setEditMode = (enabled) => {
    if (enabled && !requireAuth()) return;
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
    maybeOpenMobileDetails();
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
    syncAuthUI();
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

  if (els.closeDetailsBtn) {
    els.closeDetailsBtn.addEventListener('click', closeMobileDetails);
  }

  if (els.detailsBackdrop) {
    els.detailsBackdrop.addEventListener('click', closeMobileDetails);
  }

  els.authBtn.addEventListener('click', openAuthModal);
  els.authCloseBtn.addEventListener('click', closeAuthModal);

  els.authLoginBtn.addEventListener('click', async () => {
    const email = els.authEmail.value.trim();
    const password = els.authPassword.value;
    if (!email || !password) {
      els.authStatusText.textContent = 'Inserisci email e password.';
      return;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      els.authStatusText.textContent = `Errore: ${error.message}`;
      return;
    }
    currentUser = data.user;
    els.authStatusText.textContent = 'Accesso effettuato.';
    syncAuthUI();
    closeAuthModal();
  });

  els.authLogoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      els.authStatusText.textContent = `Errore: ${error.message}`;
      return;
    }
    currentUser = null;
    els.authStatusText.textContent = 'Disconnesso.';
    syncAuthUI();
  });

  supabase.auth.getSession().then(({ data }) => {
    currentUser = data?.session?.user || null;
    syncAuthUI();
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user || null;
    syncAuthUI();
  });

  els.toggleEditModeBtn.addEventListener('click', () => {
    setEditMode(!state.editMode);
    renderAll();
  });

  els.createCardBtn.addEventListener('click', () => {
    if (!requireAuth()) return;
    state.isCreating = true;
    state.editingId = null;
    fillEditForm(els, null);
    setEditMode(true);
    renderAll();
    updateAutoIdIfCreating(els);
    els.editName.focus();
  });

  els.editWhiteCross.addEventListener('change', () => {
    els.editCrosses.disabled = els.editWhiteCross.checked;
    if (els.editWhiteCross.checked) {
      els.editCrosses.value = '';
    }
  });

  els.editName.addEventListener('input', () => updateAutoIdIfCreating(els));
  els.editSet.addEventListener('input', () => updateAutoIdIfCreating(els));

  els.cancelEditBtn.addEventListener('click', () => {
    setEditMode(false);
    renderAll();
  });

  els.editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!requireAuth()) return;
    const currentId = state.isCreating ? null : state.editingId;
    const { card, error } = buildCardFromForm(els, state.cards, currentId);
    if (error) {
      alert(error);
      return;
    }

    const run = async () => {
      if (state.isCreating) {
        const created = await insertCardSupabase(card);
        state.cards = [...state.cards, created];
        state.selectedId = created.id;
        state.editingId = created.id;
      } else {
        const updated = await updateCardSupabase(card, currentId);
        const idx = state.cards.findIndex((c) => c.id === currentId);
        if (idx === -1) {
          state.cards = [...state.cards, updated];
        } else {
          state.cards = [...state.cards.slice(0, idx), updated, ...state.cards.slice(idx + 1)];
        }
        state.selectedId = updated.id;
        state.editingId = updated.id;
      }

      state.isCreating = false;
      buildSerialBySet(state.cards);
      populateFilters(els, state.cards);
      renderAll();
    };

    run().catch((err) => {
      alert(`Errore salvataggio: ${err.message || err}`);
    });
  });

  els.deleteCardBtn.addEventListener('click', () => {
    if (!state.editingId) return;
    if (!requireAuth()) return;
    const card = state.cards.find((c) => c.id === state.editingId);
    if (!card) return;
    if (!confirm(`Eliminare la carta "${card.name}"?`)) return;

    deleteCardSupabase(state.editingId)
      .then(() => {
        state.cards = state.cards.filter((c) => c.id !== state.editingId);
        buildSerialBySet(state.cards);
        populateFilters(els, state.cards);
        state.selectedId = state.cards[0]?.id || null;
        state.editingId = null;
        state.isCreating = false;
        renderAll();
      })
      .catch((err) => {
        alert(`Errore eliminazione: ${err.message || err}`);
      });
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
  updatePreviewToggle(els);
  syncAuthUI();
  attachRuntimeAPI(state);
}
