export default async function Page({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return <main className="container mx-auto py-8">Карточка {id} — в разработке</main>;
}