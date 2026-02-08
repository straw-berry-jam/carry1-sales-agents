import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function storeSessionContext(sessionId: string, context: any) {
  const { error } = await supabase
    .from('voice_sessions')
    .insert({ id: sessionId, context });
  if (error) console.error('Failed to store voice session:', error);
}

export async function getSessionContext(sessionId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from('voice_sessions')
    .select('context')
    .eq('id', sessionId)
    .single();
  if (error || !data) return null;
  return data.context;
}

export async function deleteSessionContext(sessionId: string) {
  await supabase.from('voice_sessions').delete().eq('id', sessionId);
}

export async function getLatestSessionContext(): Promise<any | null> {
  const { data, error } = await supabase
    .from('voice_sessions')
    .select('context')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  if (error || !data) {
    console.log('No voice session context found in Supabase');
    return null;
  }
  console.log('Found latest voice session context');
  return data.context;
}
