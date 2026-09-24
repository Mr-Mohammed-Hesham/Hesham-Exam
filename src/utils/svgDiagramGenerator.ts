// Specialized STEM Diagram, Graph, Geometry, and Table Generator for Mr. Mohammed Hesham Exam Platform

export function generateLinearGraphSvg(title = "Line of Best Fit: y = 10x + 75"): string {
  return `<div class="exam-diagram-container">
  <svg viewBox="0 0 420 220" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:420px; background:#ffffff;">
    <rect width="420" height="220" fill="#ffffff" rx="10"/>
    <text x="210" y="22" fill="#0f766e" font-weight="bold" font-size="12" text-anchor="middle">${title}</text>
    
    <!-- Grid lines -->
    <g stroke="#e2e8f0" stroke-width="1">
      <line x1="60" y1="40" x2="380" y2="40"/>
      <line x1="60" y1="70" x2="380" y2="70"/>
      <line x1="60" y1="100" x2="380" y2="100"/>
      <line x1="60" y1="130" x2="380" y2="130"/>
      <line x1="60" y1="160" x2="380" y2="160"/>
      
      <line x1="113" y1="40" x2="113" y2="180"/>
      <line x1="166" y1="40" x2="166" y2="180"/>
      <line x1="220" y1="40" x2="220" y2="180"/>
      <line x1="273" y1="40" x2="273" y2="180"/>
      <line x1="326" y1="40" x2="326" y2="180"/>
      <line x1="380" y1="40" x2="380" y2="180"/>
    </g>

    <!-- Axes -->
    <line x1="60" y1="180" x2="395" y2="180" stroke="#1e293b" stroke-width="2"/>
    <polygon points="398,180 390,176 390,184" fill="#1e293b"/>
    <line x1="60" y1="180" x2="60" y2="30" stroke="#1e293b" stroke-width="2"/>
    <polygon points="60,26 56,34 64,34" fill="#1e293b"/>

    <!-- Y-axis values -->
    <text x="52" y="184" fill="#64748b" font-size="10" text-anchor="end">60</text>
    <text x="52" y="154" fill="#64748b" font-size="10" text-anchor="end">80</text>
    <text x="52" y="124" fill="#64748b" font-size="10" text-anchor="end">100</text>
    <text x="52" y="94" fill="#64748b" font-size="10" text-anchor="end">120</text>
    <text x="52" y="64" fill="#64748b" font-size="10" text-anchor="end">140</text>
    <text x="35" y="24" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">y (cm)</text>

    <!-- X-axis values -->
    <text x="60" y="196" fill="#64748b" font-size="10" text-anchor="middle">0</text>
    <text x="113" y="196" fill="#64748b" font-size="10" text-anchor="middle">1</text>
    <text x="166" y="196" fill="#64748b" font-size="10" text-anchor="middle">2</text>
    <text x="220" y="196" fill="#64748b" font-size="10" text-anchor="middle">3</text>
    <text x="273" y="196" fill="#64748b" font-size="10" text-anchor="middle">4</text>
    <text x="326" y="196" fill="#64748b" font-size="10" text-anchor="middle">5</text>
    <text x="380" y="196" fill="#64748b" font-size="10" text-anchor="middle">6</text>
    <text x="402" y="196" fill="#0f766e" font-size="11" font-weight="bold">x</text>

    <!-- Scatter Data Points -->
    <circle cx="113" cy="148" r="3.5" fill="#0284c7"/>
    <circle cx="140" cy="140" r="3.5" fill="#0284c7"/>
    <circle cx="166" cy="132" r="3.5" fill="#0284c7"/>
    <circle cx="200" cy="120" r="3.5" fill="#0284c7"/>
    <circle cx="220" cy="116" r="3.5" fill="#0284c7"/>
    <circle cx="250" cy="104" r="3.5" fill="#0284c7"/>
    <circle cx="273" cy="98" r="3.5" fill="#0284c7"/>
    <circle cx="310" cy="86" r="3.5" fill="#0284c7"/>
    <circle cx="326" cy="80" r="3.5" fill="#0284c7"/>
    <circle cx="380" cy="58" r="3.5" fill="#0284c7"/>

    <!-- Line of Best Fit (y = 10x + 75) -->
    <line x1="60" y1="157.5" x2="380" y2="67.5" stroke="#0d9488" stroke-width="3"/>
    
    <!-- Projection dashes for x=4 (y=110) -->
    <line x1="273" y1="180" x2="273" y2="105" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
    <line x1="273" y1="105" x2="60" y2="105" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,3"/>
    <circle cx="273" cy="105" r="4.5" fill="#ef4444"/>
    <text x="282" y="102" fill="#ef4444" font-weight="bold" font-size="10">(4, 110)</text>

    <!-- Formula badge in graph -->
    <rect x="235" y="32" width="135" height="20" fill="#f0fdfa" stroke="#0d9488" rx="4"/>
    <text x="302" y="46" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">Line: y = 10x + 75</text>
  </svg>
</div>`;
}

