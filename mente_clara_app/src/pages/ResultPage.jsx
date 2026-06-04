import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import { getMensajeMotivacional, formatTime, calcPorcentaje } from '../utils/scoring';

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();

  // El juego envía el resultado por state de navegación
  const result = location.state || {
    game: 'Juego',
    level: 'facil',
    aciertos: 0,
    errores: 0,
    intentos: 0,
    tiempo: 0,
    gameId: null,
  };

  const total = result.aciertos + result.errores;
  const porcentaje = calcPorcentaje(result.aciertos, total || 1);
  const mensaje = getMensajeMotivacional(porcentaje);
  const tiempoFormato = formatTime(result.tiempo || 0);

  const nivelLabel = result.level === 'dificil'
    ? 'Difícil'
    : result.level === 'medio'
      ? 'Medio'
      : 'Fácil';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar />

      <main className="flex-grow pt-[80px] pb-[100px] px-margin-mobile flex items-center justify-center">
        <div className="w-full max-w-[720px] space-y-6 animate-bounce-in">

          {/* Success card */}
          <section className="bg-surface-container-lowest border-2 border-secondary-fixed p-8 rounded-xl text-center space-y-6 animate-soft-pulse">

            {/* Icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 bg-secondary-container text-on-secondary-container rounded-full">
              <span
                className="material-symbols-outlined text-[48px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                check_circle
              </span>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-headline-xl font-main font-extrabold text-on-secondary-container">
                {mensaje.titulo}
              </h2>
              <p className="text-headline-md font-main text-on-surface-variant">{mensaje.subtitulo}</p>
            </div>

            {/* Game info badge */}
            <div className="inline-flex items-center gap-2 bg-surface-container px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-primary text-[20px]">games</span>
              <span className="text-label-lg font-main text-on-surface-variant">
                {result.game} · {nivelLabel}
              </span>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-outline-variant">
              <StatBox label="Aciertos" value={`${result.aciertos}`} color="text-on-secondary-container" />
              <StatBox label="Intentos" value={`${result.intentos}`} color="text-primary" />
              <StatBox label="Tiempo"   value={tiempoFormato}         color="text-on-surface" />
              <StatBox label="Logro"    value={`${porcentaje}%`}      color="text-tertiary" />
            </div>

            {/* Progress bar */}
            <div className="w-full bg-surface-container rounded-full h-3 overflow-hidden">
              <div
                className="h-3 rounded-full bg-secondary-fixed-dim transition-all duration-1000"
                style={{ width: `${porcentaje}%` }}
              />
            </div>
          </section>

          {/* Navigation buttons */}
          <nav className="flex flex-col gap-4">
            <button
              id="btn-repetir"
              onClick={() => navigate(`/juegos/${result.gameId}/${result.level}`, { replace: true })}
              className="w-full h-16 bg-tertiary-fixed text-on-tertiary-fixed font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all border-b-4 border-tertiary hover:opacity-90"
            >
              <span className="material-symbols-outlined">replay</span>
              Repetir
            </button>

            <button
              id="btn-otro-juego"
              onClick={() => navigate('/juegos')}
              className="w-full h-16 bg-white border-2 border-primary text-primary font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-surface-container-high"
            >
              <span className="material-symbols-outlined">extension</span>
              Elegir otro juego
            </button>

            <button
              id="btn-inicio"
              onClick={() => navigate('/')}
              className="w-full h-16 bg-white border-2 border-outline text-on-surface-variant font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-surface-container"
            >
              <span className="material-symbols-outlined">home</span>
              Inicio
            </button>
          </nav>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}

function StatBox({ label, value, color }) {
  return (
    <div className="flex flex-col items-center p-4 bg-surface-container rounded-lg">
      <span className="text-label-lg font-main text-on-surface-variant mb-1">{label}</span>
      <span className={`text-headline-md font-main font-bold ${color}`}>{value}</span>
    </div>
  );
}
