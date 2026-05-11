import { database, ref, push } from "../api/register";

let cachedIp = "";
async function getClientIp(): Promise<string> {
  if (cachedIp) return cachedIp;
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const d = await r.json() as { ip?: string };
    cachedIp = d.ip ?? "";
  } catch { /* ignore */ }
  return cachedIp;
}

interface LogPayload {
  username: string;
  userId: string;
  action: string;
  details?: string;
  ip?: string;
}

export async function logActivity({ username, userId, action, details = "", ip = "" }: LogPayload): Promise<void> {
  try {
    const resolvedIp = ip || await getClientIp();
    await push(ref(database, "activityLogs"), {
      username, userId, action, details, ip: resolvedIp, createdAt: new Date().toISOString(),
    });
  } catch (e) { console.error("logActivity error:", e); }
}

export default function LogActivityUtil() { return null; }
