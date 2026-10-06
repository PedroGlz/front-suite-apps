export function apiErrorMessage(error: any, fallback: string): string {
  if (error.status === 401) return 'Tu sesión no es válida o expiró.';
  const message = error?.error?.message ?? error?.error?.detail;
  if (typeof message === 'string' && message.trim() && message.length <= 350 &&
      !/select\s|insert\s+into|update\s+\w+\s+set|delete\s+from|unknown column|duplicate entry|foreign key|jdbc:|stacktrace|password_hash|\$argon2|\$2[aby]\$|bearer\s|(?:password|secret|token)\s*[:=]|[\w-]{8,}\.[\w-]{8,}\.[\w-]{8,}/i.test(message)) return message;
  if (error.status === 403) return 'No tienes acceso a esta aplicación.';
  if (error.status === 404) return 'La aplicación o versión solicitada no existe.';
  return fallback;
}
