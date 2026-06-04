import { useNavigate, useLocation } from 'react-router-dom';

export default function TopBar({ title = 'Mente Clara', showBack = false, onBack }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-margin-mobile md:px-margin-desktop h-touch-target-min bg-surface border-b-2 border-outline-variant shadow-sm">
      <div className="flex items-center gap-4">
        {showBack ? (
          <button
            onClick={handleBack}
            aria-label="Volver"
            className="flex items-center justify-center w-touch-target-min h-touch-target-min rounded-full hover:bg-surface-container-high transition-colors focus-visible:outline-2"
          >
            <span className="material-symbols-outlined text-primary text-[32px]">arrow_back</span>
          </button>
        ) : (
          <span className="material-symbols-outlined text-primary text-[32px] ml-2">psychology</span>
        )}
        <h1 className="text-headline-lg-mobile md:text-headline-lg font-main font-bold text-primary">
          {title}
        </h1>
      </div>

      {/* Nav desktop */}
      <nav className="hidden md:flex items-center gap-6">
        <button
          onClick={() => navigate('/')}
          className="text-on-surface-variant hover:bg-surface-container-high px-3 py-2 rounded-lg transition-colors text-label-lg"
        >
          Inicio
        </button>
        <button
          onClick={() => navigate('/juegos')}
          className="text-primary font-bold border-b-4 border-primary px-3 py-2 text-label-lg"
        >
          Juegos
        </button>
        <button
          onClick={() => navigate('/ayuda')}
          className="text-on-surface-variant hover:bg-surface-container-high px-3 py-2 rounded-lg transition-colors text-label-lg"
        >
          Ayuda
        </button>
      </nav>
    </header>
  );
}
