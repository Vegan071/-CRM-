import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

// Быстрая проверка «есть ли кука сессии». Настоящая проверка — requireUser() в страницах и экшенах.
export function proxy(request: NextRequest) {
    if (!getSessionCookie(request)) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|login|register|pending).*)"],
};
