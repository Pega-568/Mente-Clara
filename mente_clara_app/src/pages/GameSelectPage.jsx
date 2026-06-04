import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';
import games from '../data/games.json';

const gameStyles = [
  { iconBg: 'bg-primary/10',             iconColor: 'text-primary' },
  { iconBg: 'bg-secondary-container/30', iconColor: 'text-secondary' },
  { iconBg: 'bg-tertiary-container/20',  iconColor: 'text-tertiary' },
  { iconBg: 'bg-error-container/30',     iconColor: 'text-error' },
  { iconBg: 'bg-primary-fixed/30',       iconColor: 'text-primary-container' },
];

export default function GameSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar showBack onBack={() => navigate('/')} />

      <main className="flex-grow max-w-[960px] mx-auto w-full px-margin-mobile md:px-margin-desktop pt-[100px] pb-[100px]">

        {/* Header */}
        <header className="mb-10 text-center md:text-left animate-fade-in">
          <h2 className="text-headline-xl font-main font-extrabold text-on-surface">Elige un juego</h2>
          <p className="text-body-lg font-main text-on-surface-variant mt-2">
            Ejercita tu mente con actividades diseñadas para ti.
          </p>
        </header>

        {/* Games grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gap-default animate-slide-up">
          {games.map((game, i) => {
            const style = gameStyles[i] || gameStyles[0];
            return (
              <button
                key={game.id}
                id={`game-card-${game.id}`}
                onClick={() => navigate(`/juegos/${game.id}/dificultad`)}
                className="group relative flex flex-col items-center text-center p-8 bg-surface-container-lowest border-2 border-outline-variant rounded-xl hover:border-primary hover:shadow-md active:scale-95 transition-all duration-200 min-h-[240px]"
              >
                <div className={`w-20 h-20 rounded-full ${style.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined ${style.iconColor} text-[40px]`}>
                    {game.icon}
                  </span>
                </div>
                <h3 className="text-headline-md font-main font-bold mb-2">{game.name}</h3>
                <p className="text-body-md font-main text-on-surface-variant">{game.description}</p>
              </button>
            );
          })}
        </div>

        {/* Back button */}
        <footer className="mt-12 flex justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-3 w-full md:w-[320px] h-[64px] bg-surface border-2 border-primary text-on-surface font-main font-bold text-label-lg rounded-xl hover:bg-primary hover:text-white active:scale-95 transition-all focus-visible:outline-2"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Volver al inicio
          </button>
        </footer>

      </main>

      <BottomNav />
    </div>
  );
}
