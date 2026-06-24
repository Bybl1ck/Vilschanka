"use client";

import { FormEvent, useState } from "react";
import { KeyRound, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { ADMIN_PANEL_PATH } from "@/lib/admin-paths";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const body = await response.json() as { success?: boolean; error?: string };
      if (!response.ok || !body.success) {
        setError(body.error || "Не вдалося увійти");
        return;
      }

      setPassword("");
      router.push(ADMIN_PANEL_PATH);
      router.refresh();
    } catch {
      setError("Не вдалося з’єднатися з сервером. Спробуйте ще раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <label htmlFor="password" className="text-sm font-bold text-sand-100">Пароль адміністратора</label>
      <div className="relative mt-2">
        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required autoFocus className="h-14 w-full rounded-2xl border border-white/15 bg-white/10 pl-12 pr-4 text-sand-100 outline-none transition placeholder:text-muted/60 focus:border-gold" placeholder="Введіть пароль" />
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={loading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-sm font-bold text-forest-950 transition hover:bg-sand-100 disabled:cursor-wait disabled:opacity-60">
        {loading && <LoaderCircle className="animate-spin" size={18} />} Увійти
      </button>
    </form>
  );
}
