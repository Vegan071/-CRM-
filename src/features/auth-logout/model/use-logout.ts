    "use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/shared/api/auth-client";

export function useLogout() {
    const router = useRouter();
    return () =>
        authClient.signOut({
            fetchOptions: { onSuccess: () => router.push("/login") },
        });
}