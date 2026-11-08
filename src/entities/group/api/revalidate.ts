import { revalidatePath } from "next/cache";

/** Страница группы и общий список групп («/») */
export function revalidateGroup(groupId: string) {
    revalidatePath(`/groups/${groupId}`);
    revalidatePath("/");
}
