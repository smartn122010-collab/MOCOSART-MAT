import jsPDF from 'jspdf';
import { CertificateRecord } from '../types';

/**
 * Downloads a neatly aligned, professional table report as PDF
 */
export function exportTableToPDF(
  title: string, 
  headers: string[], 
  rows: (string | number)[][], 
  filename?: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4' // 842 x 595 pt
  });

  const pageWidth = 842;
  const pageHeight = 595;
  const marginX = 36;
  const tableWidth = pageWidth - (marginX * 2); // 770 pt

  // Calculate adaptive column widths based on header length and content sample
  const colCount = headers.length;
  const colWeights = headers.map((h, i) => {
    let maxLen = String(h).length;
    for (let r = 0; r < Math.min(rows.length, 25); r++) {
      const cellLen = String(rows[r][i] || '').length;
      if (cellLen > maxLen) maxLen = cellLen;
    }
    return Math.max(8, Math.min(36, maxLen));
  });

  const totalWeight = colWeights.reduce((a, b) => a + b, 0);
  const colWidths = colWeights.map(w => Math.round((w / totalWeight) * tableWidth));
  // Adjust last column to absorb rounding difference
  const currentTotal = colWidths.reduce((a, b) => a + b, 0);
  colWidths[colWidths.length - 1] += (tableWidth - currentTotal);

  const drawHeaderBanner = (pageDoc: jsPDF) => {
    // Header Bar
    pageDoc.setFillColor(6, 78, 59); // Deep Emerald 900
    pageDoc.rect(0, 0, pageWidth, 52, 'F');

    // Accent line
    pageDoc.setFillColor(16, 185, 129); // Emerald 500
    pageDoc.rect(0, 52, pageWidth, 3, 'F');

    pageDoc.setTextColor(255, 255, 255);
    pageDoc.setFontSize(18);
    pageDoc.setFont('helvetica', 'bold');
    pageDoc.text('MOCOSART EDUCATION PLATFORM', marginX, 32);

    pageDoc.setFontSize(10);
    pageDoc.setFont('helvetica', 'normal');
    pageDoc.setTextColor(209, 250, 229);
    pageDoc.text('Official Administrative Dossier & Records Ledger', pageWidth - marginX, 32, { align: 'right' });
  };

  const drawTableHeader = (pageDoc: jsPDF, y: number) => {
    pageDoc.setFillColor(241, 245, 249); // Slate 100
    pageDoc.rect(marginX, y, tableWidth, 24, 'F');

    pageDoc.setDrawColor(203, 213, 225); // Slate 300
    pageDoc.setLineWidth(1);
    pageDoc.rect(marginX, y, tableWidth, 24, 'S');

    pageDoc.setTextColor(15, 23, 42); // Slate 900
    pageDoc.setFont('helvetica', 'bold');
    pageDoc.setFontSize(9);

    let curX = marginX;
    headers.forEach((h, i) => {
      const w = colWidths[i];
      // Vertical separator line
      if (i > 0) {
        pageDoc.line(curX, y, curX, y + 24);
      }
      const text = String(h).toUpperCase();
      pageDoc.text(text, curX + 6, y + 16, { maxWidth: w - 12 });
      curX += w;
    });
  };

  // 1. Draw Page 1 Header
  drawHeaderBanner(doc);

  // Document Title & Metadata
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text(title, marginX, 82);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated on: ${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}  •  Total Ledger Items: ${rows.length} records`,
    marginX,
    98
  );

  let currentY = 115;
  const rowHeight = 22;
  drawTableHeader(doc, currentY);
  currentY += 24;

  // Render Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  rows.forEach((row, rowIndex) => {
    // Page break handling
    if (currentY + rowHeight > pageHeight - 45) {
      doc.addPage();
      drawHeaderBanner(doc);
      currentY = 70;
      drawTableHeader(doc, currentY);
      currentY += 24;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
    }

    // Row Background (Alternating light zebra)
    if (rowIndex % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginX, currentY, tableWidth, rowHeight, 'F');
    } else {
      doc.setFillColor(255, 255, 255);
      doc.rect(marginX, currentY, tableWidth, rowHeight, 'F');
    }

    // Row Outer Border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.rect(marginX, currentY, tableWidth, rowHeight, 'S');

    doc.setTextColor(51, 65, 85);
    let curX = marginX;
    row.forEach((cell, i) => {
      const w = colWidths[i];
      if (i > 0) {
        doc.line(curX, currentY, curX, currentY + rowHeight);
      }
      const rawText = String(cell ?? '-');
      // Truncate cleanly if wider than colWidth
      const maxChars = Math.max(5, Math.floor((w - 12) / 5.2));
      const text = rawText.length > maxChars ? rawText.substring(0, maxChars - 2) + '...' : rawText;
      doc.text(text, curX + 6, currentY + 15);
      curX += w;
    });

    currentY += rowHeight;
  });

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setDrawColor(226, 232, 240);
    doc.line(marginX, pageHeight - 32, pageWidth - marginX, pageHeight - 32);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Mocosart Education Platform • Confidential Record • For Official Administrative Use Only', marginX, pageHeight - 18);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 18, { align: 'right' });
  }

  const safeFilename = (filename || title).toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 40);
  doc.save(`${safeFilename}_${new Date().toISOString().split('T')[0]}.pdf`);
}

/**
 * Downloads a neatly aligned CSV export for Excel / Google Sheets
 */
export function exportTableToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (val: string | number) => {
    const s = String(val ?? '');
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(r => r.map(escapeCell).join(','))
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads Premium Mocosart Certificate as PDF
 * Under the certificate: ONLY Founder and Co-Founder signatures (manually entered by Admin, NOT auto detected)
 */
export function exportCertificateToPDF(cert: CertificateRecord) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4' // 842 x 595
  });

  const width = 842;
  const height = 595;

  // Background Cream Paper Tint
  doc.setFillColor(254, 254, 252);
  doc.rect(0, 0, width, height, 'F');

  // Outer Deep Emerald Border
  doc.setDrawColor(6, 78, 59); // Deep Emerald 900
  doc.setLineWidth(7);
  doc.rect(20, 20, width - 40, height - 40);

  // Inner Ornate Gold/Bronze Border
  doc.setDrawColor(180, 142, 60); // Vintage Gold
  doc.setLineWidth(2);
  doc.rect(28, 28, width - 56, height - 56);

  // Thin Accent Border
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(0.8);
  doc.rect(34, 34, width - 68, height - 68);

  // Corner Ornaments
  const cornerSize = 18;
  const corners = [
    { x: 38, y: 38 },
    { x: width - 38 - cornerSize, y: 38 },
    { x: 38, y: height - 38 - cornerSize },
    { x: width - 38 - cornerSize, y: height - 38 - cornerSize }
  ];
  doc.setFillColor(180, 142, 60);
  corners.forEach(c => {
    doc.rect(c.x, c.y, cornerSize, cornerSize, 'F');
  });

  // Ribbon Badge - Top Right
  const gradeColor = cert.grade === 'Diamond' ? [14, 165, 233] : cert.grade === 'Gold' ? [217, 119, 6] : [100, 116, 139];
  doc.setFillColor(gradeColor[0], gradeColor[1], gradeColor[2]);
  doc.rect(width - 170, 42, 120, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(`★ ${cert.grade.toUpperCase()} GRADE`, width - 110, 60, { align: 'center' });

  // Center Company Header
  doc.setTextColor(6, 78, 59);
  doc.setFontSize(30);
  doc.setFont('times', 'bold');
  doc.text('MOCOSART', width / 2, 88, { align: 'center' });

  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(180, 142, 60);
  doc.text('INSTITUTE OF DIGITAL LEARNING & ACCREDITATION', width / 2, 108, { align: 'center' });

  // Horizontal Accent Divider
  doc.setDrawColor(180, 142, 60);
  doc.setLineWidth(1);
  doc.line(width / 2 - 120, 118, width / 2 + 120, 118);

  // Certificate Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(22);
  doc.setFont('times', 'italic');
  doc.text('Certificate of Achievement & Excellence', width / 2, 160, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('THIS IS PROUDLY CONFERRED UPON', width / 2, 192, { align: 'center' });

  // Recipient Name
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(28);
  doc.setFont('times', 'bold');
  doc.text(cert.userName.toUpperCase(), width / 2, 236, { align: 'center' });

  // Underline
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(1.5);
  doc.line(width / 2 - 180, 246, width / 2 + 180, 246);

  // Description & Course
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  const textBody = 'for demonstrated proficiency and successful completion of official curriculum assessments in';
  doc.text(textBody, width / 2, 278, { align: 'center' });

  doc.setTextColor(6, 78, 59);
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.text(cert.courseName, width / 2, 306, { align: 'center' });

  // Percentage and Status
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Performance Score: ${cert.percentage}%   •   Certificate ID: ${cert.certificateNumber}   •   Issue Date: ${new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    width / 2,
    334,
    { align: 'center' }
  );

  if (cert.description) {
    doc.setFontSize(9.5);
    doc.setTextColor(120, 130, 145);
    doc.text(cert.description, width / 2, 360, { align: 'center', maxWidth: 540 });
  }

  // Bottom Center: Official Seal
  const footerY = 475;
  doc.setFillColor(254, 249, 240);
  doc.circle(width / 2, footerY - 10, 38, 'F');
  doc.setDrawColor(180, 142, 60);
  doc.setLineWidth(2);
  doc.circle(width / 2, footerY - 10, 38, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(180, 142, 60);
  doc.text('OFFICIAL SEAL', width / 2, footerY - 16, { align: 'center' });
  doc.setFontSize(11);
  doc.text('★ ★ ★', width / 2, footerY - 5, { align: 'center' });
  doc.setFontSize(8);
  doc.setTextColor(6, 78, 59);
  doc.text('ACCREDITED', width / 2, footerY + 8, { align: 'center' });

  // ONLY TWO SIGNATURES UNDER THE CERTIFICATE (Manually entered by Admin):
  // 1. Founder Signature (Left)
  const founderName = cert.foundersName || 'Founder Signature';
  const founderTitle = cert.founderDesignation || 'Founder & Chancellor';
  const founderSig = cert.founderSignature || founderName;

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(1);
  doc.line(90, footerY, 280, footerY);

  doc.setFont('times', 'italic');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(founderSig, 185, footerY - 8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(founderName, 185, footerY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(founderTitle, 185, footerY + 28, { align: 'center' });

  // 2. Co-Founder Signature (Right)
  const cofounderName = cert.cofounderName || 'Co-Founder Signature';
  const cofounderTitle = cert.cofounderDesignation || 'Co-Founder & Director';
  const cofounderSig = cert.cofounderSignature || cofounderName;

  doc.line(width - 280, footerY, width - 90, footerY);

  doc.setFont('times', 'italic');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(cofounderSig, width - 185, footerY - 8, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(cofounderName, width - 185, footerY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(cofounderTitle, width - 185, footerY + 28, { align: 'center' });

  const safeUserName = cert.userName.trim().replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Mocosart_Certificate_${safeUserName}.pdf`);
}
