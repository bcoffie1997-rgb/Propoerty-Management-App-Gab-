import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const EXTERNAL_GATE_ENABLED = process.env.EXTERNAL_GATE_ENABLED === "1";
const EXTERNAL_GATE_USER = process.env.EXTERNAL_GATE_USER ?? "";
const EXTERNAL_GATE_PASSWORD = process.env.EXTERNAL_GATE_PASSWORD ?? "";

function unauthorizedResponse() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Holdings", charset="UTF-8"',
    },
  });
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

function gatePasses(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) return false;

  const encoded = authHeader.slice(6);
  let decoded = "";
  try {
    decoded = atob(encoded);
  } catch {
    return false;
  }

  const splitAt = decoded.indexOf(":");
  if (splitAt < 0) return false;

  const username = decoded.slice(0, splitAt);
  const password = decoded.slice(splitAt + 1);
  return (
    timingSafeEqual(username, EXTERNAL_GATE_USER) &&
    timingSafeEqual(password, EXTERNAL_GATE_PASSWORD)
  );
}

export async function middleware(request: NextRequest) {
  if (EXTERNAL_GATE_ENABLED) {
    if (!EXTERNAL_GATE_USER || !EXTERNAL_GATE_PASSWORD) {
      return new NextResponse("External gate is misconfigured.", { status: 500 });
    }
    if (!gatePasses(request)) {
      return unauthorizedResponse();
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public files (.svg, .png, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
