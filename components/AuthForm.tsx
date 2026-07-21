"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export function AuthForm({
  configured,
  initialMode,
  callbackError,
  passwordUpdated,
}: {
  configured: boolean;
  initialMode: AuthMode;
  callbackError: boolean;
  passwordUpdated: boolean;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(
    callbackError
      ? "That account link could not be completed. Please try again."
      : passwordUpdated
        ? "Password updated. Log in with your new password."
        : "",
  );
  const [isError, setIsError] = useState(callbackError);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage("");
    setIsError(false);
    setPassword("");
    setConfirmation("");
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || busy) return;
    if (mode === "signup" && password.length < 12) {
      setIsError(true);
      setMessage("Use at least 12 characters for your password.");
      return;
    }
    if (mode === "signup" && password !== confirmation) {
      setIsError(true);
      setMessage("The passwords do not match.");
      return;
    }

    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      const supabase = createBrowserSupabaseClient();
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign("/learn");
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/learn`,
        },
      });
      if (error) throw error;
      if (data.session) {
        window.location.assign("/learn");
        return;
      }
      setMessage("Check your inbox to confirm your email, then come back to StudyScroll.");
    } catch {
      setIsError(true);
      setMessage(
        mode === "login"
          ? "Email or password not recognized."
          : "We could not create that account. Check the details and try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGoogle() {
    if (!configured || busy) return;
    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/learn`,
        },
      });
      if (error) throw error;
    } catch {
      setIsError(true);
      setMessage("Google sign-in is unavailable right now.");
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="auth-page">
      <section className="auth-panel" aria-labelledby="auth-title">
        <Link href="/" className="auth-back"><ArrowLeft aria-hidden="true" size={18} />Home</Link>
        <div className="auth-brand"><span>Study</span><span>Scroll</span></div>

        <div className="auth-heading">
          <h1 id="auth-title">{mode === "login" ? "Welcome back" : "Keep your momentum"}</h1>
          <p>
            {mode === "login"
              ? "Sign in to continue your feed, saves, streak and ranks."
              : "Create a free account to keep your learning progress across devices."}
          </p>
        </div>

        <div className="auth-switch" aria-label="Choose account action">
          <button type="button" className={mode === "login" ? "active" : ""} aria-pressed={mode === "login"} onClick={() => switchMode("login")}>Log in</button>
          <button type="button" className={mode === "signup" ? "active" : ""} aria-pressed={mode === "signup"} onClick={() => switchMode("signup")}>Create account</button>
        </div>

        {!configured && (
          <div className="auth-message is-error" role="alert">
            Account access will be available after Supabase is connected.
          </div>
        )}

        <button type="button" className="google-button" disabled={!configured || busy} onClick={continueWithGoogle}>
          <span aria-hidden="true">G</span>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or use email</span></div>

        <form className="auth-form" onSubmit={submitEmail}>
          <label>
            <span>Email</span>
            <input type="email" name="email" autoComplete="email" inputMode="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} disabled={!configured || busy} placeholder="you@example.com" />
          </label>
          <label>
            <span>Password</span>
            <span className="password-input">
              <input type={showPassword ? "text" : "password"} name="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "signup" ? 12 : undefined} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} disabled={!configured || busy} placeholder={mode === "signup" ? "At least 12 characters" : "Your password"} />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)} disabled={!configured || busy}>
                {showPassword ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
              </button>
            </span>
          </label>
          {mode === "signup" && (
            <label>
              <span>Confirm password</span>
              <input type={showPassword ? "text" : "password"} name="password-confirmation" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={!configured || busy} placeholder="Repeat your password" />
            </label>
          )}

          {message && <div className={`auth-message${isError ? " is-error" : ""}`} role={isError ? "alert" : "status"}>{message}</div>}

          <button type="submit" className="button button-primary" disabled={!configured || busy}>
            {busy ? "Please wait..." : mode === "login" ? "Log in" : "Create free account"}
          </button>
        </form>

        {mode === "login" && <Link className="auth-help-link" href="/auth/reset">Forgot your password?</Link>}
        <p className="auth-privacy">Passwords are hashed by Supabase Auth. StudyScroll never stores them in its application database.</p>
      </section>
    </main>
  );
}
