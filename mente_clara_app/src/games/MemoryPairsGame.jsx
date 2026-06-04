import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { shuffle } from '../utils/shuffle';
import { gameConfig, getNivelKey } from '../utils/gameConfig';
import { saveResult } from '../services/progressService';
import pairsData from '../data/memoryPairs.json';

export default function MemoryPairsGame() {
  const { nivel } = useParams();
  const navigate = useNavigate();
  const nivelKey = getNivelKey(nivel);
  const { cards: totalCards } = gameConfig.memoryPairs[nivelKey];

  const [cards, setCards] = useState([]);
  const [selectedCards, setSelectedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'ok' | 'retry'
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const timerRef = useRef(null);
  const startedRef = useRef(false);

  // Build deck
  const buildDeck = useCallback(() => {
    const pool = shuffle(pairsData).slice(0, totalCards / 2);
    const deck = shuffle([
      ...pool.map((p) => ({ ...p, pairId: p.id, uid: `${p.id}-a` })),
      ...pool.map((p) => ({ ...p, pairId: p.id, uid: `${p.id}-b` })),
    ]);
    setCards(deck);
    setSelectedCards([]);
    setMatchedCards([]);
    setAttempts(0);
    setSeconds(0);
    setFeedback(null);
    startedRef.current = false;
  }, [totalCards]);

  useEffect(() => { buildDeck(); }, [buildDeck]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (startedRef.current) setSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleFlip = (card) => {
    if (isChecking) return;
    const isAlreadySelected = selectedCards.some((c) => c.uid === card.uid);
    const isAlreadyMatched = matchedCards.some((c) => c.uid === card.uid);
    if (isAlreadySelected || isAlreadyMatched) return;

    if (!startedRef.current) startedRef.current = true;

    // Debugging logs as requested
    console.log("Carta tocada", card);
    console.log("Seleccionadas", [...selectedCards, card]);
    console.log("Encontradas", matchedCards);

    const newSelected = [...selectedCards, card];
    setSelectedCards(newSelected);

    if (newSelected.length === 2) {
      setIsChecking(true);
      setAttempts((a) => a + 1);
      const [cardA, cardB] = newSelected;

      if (cardA.pairId === cardB.pairId) {
        // Match
        const newMatched = [...matchedCards, cardA, cardB];
        setMatchedCards(newMatched);
        setSelectedCards([]);
        setFeedback('ok');
        setTimeout(() => setFeedback(null), 600);
        setIsChecking(false);

        // Game finished
        if (newMatched.length === cards.length) {
          clearInterval(timerRef.current);
          const totalAttempts = attempts + 1;
          const totalPairs = newMatched.length / 2;
          const errors = Math.max(0, totalAttempts - totalPairs);
          const result = {
            game: 'Parejas',
            gameId: 'memoryPairs',
            level: nivel,
            aciertos: totalPairs,
            errores: errors,
            intentos: totalAttempts,
            tiempo: seconds,
            fecha: new Date().toISOString(),
          };
          saveResult(result);
          setTimeout(() => navigate('/resultado', { state: result }), 800);
        }
      } else {
        setFeedback('retry');
        setTimeout(() => {
          setSelectedCards([]);
          setFeedback(null);
          setIsChecking(false);
        }, 900);
      }
    }
  };

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  const cols = totalCards <= 4 ? 'grid-cols-2' : totalCards === 8 ? 'grid-cols-4' : 'grid-cols-3';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar showBack onBack={() => navigate(`/juegos/memoryPairs/dificultad`)} title="Parejas" />

      <main className="flex-grow max-w-[720px] mx-auto w-full px-margin-mobile pt-[88px] pb-[100px]">

        {/* Header */}
        <div className="text-center mb-6 animate-fade-in">
          <h2 className="text-headline-md font-main font-bold text-on-surface">Encuentra las parejas</h2>
          <p className="text-body-md font-main text-on-surface-variant mt-1">Toca dos tarjetas para encontrar las iguales</p>
        </div>

        {/* Stats bar */}
        <div className="flex justify-between items-center mb-5 px-2">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
            <span className="text-label-lg font-main font-bold text-on-surface">{mm}:{ss}</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            <span className="text-label-lg font-main font-bold text-on-surface">{matchedCards.length / 2} / {totalCards / 2}</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-tertiary text-[20px]">touch_app</span>
            <span className="text-label-lg font-main font-bold text-on-surface">{attempts}</span>
          </div>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div className={`text-center py-3 rounded-xl mb-4 text-label-lg font-main font-bold transition-all ${
            feedback === 'ok' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'
          }`}>
            {feedback === 'ok' ? '¡Encontraste una pareja! 🎉' : 'Inténtalo de nuevo 💪'}
          </div>
        )}

        {/* Cards grid */}
        <div className={`grid ${cols} gap-4`}>
          {cards.map((card) => {
            const isSelected = selectedCards.some((c) => c.uid === card.uid);
            const isMatched = matchedCards.some((c) => c.uid === card.uid);
            const isRevealed = isSelected || isMatched;

            return (
              <button
                key={card.uid}
                id={`card-${card.uid}`}
                onClick={() => handleFlip(card)}
                disabled={isMatched || isChecking || isSelected}
                aria-label={isRevealed ? card.label : 'Tarjeta boca abajo'}
                className={`aspect-square rounded-2xl w-full flex items-center justify-center transition-all ${
                  isMatched
                    ? 'bg-emerald-50 border-4 border-emerald-300 cursor-default opacity-80'
                    : isSelected
                    ? 'bg-surface-container-lowest border-4 border-primary shadow-lg scale-105'
                    : 'bg-[#e3f2fd] border-4 border-blue-200 text-blue-600 hover:scale-105 active:scale-95 shadow-sm'
                }`}
              >
                {isMatched ? (
                  <div className="flex flex-col items-center justify-center gap-1 p-2">
                    <span className="text-[40px] sm:text-[48px] md:text-[56px] leading-none select-none">{card.emoji}</span>
                    <span className="text-[14px] sm:text-[16px] md:text-[18px] font-main font-bold text-emerald-800 break-all text-center">{card.label}</span>
                  </div>
                ) : isSelected ? (
                  <div className="flex flex-col items-center justify-center gap-1 p-2">
                    <span className="text-[40px] sm:text-[48px] md:text-[56px] leading-none select-none">{card.emoji}</span>
                    <span className="text-[14px] sm:text-[16px] md:text-[18px] font-main font-bold text-on-surface break-all text-center">{card.label}</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <span className="text-[48px] sm:text-[56px] md:text-[64px] font-main font-extrabold select-none">?</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Restart & Exit buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={buildDeck}
            className="flex items-center gap-2 h-[56px] px-6 border-2 border-outline text-on-surface-variant font-main font-bold text-label-lg rounded-xl hover:bg-surface-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">refresh</span>
            Reiniciar
          </button>
          <button
            onClick={() => {
              startedRef.current = false; // Pause timer
              setShowExitConfirm(true);
            }}
            className="flex items-center gap-2 h-[56px] px-6 bg-error-container text-on-error-container font-main font-bold text-label-lg rounded-xl active:scale-95 transition-all border border-error/30"
          >
            <span className="material-symbols-outlined">logout</span>
            Salir
          </button>
        </div>

      </main>

      {showExitConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-2xl p-6 sm:p-8 max-w-[500px] w-full text-center space-y-6 shadow-2xl animate-scale-in">
            <h3 className="text-[24px] sm:text-[28px] font-main font-extrabold text-on-surface">
              ¿Deseas salir del juego?
            </h3>
            <p className="text-[18px] font-main text-on-surface-variant">
              Tu progreso de esta partida se perderá si sales ahora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button
                onClick={() => {
                  if (timerRef.current) clearInterval(timerRef.current);
                  navigate('/juegos');
                }}
                className="w-full h-16 bg-error text-white font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Salir al menú
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  if (matchedCards.length < cards.length) {
                    startedRef.current = true; // Resume timer
                  }
                }}
                className="w-full h-16 bg-surface-container border-2 border-outline text-on-surface font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                Continuar jugando
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
