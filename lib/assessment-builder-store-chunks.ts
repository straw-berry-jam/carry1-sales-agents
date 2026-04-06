import prisma from '@/lib/prisma';

/**
 * Inserts one row into document_chunks with pgvector embedding.
 * Prisma has no native vector type — use $executeRawUnsafe with ::vector cast.
 * Pass the embedding as JSON.stringify(embedding) for the pgvector text input.
 */
export async function insertDocumentChunk(params: {
  assessmentId: string;
  documentId: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
}): Promise<void> {
  await prisma.$executeRawUnsafe(
    `INSERT INTO document_chunks (id, assessment_id, document_id, chunk_index, content, embedding)
     VALUES (gen_random_uuid(), $1::uuid, $2::uuid, $3, $4, $5::vector)`,
    params.assessmentId,
    params.documentId,
    params.chunkIndex,
    params.content,
    JSON.stringify(params.embedding),
  );
}

export async function countChunksForDocument(documentId: string): Promise<number> {
  const rows = await prisma.document_chunks.count({
    where: { document_id: documentId },
  });
  return rows;
}
