/**
 * Formatea segundos a MM:SS.
 * @param {number} totalSeconds
 * @returns {string}
 */
export function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

/**
 * Calcula el porcentaje de aciertos.
 * @param {number} aciertos
 * @param {number} total
 * @returns {number} 0-100
 */
export function calcPorcentaje(aciertos, total) {
  if (total === 0) return 0;
  return Math.round((aciertos / total) * 100);
}

/**
 * Devuelve un mensaje motivacional positivo basado en el porcentaje de aciertos.
 * @param {number} porcentaje 0-100
 * @returns {{ titulo: string, subtitulo: string }}
 */
export function getMensajeMotivacional(porcentaje) {
  if (porcentaje === 100) {
    return {
      titulo: '¡Perfecto!',
      subtitulo: '¡Lo recordaste todo! Tu memoria es excelente.',
    };
  }
  if (porcentaje >= 75) {
    return {
      titulo: '¡Muy bien!',
      subtitulo: 'Hiciste un gran trabajo. Sigue practicando.',
    };
  }
  if (porcentaje >= 50) {
    return {
      titulo: '¡Buen intento!',
      subtitulo: 'Cada vez lo harás mejor. ¿Lo intentamos otra vez?',
    };
  }
  return {
    titulo: '¡Sigue adelante!',
    subtitulo: 'Practicar es lo más importante. ¡Tú puedes!',
  };
}
