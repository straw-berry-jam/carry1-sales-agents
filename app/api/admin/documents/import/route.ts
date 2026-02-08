import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { chunkDocument, generateEmbeddings, storeChunks } from '@/lib/embeddings';

const CORE_COLUMNS = ['title', 'type', 'content', 'roles', 'stages', 'strictness_override'] as const;
const VALID_TYPES = ['question', 'company', 'best_practice', 'framework'] as const;

/**
 * Parse a single CSV line into fields, handling quoted fields that may contain commas.
 * Quotes are escaped as "" inside a quoted field.
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let i = 0;
  while (i < line.length) {
    if (line[i] === '"') {
      i += 1;
      let field = '';
      while (i < line.length) {
        if (line[i] === '"') {
          i += 1;
          if (i < line.length && line[i] === '"') {
            field += '"';
            i += 1;
          } else {
            break;
          }
        } else {
          field += line[i];
          i += 1;
        }
      }
      result.push(field);
      if (line[i] === ',') i += 1;
    } else {
      const end = line.indexOf(',', i);
      const slice = end === -1 ? line.slice(i) : line.slice(i, end);
      result.push(slice.trim());
      i = end === -1 ? line.length : end + 1;
    }
  }
  return result;
}

/**
 * Parse CSV text into rows of record objects. First row is headers.
 * Core columns are normalized to lowercase; extra columns go into metadata.
 */
function parseCSV(csvText: string): { title: string; type: string; content: string; roles: string[]; stages: string[]; strictness_override: number | null; metadata: Record<string, unknown> }[] {
  const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headerLine = parseCSVLine(lines[0]);
  const headers = headerLine.map((h) => h.trim().toLowerCase());
  const coreSet = new Set(CORE_COLUMNS);
  const metaKeys: string[] = headers.filter((h) => !coreSet.has(h as typeof CORE_COLUMNS[number]));

  const titleIdx = headers.indexOf('title');
  const typeIdx = headers.indexOf('type');
  const contentIdx = headers.indexOf('content');
  const rolesIdx = headers.indexOf('roles');
  const stagesIdx = headers.indexOf('stages');
  const strictnessIdx = headers.indexOf('strictness_override');

  if (titleIdx === -1 || typeIdx === -1 || contentIdx === -1) {
    throw new Error('CSV must include columns: title, type, content');
  }

  const rows: { title: string; type: string; content: string; roles: string[]; stages: string[]; strictness_override: number | null; metadata: Record<string, unknown> }[] = [];

  for (let r = 1; r < lines.length; r++) {
    const values = parseCSVLine(lines[r]);
    const get = (idx: number) => (idx >= 0 && idx < values.length ? values[idx].trim() : '');

    const title = get(titleIdx);
    const type = get(typeIdx);
    const content = get(contentIdx);

    if (!title || !type || !content) continue;

    const rolesStr = get(rolesIdx);
    const stagesStr = get(stagesIdx);
    const roles = rolesStr ? rolesStr.split(';').map((s) => s.trim()).filter(Boolean) : [];
    const stages = stagesStr ? stagesStr.split(';').map((s) => s.trim()).filter(Boolean) : [];

    let strictness_override: number | null = null;
    const strictnessVal = get(strictnessIdx);
    if (strictnessVal !== '') {
      const num = parseInt(strictnessVal, 10);
      if (!Number.isNaN(num) && num >= 0 && num <= 100) strictness_override = num;
    }

    const metadata: Record<string, unknown> = {};
    for (let i = 0; i < metaKeys.length; i++) {
      const key = metaKeys[i];
      const idx = headers.indexOf(key);
      if (idx >= 0 && idx < values.length) {
        const raw = values[idx].trim();
        if (raw !== '') metadata[key] = raw;
      }
    }

    rows.push({ title, type, content, roles, stages, strictness_override, metadata });
  }

  return rows;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Missing or invalid file' }, { status: 400 });
    }

    const csvText = await file.text();
    let rows: { title: string; type: string; content: string; roles: string[]; stages: string[]; strictness_override: number | null; metadata: Record<string, unknown> }[];
    try {
      rows = parseCSV(csvText);
    } catch (parseErr: any) {
      return NextResponse.json({ error: parseErr?.message || 'Invalid CSV' }, { status: 400 });
    }

    const coach = await prisma.coach.findFirst({
      where: { slug: 'sei-interview-coach' },
    });
    if (!coach) {
      return NextResponse.json({ error: 'Coach not found' }, { status: 404 });
    }

    let imported = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // 1-based, + header
      try {
        if (!VALID_TYPES.includes(row.type as any)) {
          throw new Error(`Invalid type "${row.type}". Must be: question, company, best_practice, framework`);
        }

        const newDoc = await prisma.$transaction(async (tx) => {
          const doc = await tx.coachDocument.create({
            data: {
              coachId: coach.id,
              documentType: row.type,
              title: row.title,
              content: row.content,
              status: 'draft',
              strictnessOverride: row.strictness_override,
              metadata: (row.metadata || {}) as any,
            },
          });

          const taxonomyNames = [...row.roles, ...row.stages];
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
          const chunks = chunkDocument(row.content);
          if (chunks.length > 0) {
            const embeddings = await generateEmbeddings(chunks);
            await storeChunks(newDoc.id, chunks, embeddings);
          }
        } catch (embError) {
          console.error('Embedding failed for document', newDoc.id, embError);
        }

        imported += 1;
      } catch (err: any) {
        failed += 1;
        errors.push(`Row ${rowNum} (${row.title}): ${err?.message || String(err)}`);
      }
    }

    return NextResponse.json({ imported, failed, errors });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Import failed' }, { status: 500 });
  }
}
