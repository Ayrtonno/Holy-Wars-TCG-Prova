import { TEMPLATE_BY_TYPE, OVERLAY_BY_TYPE, POSITION_BY_TYPE } from './config.js';
import { toDisplay, cardCrosses, cardFaith } from './utils.js';

function pickSetIdStyleFromTemplate(state, templateUrl) {
  if (state.setIdStyleByTemplate[templateUrl]) {
    return Promise.resolve(state.setIdStyleByTemplate[templateUrl]);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const fallback = { color: '#111111', shadow: 'none' };
        state.setIdStyleByTemplate[templateUrl] = fallback;
        resolve(fallback);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const sampleW = Math.max(20, Math.floor(canvas.width * 0.36));
      const sampleH = Math.max(6, Math.floor(canvas.height * 0.06));
      const sampleX = Math.floor((canvas.width - sampleW) / 2);
      const sampleY = Math.max(0, canvas.height - sampleH - 2);

      const data = ctx.getImageData(sampleX, sampleY, sampleW, sampleH).data;
      let lumSum = 0;
      let count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        lumSum += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        count += 1;
      }

      const avgLum = count ? lumSum / count : 255;
      const style =
        avgLum < 125
          ? { color: '#f5f5f5', shadow: '0 1px 1px rgba(0, 0, 0, 0.65)' }
          : { color: '#111111', shadow: '0 1px 1px rgba(255, 255, 255, 0.45)' };

      state.setIdStyleByTemplate[templateUrl] = style;
      resolve(style);
    };

    img.onerror = () => {
      const fallback = { color: '#111111', shadow: 'none' };
      state.setIdStyleByTemplate[templateUrl] = fallback;
      resolve(fallback);
    };

    img.src = templateUrl;
  });
}

export function renderList(state, els, onSelect) {
  els.resultCount.textContent = `${state.filtered.length} risultati`;
  els.resultList.innerHTML = '';

  const fragment = document.createDocumentFragment();
  for (const card of state.filtered) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'cardRow';
    if (card.id === state.selectedId) row.classList.add('active');

    const name = document.createElement('div');
    name.className = 'name';
    name.textContent = card.name;

    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${card.faction} • ${card.type} • Croci: ${toDisplay(cardCrosses(card), '-')} • Fede: ${cardFaith(card)} • Forza: ${toDisplay(card.strength, '-')}`;

    row.appendChild(name);
    row.appendChild(meta);
    row.addEventListener('click', () => onSelect(card.id));
    fragment.appendChild(row);
  }

  els.resultList.appendChild(fragment);
}

export function renderDetails(state, els) {
  const card = state.filtered.find((c) => c.id === state.selectedId);

  if (!card) {
    els.emptyState.classList.remove('hidden');
    els.cardPreview.classList.add('hidden');
    return;
  }

  els.emptyState.classList.add('hidden');
  els.cardPreview.classList.remove('hidden');

  const template = TEMPLATE_BY_TYPE[card.type] || TEMPLATE_BY_TYPE.Santo;
  const overlays = OVERLAY_BY_TYPE[card.type] || OVERLAY_BY_TYPE.Santo;
  const serial = state.serialById[card.id] || '0000';
  const setAndSerial = `${toDisplay(card.set, 'SET')} ${serial}`;
  const p = POSITION_BY_TYPE[card.type] || POSITION_BY_TYPE.default;

  els.templateCard.style.backgroundImage = `url('${template}')`;
  els.templateCard.style.setProperty('--setid-color', '#111111');
  els.templateCard.style.setProperty('--setid-shadow', 'none');
  els.templateCard.style.setProperty('--cross-left', `${p.crossLeft}px`);
  els.templateCard.style.setProperty('--cross-top', `${p.crossTop}px`);
  els.templateCard.style.setProperty('--faith-left', `${p.faithLeft}px`);
  els.templateCard.style.setProperty('--faith-top', `${p.faithTop}px`);
  els.templateCard.style.setProperty('--strength-left', `${p.strengthLeft}px`);
  els.templateCard.style.setProperty('--strength-top', `${p.strengthTop}px`);
  els.templateCard.style.setProperty('--effect-left', `${p.effectLeft}px`);
  els.templateCard.style.setProperty('--effect-right', `${p.effectRight}px`);
  els.templateCard.style.setProperty('--effect-top', `${p.effectTop}px`);
  els.templateCard.style.setProperty('--effect-bottom', `${p.effectBottom}px`);

  els.overlayName.textContent = card.name;
  els.overlayCrosses.textContent = cardCrosses(card);
  els.overlayFaith.textContent = cardFaith(card);
  els.overlayStrength.textContent = toDisplay(card.strength, '');
  els.overlayEffect.textContent = toDisplay(card.effectText, '');
  els.overlaySetId.textContent = setAndSerial;

  els.overlayCrosses.style.display = overlays.showCrosses ? 'flex' : 'none';
  els.overlayFaith.style.display = overlays.showFaith ? 'flex' : 'none';
  els.overlayStrength.style.display = overlays.showStrength ? 'flex' : 'none';

  els.previewType.textContent = card.type;
  els.previewFaction.textContent = card.faction;
  els.previewSet.textContent = toDisplay(card.set);
  els.previewId.textContent = serial;
  els.previewCrosses.textContent = toDisplay(cardCrosses(card), '-');
  els.previewFaith.textContent = cardFaith(card);
  els.previewStrength.textContent = toDisplay(card.strength);
  els.previewEffect.textContent = toDisplay(card.effectText, 'Nessun effetto testuale.');

  pickSetIdStyleFromTemplate(state, template).then((style) => {
    if (state.selectedId !== card.id) return;
    els.templateCard.style.setProperty('--setid-color', style.color);
    els.templateCard.style.setProperty('--setid-shadow', style.shadow);
  });
}
