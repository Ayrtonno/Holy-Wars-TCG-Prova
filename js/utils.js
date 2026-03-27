export function toDisplay(value, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;
  return String(value);
}

export function cardCrosses(card) {
  if (card.crossesIsWhite) return 'W';
  if (typeof card.crosses === 'number') return String(card.crosses);
  return toDisplay(card.crossesRaw, '');
}

export function cardFaith(card) {
  if (typeof card.faith === 'number') return String(card.faith);
  return toDisplay(card.faithRaw, '-');
}

export function includeInRange(value, minRaw, maxRaw) {
  const min = minRaw === '' ? null : Number(minRaw);
  const max = maxRaw === '' ? null : Number(maxRaw);

  if (value === null || value === undefined || Number.isNaN(value)) {
    return min === null && max === null;
  }
  if (min !== null && value < min) return false;
  if (max !== null && value > max) return false;
  return true;
}

export function matchCrossRange(card, selected) {
  if (!selected) return true;
  if (selected === 'white') return card.crossesIsWhite;
  if (selected === 'unknown') return !card.crossesIsWhite && typeof card.crosses !== 'number';
  if (typeof card.crosses !== 'number') return false;
  if (selected === '1-3') return card.crosses >= 1 && card.crosses <= 3;
  if (selected === '4-6') return card.crosses >= 4 && card.crosses <= 6;
  if (selected === '7-9') return card.crosses >= 7 && card.crosses <= 9;
  if (selected === '10') return card.crosses === 10;
  return true;
}
