import { getStorage } from "./cloudflare";

export async function putDocumentContent(
    key: string,
    content: string,
    contentType = "text/markdown; charset=utf-8"
): Promise<boolean> {
    const bucket = getStorage();
    if (!bucket) return false;

    await bucket.put(key, content, {
        httpMetadata: { contentType },
    });
    return true;
}

export async function getDocumentContent(key: string): Promise<string | null> {
    const bucket = getStorage();
    if (!bucket) return null;

    const obj = await bucket.get(key);
    if (!obj) return null;
    return obj.text();
}

export async function deleteDocumentContent(key: string): Promise<void> {
    const bucket = getStorage();
    if (!bucket) return;
    await bucket.delete(key);
}

export function documentR2Key(userId: string | null, documentId: string): string {
    const prefix = userId ? `users/${userId}` : "anonymous";
    return `${prefix}/documents/${documentId}.md`;
}
