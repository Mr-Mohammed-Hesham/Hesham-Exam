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
const LOCAL_STORAGE_EXAMS_KEY = "hesham_exam_local_exams_cache_v1";

/**
 * Retrieves cached exams from localStorage for instant offline access.
 */
export function getLocalSavedExams(): GenerationHistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_EXAMS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Failed reading local exams cache:", e);
    return [];
  }
}

/**
 * Saves or updates an exam in localStorage cache.
 */
export function saveExamToLocalCache(item: GenerationHistoryItem): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalSavedExams();
    const filtered = current.filter((x) => x.id !== item.id);
    const updated = [item, ...filtered].slice(0, 100); // keep up to 100 exams locally
    localStorage.setItem(LOCAL_STORAGE_EXAMS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed saving exam to local cache:", e);
  }
}

/**
 * Deletes an exam from localStorage cache.
 */
export function deleteExamFromLocalCache(examId: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getLocalSavedExams();
    const updated = current.filter((x) => x.id !== examId);
    localStorage.setItem(LOCAL_STORAGE_EXAMS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn("Failed deleting exam from local cache:", e);
  }
}

/**
 * Saves a newly generated exam to Cloud Firestore with seamless offline backup.
 */
export async function saveExamToFirestore(
  result: ExamGenerationResult,
  user: User
): Promise<string> {
  const examId = `exam_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = Date.now();
  const isoDate = new Date(now).toISOString();

  // 1. Instant local persistence to guarantee zero data loss
  const historyItem: GenerationHistoryItem = {
    id: examId,
    timestamp: now,
    title: result.examTitle || "امتحان إلكتروني",
    language: result.detectedLanguage || "html",
    questionsCount: result.extractedQuestions?.length || 0,
    result: {
      ...result,
      generatedAt: isoDate,
    },
    creatorEmail: user.email || "",
    creatorUid: user.uid,
  };
  saveExamToLocalCache(historyItem);

  // 2. Cloud Firestore sync
  const examRef = doc(db, EXAMS_COLLECTION, examId);
  const payload: FirestoreExamDoc = {
    id: examId,
    title: result.examTitle || "امتحان إلكتروني جديد",
    generatedCode: result.generatedCode || "",
    summary: result.summary || "",
    detectedLanguage: result.detectedLanguage || "html",
    extractedQuestions: result.extractedQuestions || [],
    createdAt: serverTimestamp(),
    createdAtIso: isoDate,
    timestamp: now,
    creatorUid: user.uid,
    creatorEmail: user.email || "",
    questionsCount: result.extractedQuestions?.length || 0,
    generationMode: result.generationMode || "generate_new_similar",
  };

  try {
    await setDoc(examRef, payload);
    return examId;
  } catch (error: any) {
    // If backend is unreachable or client is offline, Firestore queues locally or we rely on local backup
    const isOffline =
      error?.code === "unavailable" ||
      error?.message?.includes("unavailable") ||
      error?.message?.includes("offline") ||
      error?.message?.includes("client is offline");

    if (isOffline) {
      console.info("Firestore operating in offline mode. Exam safely preserved in local storage.");
      return examId;
    }

    return handleFirestoreError(error, OperationType.WRITE, `${EXAMS_COLLECTION}/${examId}`);
  }
}

/**
 * Subscribes to real-time updates of exams stored in Cloud Firestore.
 * Automatically initializes from local cache and falls back smoothly if offline.
 */
export function subscribeToExams(
  user: User,
  onUpdate: (items: GenerationHistoryItem[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  // Pre-populate with local cache immediately for instant loading
  const localCached = getLocalSavedExams();
  if (localCached.length > 0) {
    onUpdate(localCached);
  }

  // Query all exams ordered by newest first
  const q = query(collection(db, EXAMS_COLLECTION), orderBy("timestamp", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const firestoreItems: GenerationHistoryItem[] = [];
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

        firestoreItems.push({
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

      // Merge firestore items with any local items that haven't synced yet
      const firestoreIds = new Set(firestoreItems.map((item) => item.id));
      const unsyncedLocals = getLocalSavedExams().filter((item) => !firestoreIds.has(item.id));
      const merged = [...firestoreItems, ...unsyncedLocals].sort(
        (a, b) => (b.timestamp || 0) - (a.timestamp || 0)
      );

      // Keep local cache fresh
      try {
        localStorage.setItem(LOCAL_STORAGE_EXAMS_KEY, JSON.stringify(merged));
      } catch (e) {
        // ignore storage errors
      }

      onUpdate(merged);
    },
    (err: any) => {
      const isOffline =
        err?.code === "unavailable" ||
        err?.message?.includes("unavailable") ||
        err?.message?.includes("offline") ||
        err?.message?.includes("client is offline");

      if (isOffline) {
        console.info("Firestore currently offline. Serving saved exams from local storage.");
        const fallback = getLocalSavedExams();
        onUpdate(fallback);
      } else {
        console.warn("Firestore subscription warning:", err);
      }

      if (onError) {
        onError(err);
      }
    }
  );
}

/**
 * Deletes an exam from Cloud Firestore and local cache.
 */
export async function deleteExamFromFirestore(examId: string): Promise<void> {
  deleteExamFromLocalCache(examId);

  const path = `${EXAMS_COLLECTION}/${examId}`;
  try {
    await deleteDoc(doc(db, EXAMS_COLLECTION, examId));
  } catch (error: any) {
    const isOffline =
      error?.code === "unavailable" ||
      error?.message?.includes("unavailable") ||
      error?.message?.includes("offline");

    if (isOffline) {
      console.info("Exam removed from local storage (Firestore offline).");
      return;
    }

    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
