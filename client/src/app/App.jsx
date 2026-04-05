import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider.jsx";
import { AppShell } from "../layouts/AppShell.jsx";
import { AuthPage } from "../pages/AuthPage.jsx";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { DeckWorkspacePage } from "../pages/DeckWorkspacePage.jsx";
import { NotFoundPage } from "../pages/NotFoundPage.jsx";
import { StudyPage } from "../pages/StudyPage.jsx";

function FullScreenMessage({ title, message }) {
  return (
    <div className="screen-center">
      <div className="panel glass-panel centered-panel">
        <p className="eyebrow">RecallFlow</p>
        <h1>{title}</h1>
        <p className="muted-text">{message}</p>
      </div>
    </div>
  );
}

function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <FullScreenMessage
        title="Restoring your workspace"
        message="Syncing decks, due cards, and your latest study progress."
      />
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function App() {
  const { user, isLoading } = useAuth();

  if (isLoading && !user) {
    return (
      <FullScreenMessage
        title="Preparing RecallFlow"
        message="Loading your session and getting the learning dashboard ready."
      />
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/decks/:deckId" element={<DeckWorkspacePage />} />
        <Route path="/study/:deckId" element={<StudyPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

