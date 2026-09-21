import type { IQReport, ItemResponse, SessionRecord } from './types';

/**
 * Persistance locale des passations.
 *
 * ÉTAT TRANSITOIRE, ASSUMÉ : tout vit dans `localStorage`, donc rien n'est partagé
 * entre appareils et rien n'est vérifiable côté serveur. Les structures écrites ici
 * reproduisent volontairement le schéma visé en Phase 4 (tables `iq_sessions`,
 * `iq_responses`, `iq_reports`), pour que la migration soit une recopie et non une
 * réécriture.
 *
 * En particulier, `recordSession` constitue le journal de réponses dont la
 * recalibration a besoin : chaque item, sa réussite et son temps de réponse. Ce
 * journal est aujourd'hui local ; il devient exploitable dès qu'il remonte au serveur.
 */

const KEY_SESSIONS = 'nexus_iq_sessions_v2';
const KEY_REPORTS = 'nexus_iq_reports_v2';
const KEY_LAST_REPORT = 'nexus_iq_last_report_v2';

/** Nombre de passations conservées pour le contrôle d'exposition des items. */
const SESSION_HISTORY_LIMIT = 5;

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota dépassé ou stockage refusé : la passation reste utilisable en mémoire.
  }
}

export function getSessionHistory(): SessionRecord[] {
  return readJson<SessionRecord[]>(KEY_SESSIONS, []);
}

/** Identifiants des items servis récemment, à éviter lors du prochain tirage. */
export function getRecentItemIds(): string[] {
  return getSessionHistory().flatMap((s) => s.responses.map((r) => r.itemId));
}

export function recordSession(
  sessionId: string,
  startedAt: string,
  responses: ItemResponse[]
): void {
  const history = getSessionHistory();
  history.unshift({
    sessionId,
    startedAt,
    finishedAt: new Date().toISOString(),
    responses,
  });
  writeJson(KEY_SESSIONS, history.slice(0, SESSION_HISTORY_LIMIT));
}

export function saveReport(report: IQReport): void {
  const reports = readJson<IQReport[]>(KEY_REPORTS, []);
  reports.unshift(report);
  writeJson(KEY_REPORTS, reports.slice(0, SESSION_HISTORY_LIMIT));
  writeJson(KEY_LAST_REPORT, report.sessionId);
}

export function getReports(): IQReport[] {
  return readJson<IQReport[]>(KEY_REPORTS, []);
}

export function getLastReport(): IQReport | null {
  const id = readJson<string | null>(KEY_LAST_REPORT, null);
  if (!id) return null;
  return getReports().find((r) => r.sessionId === id) ?? null;
}

