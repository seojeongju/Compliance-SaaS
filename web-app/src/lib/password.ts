const ITERATIONS = 100_000;

function toBase64(bytes: Uint8Array): string {
    let binary = "";
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary);
}

function fromBase64(value: string): Uint8Array {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const derived = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );
    return `${toBase64(salt)}:${toBase64(new Uint8Array(derived))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [saltB64, hashB64] = stored.split(":");
    if (!saltB64 || !hashB64) return false;

    const salt = fromBase64(saltB64);
    const saltBytes = new Uint8Array(salt);
    const expected = fromBase64(hashB64);
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const derived = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: saltBytes,
            iterations: ITERATIONS,
            hash: "SHA-256",
        },
        keyMaterial,
        256
    );
    const actual = new Uint8Array(derived);
    if (actual.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
    return diff === 0;
}

export async function hashToken(token: string): Promise<string> {
    const data = new TextEncoder().encode(token);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return toBase64(new Uint8Array(digest));
}
