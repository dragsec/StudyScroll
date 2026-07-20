import { isIP } from "node:net";

function isBlockedIpv4(hostname: string) {
  const [a, b] = hostname.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isBlockedIpv6(hostname: string) {
  const value = hostname.toLowerCase();
  return (
    value === "::" ||
    value === "::1" ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    /^fe[89ab]/u.test(value) ||
    value.startsWith("::ffff:")
  );
}

export function isSafeReferenceUrl(rawUrl: string): boolean {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/gu, "");
    if (url.protocol !== "https:" || url.username || url.password) return false;
    if (
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal")
    ) return false;
    const ipVersion = isIP(hostname);
    if (ipVersion === 4 && isBlockedIpv4(hostname)) return false;
    if (ipVersion === 6 && isBlockedIpv6(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}
