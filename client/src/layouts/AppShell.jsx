import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider.jsx";
import recallFlowLogo from "../assets/recallflow-logo.svg";

export function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticating } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="shell-bar panel glass-panel">
        <button className="brand-link" type="button" onClick={() => navigate("/")}>
          <img className="brand-logo" src={recallFlowLogo} alt="RecallFlow logo" />
          <div>
            <h1 className="brand-title">RecallFlow</h1>
          </div>
        </button>

        <div className="shell-account">
          <div className="account-pill">
            <strong>{user?.username}</strong>
            <p className="muted-text small-text">{user?.email}</p>
          </div>
          <button className="ghost-button shell-logout" type="button" onClick={handleLogout}>
            {isAuthenticating ? "Signing out..." : "Logout"}
          </button>
        </div>
      </header>

      <main className="content-area">
        {children}
      </main>
    </div>
  );
}
