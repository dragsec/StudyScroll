const privateIpv4 = /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/u;

export function isSafeReferenceUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase();
    if (url.protocol !== "https:" || url.username || url.password) return false;
    if (hostname === "localhost" || hostname.endsWith(".local") || hostname === "::1") return false;
    if (privateIpv4.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}
