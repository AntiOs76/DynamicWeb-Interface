import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/AuthProvider.jsx";
import recallFlowLogo from "../assets/recallflow-logo.svg";

function LogoutIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export function AppShell({ children }) {
  const navigate = useNavigate();
  const { user, logout, isAuthenticating } = useAuth();

  async function handleLogout() {
    await logout();
    navigate("/auth", { replace: true });
  }

  return (
    <div className="app-shell">
      <header className="shell-bar">
        <div className="shell-bar-inner">
          <button className="brand-link" type="button" onClick={() => navigate("/")}>
            <img className="brand-logo" src={recallFlowLogo} alt="RecallFlow logo" />
            <div>
              <h1 className="brand-title">RecallFlow</h1>
            </div>
          </button>

          <div className="shell-account">
            <div className="account-summary">
              <strong>{user?.username}</strong>
              <p className="muted-text small-text">{user?.email}</p>
            </div>
            <button className="ghost-button shell-logout" type="button" onClick={handleLogout}>
              <span>{isAuthenticating ? "Signing out..." : "Logout"}</span>
              <LogoutIcon />
            </button>
          </div>
        </div>
      </header>

      <main className="content-area">
        {children}
      </main>
    </div>
  );
}
