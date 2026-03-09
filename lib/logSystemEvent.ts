/**
 * Best-effort logging of system events to Supabase system_events table.
 * Used by score-session (eval fallback, retrieval errors) and can be used by other routes.
 * Never throws: on missing env or insert failure, logs to console.warn only.
 */

import { createClient } from '@supabase/supabase-js';

export type SystemEventSeverity = 'info' | 'warn' | 'error';

export interface LogSystemEventParams {
  route: string;
  event_type: string;
  severity: SystemEventSeverity;
  agent_id?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export async function logSystemEvent(params: LogSystemEventParams): Promise<void> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      console.warn('[logSystemEvent] missing Supabase env, skipping write');
      return;
    }
    const supabase = createClient(url, key);
    const { error } = await supabase.from('system_events').insert({
      route: params.route,
      event_type: params.event_type,
      severity: params.severity,
      agent_id: params.agent_id ?? null,
      message: params.message,
      metadata: params.metadata ?? null,
    });
    if (error) throw error;
  } catch (err) {
    console.warn('[logSystemEvent] failed to write system event:', err);
  }
}
