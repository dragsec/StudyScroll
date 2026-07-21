const RECOVERY_DESTINATION = "/auth/reset?mode=update";
const STANDARD_DESTINATIONS = new Set(["/learn", "/account"]);

type AuthEnvironment = {
  APP_ORIGIN?: string;
  NODE_ENV?: string;
  VERCEL_ENV?: string;
  VERCEL_URL?: string;
};

function validOrigin(value: string, production: boolean) {
  try {
    const url = new URL(value);
    if (url.username || url.password) return null;
    if (production && url.protocol !== "https:") return null;
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function authDestination(value: string | null, redirectType: string | null) {
  if (redirectType === "recovery") return RECOVERY_DESTINATION;
  return value && STANDARD_DESTINATIONS.has(value) ? value : "/learn";
}

export function authRedirectOrigin(requestUrl: string, environment: AuthEnvironment) {
  const production = environment.NODE_ENV === "production";
  if (environment.VERCEL_ENV === "preview" && environment.VERCEL_URL) {
    const previewOrigin = validOrigin(`https://${environment.VERCEL_URL}`, true);
    if (previewOrigin) return previewOrigin;
  }

  const configured = environment.APP_ORIGIN?.trim();
  if (configured) return validOrigin(configured, production);
  return production ? null : validOrigin(requestUrl, false);
}

export const passwordRecoveryDestination = RECOVERY_DESTINATION;
