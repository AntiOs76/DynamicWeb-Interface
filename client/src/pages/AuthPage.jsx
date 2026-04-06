import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "../features/auth/AuthProvider.jsx";
import recallFlowLogo from "../assets/recallflow-logo.svg";
import { StatusBanner } from "../components/StatusBanner.jsx";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters.")
});

const registerSchema = loginSchema.extend({
  username: z.string().trim().min(2, "Username must be at least 2 characters.")
});

export function AuthPage() {
  const navigate = useNavigate();
  const { login, register, isAuthenticating } = useAuth();
  const [mode, setMode] = useState("login");
  const [errorMessage, setErrorMessage] = useState("");

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const registerForm = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: ""
    }
  });

  async function handleLogin(values) {
    try {
      setErrorMessage("");
      await login(values);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  async function handleRegister(values) {
    try {
      setErrorMessage("");
      await register(values);
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero hero-panel">
        <div className="hero-brand">
          <img className="hero-logo" src={recallFlowLogo} alt="RecallFlow logo" />
          <div>
            <h2 className="hero-brand-title">RecallFlow</h2>
          </div>
        </div>
        <h1>Turns flashcards into a polished learning workflow.</h1>
        <p className="muted-text">
          Create decks, manage cards, and run focused study sessions with spaced review and a seamless single-page experience.
        </p>
      </section>

      <section className="auth-panel auth-panel-surface">
        <div className="auth-heading">
          <p className="eyebrow">{mode === "login" ? "Welcome back" : "Get started"}</p>
          <h2 className="auth-title">
            {mode === "login" ? "Sign in to your account" : "Create your account"}
          </h2>
        </div>

        <div className="auth-card">
          <div className="tabs">
            <button
              className={mode === "login" ? "tab active" : "tab"}
              type="button"
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              className={mode === "register" ? "tab active" : "tab"}
              type="button"
              onClick={() => setMode("register")}
            >
              Create Account
            </button>
            <span className={`tab-indicator${mode === "register" ? " tab-indicator-right" : ""}`} />
          </div>

          <hr className="auth-divider" />

          {errorMessage ? <StatusBanner tone="error">{errorMessage}</StatusBanner> : null}

          {mode === "login" ? (
            <form
              key="login-form"
              className="form-grid auth-form"
              onSubmit={loginForm.handleSubmit(handleLogin)}
            >
              <label className="field">
                <span>Email</span>
                <input type="email" placeholder="student@example.com" {...loginForm.register("email")} />
                <small>{loginForm.formState.errors.email?.message}</small>
              </label>

              <label className="field">
                <span>Password</span>
                <input type="password" placeholder="At least 8 characters" {...loginForm.register("password")} />
                <small>{loginForm.formState.errors.password?.message}</small>
              </label>

              <button className="primary-button full-width" type="submit">
                {isAuthenticating ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form
              key="register-form"
              className="form-grid auth-form"
              onSubmit={registerForm.handleSubmit(handleRegister)}
            >
              <label className="field">
                <span>Username</span>
                <input placeholder="Your study alias" {...registerForm.register("username")} />
                <small>{registerForm.formState.errors.username?.message}</small>
              </label>

              <label className="field">
                <span>Email</span>
                <input type="email" placeholder="student@example.com" {...registerForm.register("email")} />
                <small>{registerForm.formState.errors.email?.message}</small>
              </label>

              <label className="field">
                <span>Password</span>
                <input type="password" placeholder="Create a secure password" {...registerForm.register("password")} />
                <small>{registerForm.formState.errors.password?.message}</small>
              </label>

              <button className="primary-button full-width" type="submit">
                {isAuthenticating ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
