import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { retrieveRelevantContext, RetrievalFilter } from '@/lib/retrieval';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      query, 
      filters, 
      topK = 5, 
      similarityThreshold = 0.6 
    } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Get the default coach
    const coach = await prisma.coach.findFirst({
      where: { slug: 'sei-interview-coach' },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const results = await retrieveRelevantContext(query, coach.id, {
      filters,
      topK,
      similarityThreshold,
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error in retrieval API:', error);
    return NextResponse.json({ error: 'Failed to retrieve context' }, { status: 500 });
  }
}
