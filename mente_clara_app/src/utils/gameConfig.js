/**
 * Configuración de dificultad para cada juego.
 * Centraliza todas las reglas en un solo lugar.
 */
export const gameConfig = {
  memoryPairs: {
    easy:   { cards: 4,  pairs: 2 },
    medium: { cards: 6,  pairs: 3 },
    hard:   { cards: 8,  pairs: 4 } // 8 cartas, 4 parejas
  },
  colorSequence: {
    easy:   { sequenceLength: 3, buttons: 3, rounds: 3 },
    medium: { sequenceLength: 4, buttons: 4, rounds: 3 },
    hard:   { sequenceLength: 5, buttons: 4, rounds: 3 } // secuencia de 5, 4 botones
  },
  imageWord: {
    easy:   { options: 2, rounds: 5 },
    medium: { options: 3, rounds: 5 },
    hard:   { options: 4, rounds: 5 } // 4 opciones
  },
  oddObject: {
    easy:   { total: 4, rounds: 5 },
    medium: { total: 5, rounds: 5 },
    hard:   { total: 6, rounds: 5 } // 6 objetos
  },
  orderSteps: {
    easy:   { steps: 3, rounds: 3 },
    medium: { steps: 4, rounds: 3 },
    hard:   { steps: 5, rounds: 3 } // 5 pasos
  },
  classifyObjects: {
    easy:   { categories: 2, objects: 4 },
    medium: { categories: 2, objects: 6 },
    hard:   { categories: 3, objects: 8 }
  }
};

/**
 * Convierte el parámetro de URL al key de configuración.
 * @param {string} nivel  'facil' | 'medio' | 'dificil'
 * @returns {'easy' | 'medium' | 'hard'}
 */
export function getNivelKey(nivel) {
  if (nivel === 'dificil') return 'hard';
  return nivel === 'medio' ? 'medium' : 'easy';
}
