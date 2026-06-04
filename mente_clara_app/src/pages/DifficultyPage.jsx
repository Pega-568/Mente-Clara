import { useNavigate, useParams } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import games from '../data/games.json';

const levels = [
  {
    id: 'facil',
    label: 'Fácil',
    description: 'Pocos elementos y más ayuda',
    icon: 'sentiment_satisfied',
    iconBg: 'bg-secondary-container',
    iconColor: 'text-on-secondary-container',
  },
  {
    id: 'medio',
    label: 'Medio',
    description: 'Más elementos para recordar',
    icon: 'psychology',
    iconBg: 'bg-tertiary-fixed',
    iconColor: 'text-on-tertiary-fixed',
  },
  {
    id: 'dificil',
    label: 'Difícil',
    description: 'Un reto mayor, sin prisa',
    icon: 'military_tech',
    iconBg: 'bg-error-container-light',
    iconColor: 'text-error',
  }
];

export default function DifficultyPage() {
  const navigate = useNavigate();
  const { gameId } = useParams();

  const game = games.find((g) => g.id === gameId);
  const gameName = game?.name || 'Juego';

  const handleSelect = (levelId) => {
    navigate(`/rules/${gameId}/${levelId}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar showBack onBack={() => navigate('/juegos')} />

      <main className="flex-grow flex items-center justify-center px-margin-mobile pt-[100px] pb-[100px]">
        <div className="w-full max-w-[720px] space-y-8 animate-slide-up">

          {/* Header */}
          <div className="text-center space-y-3">
            <div className="text-[48px] mb-2">{game ? '🎮' : '🧩'}</div>
            <h1 className="text-headline-xl font-main font-extrabold text-on-surface">
              Elige la dificultad
            </h1>
            <p className="text-body-lg font-main text-on-surface-variant max-w-md mx-auto">
              Selecciona el nivel que te haga sentir más cómodo hoy.
              <br />
              <span className="text-primary font-bold">{gameName}</span>
            </p>
          </div>

          {/* Difficulty cards */}
          <div className="grid grid-cols-1 gap-5 pt-2">
            {levels.map((level) => (
              <button
                key={level.id}
                id={`btn-level-${level.id}`}
                onClick={() => handleSelect(level.id)}
                className="group relative flex flex-col md:flex-row items-center md:items-start text-left p-8 bg-surface-container-lowest border-2 border-outline-variant rounded-xl hover:border-primary hover:shadow-md active:scale-95 transition-all duration-200 w-full min-h-[140px] gap-6 focus-visible:outline-2"
              >
                <div className={`flex-shrink-0 w-16 h-16 ${level.iconBg} rounded-full flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${level.iconColor} text-[40px]`}>
                    {level.icon}
                  </span>
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h2 className="text-headline-md font-main font-bold text-on-surface">{level.label}</h2>
                  <p className="text-body-lg font-main text-on-surface-variant mt-1">{level.description}</p>
                </div>
                <span className="hidden md:block material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors text-[32px] self-center">
                  chevron_right
                </span>
              </button>
            ))}
          </div>

          {/* Back button */}
          <div className="flex justify-center pt-4">
            <button
              onClick={() => navigate('/juegos')}
              className="flex items-center justify-center gap-2 px-8 h-[64px] border-2 border-primary text-on-surface font-main font-bold text-label-lg rounded-xl hover:bg-surface-container-high active:scale-95 transition-all w-full md:w-auto min-w-[220px]"
            >
              <span className="material-symbols-outlined">arrow_back</span>
              Volver a juegos
            </button>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
