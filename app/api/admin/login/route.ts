import { json, body, sameOrigin, failure, ApiError } from "@/lib/server";
import { validPassword, sessionToken } from "@/lib/admin-auth";
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || "local";
    const prior = attempts.get(ip);
    if (prior && prior.until > Date.now() && prior.count >= 5)
      throw new ApiError("Aguarde 15 minutos antes de tentar novamente.", 429);
    const input = await body(request);
    if (!validPassword(String(input.password || ""))) {
      if (attempts.size > 1000) attempts.clear();
      attempts.set(ip, {
        count: prior && prior.until > Date.now() ? prior.count + 1 : 1,
        until: Date.now() + 900000,
      });
      throw new ApiError(
        "Senha inválida ou acesso ainda não configurado.",
        403,
      );
    }
    attempts.delete(ip);
    return json({ ok: true }, 200, {
      "Set-Cookie": `donna_admin=${sessionToken()}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${new URL(request.url).protocol === "https:" ? "; Secure" : ""}`,
    });
  } catch (e) {
    return failure(e);
  }
}
export async function DELETE(request: Request) {
  try {
    sameOrigin(request);
    return json({ ok: true }, 200, {
      "Set-Cookie":
        "donna_admin=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0",
    });
  } catch (e) {
    return failure(e);
  }
}
