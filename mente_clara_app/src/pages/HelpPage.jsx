import { useNavigate } from 'react-router-dom';
import TopBar from '../components/TopBar';
import BottomNav from '../components/BottomNav';

const items = [
  { icon: 'touch_app',       title: 'Toca para jugar',    text: 'Usa el dedo para tocar los botones. No hay prisa.' },
  { icon: 'replay',          title: 'Puedes repetir',     text: 'Al terminar puedes repetir el juego cuantas veces quieras.' },
  { icon: 'emoji_events',    title: 'Sin presión',        text: 'No hay respuestas malas. Solo practica y disfruta.' },
  { icon: 'battery_charging_full', title: 'Guarda tu progreso', text: 'Tu avance se guarda automáticamente en este dispositivo.' },
];

export default function HelpPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopBar showBack onBack={() => navigate(-1)} />
      <main className="flex-grow max-w-[720px] mx-auto w-full px-margin-mobile pt-[100px] pb-[100px] animate-fade-in">
        <h1 className="text-headline-xl font-main font-extrabold text-on-surface mb-3">Ayuda</h1>
        <p className="text-body-lg font-main text-on-surface-variant mb-8">Todo lo que necesitas saber para disfrutar Mente Clara.</p>
        <div className="grid grid-cols-1 gap-5">
          {items.map((item) => (
            <div key={item.title} className="flex gap-5 p-6 bg-surface-container-lowest border border-outline-variant rounded-xl">
              <div className="flex-shrink-0 w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[32px]">{item.icon}</span>
              </div>
              <div>
                <h3 className="text-headline-md font-main font-bold mb-1">{item.title}</h3>
                <p className="text-body-md font-main text-on-surface-variant">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => navigate('/juegos')}
            className="h-[64px] w-full md:w-[320px] bg-primary text-on-primary font-main font-bold text-label-lg rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">play_arrow</span>
            ¡Empezar a jugar!
          </button>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
