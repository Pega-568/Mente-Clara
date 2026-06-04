import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { shuffle } from '../utils/shuffle';
import { gameConfig, getNivelKey } from '../utils/gameConfig';
import { saveResult } from '../services/progressService';
import classifyObjectsData from '../data/classifyObjects.json';

export default function ClassifyObjectsGame() {
  const { nivel } = useParams();
  const navigate = useNavigate();
  const nivelKey = getNivelKey(nivel);

  const [levelData, setLevelData] = useState(null);
  const [classifiedItems, setClassifiedItems] = useState({}); // { itemId: categoryId }
  const [selectedObject, setSelectedObject] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [aciertos, setAciertos] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [activeDrag, setActiveDrag] = useState(null);
  const [feedback, setFeedback] = useState(null); // { type: 'ok'|'retry'|'final', text: '' }
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const timerRef = useRef(null);
  const startedRef = useRef(false);

  // Initialize and load challenge
  const loadGame = useCallback(() => {
    const challenge = classifyObjectsData.find((c) => c.level === nivelKey);
    if (challenge) {
      setLevelData({
        ...challenge,
        items: shuffle([...challenge.items]),
      });
    }
    setClassifiedItems({});
    setSelectedObject(null);
    setAttempts(0);
    setAciertos(0);
    setSeconds(0);
    setFeedback(null);
    startedRef.current = false;
  }, [nivelKey]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      if (startedRef.current) {
        setSeconds((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Classification Logic
  const classifyItem = (item, categoryId) => {
    if (!startedRef.current) startedRef.current = true;

    setAttempts((a) => a + 1);

    if (item.categoryId === categoryId) {
      // Correct!
      const newClassified = { ...classifiedItems, [item.id]: categoryId };
      setClassifiedItems(newClassified);
      setAciertos((a) => a + 1);
      setFeedback({ type: 'ok', text: '¡Muy bien! Ese objeto pertenece aquí.' });
      setSelectedObject(null);
      setTimeout(() => setFeedback(null), 1200);

      // Check if game finished
      const totalToClassify = levelData.items.length;
      if (Object.keys(newClassified).length === totalToClassify) {
        clearInterval(timerRef.current);
        const totalAttempts = attempts + 1;
        const errors = Math.max(0, totalAttempts - totalToClassify);
        const result = {
          game: 'Clasificar objetos',
          gameId: 'classifyObjects',
          level: nivel,
          aciertos: totalToClassify,
          errores: errors,
          intentos: totalAttempts,
          tiempo: seconds,
          fecha: new Date().toISOString(),
        };
        saveResult(result);
        setFeedback({ type: 'final', text: 'Excelente trabajo. Clasificaste los objetos.' });
        setTimeout(() => {
          navigate('/resultado', { state: result });
        }, 1500);
      }
    } else {
      // Wrong!
      setFeedback({ type: 'retry', text: 'Inténtalo nuevamente. Observa el grupo.' });
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  // Drag & Drop Pointer Events
  const handlePointerDown = (e, item) => {
    if (classifiedItems[item.id]) return;
    if (!startedRef.current) startedRef.current = true;

    const clientX = e.clientX;
    const clientY = e.clientY;

    setActiveDrag({
      item,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      hasMoved: false,
    });

    setSelectedObject(item);
  };

  const handlePointerMove = (e) => {
    if (!activeDrag) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    const dist = Math.hypot(clientX - activeDrag.startX, clientY - activeDrag.startY);
    const hasMoved = dist > 10;

    setActiveDrag((prev) => ({
      ...prev,
      currentX: clientX,
      currentY: clientY,
      hasMoved: prev.hasMoved || hasMoved,
    }));
  };

  const handlePointerUp = (e) => {
    if (!activeDrag) return;

    const clientX = e.clientX;
    const clientY = e.clientY;

    if (activeDrag.hasMoved) {
      const droppedEl = document.elementFromPoint(clientX, clientY);
      const dropZone = droppedEl?.closest('[data-category-id]');
      if (dropZone) {
        const categoryId = dropZone.getAttribute('data-category-id');
        classifyItem(activeDrag.item, categoryId);
      } else {
        setSelectedObject(activeDrag.item);
      }
    }

    setActiveDrag(null);
  };

  // Accessible click target placement
  const handleCategoryClick = (categoryId) => {
    if (selectedObject) {
      classifyItem(selectedObject, categoryId);
    }
  };

  if (!levelData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="text-headline-md font-main text-on-surface">Cargando juego...</div>
      </div>
    );
  }

  const mm = Math.floor(seconds / 60).toString().padStart(2, '0');
  const ss = (seconds % 60).toString().padStart(2, '0');

  const totalToClassify = levelData.items.length;
  const currentProgress = Object.keys(classifiedItems).length;

  return (
    <div
      className="min-h-screen bg-background flex flex-col select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <TopBar showBack onBack={() => navigate('/juegos/classifyObjects/dificultad')} title="Clasificar" />

      <main className="flex-grow max-w-[900px] mx-auto w-full px-margin-mobile pt-[88px] pb-[100px]">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-headline-md font-main font-bold text-on-surface">Clasificar objetos</h2>
          <p className="text-body-md font-main text-on-surface-variant mt-1">Coloca cada elemento en su grupo correspondiente</p>
        </div>

        {/* Stats bar */}
        <div className="flex justify-between items-center mb-5 px-2">
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-primary text-[20px]">timer</span>
            <span className="text-label-lg font-main font-bold text-on-surface">{mm}:{ss}</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-secondary text-[20px]">check_circle</span>
            <span className="text-label-lg font-main font-bold text-on-surface">{currentProgress} / {totalToClassify}</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
            <span className="material-symbols-outlined text-tertiary text-[20px]">touch_app</span>
            <span className="text-label-lg font-main font-bold text-on-surface">{attempts}</span>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl mb-6 text-center max-w-[720px] mx-auto">
          <p className="text-[18px] sm:text-[20px] font-main font-bold text-primary leading-relaxed">
            💡 Arrastra un objeto a su grupo o tócalo y luego toca el grupo correcto.
          </p>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div className={`text-center py-4 px-6 rounded-2xl mb-6 text-[20px] font-main font-bold transition-all shadow-md max-w-[720px] mx-auto animate-bounce-in ${
            feedback.type === 'ok' || feedback.type === 'final'
              ? 'bg-secondary-container text-on-secondary-container border border-secondary-fixed'
              : 'bg-error-container text-on-error-container border border-error'
          }`}>
            {feedback.text}
          </div>
        )}

        {/* Draggable Objects Container */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mb-10 min-h-[160px] p-4 bg-surface-container/30 border-2 border-dashed border-outline-variant rounded-2xl">
          {levelData.items.filter((item) => !classifiedItems[item.id]).map((item) => {
            const isSelected = selectedObject?.id === item.id;
            const isDraggingThis = activeDrag && activeDrag.item.id === item.id && activeDrag.hasMoved;
            return (
              <button
                key={item.id}
                onPointerDown={(e) => handlePointerDown(e, item)}
                className={`w-32 h-32 sm:w-36 sm:h-36 bg-surface-container-lowest border-2 rounded-2xl flex flex-col items-center justify-center cursor-grab select-none transition-all shadow-sm ${
                  isSelected
                    ? 'border-primary bg-primary-container text-on-primary-container ring-4 ring-primary/35 scale-105 shadow-md'
                    : 'border-outline-variant hover:border-primary hover:shadow-md'
                } ${isDraggingThis ? 'opacity-20' : ''}`}
                style={{ touchAction: 'none' }}
              >
                <span className="text-[48px] sm:text-[56px] leading-none select-none">{item.emoji}</span>
                <span className="text-[18px] font-main font-bold mt-1 text-on-surface break-all text-center px-1 leading-tight">{item.name}</span>
              </button>
            );
          })}
          {currentProgress === totalToClassify && (
            <div className="flex items-center justify-center w-full text-[20px] font-main font-bold text-secondary">
              ¡Completado! 🎉
            </div>
          )}
        </div>

        {/* Categories Drop Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levelData.categories.map((category) => {
            const isTarget = !!selectedObject;
            const hasClassified = levelData.items.filter((item) => classifiedItems[item.id] === category.id);
            
            return (
              <div
                key={category.id}
                data-category-id={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`p-6 rounded-2xl flex flex-col items-center min-h-[220px] transition-all cursor-pointer border-4 ${
                  isTarget
                    ? 'bg-primary/5 border-dashed border-primary shadow-md hover:bg-primary-container-high'
                    : 'bg-surface-container border-solid border-outline-variant hover:border-primary hover:shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[36px]">{category.emoji}</span>
                  <h3 className="text-[22px] sm:text-[24px] font-main font-extrabold text-on-surface">{category.name}</h3>
                </div>

                {isTarget && (
                  <span className="text-label-md font-main font-bold text-primary mt-2 animate-pulse bg-primary/10 px-3 py-1 rounded-full">
                    Colocar aquí
                  </span>
                )}

                {/* Classified Items in this Group */}
                <div className="flex flex-wrap gap-2 mt-5 justify-center w-full">
                  {hasClassified.map((item) => (
                    <div
                      key={item.id}
                      className="bg-emerald-50 text-emerald-900 border border-emerald-300 px-4 py-2 rounded-xl font-main font-bold text-[16px] sm:text-[18px] flex items-center gap-2 shadow-sm animate-fade-in"
                    >
                      <span className="text-[20px] leading-none">{item.emoji}</span>
                      <span>{item.name}</span>
                    </div>
                  ))}
                  {hasClassified.length === 0 && (
                    <span className="text-body-md font-main text-on-surface-variant/40 mt-8">Vacío</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Restart & Exit buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={loadGame}
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

      {/* Floating Drag Preview */}
      {activeDrag && activeDrag.hasMoved && (
        <div
          className="fixed bg-surface-container-lowest border-4 border-primary rounded-2xl p-3 flex flex-col items-center justify-center w-32 h-32 sm:w-36 sm:h-36 shadow-2xl pointer-events-none select-none z-50 animate-fade-in"
          style={{
            left: activeDrag.currentX - 72,
            top: activeDrag.currentY - 72,
          }}
        >
          <span className="text-[48px] sm:text-[56px] leading-none">{activeDrag.item.emoji}</span>
          <span className="text-[18px] font-main font-bold mt-1 text-on-surface break-all text-center px-1 leading-tight">{activeDrag.item.name}</span>
        </div>
      )}

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
                  if (currentProgress < totalToClassify) {
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
