import { NextRequest, NextResponse } from 'next/server';
import { storeSessionContext } from '@/lib/voiceSessionStore';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!agentId || !apiKey) {
      console.error('Missing ElevenLabs credentials in environment');
      return NextResponse.json({ error: 'Missing ElevenLabs credentials' }, { status: 500 });
    }

    // Parse the body to get onboarding context
    const body = await req.json().catch(() => ({}));
    const sessionId = randomUUID();

    // Store the context in memory, keyed by sessionId
    await storeSessionContext(sessionId, {
      resumeText: body.resumeText || '',
      role: body.target_role || 'Software Engineer',
      company: body.target_company || '',
      interviewType: body.interviewType || 'General',
      preferredName: body.user_name || 'Candidate',
    });

    console.log('Stored voice session context for sessionId:', sessionId);
    console.log('Fetching signed URL for agent:', agentId);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('ElevenLabs API returned error:', error);
      throw new Error(`ElevenLabs API error: ${error}`);
    }

    const data = await response.json();
    return NextResponse.json({ 
      signedUrl: data.signed_url,
      sessionId: sessionId,
    });

  } catch (error: any) {
    console.error('Error in /api/elevenlabs-signed-url:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
