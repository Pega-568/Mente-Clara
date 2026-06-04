import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <TopBar />

      <main className="flex-grow flex items-center justify-center px-margin-mobile pt-[80px] pb-[100px] md:pb-12">
        <div className="max-w-[960px] w-full text-center space-y-10 animate-fade-in">

          {/* Hero illustration */}
          <div className="relative w-full aspect-video md:aspect-[21/9] rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 via-surface-container to-secondary-container/30 border border-outline-variant flex items-center justify-center">
            <div className="text-center space-y-4 p-8">
              <div className="text-[80px] md:text-[120px] leading-none animate-bounce-in">🧠</div>
              <div className="flex justify-center gap-4 text-[40px] md:text-[56px]">
                <span>🎯</span><span>🌟</span><span>🎮</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-50 pointer-events-none" />
          </div>

          {/* Identity */}
          <div className="space-y-3 animate-slide-up">
            <h1 className="text-headline-xl font-main font-extrabold text-primary md:text-[56px] md:leading-[64px]">
              Mente Clara
            </h1>
            <p className="text-body-lg font-main text-on-surface-variant max-w-lg mx-auto">
              Juegos sencillos para ejercitar la memoria
            </p>
          </div>

          {/* Main actions */}
          <div className="flex flex-col gap-5 max-w-md mx-auto animate-slide-up">
            <button
              id="btn-comenzar"
              onClick={() => navigate('/juegos')}
              className="h-[64px] bg-primary text-on-primary rounded-xl text-label-lg font-main font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
              Comenzar
            </button>

            <button
              id="btn-ayuda"
              onClick={() => navigate('/ayuda')}
              className="h-[64px] bg-white border-2 border-primary text-on-background rounded-xl text-label-lg font-main font-bold hover:bg-surface-container-low active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span className="material-symbols-outlined text-[28px]">help</span>
              Ayuda
            </button>
          </div>

          {/* Quick access bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gap-default pt-4 text-left animate-fade-in">
            <div
              onClick={() => navigate('/juegos')}
              className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary hover:border-2 transition-all cursor-pointer group"
            >
              <span className="material-symbols-outlined text-primary text-[36px] mb-3 block group-hover:scale-110 transition-transform">extension</span>
              <h3 className="text-headline-md font-main font-bold mb-2">Memoria Visual</h3>
              <p className="text-body-md font-main text-on-surface-variant">Ejercicios con formas y colores diseñados para la concentración.</p>
            </div>
            <div
              onClick={() => navigate('/juegos')}
              className="p-6 bg-surface-container-lowest border border-outline-variant rounded-xl hover:border-primary hover:border-2 transition-all cursor-pointer group"
            >
              <span className="material-symbols-outlined text-primary text-[36px] mb-3 block group-hover:scale-110 transition-transform">format_list_numbered</span>
              <h3 className="text-headline-md font-main font-bold mb-2">Secuencias</h3>
              <p className="text-body-md font-main text-on-surface-variant">Sigue los pasos en el orden correcto sin prisas.</p>
            </div>
          </div>

        </div>
      </main>

      <BottomNav />
    </div>
  );
}
