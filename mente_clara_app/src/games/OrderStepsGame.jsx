import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { gameConfig, getNivelKey } from '../utils/gameConfig';
import { saveResult } from '../services/progressService';
import { shuffle } from '../utils/shuffle';
import orderStepsBank from '../data/orderStepsBank.json';

export default function OrderStepsGame() {
  const { nivel } = useParams();
  const navigate = useNavigate();
  const nivelKey = getNivelKey(nivel);
  const { steps: stepCount, rounds } = gameConfig.orderSteps[nivelKey];

  const [sessionScenarios, setSessionScenarios] = useState([]);
  const [roundIdx, setRoundIdx] = useState(0);
  const [shuffledSteps, setShuffledSteps] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState([]); // array of step texts in selected order
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [aciertos, setAciertos] = useState(0);
  const [errores, setErrores] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef(null);
  const startedRef = useRef(false);

  // Load scenarios without duplicates for this session
  const loadGame = useCallback(() => {
    const eligible = orderStepsBank.filter((s) => s.level === nivelKey || s.steps.length === stepCount);
    const source = eligible.length > 0 ? eligible : orderStepsBank;
    const selected = shuffle([...source]).slice(0, rounds);

    setSessionScenarios(selected);
    setRoundIdx(0);
    setSelectedOrder([]);
    setFeedback(null);
    setAciertos(0);
    setErrores(0);
    setSeconds(0);
    startedRef.current = false;
  }, [nivelKey, stepCount, rounds]);

  useEffect(() => {
    loadGame();
    timerRef.current = setInterval(() => {
      if (startedRef.current && !showExitConfirm) {
        setSeconds((s) => s + 1);
      }
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [loadGame, showExitConfirm]);

  const currentScenario = sessionScenarios[roundIdx];

  // Set steps when current scenario loads
  useEffect(() => {
    if (currentScenario) {
      setShuffledSteps(shuffle([...currentScenario.steps]));
      setSelectedOrder([]);
      setFeedback(null);
    }
  }, [currentScenario]);

  const handleTap = (step) => {
    if (selectedOrder.includes(step.text)) return;
    if (feedback) return;
    if (!startedRef.current) startedRef.current = true;

    const newOrder = [...selectedOrder, step.text];
    setSelectedOrder(newOrder);

    if (newOrder.length === stepCount) {
      const correctOrder = [...currentScenario.steps]
        .sort((a, b) => a.order - b.order)
        .map((s) => s.text);
      const isCorrect = newOrder.every((text, i) => text === correctOrder[i]);

      if (isCorrect) {
        setAciertos((a) => a + 1);
        setFeedback('correct');
      } else {
        setErrores((e) => e + 1);
        setFeedback('wrong');
      }
    }
  };

  const handleUndo = () => {
    if (feedback) return;
    setSelectedOrder((o) => o.slice(0, -1));
  };

  const handleNextRound = () => {
    const nextIdx = roundIdx + 1;
    if (nextIdx >= rounds) {
      // Game over
      clearInterval(timerRef.current);
      const result = {
        game: 'Ordenar pasos',
        gameId: 'orderSteps',
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
    }
  };

  if (!currentScenario) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h2 className="text-headline-md font-main text-on-surface">Cargando juego...</h2>
      </div>
    );
  }

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  const sortedCorrectSteps = [...currentScenario.steps].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">
      <TopBar showBack onBack={() => {
        startedRef.current = false;
        setShowExitConfirm(true);
      }} title="Ordenar" />

      <main className="flex-grow max-w-[620px] mx-auto w-full px-margin-mobile pt-[88px] pb-[100px]">

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-label-md font-main text-on-surface-variant mb-2">
            <span>Ronda {roundIdx + 1} de {rounds}</span>
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
          <h2 className="text-headline-md font-main font-bold text-on-surface">Ordena los pasos</h2>
          <p className="text-[20px] font-main text-on-surface-variant mt-1">
            Actividad: <span className="text-primary font-extrabold">{currentScenario.activity}</span>
          </p>
        </div>

        {/* Selected sequence display */}
        <div className="mb-5 p-4 bg-surface-container rounded-2xl border border-outline-variant min-h-[80px]">
          <p className="text-label-md font-main text-on-surface-variant mb-2 font-bold">Tu orden elegido:</p>
          <div className="flex flex-col gap-2">
            {selectedOrder.map((text, i) => (
              <div key={i} className="flex items-center gap-3 bg-primary/5 rounded-xl px-4 py-2 border border-primary/20">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary text-[18px] font-main font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-[18px] font-main text-on-surface">{text}</span>
              </div>
            ))}
            {selectedOrder.length === 0 && (
              <p className="text-[18px] font-main text-on-surface-variant italic">Toca los pasos de abajo en orden...</p>
            )}
          </div>
        </div>

        {/* Solution feedback (upon error) */}
        {feedback === 'wrong' && (
          <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl mb-6 space-y-3">
            <h4 className="text-[20px] font-main font-bold text-primary">El orden correcto es:</h4>
            <div className="flex flex-col gap-2">
              {sortedCorrectSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 bg-white border border-outline-variant rounded-xl px-4 py-2">
                  <span className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container text-[18px] font-main font-bold flex items-center justify-center flex-shrink-0">
                    {step.order}
                  </span>
                  <span className="text-[18px] font-main text-on-surface">{step.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback box & Action buttons */}
        {feedback && (
          <div className={`text-center py-5 px-6 rounded-2xl mb-6 shadow-sm border ${
            feedback === 'correct'
              ? 'bg-secondary-container text-on-secondary-container border-secondary-fixed'
              : 'bg-surface-container text-on-surface-variant border-outline-variant'
          }`}>
            <p className="text-[18px] sm:text-[20px] font-main font-bold mb-4">
              {feedback === 'correct'
                ? '¡Excelente! Has ordenado los pasos correctamente. 🌟'
                : '¡Buen intento! Revisa la secuencia correcta arriba. 💪'}
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              {feedback === 'wrong' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedOrder([]);
                      setFeedback(null);
                      setShuffledSteps(shuffle([...currentScenario.steps]));
                    }}
                    className="h-[56px] px-6 bg-white border-2 border-primary text-primary font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined">replay</span>
                    Repetir actividad
                  </button>
                  <button
                    onClick={() => {
                      startedRef.current = false;
                      setShowExitConfirm(true);
                    }}
                    className="h-[56px] px-6 bg-error-container text-on-error-container font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border border-error/30"
                  >
                    <span className="material-symbols-outlined">logout</span>
                    Salir
                  </button>
                </>
              )}
              <button
                onClick={handleNextRound}
                className="h-[56px] px-8 bg-tertiary-fixed text-on-tertiary-fixed font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all border-b-4 border-tertiary"
              >
                <span>{roundIdx + 1 >= rounds ? 'Ver resultado' : 'Continuar'}</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        )}

        {/* Step buttons */}
        {!feedback && (
          <div className="flex flex-col gap-3">
            {shuffledSteps.map((step) => {
              const isSelected = selectedOrder.includes(step.text);
              const position = selectedOrder.indexOf(step.text) + 1;
              return (
                <button
                  key={step.text}
                  onClick={() => handleTap(step)}
                  disabled={isSelected || !!feedback}
                  className={`flex items-center gap-4 p-5 rounded-2xl text-left font-main font-bold text-[18px] transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-primary/10 border-2 border-primary/30 text-on-surface-variant cursor-default opacity-60'
                      : 'bg-surface-container-lowest border-2 border-outline-variant hover:border-primary hover:shadow-md cursor-pointer'
                  }`}
                >
                  {isSelected ? (
                    <span className="w-9 h-9 rounded-full bg-primary text-on-primary text-label-lg font-bold flex items-center justify-center flex-shrink-0">
                      {position}
                    </span>
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-surface-container border-2 border-outline-variant flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-on-surface-variant text-[20px]">radio_button_unchecked</span>
                    </span>
                  )}
                  <span className="leading-tight">{step.text}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div className="mt-8 flex justify-center gap-4">
          {selectedOrder.length > 0 && !feedback && (
            <button
              onClick={handleUndo}
              className="flex items-center gap-2 h-[56px] px-6 border-2 border-outline text-on-surface-variant font-main font-bold text-label-lg rounded-xl hover:bg-surface-container active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined">undo</span>
              Deshacer
            </button>
          )}
          <button
            onClick={loadGame}
            disabled={!!feedback}
            className={`flex items-center gap-2 h-[56px] px-6 border-2 border-outline text-on-surface-variant font-main font-bold text-label-lg rounded-xl transition-all ${
              feedback
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
                  if (!feedback) {
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
