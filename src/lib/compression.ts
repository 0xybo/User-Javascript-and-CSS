import { JSONComposite } from '@/types/json';

export async function compress(data: JSONComposite): Promise<string> {
    // Convert object → JSON → Uint8Array
    const json = JSON.stringify(data);
    const input = new TextEncoder().encode(json);

    // Stream through GZIP
    const compressedStream = new Blob([input]).stream().pipeThrough(new CompressionStream('gzip'));

    const compressedBlob = await new Response(compressedStream).blob();
    const arrayBuffer = await compressedBlob.arrayBuffer();

    // Convert binary → Base64
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary); // Base64 string
}

export async function decompress(base64: string): Promise<JSONComposite> {
    // Base64 → binary
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    // Stream through GZIP decompressor
    const decompressedStream = new Blob([bytes])
        .stream()
        .pipeThrough(new DecompressionStream('gzip'));

    const decompressedBlob = await new Response(decompressedStream).blob();
    const text = await decompressedBlob.text();

    return JSON.parse(text);
}
