export const STORAGE_KEY = 'holy_war_ui_v1';

export const TEMPLATE_BY_TYPE = {
  Artefatto: './assets/templates/Artefatto.png',
  Benedizione: './assets/templates/Benedizione.png',
  Edificio: './assets/templates/Edificio.png',
  Innata: './assets/templates/Innata.png',
  Maledizione: './assets/templates/Maledizione.png',
  Santo: './assets/templates/Santo.png',
  Token: './assets/templates/Token.png',
};

export const OVERLAY_BY_TYPE = {
  Artefatto: { showCrosses: true, showFaith: true, showStrength: false },
  Benedizione: { showCrosses: true, showFaith: false, showStrength: false },
  Edificio: { showCrosses: true, showFaith: true, showStrength: false },
  Innata: { showCrosses: false, showFaith: false, showStrength: false },
  Maledizione: { showCrosses: true, showFaith: false, showStrength: false },
  Santo: { showCrosses: true, showFaith: true, showStrength: true },
  Token: { showCrosses: false, showFaith: true, showStrength: true },
};

export const POSITION_BY_TYPE = {
  default: {
    crossLeft: 76,
    crossTop: 195,
    faithLeft: 202.5,
    faithTop: 15,
    strengthLeft: 195,
    strengthTop: 191,
    effectLeft: 22,
    effectRight: 18,
    effectTop: 238,
    effectBottom: 20,
  },
  Edificio: {
    crossLeft: 76,
    crossTop: 195,
    faithLeft: 202,
    faithTop: 15,
    strengthLeft: 195,
    strengthTop: 191,
    effectLeft: 18,
    effectRight: 18,
    effectTop: 249,
    effectBottom: 20,
  },
  Token: {
    crossLeft: 76,
    crossTop: 195,
    faithLeft: 202.5,
    faithTop: 15,
    strengthLeft: 202,
    strengthTop: 304,
    effectLeft: 18,
    effectRight: 18,
    effectTop: 249,
    effectBottom: 20,
  },
};
