"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NeuromLogo } from "./Logo";
import { normalizeUsername } from "@/lib/utils";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (isSignup) {
        const uname = normalizeUsername(username);
        if (uname.length < 3) {
          throw new Error("Le pseudo doit faire au moins 3 caractères (a-z, 0-9, _).");
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: { username: uname, display_name: displayName || uname },
          },
        });
        if (error) throw error;

        // Si la confirmation e-mail est activée, pas de session immédiate.
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setInfo("Compte créé. Vérifiez votre boîte mail pour confirmer, puis connectez-vous.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm animate-fade-up">
        <div className="mb-10 flex flex-col items-center text-center">
          <NeuromLogo className="scale-125" />
          <h1 className="mt-7 text-3xl font-semibold tracking-tightest">
            {isSignup ? "Rejoindre Neurom" : "Bon retour"}
          </h1>
          <p className="mt-2 text-[15px] text-muted">
            Le réseau entièrement dédié à l&apos;IA.
          </p>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-3">
          {isSignup && (
            <>
              <Field
                label="Nom affiché"
                value={displayName}
                onChange={setDisplayName}
                placeholder="Ada Lovelace"
                autoComplete="name"
              />
              <Field
                label="Pseudo"
                value={username}
                onChange={(v) => setUsername(normalizeUsername(v))}
                placeholder="ada"
                prefix="@"
                autoComplete="username"
              />
            </>
          )}
          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="vous@exemple.com"
            autoComplete="email"
            required
          />
          <Field
            label="Mot de passe"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete={isSignup ? "new-password" : "current-password"}
            required
          />

          {error && (
            <p className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm">
              {error}
            </p>
          )}
          {info && (
            <p className="rounded-xl border border-line bg-elevated px-3 py-2 text-sm">
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-12 rounded-full bg-ink font-semibold text-canvas transition hover:opacity-90 active:scale-[0.99] disabled:opacity-40"
          >
            {loading ? "…" : isSignup ? "Créer mon compte" : "Se connecter"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          {isSignup ? "Déjà un compte ? " : "Pas encore de compte ? "}
          <Link
            href={isSignup ? "/login" : "/signup"}
            className="font-medium text-ink underline-offset-4 hover:underline"
          >
            {isSignup ? "Se connecter" : "S'inscrire"}
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  prefix,
  autoComplete,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  prefix?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[11px] uppercase tracking-widest text-subtle">
        {label}
      </span>
      <span className="flex items-center rounded-xl border border-line bg-transparent px-3.5 transition focus-within:border-ink">
        {prefix && <span className="text-subtle">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="h-12 w-full bg-transparent text-[15px] placeholder:text-subtle focus:outline-none"
        />
      </span>
    </label>
  );
}
