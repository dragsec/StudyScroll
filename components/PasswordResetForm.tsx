"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export function PasswordResetForm({
  configured,
  initialError,
  updateMode,
}: {
  configured: boolean;
  initialError: string;
  updateMode: boolean;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(initialError);
  const [isError, setIsError] = useState(Boolean(initialError));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!configured || busy) return;
    if (updateMode && (password.length < 12 || password !== confirmation)) {
      setIsError(true);
      setMessage(password.length < 12 ? "Use at least 12 characters." : "The passwords do not match.");
      return;
    }

    setBusy(true);
    setMessage("");
    setIsError(false);
    try {
      if (updateMode) {
        const response = await fetch("/api/account/recovery-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-StudyScroll-Request": "1",
          },
          body: JSON.stringify({ password }),
        });
        if (!response.ok) throw new Error("password_update_failed");
        window.location.assign("/auth?password=updated");
        return;
      } else {
        const supabase = createBrowserSupabaseClient();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset?mode=update`,
        });
        if (error) throw error;
        setMessage("If that email has an account, a reset link is on its way.");
      }
    } catch {
      setIsError(true);
      setMessage("The password request could not be completed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main id="main-content" className="auth-page">
      <section className="auth-panel" aria-labelledby="reset-title">
        <Link href={updateMode ? "/account" : "/auth"} className="auth-back"><ArrowLeft aria-hidden="true" size={18} />Back</Link>
        <div className="auth-brand"><span>Study</span><span>Scroll</span></div>
        <div className="auth-heading">
          <h1 id="reset-title">{updateMode ? "Choose a new password" : "Reset your password"}</h1>
          <p>{updateMode ? "Use a new password you do not use anywhere else." : "We will email you a secure link to choose a new password."}</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          {updateMode ? (
            <>
              <label><span>New password</span><input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={(event) => setPassword(event.target.value)} disabled={!configured || busy} placeholder="At least 12 characters" /></label>
              <label><span>Confirm password</span><input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={(event) => setConfirmation(event.target.value)} disabled={!configured || busy} placeholder="Repeat your password" /></label>
            </>
          ) : (
            <label><span>Email</span><input type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} disabled={!configured || busy} placeholder="you@example.com" /></label>
          )}
          {message && <div className={`auth-message${isError ? " is-error" : ""}`} role={isError ? "alert" : "status"}>{message}</div>}
          <button className="button button-primary" type="submit" disabled={!configured || busy}>{busy ? "Please wait..." : updateMode ? "Update password" : "Send reset link"}</button>
        </form>
      </section>
    </main>
  );
}
