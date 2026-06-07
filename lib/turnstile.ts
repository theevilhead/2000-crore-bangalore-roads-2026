// Cloudflare Turnstile verification. Env-gated: if TURNSTILE_SECRET_KEY is unset,
// captcha is disabled and this always passes (handy for local/dev).
export async function verifyCaptcha(token: string | undefined, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // disabled
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}

export function captchaEnabled(): boolean {
  return !!process.env.TURNSTILE_SECRET_KEY;
}
