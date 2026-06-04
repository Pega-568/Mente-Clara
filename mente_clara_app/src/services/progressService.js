const KEY = 'mente_clara_progress';

/**
 * Guarda un resultado de juego en localStorage.
 * @param {{ game: string, level: string, aciertos: number, errores: number, intentos: number, tiempo: number, fecha: string }} result
 */
export function saveResult(result) {
  const history = getHistory();
  history.push({
    ...result,
    fecha: result.fecha || new Date().toISOString(),
  });
  localStorage.setItem(KEY, JSON.stringify(history));
}

/**
 * Obtiene el historial completo de resultados.
 * @returns {Array}
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Obtiene los resultados de un juego específico.
 * @param {string} gameId
 * @returns {Array}
 */
export function getGameHistory(gameId) {
  return getHistory().filter((r) => r.game === gameId);
}

/**
 * Limpia todo el historial de progreso.
 */
export function clearHistory() {
  localStorage.removeItem(KEY);
}
