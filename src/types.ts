export interface ExamImage {
  id: string;
  name: string;
  mimeType: string;
  data: string; // base64
  previewUrl: string;
  size?: number;
  fileCategory?: 'image' | 'pdf' | 'document' | 'text';
  textSnippet?: string;
}

export interface ExtractedQuestion {
  number: number;
  question: string;
  questionAr?: string;
  questionEn?: string;
  type?: 'mcq' | 'true_false' | 'essay' | 'coding' | string;
  options?: string[];
  optionsAr?: string[];
  optionsEn?: string[];
  correctAnswer?: string | number;
  correctIndex?: number;
  explanation?: string;
  explanationAr?: string;
  explanationEn?: string;
  points?: number;
}

export type GenerationMode = "generate_new_similar" | "exact_extract";

export interface ExamGenerationResult {
  examTitle: string;
  detectedLanguage: string;
  suggestedFileName: string;
  summary: string;
  extractedQuestions: ExtractedQuestion[];
  generatedCode: string;
  generatedAt: string;
  templateNameUsed?: string;
  generationMode?: GenerationMode;
}

export interface CodeTemplatePreset {
  id: string;
  title: string;
  titleEn: string;
  category: string;
  language: string;
  extension: string;
  description: string;
  code: string;
}

export interface GenerationHistoryItem {
  id: string;
  timestamp: number;
  title: string;
  language: string;
  questionsCount: number;
  result: ExamGenerationResult;
}
