import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { AppShell } from './components/AppShell';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';
import { ChallengePage } from './pages/ChallengePage';
import { ShortcutsPage } from './pages/ShortcutsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route
          path="/practice"
          element={
            <AppShell>
              <SpreadsheetGrid />
            </AppShell>
          }
        />
        <Route
          path="/challenge"
          element={
            <AppShell>
              <ChallengePage />
            </AppShell>
          }
        />
        <Route
          path="/shortcuts"
          element={
            <AppShell>
              <ShortcutsPage />
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
