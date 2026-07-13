/**
 * Shared sync helpers — used by the inventory UI and unit tests.
 * Keeps "invisible" sync failures from looking like success.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.InventorySync = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function isInventoryPayload(data) {
    return !!(data && typeof data === 'object' && !Array.isArray(data) && Array.isArray(data.items) && !data.error);
  }

  function syncFailureMessage(res, data) {
    if (res && res.ok && !(data && data.error)) return null;
    if (data && data.error) return String(data.error);
    const status = res && res.status ? res.status : '?';
    return 'HTTP ' + status;
  }

  function mergeLoadedItem(serverItem, defaults) {
    const df = (defaults || []).find((x) => x.id === serverItem.id);
    if (!df) return { ...serverItem };
    // Preserve user-edited identity fields; only fill gaps from code defaults.
    return {
      ...df,
      ...serverItem,
      name: serverItem.name != null && serverItem.name !== '' ? serverItem.name : df.name,
      sub: serverItem.sub != null ? serverItem.sub : df.sub,
      unit: serverItem.unit != null && serverItem.unit !== '' ? serverItem.unit : df.unit,
    };
  }

  function buildExportPayload(state, ts) {
    return {
      version: 2,
      ts: ts != null ? ts : Date.now(),
      cats: state.cats,
      items: state.items,
      history: (state.history || []).slice(-50),
      purchases: (state.purchases || []).slice(-500),
      customIcons: state.customIcons || [],
    };
  }

  return {
    isInventoryPayload,
    syncFailureMessage,
    mergeLoadedItem,
    buildExportPayload,
  };
});
