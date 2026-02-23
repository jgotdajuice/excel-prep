import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { WelcomePage } from './pages/WelcomePage';
import { AppShell } from './components/AppShell';
import { SpreadsheetGrid } from './components/SpreadsheetGrid';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
