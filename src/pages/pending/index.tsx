import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card/card";

export function PendingPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-4">
            <Card className="w-full max-w-sm">
                <CardHeader><CardTitle>Заявка отправлена</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                    <p>Администратор рассмотрит её, после этого вы сможете войти.</p>
                    <Link href="/login" className="underline">К странице входа</Link>
                </CardContent>
            </Card>
        </main>
    );
}