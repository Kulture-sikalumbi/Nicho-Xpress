"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.replace("/admin");
      router.refresh();
    } catch {
      setStatus("error");
      setErrorMessage("Sign-in failed. Check your details and make sure this account has staff access.");
    }
  }

  return (
    <main className="admin-login-page">
      <a className="admin-back-link" href="/">← Back to Nicho-Xpress</a>
      <section className="admin-login-card">
        <a className="brand" href="/" aria-label="Nicho-Xpress home">
          <span className="brand-mark">n<span>x</span></span>
          <span className="brand-word">Nicho<span>-Xpress</span></span>
        </a>
        <span className="admin-login-kicker">STAFF ACCESS</span>
        <h1>Welcome back.</h1>
        <p className="admin-login-intro">Sign in to review incoming item requests.</p>
        <form className="admin-login-form" onSubmit={signIn}>
          <label htmlFor="staff-email">Email address</label>
          <input id="staff-email" name="email" type="email" autoComplete="username" required />
          <label htmlFor="staff-password">Password</label>
          <input id="staff-password" name="password" type="password" autoComplete="current-password" required />
          {status === "error" && <p className="admin-login-error" role="alert">{errorMessage}</p>}
          <button className="button button-dark" type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Signing in…" : "Sign in"}
            {status !== "sending" && <span aria-hidden="true">↗</span>}
          </button>
        </form>
        <p className="admin-login-foot">Staff accounts are invited by a project administrator.</p>
      </section>
    </main>
  );
}
