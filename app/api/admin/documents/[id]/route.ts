import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { chunkDocument, generateEmbeddings, storeChunks } from '@/lib/embeddings';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await prisma.coachDocument.findUnique({
      where: { id },
      include: {
        documentTaxonomies: {
          include: {
            taxonomy: true,
          },
        },
      },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const metadata = doc.metadata as any;
    const roles = doc.documentTaxonomies
      .filter((dt) => dt.taxonomy.taxonomyType === 'role')
      .map((dt) => dt.taxonomy.name);
    const stages = doc.documentTaxonomies
      .filter((dt) => dt.taxonomy.taxonomyType === 'stage')
      .map((dt) => dt.taxonomy.name);

    const mappedDoc = {
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

    return NextResponse.json(mappedDoc);
  } catch (error: any) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { 
      type, title, content, status, 
      roles = [], stages = [], 
      strictness_override,
      ...metadata 
    } = body;

    const coach = await prisma.coach.findFirst({
      where: { slug: 'sei-sales-coach' },
    });

    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    const updatedDoc = await prisma.$transaction(async (tx) => {
      // 1. Update the document
      const doc = await tx.coachDocument.update({
        where: { id },
        data: {
          documentType: type,
          title,
          content,
          status: status === 'active' ? 'active' : 'draft',
          strictnessOverride: (strictness_override !== undefined && strictness_override !== null) ? parseInt(strictness_override) : null,
          metadata: metadata || {},
        },
      });

      // 2. Clear old taxonomies
      await tx.documentTaxonomy.deleteMany({
        where: { documentId: id },
      });

      // 3. Connect new taxonomies
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

    try {
      const chunks = chunkDocument(content);
      if (chunks.length > 0) {
        const embeddings = await generateEmbeddings(chunks);
        await storeChunks(updatedDoc.id, chunks, embeddings);
      }
    } catch (embError) {
      console.error('Embedding regeneration failed for document:', updatedDoc.id, embError);
    }

    return NextResponse.json(updatedDoc);
  } catch (error: any) {
    console.error('Error updating document:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.coachDocument.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
