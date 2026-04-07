import { TranscriptData } from '@/types'
import { fmt } from './gpa'

// ── Generate document ID ─────────────────────────────────────────────────────
export function generateDocumentId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let id = 'TRX-'
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)]
  return id
}

// ── Build the HTML string for PDF ────────────────────────────────────────────
function buildTranscriptHTML(data: TranscriptData): string {
  const { student, semesters, cgpa, totalUnits, classOfDegree, documentId, issuedDate } = data

  const gradeColor = (g: string) => {
    if (g === 'A') return '#065f46'
    if (g === 'B') return '#1e40af'
    if (g === 'C') return '#92400e'
    if (g === 'D') return '#c2410c'
    return '#991b1b'
  }

  const semRows = semesters.map((sem) => `
    <tr><td colspan="5" style="padding:10px 0 4px;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.08em;color:#4b5563;border-top:1.5px solid #374151">${sem.label}</td></tr>
    <tr style="background:#f9fafb">
      <td style="padding:4px 6px;font-size:10px;font-weight:600;color:#6b7280">CODE</td>
      <td style="padding:4px 6px;font-size:10px;font-weight:600;color:#6b7280">COURSE TITLE</td>
      <td style="padding:4px 6px;font-size:10px;font-weight:600;color:#6b7280;text-align:center">UNITS</td>
      <td style="padding:4px 6px;font-size:10px;font-weight:600;color:#6b7280;text-align:center">GRADE</td>
      <td style="padding:4px 6px;font-size:10px;font-weight:600;color:#6b7280;text-align:right">GP</td>
    </tr>
    ${sem.courses.map((c) => {
      const gp = (c.units * (c.grade === 'A' ? 5 : c.grade === 'B' ? 4 : c.grade === 'C' ? 3 : c.grade === 'D' ? 2 : c.grade === 'E' ? 1 : 0))
      return `<tr style="border-bottom:.5px solid #e5e7eb">
        <td style="padding:5px 6px;font-size:11px;font-family:monospace;color:#6b7280">${c.code}</td>
        <td style="padding:5px 6px;font-size:11px">${c.title}</td>
        <td style="padding:5px 6px;font-size:11px;text-align:center">${c.units}</td>
        <td style="padding:5px 6px;font-size:11px;text-align:center;font-weight:700;color:${gradeColor(c.grade)}">${c.grade}</td>
        <td style="padding:5px 6px;font-size:11px;text-align:right;color:#6b7280">${gp.toFixed(1)}</td>
      </tr>`
    }).join('')}
    <tr style="background:#f3f4f6;font-weight:600">
      <td colspan="2" style="padding:5px 6px;font-size:11px">Semester Total</td>
      <td style="padding:5px 6px;font-size:11px;text-align:center">${sem.totalUnits}</td>
      <td colspan="2" style="padding:5px 6px;font-size:11px;text-align:right">GPA: ${fmt(sem.gpa)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 12px; color: #111827; background: #fff; padding: 32px 40px; }
  .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); font-size: 80px; font-weight: 900; color: rgba(0,0,0,0.04); pointer-events: none; letter-spacing: .1em; z-index: 0; }
  .header { text-align: center; border-bottom: 2.5px solid #111; padding-bottom: 16px; margin-bottom: 18px; }
  .seal { width: 56px; height: 56px; border-radius: 50%; border: 2.5px solid #111; display: inline-flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 700; letter-spacing: .04em; text-align: center; line-height: 1.4; margin-bottom: 8px; }
  .uni-name { font-size: 18px; font-weight: 700; letter-spacing: .02em; }
  .doc-sub { font-size: 11px; color: #4b5563; margin-top: 3px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 28px; font-size: 11.5px; margin-bottom: 18px; }
  .info-label { font-weight: 600; color: #374151; }
  table { width: 100%; border-collapse: collapse; }
  .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; border: 1px solid #d1d5db; border-radius: 6px; overflow: hidden; margin: 14px 0; }
  .summary-cell { padding: 10px 14px; border-right: .5px solid #d1d5db; }
  .summary-cell:last-child { border-right: none; }
  .summary-label { font-size: 9px; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; margin-bottom: 2px; }
  .summary-val { font-size: 18px; font-weight: 700; }
  .sig-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 28px; padding-top: 14px; border-top: .5px solid #d1d5db; }
  .sig-line { border-bottom: 1px solid #111; margin-bottom: 5px; height: 22px; }
  .sig-label { font-size: 9.5px; color: #6b7280; text-align: center; font-family: sans-serif; }
  .footer-note { text-align: center; font-size: 9px; color: #9ca3af; font-family: sans-serif; margin-top: 14px; border-top: .5px solid #e5e7eb; padding-top: 8px; line-height: 1.8; }
  .qr-placeholder { width: 56px; height: 56px; background: #f3f4f6; border: .5px solid #d1d5db; display: inline-block; }
</style>
</head>
<body>
  <div class="watermark">OFFICIAL</div>
  <div class="header">
    <div class="seal">ABU<br>1962</div><br>
    <div class="uni-name">Ahmadu Bello University, Kano</div>
    <div class="doc-sub">Office of the Registrar — Official Academic Transcript</div>
  </div>

  <div class="info-grid">
    <div><span class="info-label">Student Name: </span>${student.name}</div>
    <div><span class="info-label">Matric Number: </span>${student.matric}</div>
    <div><span class="info-label">Programme: </span>${student.program}</div>
    <div><span class="info-label">Faculty: </span>${student.faculty}</div>
    <div><span class="info-label">Entry Year: </span>${student.entryYear}</div>
    <div><span class="info-label">Current Level: </span>${student.level}L</div>
    <div><span class="info-label">Date Issued: </span>${issuedDate}</div>
    <div><span class="info-label">Document ID: </span><span style="font-family:monospace">${documentId}</span></div>
  </div>

  <table>${semRows}</table>

  <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#4b5563;margin-top:16px;margin-bottom:6px">Academic Summary</div>
  <div class="summary-grid">
    <div class="summary-cell">
      <div class="summary-label">CGPA (5-Point)</div>
      <div class="summary-val" style="color:${cgpa >= 4.5 ? '#065f46' : cgpa >= 3.5 ? '#1e40af' : '#92400e'}">${fmt(cgpa)}</div>
    </div>
    <div class="summary-cell">
      <div class="summary-label">Total Units</div>
      <div class="summary-val">${totalUnits}</div>
    </div>
    <div class="summary-cell">
      <div class="summary-label">Class of Degree</div>
      <div style="font-size:11px;font-weight:700;margin-top:2px">${classOfDegree}</div>
    </div>
    <div class="summary-cell">
      <div class="summary-label">Courses</div>
      <div class="summary-val">${data.totalCourses}</div>
    </div>
  </div>

  <div style="display:flex;align-items:flex-end;gap:16px;margin-top:8px">
    <div>
      <div style="font-size:9px;color:#9ca3af;font-family:sans-serif;margin-bottom:4px">Scan to verify</div>
      <div class="qr-placeholder"></div>
    </div>
    <div style="flex:1">
      <div class="sig-grid">
        <div><div class="sig-line"></div><div class="sig-label">Registrar</div></div>
        <div><div class="sig-line"></div><div class="sig-label">Deputy Registrar (Academic)</div></div>
      </div>
    </div>
  </div>

  <div class="footer-note">
    This document is issued by the Registry Division, Ahmadu Bello University, Kano, Nigeria.<br>
    Any alteration, erasure, or defacement renders this transcript void and invalid.<br>
    Grading Scale: A (70–100, GP 5) · B (60–69, GP 4) · C (50–59, GP 3) · D (45–49, GP 2) · E (40–44, GP 1) · F (0–39, GP 0)
  </div>
</body>
</html>`
}

// ── Export to PDF using html2pdf.js ──────────────────────────────────────────
export async function exportTranscriptPDF(data: TranscriptData): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default
  const htmlContent = buildTranscriptHTML(data)
  const container = document.createElement('div')
  container.innerHTML = htmlContent
  document.body.appendChild(container)

  const options = {
    margin:       [10, 10, 10, 10],
    filename:     `Transcript_${data.student.matric.replace(/\//g, '-')}_${Date.now()}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, useCORS: true, logging: false },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] },
  }

  await html2pdf().set(options).from(container).save()
  document.body.removeChild(container)
}
