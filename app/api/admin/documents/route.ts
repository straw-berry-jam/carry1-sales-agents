import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { chunkDocument, generateEmbeddings, storeChunks } from '@/lib/embeddings';

export async function GET() {
  try {
    const documents = await prisma.coachDocument.findMany({
      include: {
        documentTaxonomies: {
          include: {
            taxonomy: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    // Map database records to KBDocument structure
    const mappedDocs = documents.map((doc) => {
      const metadata = doc.metadata as any;
      const roles = doc.documentTaxonomies
        .filter((dt) => dt.taxonomy.taxonomyType === 'role')
        .map((dt) => dt.taxonomy.name);
      const stages = doc.documentTaxonomies
        .filter((dt) => dt.taxonomy.taxonomyType === 'stage')
        .map((dt) => dt.taxonomy.name);

      return {
        id: doc.id,
        type: doc.documentType as any,
        title: doc.title,
        content: doc.content,
        status: doc.status as any,
        strictness_override: doc.strictnessOverride,
        updatedAt: doc.updatedAt.toISOString().split('T')[0],
        roles,
        stages,
        ...metadata,
      };
    });

    return NextResponse.json(mappedDocs);
  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      type, title, content, status, 
      roles = [], stages = [], 
      strictness_override,
      ...metadata 
    } = body;

    // 1. Get the default coach (SEI Interview Coach)
    const coach = await prisma.coach.findFirst({
      where: { slug: 'sei-interview-coach' },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    // 2. Create the document
    const newDoc = await prisma.$transaction(async (tx) => {
      const doc = await tx.coachDocument.create({
        data: {
          coachId: coach.id,
          documentType: type,
          title,
          content,
          status: status === 'active' ? 'active' : 'draft',
          strictnessOverride: (strictness_override !== undefined && strictness_override !== null) ? parseInt(strictness_override) : null,
          metadata: metadata || {},
        },
      });

      // 3. Handle Taxonomies (Roles and Stages)
      const taxonomyNames = [...roles, ...stages];
      if (taxonomyNames.length > 0) {
        const taxonomies = await tx.taxonomy.findMany({
          where: {
            coachId: coach.id,
            name: { in: taxonomyNames },
          },
        });

        if (taxonomies.length > 0) {
          await tx.documentTaxonomy.createMany({
            data: taxonomies.map((t) => ({
              documentId: doc.id,
              taxonomyId: t.id,
            })),
          });
        }
      }

      return doc;
    });

    /**
     * Automatic Embedding Generation:
     * Chunks the document content, generates OpenAI embeddings in batches,
     * and stores them in the coach_chunks table.
     */
    try {
      const chunks = chunkDocument(content);
      if (chunks.length > 0) {
        const embeddings = await generateEmbeddings(chunks);
        await storeChunks(newDoc.id, chunks, embeddings);
      }
    } catch (embError) {
      // If embedding fails, still create the document but log the error
      console.error('Embedding generation/storage failed for document:', newDoc.id, embError);
    }

    return NextResponse.json(newDoc);
  } catch (error: any) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
