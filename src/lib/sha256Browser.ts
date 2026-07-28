/** SHA-256 of a Blob/ArrayBuffer in the browser (Web Crypto). */
export async function sha256HexBrowser(data: ArrayBuffer | Blob): Promise<string> {
  const buf =
    data instanceof Blob ? await data.arrayBuffer() : data;
  const hash = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export function isSha256Hex(s: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(s.trim());
}
