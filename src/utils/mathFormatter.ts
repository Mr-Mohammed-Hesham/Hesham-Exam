/**
 * Mathematical notation and LaTeX cleanup utilities for interactive exams.
 * Ensures clean rendering whether KaTeX is active or rendering static text.
 */

export function cleanLatexSymbols(formula: string): string {
  if (!formula) return "";
  let s = formula;

  // Clean common LaTeX spaces & dividers
  s = s.replace(/\\quad/g, "   ");
  s = s.replace(/\\qquad/g, "    ");
  s = s.replace(/\\,/g, " ");
  s = s.replace(/\\;/g, " ");
  s = s.replace(/\\!/g, "");

  // Text commands
  s = s.replace(/\\text\{([^}]+)\}/g, "$1");
  s = s.replace(/\\mathrm\{([^}]+)\}/g, "$1");
  s = s.replace(/\\mathbf\{([^}]+)\}/g, "$1");

  // Operators & symbols
  s = s.replace(/\\cdot/g, " · ");
  s = s.replace(/\\times/g, " × ");
  s = s.replace(/\\div/g, " ÷ ");
  s = s.replace(/\\pm/g, " ± ");
  s = s.replace(/\\approx/g, " ≈ ");
  s = s.replace(/\\neq/g, " ≠ ");
  s = s.replace(/\\leq/g, " ≤ ");
  s = s.replace(/\\geq/g, " ≥ ");
  s = s.replace(/\\to/g, " → ");
  s = s.replace(/\\rightarrow/g, " → ");
  s = s.replace(/\\leftarrow/g, " ← ");
  s = s.replace(/\\infty/g, " ∞ ");

  // Fractions: \frac{a}{b} -> (a / b)
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1 / $2)");

  // Square roots: \sqrt{x} -> √(x)
  s = s.replace(/\\sqrt\{([^}]+)\}/g, "√($1)");

  // Greek letters
  s = s.replace(/\\Delta/g, "Δ");
  s = s.replace(/\\theta/g, "θ");
  s = s.replace(/\\pi/g, "π");
  s = s.replace(/\\Omega/g, "Ω");
  s = s.replace(/\\mu/g, "μ");
  s = s.replace(/\\lambda/g, "λ");
  s = s.replace(/\\alpha/g, "α");
  s = s.replace(/\\beta/g, "β");
  s = s.replace(/\\gamma/g, "γ");
  s = s.replace(/\\sigma/g, "σ");
  s = s.replace(/\\Sigma/g, "∑");
  s = s.replace(/\\int/g, "∫");

  // Powers
  s = s.replace(/\^2\b/g, "²");
  s = s.replace(/\^3\b/g, "³");
  s = s.replace(/\^0\b/g, "⁰");
  s = s.replace(/\^1\b/g, "¹");

  return s.trim();
}

/**
 * Formats mathematical expressions in Arabic / English text strings.
 * Preserves KaTeX delimiters ($...$) while styling spans for crisp display.
 */
export function formatMathInText(text: string): string {
  if (!text) return "";
  if (text.includes('class="math-display"')) return text;

  // Convert $formula$ into <span class="math-display">$cleanFormula$</span>
  let res = text.replace(/\$([^$]+)\$/g, (_match, expr) => {
    const cleaned = cleanLatexSymbols(expr);
    return `<span class="math-display">$${cleaned}$</span>`;
  });

  // Convert backticked formulas
  res = res.replace(/`([^`]+)`/g, (_match, expr) => {
    const cleaned = cleanLatexSymbols(expr);
    return `<span class="math-display">$${cleaned}$</span>`;
  });

  return res;
}
