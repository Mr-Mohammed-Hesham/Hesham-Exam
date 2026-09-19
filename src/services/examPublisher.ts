import JSZip from "jszip";
import { ExamGenerationResult } from "../types";

export interface ExamPublishOptions {
  result: ExamGenerationResult;
  githubUsername?: string;
  repositoryName?: string;
  durationMinutes?: number;
  subject?: string;
}

export interface ExamValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const GITHUB_USERNAME_STORAGE_KEY = "hesham_exam_github_username";
export const DEFAULT_GITHUB_USERNAME = "Mr-Mohammed-Hesham";

/**
 * Retrieve saved GitHub username or default.
 */
export function getSavedGitHubUsername(): string {
  try {
    const saved = localStorage.getItem(GITHUB_USERNAME_STORAGE_KEY);
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // ignore localStorage errors in sandboxed iframes
  }
  return DEFAULT_GITHUB_USERNAME;
}

/**
 * Save preferred GitHub username.
 */
export function saveGitHubUsername(username: string): void {
  try {
    localStorage.setItem(GITHUB_USERNAME_STORAGE_KEY, username.trim());
  } catch {
    // ignore
  }
}

/**
 * Translates common Arabic academic keywords into English slug parts for clean repo names.
 */
const ARABIC_TO_ENGLISH_MAP: Record<string, string> = {
  فيزياء: "physics",
  كيمياء: "chemistry",
  أحياء: "biology",
  علوم: "science",
  رياضيات: "math",
  جبر: "algebra",
  هندسة: "geometry",
  تفاضل: "calculus",
  ديناميكا: "dynamics",
  استاتيكا: "statics",
  لغة: "language",
  عربية: "arabic",
  إنجليزية: "english",
  فرنسية: "french",
  تاريخ: "history",
  جغرافيا: "geography",
  فلسفة: "philosophy",
  منطق: "logic",
  علم: "science",
  نفس: "psychology",
  اجتماع: "sociology",
  ثانوية: "highschool",
  عامة: "general",
  صف: "grade",
  الصف: "grade",
  الأول: "first",
  الثاني: "second",
  الثالث: "third",
  الرابع: "fourth",
  الخامس: "fifth",
  السادس: "sixth",
  السابع: "seventh",
  الثامن: "eighth",
  التاسع: "ninth",
  العاشر: "grade10",
  الحادي: "grade11",
  الثاني_عشر: "grade12",
  عشر: "grade",
  أول: "1",
  ثاني: "2",
  ثالث: "3",
  رابع: "4",
  خامس: "5",
  سادس: "6",
  وحدة: "unit",
  الوحدة: "unit",
  فصل: "chapter",
  الفصل: "chapter",
  درس: "lesson",
  الدرس: "lesson",
  باب: "part",
  الباب: "part",
  امتحان: "exam",
  اختبار: "exam",
  تجريبي: "mock",
  شامل: "comprehensive",
  نهائي: "final",
  شهري: "monthly",
  تراكمي: "cumulative",
  تقييم: "assessment",
  مستر: "mr",
  محمد: "mohamed",
  هشام: "hesham",
};

/**
 * Generates a clean, safe repository slug from the exam title.
 * Follows strict GitHub repository naming rules:
 * - lowercase
 * - hyphens only
 * - no spaces
 * - no dangerous characters, path traversal, slashes, or executable scripts
 * - fallback to 'exam-YYYY-MM-DD' if unresolvable
 */
