/**
 * GET /api/admin/system-events
 * Returns recent system_events for the System Health page and summary counts for last 24h.
 * Reads from Supabase system_events table (no Prisma model).
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const EVENTS_LIMIT = 500;
const TWENTY_FOUR_H_MS = 24 * 60 * 60 * 1000;

export interface SystemEventRow {
  id: string;
  created_at: string;
  route: string;
  event_type: string;
  severity: string;
  agent_id: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
}

export interface SystemEventsResponse {
  events: SystemEventRow[];
  summary: {
    errorsLast24h: number;
    warningsLast24h: number;
    lastEventAt: string | null;
  };
}

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json(
        { error: 'System events not configured' },
        { status: 503 }
      );
    }
    const supabase = createClient(url, key);

    const since = new Date(Date.now() - TWENTY_FOUR_H_MS).toISOString();

    // Fetch events (newest first) and compute summary from same data to avoid extra queries
    const { data: events, error: fetchError } = await supabase
      .from('system_events')
      .select('id, created_at, route, event_type, severity, agent_id, message, metadata')
      .order('created_at', { ascending: false })
      .limit(EVENTS_LIMIT);

    if (fetchError) {
      console.error('[system-events] fetch error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to load system events' },
        { status: 500 }
      );
    }

    const rows = (events ?? []) as SystemEventRow[];
    let errorsLast24h = 0;
    let warningsLast24h = 0;
    let lastEventAt: string | null = null;
    if (rows.length > 0) {
      lastEventAt = rows[0].created_at;
      for (const row of rows) {
        if (row.created_at < since) break;
        if (row.severity === 'error') errorsLast24h += 1;
        else if (row.severity === 'warn') warningsLast24h += 1;
      }
    }

    const response: SystemEventsResponse = {
      events: rows,
      summary: {
        errorsLast24h,
        warningsLast24h,
        lastEventAt,
      },
    };
    return NextResponse.json(response);
  } catch (err) {
    console.error('[system-events] error:', err);
    return NextResponse.json(
      { error: 'Failed to load system events' },
      { status: 500 }
    );
  }
}
