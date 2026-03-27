import { STORAGE_KEY } from './config.js';

export function loadPersistedUI() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function savePersistedUI(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore storage errors
  }
}

export function readFilterValues(els) {
  return {
    search: els.searchInput.value,
    faction: els.factionFilter.value,
    type: els.typeFilter.value,
    crosses: els.crossesFilter.value,
    faithMin: els.faithMin.value,
    faithMax: els.faithMax.value,
    strengthMin: els.strengthMin.value,
    strengthMax: els.strengthMax.value,
    withEffectOnly: els.withEffectOnly.checked,
    onlyWhiteCross: els.onlyWhiteCross.checked,
  };
}

export function applyFilterValues(els, filters) {
  if (!filters) return;
  els.searchInput.value = filters.search || '';
  els.factionFilter.value = filters.faction || '';
  els.typeFilter.value = filters.type || '';
  els.crossesFilter.value = filters.crosses || '';
  els.faithMin.value = filters.faithMin || '';
  els.faithMax.value = filters.faithMax || '';
  els.strengthMin.value = filters.strengthMin || '';
  els.strengthMax.value = filters.strengthMax || '';
  els.withEffectOnly.checked = Boolean(filters.withEffectOnly);
  els.onlyWhiteCross.checked = Boolean(filters.onlyWhiteCross);
}
