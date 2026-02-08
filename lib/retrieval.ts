import { Prisma } from '@prisma/client';
import prisma from './prisma';
import { generateEmbedding } from './embeddings';

export interface RetrievalFilter {
  roles?: string[];
  stages?: string[];
  documentTypes?: string[];
}

export interface RetrievalResult {
  chunkText: string;
  similarity: number;
  documentTitle: string;
  documentType: string;
  strictnessOverride: number | null;
  metadata: any;
}

/**
 * Retrieves relevant context chunks from the database using vector similarity search.
 */
export async function retrieveRelevantContext(
  query: string,
  coachId: string,
  options: {
    filters?: RetrievalFilter;
    topK?: number;
    similarityThreshold?: number;
  } = {}
): Promise<RetrievalResult[]> {
  const { 
    filters = {}, 
    topK = 5, 
    similarityThreshold = 0.7 
  } = options;

  try {
    // 1. Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    const embeddingSql = `[${queryEmbedding.join(',')}]`;

    // 2. Build the base query conditions
    // Note: We use raw SQL because Prisma does not natively support pgvector operators yet
    
    let filterClauses: string[] = [];
    const queryParams: any[] = [embeddingSql, coachId, similarityThreshold];

    // Filter by document type
    if (filters.documentTypes && filters.documentTypes.length > 0) {
      const typeIndex = queryParams.push(filters.documentTypes);
      filterClauses.push(`d.document_type = ANY($${typeIndex})`);
    }

    // Filter by roles (requires checking taxonomies)
    if (filters.roles && filters.roles.length > 0) {
      const rolesIndex = queryParams.push(filters.roles);
      filterClauses.push(`
        EXISTS (
          SELECT 1 FROM document_taxonomies dt
          JOIN taxonomies t ON dt.taxonomy_id = t.id
          WHERE dt.document_id = d.id 
          AND t.taxonomy_type = 'role'
          AND t.name = ANY($${rolesIndex})
        )
      `);
    }

    // Filter by stages (requires checking taxonomies)
    if (filters.stages && filters.stages.length > 0) {
      const stagesIndex = queryParams.push(filters.stages);
      filterClauses.push(`
        EXISTS (
          SELECT 1 FROM document_taxonomies dt
          JOIN taxonomies t ON dt.taxonomy_id = t.id
          WHERE dt.document_id = d.id 
          AND t.taxonomy_type = 'stage'
          AND t.name = ANY($${stagesIndex})
        )
      `);
    }

    const whereClause = filterClauses.length > 0 
      ? `AND ${filterClauses.join(' AND ')}` 
      : '';

    const limitIndex = queryParams.push(topK);

    // 3. Execute the vector similarity search
    const results = await prisma.$queryRawUnsafe<any[]>(
      `
      SELECT 
        c.chunk_text as "chunkText",
        1 - (c.embedding <=> $1::vector) as "similarity",
        d.title as "documentTitle",
        d.document_type as "documentType",
        d.strictness_override as "strictnessOverride",
        d.metadata as "metadata"
      FROM coach_chunks c
      JOIN coach_documents d ON c.document_id = d.id
      WHERE d.coach_id = $2::uuid
        AND d.status = 'active'
        AND 1 - (c.embedding <=> $1::vector) >= $3
        ${whereClause}
      ORDER BY "similarity" DESC
      LIMIT $${limitIndex}
      `,
      ...queryParams
    );

    // 4. Process results
    return results.map(r => ({
      chunkText: r.chunkText,
      similarity: Number(r.similarity),
      documentTitle: r.documentTitle,
      documentType: r.documentType,
      strictnessOverride: r.strictnessOverride,
      metadata: r.metadata,
    }));

  } catch (error: any) {
    console.error('ERROR in retrieveRelevantContext:', error);
    console.error('Error details:', error.message, error.stack);
    throw new Error('Failed to retrieve relevant context: ' + error.message);
  }
}