export function generateRepositorySlug(title: string): string {
  if (!title || !title.trim()) {
    const today = new Date().toISOString().split("T")[0];
    return `exam-${today}`;
  }

  const cleanInput = title.trim();

  // Try mapping known Arabic words
  let transliterated = cleanInput;
  // Replace compound phrases
  transliterated = transliterated.replace(/الثاني\s+عشر/g, "grade-12");
  transliterated = transliterated.replace(/الحادي\s+عشر/g, "grade-11");
  transliterated = transliterated.replace(/الثالث\s+الثانوي/g, "grade-12-physics");
  transliterated = transliterated.replace(/الصف\s+(\d+)/g, "grade-$1");
  transliterated = transliterated.replace(/الوحدة\s+(\d+)/g, "unit-$1");
  transliterated = transliterated.replace(/الفصل\s+(\d+)/g, "chapter-$1");

  // Replace individual mapped words
  for (const [ar, en] of Object.entries(ARABIC_TO_ENGLISH_MAP)) {
    const regex = new RegExp(`(^|\\s|[_-])${ar}(\\s|[_-]|$)`, "gi");
    transliterated = transliterated.replace(regex, `$1${en}$2`);
  }

  // Remove any remaining Arabic characters or unsupported symbols
  // Keep only alphanumeric characters and spaces/hyphens
  let slug = transliterated
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // remove non-ascii and special symbols
    .replace(/[\s_]+/g, "-") // collapse spaces and underscores to hyphen
    .replace(/-+/g, "-") // collapse repeated hyphens
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens

  // If slug is empty or too short after stripping non-latin characters
  if (!slug || slug.length < 3) {
    const today = new Date().toISOString().split("T")[0];
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    slug = `hesham-exam-${today}-${randomSuffix}`;
  }

  // Ensure 'exam' is in the repository name if not already present
  if (!slug.includes("exam")) {
    slug = `${slug}-exam`;
  }

  // Limit length according to GitHub standards (max 60 chars)
  if (slug.length > 60) {
    slug = slug.substring(0, 60).replace(/-+$/, "");
  }

  return slug;
}

/**
 * Validates the exam code before publishing.
 * Verifies non-empty HTML, valid tags, question presence, and no unresolved placeholders.
 */
