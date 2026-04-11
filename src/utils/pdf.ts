import { TranscriptData } from '@/types'
import { fmt } from './gpa'

// ── Generate document ID ─────────────────────────────────────────────────────
export function generateDocumentId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'TRX-'
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

// ── Grade point lookup (avoids importing full type map in a template) ─────────
function gradeToPoints(grade: string): number {
  const map: Record<string, number> = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 }
  return map[grade] ?? 0
}

function gradeColor(grade: string): string {
  const map: Record<string, string> = {
    A: '#065f46', B: '#1e40af', C: '#92400e', D: '#c2410c', E: '#b91c1c', F: '#7f1d1d',
  }
  return map[grade] ?? '#374151'
}

// ── Build self-contained HTML for the PDF ────────────────────────────────────
function buildTranscriptHTML(data: TranscriptData): string {
  const { student, semesters, cgpa, totalUnits, classOfDegree, documentId, issuedDate } = data

  const semRows = semesters.map((sem) => `
    <tr>
      <td colspan="5" style="padding:10px 6px 4px;font-weight:700;font-size:10.5px;
        text-transform:uppercase;letter-spacing:.08em;color:#374151;
        border-top:2px solid #1f2937">
        ${sem.label}
      </td>
    </tr>
    <tr style="background:#f9fafb">
      <td style="padding:4px 6px;font-size:9.5px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Code</td>
      <td style="padding:4px 6px;font-size:9.5px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.05em">Course Title</td>
      <td style="padding:4px 6px;font-size:9.5px;font-weight:600;color:#6b7280;text-align:center">Units</td>
      <td style="padding:4px 6px;font-size:9.5px;font-weight:600;color:#6b7280;text-align:center">Grade</td>
      <td style="padding:4px 6px;font-size:9.5px;font-weight:600;color:#6b7280;text-align:right">GP</td>
    </tr>
    ${sem.courses.map((c) => {
      const gp = (gradeToPoints(c.grade) * c.units).toFixed(1)
      return `<tr style="border-bottom:0.5px solid #e5e7eb">
        <td style="padding:5px 6px;font-size:10.5px;font-family:monospace;color:#6b7280">${c.code}</td>
        <td style="padding:5px 6px;font-size:10.5px;color:#111827">${c.title}</td>
        <td style="padding:5px 6px;font-size:10.5px;text-align:center;color:#374151">${c.units}</td>
        <td style="padding:5px 6px;font-size:10.5px;text-align:center;font-weight:700;color:${gradeColor(c.grade)}">${c.grade}</td>
        <td style="padding:5px 6px;font-size:10.5px;text-align:right;color:#6b7280">${gp}</td>
      </tr>`
    }).join('')}
    <tr style="background:#f3f4f6">
      <td colspan="2" style="padding:5px 6px;font-size:10.5px;font-weight:600;color:#374151">Semester Total</td>
      <td style="padding:5px 6px;font-size:10.5px;text-align:center;font-weight:600">${sem.totalUnits}</td>
      <td></td>
      <td style="padding:5px 6px;font-size:10.5px;text-align:right;font-weight:600">GPA: ${fmt(sem.gpa)}</td>
    </tr>
  `).join('')

  const cgpaColor = cgpa >= 4.5 ? '#065f46' : cgpa >= 3.5 ? '#1e40af' : cgpa >= 2.4 ? '#92400e' : '#991b1b'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 12px;
    color: #111827;
    background: #ffffff;
    padding: 28px 36px;
    width: 794px;
  }
  .watermark {
    position: fixed; top: 50%; left: 50%;
    transform: translate(-50%, -50%) rotate(-35deg);
    font-size: 90px; font-weight: 900;
    color: rgba(0,0,0,0.035);
    letter-spacing: .12em;
    pointer-events: none; z-index: 0;
    white-space: nowrap;
  }
  .header { text-align: center; border-bottom: 2.5px solid #111827; padding-bottom: 14px; margin-bottom: 16px; }
  .seal {
    width: 54px; height: 54px; border-radius: 50%;
    border: 2.5px solid #111827;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 8px; font-weight: 800; text-align: center; line-height: 1.4;
    margin-bottom: 8px;
  }
  .uni-name { font-size: 17px; font-weight: 700; letter-spacing: .02em; }
  .doc-sub { font-size: 10.5px; color: #4b5563; margin-top: 3px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 24px; font-size: 11px; margin-bottom: 16px; }
  .info-label { font-weight: 700; color: #374151; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; margin: 14px 0 16px; }
  .summary-cell { padding: 9px 12px; border-right: 0.5px solid #d1d5db; }
  .summary-cell:last-child { border-right: none; }
  .summary-label { font-size: 8.5px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; margin-bottom: 3px; font-family: sans-serif; }
  .summary-val { font-size: 18px; font-weight: 700; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; padding-top: 14px; border-top: 0.5px solid #d1d5db; }
  .sig-line { border-bottom: 1px solid #111827; height: 22px; margin-bottom: 5px; }
  .sig-label { font-size: 9.5px; color: #6b7280; text-align: center; font-family: sans-serif; }
  .footer-note { text-align: center; font-size: 8.5px; color: #9ca3af; font-family: sans-serif; margin-top: 14px; border-top: 0.5px solid #e5e7eb; padding-top: 8px; line-height: 1.9; }
  .bottom-row { display: flex; align-items: flex-end; gap: 16px; }
  .qr-box { width: 54px; height: 54px; background: #f3f4f6; border: 0.5px solid #d1d5db; flex-shrink: 0; }
</style>
</head>
<body>
  <div class="watermark">OFFICIAL</div>

  <div class="header">
    <div class="seal">ABU<br/>1962</div><br/>
    <div class="uni-name">Ahmadu Bello University, Zaria</div>
    <div class="doc-sub">Office of the Registrar &mdash; Official Academic Transcript</div>
  </div>

  <div class="info-grid">
    <div><span class="info-label">Student Name:</span> ${student.name}</div>
    <div><span class="info-label">Matric Number:</span> <span style="font-family:monospace">${student.matric}</span></div>
    <div><span class="info-label">Programme:</span> ${student.program}</div>
    <div><span class="info-label">Faculty:</span> ${student.faculty}</div>
    <div><span class="info-label">Entry Year:</span> ${student.entryYear}</div>
    <div><span class="info-label">Current Level:</span> ${student.level}L</div>
    <div><span class="info-label">Date Issued:</span> ${issuedDate}</div>
    <div><span class="info-label">Document ID:</span> <span style="font-family:monospace">${documentId}</span></div>
  </div>

  <table>${semRows}</table>

  <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:#4b5563;margin-top:14px;margin-bottom:4px">
    Academic Summary
  </div>
  <div class="summary-grid">
    <div class="summary-cell">
      <div class="summary-label">CGPA (5-Point)</div>
      <div class="summary-val" style="color:${cgpaColor}">${fmt(cgpa)}</div>
    </div>
    <div class="summary-cell">
      <div class="summary-label">Total Units</div>
      <div class="summary-val">${totalUnits}</div>
    </div>
    <div class="summary-cell">
      <div class="summary-label">Class of Degree</div>
      <div style="font-size:10.5px;font-weight:700;margin-top:4px;line-height:1.4">${classOfDegree}</div>
    </div>
    <div class="summary-cell">
      <div class="summary-label">Courses</div>
      <div class="summary-val">${data.totalCourses}</div>
    </div>
  </div>

  <div class="bottom-row">
    <div>
      <div style="font-size:8px;color:#9ca3af;font-family:sans-serif;margin-bottom:4px">Scan to verify</div>
      <div class="qr-box"></div>
    </div>
    <div style="flex:1">
      <div class="sig-grid">
        <div><div class="sig-line"></div><div class="sig-label">Registrar</div></div>
        <div><div class="sig-line"></div><div class="sig-label">Deputy Registrar (Academic)</div></div>
      </div>
    </div>
  </div>

  <div class="footer-note">
    Issued by the Registry Division, Ahmadu Bello University, Zaria, Nigeria.<br/>
    Any alteration, erasure, or defacement renders this transcript null and void.<br/>
    <strong>Grading Scale:</strong> A (70&ndash;100, GP 5) &middot; B (60&ndash;69, GP 4) &middot; C (50&ndash;59, GP 3) &middot; D (45&ndash;49, GP 2) &middot; E (40&ndash;44, GP 1) &middot; F (0&ndash;39, GP 0)
  </div>
</body>
</html>`
}

// ── PDF export using jsPDF + html2canvas (replaces html2pdf.js) ──────────────
// html2pdf.js has no proper ESM export and breaks on Vercel production builds.
// jsPDF and html2canvas both have clean ESM exports and full TS type support.
export async function exportTranscriptPDF(data: TranscriptData): Promise<void> {
  // Dynamic imports keep them out of the initial bundle
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ])

  // Render HTML into an off-screen container
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;z-index:-1;background:#fff;'
  container.innerHTML = buildTranscriptHTML(data)
  document.body.appendChild(container)

  try {
    // Capture as canvas at 2× resolution for crisp output
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 794,
    })

    const imgData   = canvas.toDataURL('image/jpeg', 0.97)
    const pdf       = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
    const pageW     = pdf.internal.pageSize.getWidth()
    const pageH     = pdf.internal.pageSize.getHeight()
    const imgH      = (canvas.height * pageW) / canvas.width

    // If content taller than one page, split across pages
    let yOffset = 0
    while (yOffset < imgH) {
      if (yOffset > 0) pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, -yOffset, pageW, imgH)
      yOffset += pageH
    }

    const filename = `Transcript_${data.student.matric.replace(/\//g, '-')}_${Date.now()}.pdf`
    pdf.save(filename)
  } finally {
    document.body.removeChild(container)
  }
}
