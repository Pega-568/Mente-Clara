import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage        from './pages/HomePage';
import GameSelectPage  from './pages/GameSelectPage';
import DifficultyPage  from './pages/DifficultyPage';
import ResultPage      from './pages/ResultPage';
import HelpPage        from './pages/HelpPage';
import RulesPage       from './pages/RulesPage';
import MemoryPairsGame    from './games/MemoryPairsGame';
import ColorSequenceGame  from './games/ColorSequenceGame';
import ImageWordGame      from './games/ImageWordGame';
import OddObjectGame      from './games/OddObjectGame';
import OrderStepsGame     from './games/OrderStepsGame';
import ClassifyObjectsGame from './games/ClassifyObjectsGame';

// Dispatcher: routes /:gameId/:nivel to the right game component
function GameDispatcher() {
  const { gameId, nivel } = window.__routeParams || {};
  return null; // Handled by individual routes below
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
         {/* Main flow */}
        <Route path="/"               element={<HomePage />} />
        <Route path="/juegos"         element={<GameSelectPage />} />
        <Route path="/juegos/:gameId/dificultad" element={<DifficultyPage />} />
        <Route path="/rules/:gameId/:nivel" element={<RulesPage />} />
        <Route path="/resultado"      element={<ResultPage />} />
        <Route path="/ayuda"          element={<HelpPage />} />

        {/* Game routes */}
        <Route path="/juegos/memoryPairs/:nivel"   element={<MemoryPairsGame />} />
        <Route path="/juegos/colorSequence/:nivel" element={<ColorSequenceGame />} />
        <Route path="/juegos/imageWord/:nivel"     element={<ImageWordGame />} />
        <Route path="/juegos/oddObject/:nivel"     element={<OddObjectGame />} />
        <Route path="/juegos/orderSteps/:nivel"    element={<OrderStepsGame />} />
        <Route path="/juegos/classifyObjects/:nivel" element={<ClassifyObjectsGame />} />

        {/* Fallbacks */}
        <Route path="/games" element={<Navigate to="/juegos" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
