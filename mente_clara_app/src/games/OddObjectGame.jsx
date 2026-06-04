import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { gameConfig, getNivelKey } from '../utils/gameConfig';
import { saveResult } from '../services/progressService';
import { shuffle } from '../utils/shuffle';
import oddObjectBank from '../data/oddObjectBank.json';

export default function OddObjectGame() {
  const { nivel } = useParams();
  const navigate = useNavigate();
  const nivelKey = getNivelKey(nivel);
  const { total, rounds } = gameConfig.oddObject[nivelKey];

  const [sessionRounds, setSessionRounds] = useState([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef(null);
  const startedRef = useRef(false);

  // Generate 5 unique rounds for this game session
  const loadGame = useCallback(() => {
    const shuffledCategories = shuffle([...oddObjectBank]);
    const generated = [];

    for (let i = 0; i < rounds; i++) {
      const mainCat = shuffledCategories[i % shuffledCategories.length];
      const intruderCat = shuffledCategories[(i + 1) % shuffledCategories.length];

      // Pick N-1 items from main category, and 1 from intruder
      const mainItems = shuffle([...mainCat.items]).slice(0, total - 1);
      const intruderItem = shuffle([...intruderCat.items])[0];

      const displayItems = shuffle([
        ...mainItems.map((emoji) => ({ emoji, isOdd: false })),
        { emoji: intruderItem, isOdd: true },
      ]);

      generated.push({
        category: mainCat.category,
        odd: intruderItem,
        explanation: `${intruderItem} no pertenece al grupo de ${mainCat.category}`,
        items: displayItems,
      });
    }

    setSessionRounds(generated);
    setRoundIdx(0);
    setSelected(null);
    setFeedback(null);
    setAciertos(0);
    setErrores(0);
    setSeconds(0);
    startedRef.current = false;
  }, [total, rounds]);

  useEffect(() => {
    loadGame();
    timerRef.current = setInterval(() => {
      if (startedRef.current && !showExitConfirm) {
        setSeconds((s) => s + 1);
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loadGame, showExitConfirm]);

  const currentRound = sessionRounds[roundIdx];

  const handleSelect = (item) => {
    if (selected) return;
    if (!startedRef.current) startedRef.current = true;

    setSelected(item.emoji);

    if (item.isOdd) {
      setAciertos((a) => a + 1);
      setFeedback('correct');
    } else {
      setErrores((e) => e + 1);
      setFeedback('wrong');
    }
  };

  const handleNextRound = () => {
    const nextIdx = roundIdx + 1;
    if (nextIdx >= rounds) {
      // Game over
      clearInterval(timerRef.current);
      const result = {
        game: 'Intruso',
        gameId: 'oddObject',
        level: nivel,
        aciertos,
        errores,
        intentos: rounds,
        tiempo: seconds,
        fecha: new Date().toISOString(),
      };
      saveResult(result);
      navigate('/resultado', { state: result });
    } else {
      setRoundIdx(nextIdx);
      setSelected(null);
      setFeedback(null);
    }
  };

  if (!currentRound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h2 className="text-headline-md font-main text-on-surface">Cargando juego...</h2>
      </div>
    );
  }

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  // grid layout: 4 options = 2x2, 5 options = 3+2 (cols-3), 6 options = 3x2 (cols-3)
  const gridCols = total <= 4 ? 'grid-cols-2' : 'grid-cols-3';

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">
      <TopBar showBack onBack={() => {
        startedRef.current = false;
        setShowExitConfirm(true);
      }} title="Intruso" />

      <main className="flex-grow max-w-[620px] mx-auto w-full px-margin-mobile pt-[88px] pb-[100px]">

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-label-md font-main text-on-surface-variant mb-2">
            <span>Pregunta {roundIdx + 1} de {rounds}</span>
            <span className="font-bold text-primary">{mm}:{ss}</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-3">
            <div
              className="h-3 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${(roundIdx / rounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Instruction */}
        <div className="text-center mb-6">
          <h2 className="text-headline-md font-main font-bold text-on-surface">¿Cuál no pertenece?</h2>
          <p className="text-[20px] font-main text-on-surface-variant mt-1">
            Categoría principal: <span className="text-primary font-extrabold">{currentRound.category}</span>
          </p>
        </div>

        {/* Feedback banner & Continue button */}
        {feedback && (
          <div className={`text-center py-4 px-6 rounded-2xl mb-6 text-[18px] font-main font-bold transition-all shadow-sm ${
            feedback === 'correct'
              ? 'bg-secondary-container text-on-secondary-container border border-secondary-fixed'
              : 'bg-surface-container text-on-surface-variant border border-outline-variant'
          }`}>
            {feedback === 'correct' ? (
              <p className="text-[18px]">🎉 ¡Muy bien! {currentRound.odd} no pertenece al grupo de {currentRound.category}.</p>
            ) : (
              <p className="text-[18px]">😊 Observa nuevamente. El objeto diferente era {currentRound.odd}.</p>
            )}

            <button
              onClick={handleNextRound}
              className="mt-4 mx-auto w-full max-w-[220px] h-[52px] bg-tertiary-fixed text-on-tertiary-fixed font-main font-bold text-label-md rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border-b-4 border-tertiary"
            >
              {roundIdx + 1 >= rounds ? 'Ver resultado' : 'Siguiente ronda'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Objects grid */}
        <div className={`grid ${gridCols} gap-4 sm:gap-5`}>
          {currentRound.items.map((item, i) => {
            const isSelected = selected === item.emoji;
            let btnClass = 'bg-surface-container-lowest border-2 border-outline-variant hover:border-primary hover:shadow-md';

            if (selected) {
              if (item.isOdd) {
                btnClass = 'bg-secondary-container border-2 border-secondary-fixed text-on-secondary-container';
              } else if (isSelected) {
                btnClass = 'bg-error-container border-2 border-error text-on-error-container';
              } else {
                btnClass = 'bg-surface-container border border-outline-variant opacity-50';
              }
            }

            return (
              <button
                key={i}
                id={`odd-item-${i}`}
                onClick={() => handleSelect(item)}
                disabled={!!selected}
                aria-label={`Objeto ${i + 1}`}
                className={`aspect-square rounded-2xl flex items-center justify-center text-[64px] sm:text-[72px] transition-all active:scale-90 ${
                  selected ? 'cursor-default' : 'cursor-pointer hover:scale-105'
                } ${btnClass}`}
              >
                <span className="select-none">{item.emoji}</span>
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={loadGame}
            disabled={!!selected}
            className={`flex items-center gap-2 h-[56px] px-6 border-2 border-outline text-on-surface-variant font-main font-bold text-label-lg rounded-xl transition-all ${
              selected
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-surface-container active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined">refresh</span>
            Reiniciar
          </button>
          <button
            onClick={() => {
              startedRef.current = false;
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
                  if (!selected) {
                    startedRef.current = true;
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
