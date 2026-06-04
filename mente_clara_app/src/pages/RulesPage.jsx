import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import gameRules from '../data/gameRules.json';

export default function RulesPage() {
  const navigate = useNavigate();
  const { gameId, nivel } = useParams();

  const rules = gameRules[gameId] || {
    name: "Juego Cognitivo",
    objective: "Completar la actividad cognitiva.",
    instructions: ["Sigue las indicaciones en pantalla."],
    tip: "Hazlo a tu propio ritmo. ¡El ejercicio mental es lo más importante!"
  };

  const nivelLabel = nivel === 'dificil'
    ? 'Difícil'
    : nivel === 'medio'
      ? 'Medio'
      : 'Fácil';

  const levelColor = nivel === 'dificil'
    ? 'bg-error-container text-on-error-container border-error'
    : nivel === 'medio'
      ? 'bg-tertiary-container text-on-tertiary-container border-tertiary'
      : 'bg-secondary-container text-on-secondary-container border-secondary';

  const handleStart = () => {
    navigate(`/juegos/${gameId}/${nivel}`);
  };

  const handleBack = () => {
    navigate(`/juegos/${gameId}/dificultad`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar showBack onBack={handleBack} />

      <main className="flex-grow flex items-center justify-center px-margin-mobile pt-[100px] pb-[100px]">
        <div className="w-full max-w-[720px] space-y-6 animate-slide-up">
          
          {/* Main Card */}
          <section className="bg-surface-container-lowest border-2 border-outline-variant p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
            
            {/* Header info */}
            <div className="text-center space-y-2">
              <h1 className="text-[32px] sm:text-[40px] font-main font-extrabold text-on-surface">
                {rules.name}
              </h1>
              <div className="inline-block">
                <span className={`px-4 py-1.5 rounded-full font-main font-bold text-[18px] border ${levelColor}`}>
                  Nivel: {nivelLabel}
                </span>
              </div>
            </div>

            {/* Objective box */}
            <div className="bg-primary/5 border border-primary/20 p-5 rounded-xl">
              <h2 className="text-label-lg font-main font-bold text-primary mb-1 uppercase tracking-wider">Objetivo</h2>
              <p className="text-[20px] font-main font-semibold text-on-surface">
                {rules.objective}
              </p>
            </div>

            {/* Instructions box */}
            <div className="space-y-3">
              <h2 className="text-label-lg font-main font-bold text-on-surface-variant uppercase tracking-wider">¿Cómo jugar?</h2>
              <ul className="space-y-3">
                {rules.instructions.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-surface-container border-2 border-outline-variant text-[18px] font-main font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-[18px] sm:text-[20px] font-main text-on-surface leading-relaxed">
                      {step}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Positive tip */}
            <div className="bg-secondary-container-light/10 border border-secondary-fixed/20 p-5 rounded-xl flex gap-3 items-center">
              <span className="material-symbols-outlined text-secondary text-[32px] flex-shrink-0">
                lightbulb
              </span>
              <p className="text-[18px] font-main text-on-surface-variant italic">
                <strong>Consejo:</strong> {rules.tip}
              </p>
            </div>

          </section>

          {/* Action buttons */}
          <nav className="flex flex-col sm:flex-row gap-4 justify-between">
            <button
              onClick={handleBack}
              className="w-full sm:flex-1 h-[64px] bg-white border-2 border-outline text-on-surface-variant font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Volver
            </button>

            <button
              onClick={handleStart}
              className="w-full sm:flex-1 h-[64px] bg-primary text-on-primary font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all border-b-4 border-primary-dark hover:opacity-90"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              Iniciar juego
            </button>
          </nav>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
