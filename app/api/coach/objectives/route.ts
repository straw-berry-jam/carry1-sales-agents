import { NextRequest, NextResponse } from 'next/server';
import { generateKeyObjectives } from '@/lib/coaching';

export async function POST(req: NextRequest) {
  try {
    const { role, company, interviewType } = await req.json();

    if (!role || !company || !interviewType) {
      return NextResponse.json(
        { error: 'Missing required parameters: role, company, or interviewType' },
        { status: 400 }
      );
    }

    const objectives = await generateKeyObjectives(role, company, interviewType);

    return NextResponse.json({ objectives });

  } catch (error: any) {
    console.error('API Error in /api/coach/objectives:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate key objectives' },
      { status: 500 }
    );
  }
}
