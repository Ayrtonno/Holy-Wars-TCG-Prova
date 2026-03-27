export function attachRuntimeAPI(state) {
  function createCardInstance(baseCard, owner = 'p1') {
    const instanceId = `I${String(state.nextInstanceId++).padStart(5, '0')}`;
    const currentCrosses = typeof baseCard.crosses === 'number' ? baseCard.crosses : null;
    const currentFaith = typeof baseCard.faith === 'number' ? baseCard.faith : null;
    const currentStrength = typeof baseCard.strength === 'number' ? baseCard.strength : null;

    const instance = {
      instanceId,
      cardId: baseCard.id,
      owner,
      base: {
        crosses: currentCrosses,
        faith: currentFaith,
        strength: currentStrength,
      },
      current: {
        crosses: currentCrosses,
        faith: currentFaith,
        strength: currentStrength,
      },
      flags: {},
    };

    state.instancesById[instanceId] = instance;
    return instance;
  }

  function setCurrentStat(instance, stat, value) {
    if (!instance || !instance.current || !(stat in instance.current)) return;
    if (typeof value !== 'number') return;
    instance.current[stat] = value;
  }

  function addToCurrentStat(instance, stat, delta) {
    if (!instance || !instance.current || !(stat in instance.current)) return;
    if (typeof instance.current[stat] !== 'number' || typeof delta !== 'number') return;
    instance.current[stat] += delta;
  }

  function resetInstanceToBase(instance) {
    if (!instance) return;
    instance.current.crosses = instance.base.crosses;
    instance.current.faith = instance.base.faith;
    instance.current.strength = instance.base.strength;
  }

  window.HolyWarRuntime = {
    createCardInstance,
    setCurrentStat,
    addToCurrentStat,
    resetInstanceToBase,
    getInstanceById: (id) => state.instancesById[id] || null,
  };
}
