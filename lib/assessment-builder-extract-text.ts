import mammoth from 'mammoth';

export type ExtractableKind = 'pdf' | 'docx' | 'txt';

export function detectExtractableKind(filename: string): ExtractableKind | null {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (lower.endsWith('.docx')) return 'docx';
  if (lower.endsWith('.txt')) return 'txt';
  return null;
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  kind: ExtractableKind,
): Promise<string> {
  if (kind === 'pdf') {
    // Dynamic import only — pdf-parse pulls test fixtures at module scope and breaks the Next bundle if static-imported.
    const mod = await import('pdf-parse');
    const pdfParse =
      typeof mod === 'object' &&
      mod !== null &&
      'default' in mod &&
      typeof (mod as { default: unknown }).default === 'function'
        ? (mod as { default: (b: Buffer) => Promise<{ text?: string }> }).default
        : (mod as unknown as (b: Buffer) => Promise<{ text?: string }>);
    const data = await pdfParse(buffer);
    return (data.text ?? '').replace(/\s+/g, ' ').trim();
  }
  if (kind === 'docx') {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value ?? '').trim();
  }
  return buffer.toString('utf8');
}
