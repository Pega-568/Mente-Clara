import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { gameConfig, getNivelKey } from '../utils/gameConfig';
import { saveResult } from '../services/progressService';
import colorsData from '../data/colorSequences.json';

// States: 'READY' | 'SHOWING_SEQUENCE' | 'WAITING_USER' | 'ROUND_RESULT'
export default function ColorSequenceGame() {
  const { nivel } = useParams();
  const navigate = useNavigate();
  const nivelKey = getNivelKey(nivel);
  const { sequenceLength, buttons, rounds } = gameConfig.colorSequence[nivelKey];

  const colors = colorsData.slice(0, buttons);

  const [sequence, setSequence]       = useState([]);
  const [phase, setPhase]             = useState('READY'); 
  const [activeColor, setActiveColor] = useState(null);
  const [userInput, setUserInput]     = useState([]);
  const [round, setRound]             = useState(1);
  const [aciertos, setAciertos]       = useState(0);
  const [errores, setErrores]         = useState(0);
  const [seconds, setSeconds]         = useState(0);
  const [feedback, setFeedback]       = useState(null); // 'correct' | 'wrong'
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef(null);
  const startedRef = useRef(false);
  const timeoutsRef = useRef([]);

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((t) => clearTimeout(t));
    timeoutsRef.current = [];
  };

  const buildSequence = useCallback(() => {
    const pool = colors.map((c) => c.id);
    const seq = Array.from({ length: sequenceLength }, () => pool[Math.floor(Math.random() * pool.length)]);
    return seq;
  }, [sequenceLength, buttons]);

  // Load next round sequence
  const prepareRound = useCallback(() => {
    clearAllTimeouts();
    const seq = buildSequence();
    setSequence(seq);
    setUserInput([]);
    setActiveColor(null);
    setFeedback(null);
    setPhase('READY');
  }, [buildSequence]);

  useEffect(() => {
    prepareRound();
    timerRef.current = setInterval(() => {
      if (startedRef.current && !showExitConfirm) {
        setSeconds((s) => s + 1);
      }
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearAllTimeouts();
    };
  }, [prepareRound, showExitConfirm]);

  const handleStartSequence = () => {
    if (phase !== 'READY') return;
    if (!startedRef.current) startedRef.current = true;

    setPhase('SHOWING_SEQUENCE');
    setUserInput([]);
    setActiveColor(null);
    setFeedback(null);

    let delay = 600;
    sequence.forEach((colorId, i) => {
      const t1 = setTimeout(() => {
        setActiveColor(colorId);
      }, delay + i * 900);
      const t2 = setTimeout(() => {
        setActiveColor(null);
      }, delay + i * 900 + 600);
      timeoutsRef.current.push(t1, t2);
    });

    const t3 = setTimeout(() => {
      setPhase('WAITING_USER');
    }, delay + sequence.length * 900 + 300);
    timeoutsRef.current.push(t3);
  };

  const handleColorTap = (colorId) => {
    if (phase !== 'WAITING_USER') return;

    const newInput = [...userInput, colorId];
    setUserInput(newInput);
    setActiveColor(colorId);
    
    const tActive = setTimeout(() => setActiveColor(null), 250);
    timeoutsRef.current.push(tActive);

    const idx = newInput.length - 1;

    // Check wrong tap
    if (colorId !== sequence[idx]) {
      setErrores((e) => e + 1);
      setFeedback('wrong');
      setPhase('ROUND_RESULT');
      return;
    }

    // Check completion
    if (newInput.length === sequence.length) {
      setAciertos((a) => a + 1);
      setFeedback('correct');
      setPhase('ROUND_RESULT');
    }
  };

  const handleNextRound = () => {
    clearAllTimeouts();
    const nextRound = round + 1;
    if (nextRound > rounds) {
      // Game completed
      clearInterval(timerRef.current);
      const result = {
        game: 'Colores',
        gameId: 'colorSequence',
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
      setRound(nextRound);
      prepareRound();
    }
  };

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">
      <TopBar showBack onBack={() => {
        startedRef.current = false;
        setShowExitConfirm(true);
      }} title="Colores" />

      <main className="flex-grow max-w-[600px] mx-auto w-full px-margin-mobile pt-[88px] pb-[100px]">

        {/* Header info */}
        <div className="text-center mb-6">
          <h2 className="text-headline-md font-main font-bold text-on-surface">
            {phase === 'READY' && '🎯 Todo listo'}
            {phase === 'SHOWING_SEQUENCE' && '👀 Observa la secuencia'}
            {phase === 'WAITING_USER' && '👆 Repite la secuencia'}
            {phase === 'ROUND_RESULT' && '✨ Resultado de ronda'}
          </h2>
          <p className="text-body-md font-main text-on-surface-variant mt-1">
            Ronda {round} de {rounds}
          </p>
        </div>

        {/* Stats bar */}
        <div className="flex justify-between items-center mb-6 px-2">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
            <span className="text-label-lg font-main font-bold">{mm}:{ss}</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-secondary text-[20px]">check</span>
            <span className="text-label-lg font-main font-bold">Aciertos: {aciertos}</span>
          </div>
        </div>

        {/* Sequence progress dots */}
        <div className="flex justify-center gap-3 mb-6 min-h-[30px]">
          {phase !== 'READY' && sequence.map((colorId, i) => {
            const color = colors.find((c) => c.id === colorId);
            const isFilled = phase === 'ROUND_RESULT' || i < userInput.length;
            return (
              <div
                key={i}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  isFilled ? 'border-transparent scale-110' : 'border-outline-variant bg-surface-container'
                }`}
                style={isFilled ? { backgroundColor: color?.hex } : {}}
              />
            );
          })}
        </div>

        {/* Phase instructions */}
        <div className="text-center mb-6">
          {phase === 'READY' && (
            <p className="text-[18px] font-main text-on-surface-variant">
              Toca el botón de abajo para ver la secuencia de luces.
            </p>
          )}
          {phase === 'SHOWING_SEQUENCE' && (
            <p className="text-[18px] font-main text-primary font-bold animate-pulse">
              Observa con atención. Aún no toques los botones.
            </p>
          )}
          {phase === 'WAITING_USER' && (
            <p className="text-[18px] font-main text-secondary font-bold">
              Ahora toca los botones de colores en el orden correcto.
            </p>
          )}
        </div>

        {/* Start Button */}
        {phase === 'READY' && (
          <div className="flex justify-center mb-8">
            <button
              onClick={handleStartSequence}
              className="w-full max-w-[280px] h-[64px] bg-primary text-on-primary font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all border-b-4 border-primary-dark shadow-md"
            >
              <span className="material-symbols-outlined">play_circle</span>
              Iniciar secuencia
            </button>
          </div>
        )}

        {/* Feedback banner */}
        {phase === 'ROUND_RESULT' && feedback && (
          <div className={`text-center py-4 px-6 rounded-2xl mb-6 text-[18px] font-main font-bold transition-all shadow-sm ${
            feedback === 'correct'
              ? 'bg-secondary-container text-on-secondary-container border border-secondary-fixed'
              : 'bg-surface-container text-on-surface-variant border border-outline-variant'
          }`}>
            {feedback === 'correct' ? (
              <span>¡Correcto! ¡Excelente memoria! 🎉</span>
            ) : (
              <div>
                <p className="text-[18px] mb-1">Vamos a intentarlo otra vez. 💪</p>
                <p className="text-[16px] font-normal text-on-surface-variant">La secuencia correcta era la que se muestra arriba.</p>
              </div>
            )}
            
            <button
              onClick={handleNextRound}
              className="mt-4 mx-auto w-full max-w-[220px] h-[52px] bg-tertiary-fixed text-on-tertiary-fixed font-main font-bold text-label-md rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border-b-4 border-tertiary"
            >
              {round >= rounds ? 'Ver resultado' : feedback === 'correct' ? 'Siguiente ronda' : 'Continuar'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Color buttons */}
        <div className={`grid grid-cols-2 gap-5`}>
          {colors.map((color) => {
            const isActive = activeColor === color.id;
            const isDisabled = phase !== 'WAITING_USER';
            return (
              <button
                key={color.id}
                id={`color-btn-${color.id}`}
                onClick={() => handleColorTap(color.id)}
                disabled={isDisabled}
                aria-label={color.label}
                className={`h-[100px] md:h-[120px] rounded-xl font-main font-bold text-headline-md transition-all ${
                  isDisabled ? 'opacity-65 cursor-not-allowed' : 'hover:opacity-95 active:scale-90 shadow-md'
                } ${isActive ? 'scale-105 shadow-xl' : ''}`}
                style={{
                  backgroundColor: color.hex,
                  color: color.textColor,
                  boxShadow: isActive ? `0 0 35px ${color.hex}` : undefined,
                  touchAction: 'none'
                }}
              >
                {color.label}
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={() => {
              clearAllTimeouts();
              prepareRound();
            }}
            disabled={phase === 'SHOWING_SEQUENCE' || phase === 'ROUND_RESULT'}
            className={`flex items-center gap-2 h-[56px] px-6 border-2 border-outline text-on-surface-variant font-main font-bold text-label-lg rounded-xl transition-all ${
              phase === 'SHOWING_SEQUENCE' || phase === 'ROUND_RESULT'
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-surface-container active:scale-95'
            }`}
          >
            <span className="material-symbols-outlined">refresh</span>
            Reiniciar
          </button>
          <button
            onClick={() => {
              clearAllTimeouts();
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
                  clearAllTimeouts();
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
                  startedRef.current = true;
                  if (phase === 'SHOWING_SEQUENCE') {
                    // replay sequence so they don't get a broken view
                    handleStartSequence();
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
