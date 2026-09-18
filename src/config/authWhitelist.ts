/**
 * Authorized Google Accounts Whitelist for Hesham Exam Platform.
 * 
 * Only accounts listed in this whitelist are permitted to access the platform,
 * generate exams, and manage saved exams in Firestore.
 * 
 * If a user attempts to sign in with an unlisted Google account,
 * they will be signed out immediately with an authorization warning in Arabic.
 */

export const ALLOWED_EMAILS: string[] = [
  "mr.mohamed.hesham93@gmail.com",
  // Add any additional authorized educator/admin emails here:
  // "teacher.assistant@gmail.com",
];

/**
 * Checks if the given email address is in the authorization whitelist (case-insensitive).
 */
export function isEmailWhitelisted(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ALLOWED_EMAILS.some(
    (allowed) => allowed.trim().toLowerCase() === normalized
  );
}
