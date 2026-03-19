export interface KBDocument {
  id: string;
  type: 'question' | 'company' | 'best_practice' | 'framework';
  title: string;
  content: string; // This will store the main detail field (question text, what they look for, overview, etc.)
  status: 'active' | 'draft';
  updatedAt: string;
  // Metadata fields for different types
  roles?: string[];
  stages?: string[];
  exampleAnswer?: string;
  whyItsStrong?: string;
  companyName?: string;
  industry?: string;
  topic?: string;
  frameworkName?: string;
  frameworkType?: string;
  strictness_override?: number | null;
}

export const mockDocuments: KBDocument[] = [
  {
    id: '1',
    type: 'question',
    title: 'Tell me about yourself',
    content: 'A standard introductory question to understand the candidate\'s background and communication style.',
    status: 'active',
    updatedAt: '2026-02-03',
    roles: ['Product Manager', 'Software Engineer'],
    stages: ['Initial Screen'],
  },
  {
    id: '3',
    type: 'company',
    title: 'CARRY1',
    content: 'Values alignment, consulting mindset, and long-term ownership.',
    status: 'active',
    updatedAt: '2026-01-28',
    companyName: 'CARRY1',
    industry: 'Consulting',
    roles: ['All Roles'],
  },
  {
    id: '4',
    type: 'best_practice',
    title: 'Active Listening Techniques',
    content: 'How to demonstrate engagement and understanding during an interview.',
    status: 'draft',
    updatedAt: '2026-02-02',
    topic: 'Communication',
    roles: ['All Roles'],
    stages: ['All Stages'],
  },
  {
    id: '5',
    type: 'framework',
    title: 'Problem Solving Framework',
    content: 'A structured approach to deconstructing complex business problems.',
    status: 'active',
    updatedAt: '2026-01-15',
    frameworkName: 'Problem Solving',
    frameworkType: 'General',
    roles: ['All Roles'],
    stages: ['All Stages'],
  },
];

export const mockStats = {
  totalDocuments: 156,
  questions: 45,
  examples: 32,
  companies: 12,
  bestPractices: 28,
  frameworks: 39,
};
