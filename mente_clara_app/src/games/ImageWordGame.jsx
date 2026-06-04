import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { gameConfig, getNivelKey } from '../utils/gameConfig';
import { saveResult } from '../services/progressService';
import { shuffle } from '../utils/shuffle';
import imageWordData from '../data/imageWord.json';

export default function ImageWordGame() {
  const { nivel } = useParams();
  const navigate = useNavigate();
  const nivelKey = getNivelKey(nivel);
  const { options, rounds } = gameConfig.imageWord[nivelKey];

  const pool = useRef(shuffle(imageWordData));
  const [roundIdx, setRoundIdx] = useState(0);
  const [choices, setChoices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const showExitConfirmRef = useRef(false);
  const timerRef = useRef(null);

  const buildChoices = useCallback((item) => {
    const correct = item.correctWord;
    const distractors = shuffle(item.distractors).slice(0, options - 1);
    return shuffle([correct, ...distractors]);
  }, [options]);

  useEffect(() => {
    setChoices(buildChoices(pool.current[0]));
    timerRef.current = setInterval(() => {
      if (!showExitConfirmRef.current) {
        setSeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const currentItem = pool.current[roundIdx] || pool.current[0];

  const handleSelect = (word) => {
    if (selected) return;
    setSelected(word);
    const isCorrect = word === currentItem.correctWord;

    if (isCorrect) {
      setAciertos((a) => a + 1);
      setFeedback('correct');
    } else {
      setErrores((e) => e + 1);
      setFeedback('wrong');
    }

    setTimeout(() => {
      const nextIdx = roundIdx + 1;
      if (nextIdx >= rounds) {
        clearInterval(timerRef.current);
        const result = {
          game: 'Imagen y palabra',
          gameId: 'imageWord',
          level: nivel,
          aciertos: isCorrect ? aciertos + 1 : aciertos,
          errores: isCorrect ? errores : errores + 1,
          intentos: rounds,
          tiempo: seconds,
          fecha: new Date().toISOString(),
        };
        saveResult(result);
        navigate('/resultado', { state: result });
      } else {
        setRoundIdx(nextIdx);
        setChoices(buildChoices(pool.current[nextIdx]));
        setSelected(null);
        setFeedback(null);
      }
    }, 1200);
  };

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar showBack onBack={() => navigate('/juegos/imageWord/dificultad')} title="Imagen y palabra" />

      <main className="flex-grow max-w-[600px] mx-auto w-full px-margin-mobile pt-[88px] pb-[100px]">

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-label-md font-main text-on-surface-variant mb-2">
            <span>Pregunta {roundIdx + 1} de {rounds}</span>
            <span className="font-bold text-primary">{mm}:{ss}</span>
          </div>
          <div className="w-full bg-surface-container rounded-full h-3">
            <div
              className="h-3 rounded-full bg-primary transition-all duration-500"
              style={{ width: `${((roundIdx) / rounds) * 100}%` }}
            />
          </div>
        </div>

        {/* Image card */}
        <div className="bg-surface-container-lowest border-2 border-outline-variant rounded-xl p-8 text-center mb-6 animate-slide-up">
          <div className="text-[100px] md:text-[120px] leading-none mb-4 select-none">
            {currentItem.imageEmoji}
          </div>
          <p className="text-body-md font-main text-on-surface-variant">{currentItem.imageLabel}</p>
          <h2 className="text-headline-md font-main font-bold text-on-surface mt-2">
            ¿Cómo se llama?
          </h2>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div className={`text-center py-3 rounded-xl mb-5 text-label-lg font-main font-bold transition-all ${
            feedback === 'correct'
              ? 'bg-secondary-container text-on-secondary-container'
              : 'bg-surface-container text-on-surface-variant'
          }`}>
            {feedback === 'correct' ? '¡Correcto! ¡Muy bien! 🎉' : `Era: ${currentItem.correctWord} 😊`}
          </div>
        )}

        {/* Choice buttons */}
        <div className={`grid grid-cols-1 gap-4`}>
          {choices.map((word) => {
            const isSelected = selected === word;
            const isCorrect = word === currentItem.correctWord;
            let btnClass = 'bg-surface-container-lowest border-2 border-outline-variant text-on-surface hover:border-primary';

            if (selected) {
              if (isCorrect) btnClass = 'bg-secondary-container border-2 border-secondary-fixed text-on-secondary-container';
              else if (isSelected) btnClass = 'bg-surface-container border-2 border-outline text-on-surface-variant';
            }

            return (
              <button
                key={word}
                id={`choice-${word}`}
                onClick={() => handleSelect(word)}
                disabled={!!selected}
                className={`h-[64px] rounded-xl font-main font-bold text-label-lg transition-all active:scale-95 ${btnClass}`}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 h-[56px] px-6 border-2 border-outline text-on-surface-variant font-main font-bold text-label-lg rounded-xl hover:bg-surface-container active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">refresh</span>
            Reiniciar
          </button>
          <button
            onClick={() => {
              showExitConfirmRef.current = true;
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
                  showExitConfirmRef.current = false;
                  setShowExitConfirm(false);
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
