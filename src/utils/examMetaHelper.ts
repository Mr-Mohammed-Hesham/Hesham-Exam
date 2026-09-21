/**
 * Exam Title & Grade / Stage Resolution Engine
 * Handles dynamic extraction of Exam Title, Grade/Class, and Subject
 * from teacher's notes (instructions), title field, or exam text.
 */

export interface ResolvedExamMeta {
  title: string;
  grade: string;
  subject: string;
  subheading: string; // e.g. "الصف الثاني الثانوي - فيزياء"
}

export function resolveExamTitleAndGrade(params: {
  examTitle?: string;
  instructions?: string;
  examText?: string;
}): ResolvedExamMeta {
  const { examTitle = "", instructions = "", examText = "" } = params;
  const combined = `${examTitle} ${instructions} ${examText.slice(0, 300)}`.trim();

  // 1. Detect Grade / Class (الصف الدراسي)
  let detectedGrade = "";
  
  const gradePatterns: { regex: RegExp; name: string }[] = [
    { regex: /الصف\s+الثالث\s+الثانوي|ثانوية\s+عامة|تالتة\s+ثانوي|3rd\s*sec/i, name: "الصف الثالث الثانوي" },
    { regex: /الصف\s+الثاني\s+الثانوي|تانية\s+ثانوي|2nd\s*sec/i, name: "الصف الثاني الثانوي" },
    { regex: /الصف\s+الأول\s+الثانوي|أولى\s+ثانوي|1st\s*sec/i, name: "الصف الأول الثانوي" },
    { regex: /الصف\s+الثالث\s+الإعدادي|تالتة\s+إعدادي|شهادة\s+إعدادية/i, name: "الصف الثالث الإعدادي" },
    { regex: /الصف\s+الثاني\s+الإعدادي|تانية\s+إعدادي/i, name: "الصف الثاني الإعدادي" },
    { regex: /الصف\s+الأول\s+الإعدادي|أولى\s+إعدادي/i, name: "الصف الأول الإعدادي" },
    { regex: /الصف\s+السادس\s+الابتدائي|ساتة\s+ابتدائي/i, name: "الصف السادس الابتدائي" },
    { regex: /الصف\s+الخامس\s+الابتدائي|خامسة\s+ابتدائي/i, name: "الصف الخامس الابتدائي" },
    { regex: /الصف\s+الرابع\s+الابتدائي|رابعة\s+ابتدائي/i, name: "الصف الرابع الابتدائي" },
  ];

  for (const p of gradePatterns) {
    if (p.regex.test(combined)) {
      detectedGrade = p.name;
      break;
    }
  }

  // Fallback pattern for any arbitrary "الصف ال..."
  if (!detectedGrade) {
    const arbitraryGradeMatch = combined.match(/(الصف\s+[\u0621-\u064A\s]{3,25}(?:الابتدائي|الإعدادي|الثانوي)?)/);
    if (arbitraryGradeMatch && arbitraryGradeMatch[1]) {
      detectedGrade = arbitraryGradeMatch[1].trim();
    }
  }

  // 2. Detect Subject (المادة)
  let detectedSubject = "";
  if (/فيزياء|physics/i.test(combined)) detectedSubject = "الفيزياء";
  else if (/كيمياء|chemistry/i.test(combined)) detectedSubject = "الكيمياء";
  else if (/أحياء|بيولوجي|biology/i.test(combined)) detectedSubject = "الأحياء";
  else if (/رياضيات|جبر|هندسة|تفاضل|تكامل|حساب\s*مثلثات|math/i.test(combined)) detectedSubject = "الرياضيات";
  else if (/علوم|science/i.test(combined)) detectedSubject = "العلوم";
  else if (/عربي|لغة\s*عربية/i.test(combined)) detectedSubject = "اللغة العربية";
  else if (/إنجليزي|انجليزي|english/i.test(combined)) detectedSubject = "اللغة الإنجليزية";
  else if (/تاريخ/i.test(combined)) detectedSubject = "التاريخ";
  else if (/جغرافيا/i.test(combined)) detectedSubject = "الجغرافيا";
  else detectedSubject = "العلوم والتطبيقات";

  // 3. Resolve Title (اسم الامتحان)
  let resolvedTitle = examTitle.trim();

  // If user didn't provide title in examTitle, inspect instructions or notes
  if (!resolvedTitle && instructions.trim()) {
    // Check if instructions start with or contain an explicit exam name
    const titleMatch = instructions.match(/(?:امتحان|اختبار|تدريب|مراجعة)\s+[\u0621-\u064A0-9\s\-–]+/i);
    if (titleMatch) {
      resolvedTitle = titleMatch[0].trim();
    } else {
      resolvedTitle = instructions.split(/[،,\n\.]/)[0].trim();
    }
  }

  // If still empty, construct from Subject + Grade or topic
  if (!resolvedTitle) {
    if (detectedGrade && detectedSubject) {
      resolvedTitle = `امتحان محاكٍ شامل - ${detectedSubject} (${detectedGrade})`;
    } else if (detectedSubject) {
      resolvedTitle = `امتحان محاكٍ تفاعلي - مادة ${detectedSubject}`;
    } else {
      resolvedTitle = "امتحان محاكٍ تفاعلي شامل";
    }
  }

  // If resolvedTitle does not contain the detected grade and grade exists, enhance it
  if (detectedGrade && !resolvedTitle.includes(detectedGrade)) {
    resolvedTitle = `${resolvedTitle} - ${detectedGrade}`;
  }

  // 4. Construct Subheading (الصف والمادة)
  let subheading = "";
  if (detectedGrade && detectedSubject) {
    subheading = `${detectedGrade} • مادة ${detectedSubject}`;
  } else if (detectedGrade) {
    subheading = detectedGrade;
  } else if (detectedSubject) {
    subheading = `مادة ${detectedSubject}`;
  } else {
    subheading = "المرحلة التعليمية والمادة الدراسية";
  }

  return {
    title: resolvedTitle,
    grade: detectedGrade,
    subject: detectedSubject,
    subheading: subheading,
  };
}
