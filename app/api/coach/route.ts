import { NextRequest, NextResponse } from 'next/server';
import { generateCoachResponse, SessionContext } from '@/lib/coaching';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { userMessage, sessionContext } = body as { 
      userMessage: string; 
      sessionContext: SessionContext 
    };

    if (!userMessage || !sessionContext) {
      return NextResponse.json(
        { error: 'Missing userMessage or sessionContext' },
        { status: 400 }
      );
    }

    const coachResponse = await generateCoachResponse({
      userMessage,
      sessionContext
    });

    return NextResponse.json({ response: coachResponse });

  } catch (error: any) {
    console.error('API Error in /api/coach:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate coach response' },
      { status: 500 }
    );
  }
}