export function generateVelocityTimeGraphSvg(): string {
  return `<div class="exam-diagram-container">
  <svg viewBox="0 0 360 140" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:360px;">
    <rect width="360" height="140" fill="#f8fafc" rx="8"/>
    <line x1="45" y1="110" x2="330" y2="110" stroke="#334155" stroke-width="2"/>
    <line x1="45" y1="110" x2="45" y2="20" stroke="#334155" stroke-width="2"/>
    <line x1="45" y1="35" x2="300" y2="35" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <line x1="150" y1="110" x2="150" y2="35" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <line x1="300" y1="110" x2="300" y2="35" stroke="#cbd5e1" stroke-dasharray="3,3"/>
    <polyline points="45,110 150,35 300,35" fill="none" stroke="#0d9488" stroke-width="3"/>
    <circle cx="45" cy="110" r="3" fill="#0d9488"/>
    <circle cx="150" cy="35" r="3" fill="#0d9488"/>
    <circle cx="300" cy="35" r="3" fill="#0d9488"/>
    <text x="35" y="40" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="end">20</text>
    <text x="35" y="114" fill="#64748b" font-size="11" text-anchor="end">0</text>
    <text x="150" y="126" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">4 s</text>
    <text x="300" y="126" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">10 s</text>
    <text x="45" y="15" fill="#0f766e" font-size="11" font-weight="bold" text-anchor="middle">v (m/s)</text>
    <text x="340" y="114" fill="#0f766e" font-size="11" font-weight="bold">t (s)</text>
  </svg>
</div>`;
}

export function generateCircuitDiagramSvg(): string {
  return `<div class="exam-diagram-container">
  <svg viewBox="0 0 380 130" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:380px;">
    <rect width="380" height="130" fill="#f8fafc" rx="8"/>
    <rect x="30" y="20" width="320" height="90" fill="none" stroke="#0f766e" stroke-width="2.5" rx="4"/>
    <line x1="30" y1="50" x2="30" y2="80" stroke="#f8fafc" stroke-width="5"/>
    <line x1="20" y1="58" x2="40" y2="58" stroke="#0f766e" stroke-width="3"/>
    <line x1="25" y1="68" x2="35" y2="68" stroke="#0f766e" stroke-width="1.5"/>
    <text x="50" y="66" fill="#0f766e" font-weight="bold" font-size="12">V = 16V</text>
    <rect x="85" y="12" width="55" height="16" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="112" y="24" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₃ = 2Ω</text>
    <line x1="180" y1="20" x2="180" y2="6" stroke="#0f766e" stroke-width="2"/>
    <line x1="180" y1="20" x2="180" y2="34" stroke="#0f766e" stroke-width="2"/>
    <rect x="205" y="-1" width="55" height="15" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="232" y="11" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₁ = 6Ω</text>
    <rect x="205" y="27" width="55" height="15" fill="#e2e8f0" stroke="#0f766e" stroke-width="2" rx="3"/>
    <text x="232" y="39" fill="#0f766e" font-weight="bold" font-size="11" text-anchor="middle">R₂ = 3Ω</text>
    <line x1="180" y1="6" x2="205" y2="6" stroke="#0f766e" stroke-width="2"/>
    <line x1="180" y1="34" x2="205" y2="34" stroke="#0f766e" stroke-width="2"/>
    <line x1="260" y1="6" x2="285" y2="6" stroke="#0f766e" stroke-width="2"/>
    <line x1="260" y1="34" x2="285" y2="34" stroke="#0f766e" stroke-width="2"/>
    <line x1="285" y1="6" x2="285" y2="34" stroke="#0f766e" stroke-width="2"/>
    <line x1="285" y1="20" x2="350" y2="20" stroke="#0f766e" stroke-width="2"/>
  </svg>
</div>`;
}

export function generateTriangleGeometrySvg(): string {
  return `<div class="exam-diagram-container">
  <svg viewBox="0 0 320 140" class="exam-diagram" xmlns="http://www.w3.org/2000/svg" style="max-width:320px;">
    <rect width="320" height="140" fill="#f8fafc" rx="8"/>
    <polygon points="50,115 230,115 50,25" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.5"/>
    <rect x="50" y="102" width="13" height="13" fill="none" stroke="#0284c7" stroke-width="1.5"/>
    <text x="140" y="132" fill="#0369a1" font-weight="bold" font-size="12" text-anchor="middle">a = 6 cm</text>
    <text x="35" y="75" fill="#0369a1" font-weight="bold" font-size="12" text-anchor="end">b = 8 cm</text>
    <text x="155" y="65" fill="#dc2626" font-weight="bold" font-size="13">c = ?</text>
    <text x="195" y="108" fill="#0369a1" font-weight="bold" font-size="12">θ</text>
  </svg>
</div>`;
}

export function generateDataTableHtml(): string {
  return `<div class="exam-table-container">
  <table class="exam-table">
    <thead>
      <tr>
        <th>فرق الجهد V (فولت)</th>
        <td>2.0</td>
        <td>4.0</td>
        <td>6.0</td>
        <td>8.0</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>شدة التيار I (أمبير)</th>
        <td>0.5</td>
        <td>1.0</td>
        <td>1.5</td>
        <td>2.0</td>
      </tr>
    </tbody>
  </table>
</div>`;
}

export function generateSealDataTableHtml(): string {
  return `<div class="exam-table-container">
  <table class="exam-table">
    <thead>
      <tr>
        <th>العمر x (سنوات)</th>
        <td>1</td>
        <td>2</td>
        <td>3</td>
        <td>4</td>
        <td>5</td>
        <td>6</td>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>الطول المتوقع y (سم)</th>
        <td>85</td>
        <td>90</td>
        <td>105</td>
        <td>110</td>
        <td>120</td>
        <td>135</td>
      </tr>
    </tbody>
  </table>
</div>`;
}
