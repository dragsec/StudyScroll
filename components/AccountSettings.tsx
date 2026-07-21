"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowLeft, KeyRound, LogOut, Mail, Trash2 } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type Notice = { tone: "success" | "error"; text: string } | null;

export function AccountSettings({ email, provider }: { email: string; provider: string | null }) {
  const [newEmail, setNewEmail] = useState(email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const passwordProvider = provider === "email" || provider === null;

  async function updateEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || newEmail === email) return;
    setBusy("email");
    setNotice(null);
    try {
      const { error } = await createBrowserSupabaseClient().auth.updateUser({ email: newEmail });
      if (error) throw error;
      setNotice({ tone: "success", text: "Check both inboxes to confirm the email change." });
    } catch {
      setNotice({ tone: "error", text: "Your email could not be updated." });
    } finally {
      setBusy(null);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    if (newPassword.length < 12 || newPassword !== passwordConfirmation) {
      setNotice({
        tone: "error",
        text: newPassword.length < 12 ? "Use at least 12 characters." : "The new passwords do not match.",
      });
      return;
    }

    setBusy("password");
    setNotice(null);
    try {
      const { error } = await createBrowserSupabaseClient().auth.updateUser({
        password: newPassword,
        current_password: currentPassword,
      });
      if (error) throw error;
      setCurrentPassword("");
      setNewPassword("");
      setPasswordConfirmation("");
      setNotice({ tone: "success", text: "Password updated." });
    } catch {
      setNotice({ tone: "error", text: "Check your current password and try again." });
    } finally {
      setBusy(null);
    }
  }

  async function sendPasswordLink() {
    if (busy) return;
    setBusy("password-link");
    setNotice(null);
    try {
      const { error } = await createBrowserSupabaseClient().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset?mode=update`,
      });
      if (error) throw error;
      setNotice({ tone: "success", text: "A secure password link is on its way." });
    } catch {
      setNotice({ tone: "error", text: "The password email could not be sent." });
    } finally {
      setBusy(null);
    }
  }

  async function signOut() {
    if (busy) return;
    setBusy("signout");
    setNotice(null);
    const { error } = await createBrowserSupabaseClient().auth.signOut();
    if (error) {
      setNotice({ tone: "error", text: "You could not be logged out. Please try again." });
      setBusy(null);
      return;
    }
    window.location.assign("/");
  }

  async function deleteAccount() {
    if (busy || deleteConfirmation !== "DELETE") return;
    setBusy("delete");
    setNotice(null);
    try {
      const response = await fetch("/api/account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-StudyScroll-Request": "1",
        },
        body: JSON.stringify({ confirmation: deleteConfirmation }),
      });
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const code =
          payload && typeof payload === "object" && "error" in payload
            ? (payload as { error?: { code?: unknown } }).error?.code
            : null;
        if (code === "reauthentication_required") {
          setNotice({ tone: "error", text: "For safety, log out and sign in again before deleting your account." });
          setBusy(null);
          return;
        }
        throw new Error("delete_failed");
      }
      window.location.assign("/");
    } catch {
      setNotice({ tone: "error", text: "Account deletion could not be completed. Please try again." });
      setBusy(null);
    }
  }

  return (
    <main id="main-content" className="account-page">
      <div className="account-shell">
        <header className="account-header">
          <Link href="/learn" className="auth-back"><ArrowLeft aria-hidden="true" size={18} />Back to StudyScroll</Link>
          <div><p>Account</p><h1>Settings</h1></div>
          <span>{email}</span>
        </header>

        {notice && <div className={`account-notice is-${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</div>}

        <section className="settings-section" aria-labelledby="email-settings-title">
          <div className="settings-title"><Mail aria-hidden="true" size={20} /><div><h2 id="email-settings-title">Email</h2><p>Used only for signing in and account messages.</p></div></div>
          <form onSubmit={updateEmail} className="settings-form">
            <label><span>New email</span><input type="email" autoComplete="email" maxLength={254} required value={newEmail} onChange={(event) => setNewEmail(event.target.value)} disabled={Boolean(busy)} /></label>
            <button type="submit" className="button button-secondary" disabled={Boolean(busy) || newEmail === email}>{busy === "email" ? "Updating..." : "Update email"}</button>
          </form>
        </section>

        <section className="settings-section" aria-labelledby="password-settings-title">
          <div className="settings-title"><KeyRound aria-hidden="true" size={20} /><div><h2 id="password-settings-title">Password</h2><p>{passwordProvider ? "Confirm your current password before choosing another." : "Your account currently signs in with Google."}</p></div></div>
          {passwordProvider ? (
            <form onSubmit={updatePassword} className="settings-form">
              <label><span>Current password</span><input type="password" autoComplete="current-password" maxLength={128} required value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={Boolean(busy)} /></label>
              <label><span>New password</span><input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={Boolean(busy)} placeholder="At least 12 characters" /></label>
              <label><span>Confirm new password</span><input type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} disabled={Boolean(busy)} /></label>
              <button type="submit" className="button button-secondary" disabled={Boolean(busy)}>{busy === "password" ? "Updating..." : "Update password"}</button>
            </form>
          ) : (
            <button type="button" className="button button-secondary settings-single-action" onClick={sendPasswordLink} disabled={Boolean(busy)}>{busy === "password-link" ? "Sending..." : "Email me a password link"}</button>
          )}
        </section>

        <section className="settings-section" aria-labelledby="session-settings-title">
          <div className="settings-title"><LogOut aria-hidden="true" size={20} /><div><h2 id="session-settings-title">Session</h2><p>Sign out on this device.</p></div></div>
          <button type="button" className="button button-secondary settings-single-action" onClick={signOut} disabled={Boolean(busy)}>{busy === "signout" ? "Signing out..." : "Log out"}</button>
        </section>

        <section className="settings-section danger-zone" aria-labelledby="delete-settings-title">
          <div className="settings-title"><Trash2 aria-hidden="true" size={20} /><div><h2 id="delete-settings-title">Delete account</h2><p>Permanently removes your saves, attempts, streak and ranks.</p></div></div>
          <label><span>Type DELETE to confirm</span><input type="text" autoComplete="off" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} disabled={Boolean(busy)} /></label>
          <button type="button" className="delete-account-button" disabled={Boolean(busy) || deleteConfirmation !== "DELETE"} onClick={deleteAccount}>{busy === "delete" ? "Deleting..." : "Delete my account"}</button>
        </section>
      </div>
    </main>
  );
}