export function validateExamCode(html: string): ExamValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!html || !html.trim()) {
    errors.push("كود الامتحان فارغ. لا يمكن تصدير أو نشر ملف فارغ.");
    return { isValid: false, errors, warnings };
  }

  const lower = html.toLowerCase().trim();

  // Basic HTML document structure check
  const hasDoctype = lower.includes("<!doctype html");
  const hasHtml = lower.includes("<html");
  const hasBody = lower.includes("<body");
  const hasClosingHtml = lower.includes("</html>");

  if (!hasDoctype && !hasHtml) {
    errors.push("الكود لا يحتوي على وسم <!DOCTYPE html> أو <html> صالح.");
  }

  if (!hasBody) {
    errors.push("الكود لا يحتوي على وسم <body> لتضمين واجهة الامتحان.");
  }

  if (!hasClosingHtml) {
    warnings.push("تنبيه: وسم الإغلاق </html> غير مكتمل، يفضل إغلاق الوثيقة بشكل سليم.");
  }

  // Check for unhandled template placeholders
  const placeholderRegex = /\{\{[A-Z0-9_]+\}\}/g;
  const matches = html.match(placeholderRegex);
  if (matches && matches.length > 0) {
    const uniqueMatches = Array.from(new Set(matches)).join(", ");
    errors.push(`تم اكتشاف وسوم ومتغيرات غير معالجة داخل الكود: ${uniqueMatches}`);
  }

  // Check for empty question array bug
  if (lower.includes("const questions = [];") || lower.includes("let questions = [];") || lower.includes("var questions = [];")) {
    // Only an error if there are no question cards in the DOM
    if (!lower.includes("question-card") && !lower.includes("question-container")) {
      errors.push("مصفوفة الأسئلة البرمجية فارغة ولم يتم رصد أسئلة مضمنة داخل الامتحان.");
    }
  }

  // Verify there is actual exam content
  const hasQuestionsOrCards =
    lower.includes("question") ||
    lower.includes("سؤال") ||
    lower.includes("radio") ||
    lower.includes("option") ||
    lower.includes("quiz");

  if (!hasQuestionsOrCards) {
    warnings.push("تحذير: لم يتم رصد مؤشرات صريحة لأسئلة أو خيارات داخل كود الامتحان.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Builds the official README.md documentation for the exam repository.
 */
export function generateExamReadme(options: ExamPublishOptions): string {
  const { result, githubUsername = DEFAULT_GITHUB_USERNAME, repositoryName, durationMinutes = 30, subject = "الفيزياء والعلوم" } = options;
  const repoSlug = repositoryName || generateRepositorySlug(result.examTitle);
  const questionsCount = result.extractedQuestions?.length || 0;
  const pagesUrl = `https://${githubUsername}.github.io/${repoSlug}/`;
  const dateStr = new Date().toISOString().split("T")[0];

  return `# ${result.examTitle || "Interactive Examination"}

> 🌟 **Generated with [Hesham Exam Platform](https://github.com/Mr-Mohammed-Hesham/Hesham-Exam)** — Comprehensive interactive assessment & electronic examination system by **Mr. Mohamed Hesham**.

---

## 📋 Exam Overview

| Attribute | Details |
| :--- | :--- |
| **Exam Title** | ${result.examTitle || "امتحان إلكتروني تفاعلي"} |
| **Subject / Material** | ${subject} |
| **Questions Count** | ${questionsCount} Questions |
| **Estimated Duration** | ${durationMinutes} Minutes |
| **Generation Date** | ${dateStr} |
| **Format** | Standalone Single-File Web Application (\`index.html\`) |
| **Published URL** | [${pagesUrl}](${pagesUrl}) |

---

## 🚀 Live Demo & Online Examination

Once deployed via GitHub Pages, this exam is immediately accessible for all students on any device (Desktop, Tablet, Mobile) at:

👉 **[Launch Interactive Exam](${pagesUrl})**

---

## 💻 Offline & Local Usage

This examination is 100% self-contained in a single file (\`index.html\`). No external servers, databases, or npm dependencies are required.

To run it locally:
1. Clone or download this repository.
2. Double-click \`index.html\` to open it in Google Chrome, Microsoft Edge, Safari, or Firefox.
3. Start answering questions immediately!

---

## ⚙️ Automated GitHub Pages Deployment

This repository includes a preconfigured GitHub Actions workflow in \`.github/workflows/deploy.yml\`.

When pushed to the \`main\` branch:
1. GitHub Actions automatically packages \`index.html\`.
2. Deploys it directly to GitHub Pages with zero manual build steps.
3. Your exam goes live at \`${pagesUrl}\`.

### Repository Permissions Note
Ensure GitHub Pages is enabled in your repository settings:
- Go to **Settings** > **Pages**.
- Under **Build and deployment** > **Source**, choose **GitHub Actions**.

---

*Academic Excellence & Interactive Science by Mr. Mohamed Hesham.*
`;
}

/**
 * Builds the modern official GitHub Pages deploy workflow for the exam.
 * Uses official GitHub Actions (`actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`).
 * Runs automatically on push to main with zero secrets or external dependencies.
 */
export function generateExamWorkflow(): string {
  return `name: Deploy Exam to GitHub Pages

on:
  push:
    branches:
      - main
      - master
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN to allow deployment to GitHub Pages
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment, skipping runs queued between the run in-progress and latest queued.
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup GitHub Pages
        uses: actions/configure-pages@v5

      - name: Upload Artifact
        uses: actions/upload-pages-artifact@v3
        with:
          # Upload the entire repository containing index.html
          path: .

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`;
}

/**
 * Packages the standalone exam repository into a ready-to-deploy ZIP file.
 * Structure:
 * ├── index.html
 * ├── README.md
 * └── .github/
 *     └── workflows/
 *         └── deploy.yml
 */
export async function createExamPublishPackage(options: ExamPublishOptions): Promise<{ zipBlob: Blob; fileName: string; repositorySlug: string }> {
  const { result } = options;
  const repoSlug = options.repositoryName || generateRepositorySlug(result.examTitle);

  // Validate code first
  const validation = validateExamCode(result.generatedCode);
  if (!validation.isValid) {
    throw new Error(validation.errors.join("\n"));
  }

  const zip = new JSZip();

  // 1. index.html (the exact, current approved & edited exam code)
  zip.file("index.html", result.generatedCode);

  // 2. README.md (detailed documentation & instructions)
  const readmeContent = generateExamReadme({ ...options, repositoryName: repoSlug });
  zip.file("README.md", readmeContent);

  // 3. .github/workflows/deploy.yml (GitHub Actions Pages deployment)
  const workflowsFolder = zip.folder(".github")?.folder("workflows");
  if (workflowsFolder) {
    workflowsFolder.file("deploy.yml", generateExamWorkflow());
  } else {
    zip.file(".github/workflows/deploy.yml", generateExamWorkflow());
  }

  // 4. .nojekyll (ensures GitHub Pages does not run Jekyll on files)
  zip.file(".nojekyll", "");

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 9 },
  });

  const fileName = `${repoSlug}.zip`;

  return {
    zipBlob,
    fileName,
    repositorySlug: repoSlug,
  };
}

/**
 * Triggers direct browser download of the generated exam ZIP package.
 */
export async function downloadExamZip(options: ExamPublishOptions): Promise<string> {
  const { zipBlob, fileName, repositorySlug } = await createExamPublishPackage(options);
  const url = URL.createObjectURL(zipBlob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return repositorySlug;
}
