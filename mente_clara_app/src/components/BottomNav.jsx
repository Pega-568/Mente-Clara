import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/',       icon: 'home',      label: 'Inicio' },
  { path: '/juegos', icon: 'extension', label: 'Juegos' },
  { path: '/ayuda',  icon: 'help',      label: 'Ayuda' },
];

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-surface h-[80px] border-t-2 border-outline-variant rounded-t-xl shadow-2xl">
      {navItems.map(({ path, icon, label }) => {
        const isActive =
          path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(path);

        return (
          <button
            key={path}
            onClick={() => navigate(path)}
            aria-label={label}
            className={`flex flex-col items-center justify-center py-2 flex-1 transition-colors ${
              isActive
                ? 'text-primary border-t-4 border-primary bg-surface-container-low scale-95'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span
              className="material-symbols-outlined text-[28px]"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {icon}
            </span>
            <span className="text-label-md mt-0.5">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
