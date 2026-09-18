import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Unsubscribe,
  where,
} from "firebase/firestore";
import { User } from "firebase/auth";
import { db, handleFirestoreError, OperationType } from "../config/firebase";
import { ExamGenerationResult, GenerationHistoryItem } from "../types";

export interface FirestoreExamDoc {
  id: string;
  title: string;
  generatedCode: string;
  summary: string;
  detectedLanguage: string;
  extractedQuestions: any[];
  createdAt: any;
  createdAtIso: string;
  timestamp: number;
  creatorUid: string;
  creatorEmail: string;
  questionsCount: number;
  generationMode?: string;
}

const EXAMS_COLLECTION = "exams";

/**
 * Saves a newly generated exam to Cloud Firestore under collection 'exams'.
 */
export async function saveExamToFirestore(
  result: ExamGenerationResult,
  user: User
): Promise<string> {
  const examId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const examRef = doc(db, EXAMS_COLLECTION, examId);

  const payload: FirestoreExamDoc = {
    id: examId,
    title: result.examTitle || "امتحان إلكتروني جديد",
    generatedCode: result.generatedCode || "",
    summary: result.summary || "",
    detectedLanguage: result.detectedLanguage || "html",
    extractedQuestions: result.extractedQuestions || [],
    createdAt: serverTimestamp(),
    createdAtIso: new Date().toISOString(),
    timestamp: Date.now(),
    creatorUid: user.uid,
    creatorEmail: user.email || "",
    questionsCount: result.extractedQuestions?.length || 0,
    generationMode: result.generationMode || "generate_new_similar",
  };

  try {
    await setDoc(examRef, payload);
    return examId;
  } catch (error) {
    return handleFirestoreError(error, OperationType.WRITE, `${EXAMS_COLLECTION}/${examId}`);
  }
}

/**
 * Subscribes to real-time updates of exams stored in Cloud Firestore.
 * Maps Firestore documents into the app's GenerationHistoryItem format.
 */
export function subscribeToExams(
  user: User,
  onUpdate: (items: GenerationHistoryItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // Query all exams ordered by newest first
  const q = query(collection(db, EXAMS_COLLECTION), orderBy("timestamp", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const items: GenerationHistoryItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as FirestoreExamDoc;
        const result: ExamGenerationResult = {
          examTitle: data.title,
          detectedLanguage: data.detectedLanguage || "html",
          suggestedFileName: `${data.title || "exam"}.html`,
          summary: data.summary || "",
          extractedQuestions: data.extractedQuestions || [],
          generatedCode: data.generatedCode || "",
          generatedAt: data.createdAtIso || new Date(data.timestamp).toISOString(),
          generationMode: (data.generationMode as any) || "generate_new_similar",
        };

        items.push({
          id: data.id || docSnap.id,
          timestamp: data.timestamp || Date.now(),
          title: data.title || "امتحان إلكتروني",
          language: data.detectedLanguage || "html",
          questionsCount: data.questionsCount || (data.extractedQuestions?.length ?? 0),
          result,
          creatorEmail: data.creatorEmail,
          creatorUid: data.creatorUid,
        });
      });
      onUpdate(items);
    },
    (err) => {
      console.error("Error subscribing to exams from Firestore:", err);
      if (onError) {
        onError(err);
      }
    }
  );
}

/**
 * Deletes an exam from Cloud Firestore.
 */
export async function deleteExamFromFirestore(examId: string): Promise<void> {
  const path = `${EXAMS_COLLECTION}/${examId}`;
  try {
    await deleteDoc(doc(db, EXAMS_COLLECTION, examId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
