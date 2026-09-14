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
 * Blue & White design with cursive lettering, top flowing ribbon (Gold / Diamond / Silver), 
 * embossed metallic rosette seal with ribbon tails, and manually-entered Founder & Co-Founder signatures.
 */
export function exportCertificateToPDF(cert: CertificateRecord) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4' // 842 x 595
  });

  const width = 842;
  const height = 595;
  const grade = cert.grade || 'Gold';

  // Palette definitions based on Ribbon Flow (Gold / Diamond / Silver)
  const isDiamond = grade === 'Diamond';
  const isSilver = grade === 'Silver';
  const isGold = !isDiamond && !isSilver;

  // Primary Metallic Accent Colors
  const metallicPrimary = isDiamond 
    ? [2, 132, 199] // Deep Azure / Cyan
    : isSilver 
      ? [100, 116, 139] // Polished Slate
      : [217, 119, 6]; // Radiant Gold

  const metallicLight = isDiamond
    ? [224, 242, 254] // Sky Ice
    : isSilver
      ? [241, 245, 249] // Chrome White
      : [254, 240, 138]; // Pale Gold

  const metallicDark = isDiamond
    ? [3, 105, 161]
    : isSilver
      ? [71, 85, 105]
      : [180, 83, 9];

  // 1. Pristine White Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, width, height, 'F');

  // 2. Multi-tier Royal Blue & White Borders
  // Outer Royal Blue Frame (Deep Sapphire 900)
  doc.setDrawColor(26, 54, 138);
  doc.setLineWidth(10);
  doc.rect(18, 18, width - 36, height - 36);

  // Inner Metallic Gold/Diamond/Silver Accent Line
  doc.setDrawColor(metallicPrimary[0], metallicPrimary[1], metallicPrimary[2]);
  doc.setLineWidth(2);
  doc.rect(26, 26, width - 52, height - 52);

  // Delicate Navy Thin Pinstripe
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.8);
  doc.rect(31, 31, width - 62, height - 62);

  // Corner Ornaments (Royal Blue & Metallic squares with diamond cross)
  const cornerSize = 14;
  const cornerPositions = [
    { x: 35, y: 35 },
    { x: width - 35 - cornerSize, y: 35 },
    { x: 35, y: height - 35 - cornerSize },
    { x: width - 35 - cornerSize, y: height - 35 - cornerSize }
  ];
  cornerPositions.forEach(c => {
    doc.setFillColor(26, 54, 138);
    doc.rect(c.x, c.y, cornerSize, cornerSize, 'F');
    doc.setFillColor(metallicLight[0], metallicLight[1], metallicLight[2]);
    doc.circle(c.x + cornerSize / 2, c.y + cornerSize / 2, 3, 'F');
  });

  // 3. TOP FLOWING RIBBON BANNER (Gold / Diamond / Silver Flow)
  const ribbonWidth = 320;
  const ribbonHeight = 30;
  const ribbonX = (width - ribbonWidth) / 2;
  const ribbonY = 32;

  // Left Ribbon Wing (Folded 3D effect)
  doc.setFillColor(metallicDark[0], metallicDark[1], metallicDark[2]);
  doc.triangle(ribbonX - 25, ribbonY + 28, ribbonX, ribbonY + 6, ribbonX, ribbonY + 28, 'F');
  doc.setFillColor(metallicPrimary[0], metallicPrimary[1], metallicPrimary[2]);
  doc.rect(ribbonX - 45, ribbonY + 6, 45, 22, 'F');
  // Left Swallowtail cut
  doc.setFillColor(255, 255, 255);
  doc.triangle(ribbonX - 45, ribbonY + 6, ribbonX - 35, ribbonY + 17, ribbonX - 45, ribbonY + 28, 'F');

  // Right Ribbon Wing (Folded 3D effect)
  doc.setFillColor(metallicDark[0], metallicDark[1], metallicDark[2]);
  doc.triangle(ribbonX + ribbonWidth + 25, ribbonY + 28, ribbonX + ribbonWidth, ribbonY + 6, ribbonX + ribbonWidth, ribbonY + 28, 'F');
  doc.setFillColor(metallicPrimary[0], metallicPrimary[1], metallicPrimary[2]);
  doc.rect(ribbonX + ribbonWidth, ribbonY + 6, 45, 22, 'F');
  // Right Swallowtail cut
  doc.setFillColor(255, 255, 255);
  doc.triangle(ribbonX + ribbonWidth + 45, ribbonY + 6, ribbonX + ribbonWidth + 35, ribbonY + 17, ribbonX + ribbonWidth + 45, ribbonY + 28, 'F');

  // Center Flowing Ribbon Body
  doc.setFillColor(metallicPrimary[0], metallicPrimary[1], metallicPrimary[2]);
  doc.roundedRect(ribbonX, ribbonY, ribbonWidth, ribbonHeight, 3, 3, 'F');
  doc.setDrawColor(metallicLight[0], metallicLight[1], metallicLight[2]);
  doc.setLineWidth(1);
  doc.roundedRect(ribbonX + 2, ribbonY + 2, ribbonWidth - 4, ribbonHeight - 4, 2, 2, 'S');

  // Ribbon Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`★  ${grade.toUpperCase()} ACCREDITED CERTIFICATE  ★`, width / 2, ribbonY + 19, { align: 'center' });

  // 4. Institution Header: MOCOSART (Royal Blue & White Theme)
  doc.setTextColor(26, 54, 138); // Deep Royal Blue
  doc.setFontSize(30);
  doc.setFont('times', 'bold');
  doc.text('MOCOSART', width / 2, 104, { align: 'center' });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(metallicPrimary[0], metallicPrimary[1], metallicPrimary[2]);
  doc.text('INTERNATIONAL INSTITUTE OF EDUCATIONAL ACCREDITATION', width / 2, 122, { align: 'center' });

  // Horizontal Accent Divider
  doc.setDrawColor(26, 54, 138);
  doc.setLineWidth(0.8);
  doc.line(width / 2 - 140, 130, width / 2 + 140, 130);

  // 5. Certificate Title
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(22);
  doc.setFont('times', 'italic');
  doc.text('Certificate of Achievement & Excellence', width / 2, 165, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(148, 163, 184);
  doc.text('THIS IS PROUDLY CONFERRED UPON', width / 2, 194, { align: 'center' });

  // 6. CANDIDATE NAME - GRAND CURSIVE SCRIPT
  doc.setTextColor(15, 23, 85); // Deep Royal Navy
  doc.setFontSize(32);
  doc.setFont('times', 'bolditalic');
  doc.text(cert.userName, width / 2, 238, { align: 'center' });

  // Elegant Calligraphic Underline with Jewel Diamond Center
  doc.setDrawColor(26, 54, 138);
  doc.setLineWidth(1.2);
  doc.line(width / 2 - 180, 248, width / 2 + 180, 248);
  doc.setFillColor(metallicPrimary[0], metallicPrimary[1], metallicPrimary[2]);
  doc.circle(width / 2, 248, 3.5, 'F');

  // 7. Course & Certification Context
  doc.setFontSize(11);
  doc.setFont('times', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(
    'for demonstrated distinguished excellence and mastery in the comprehensive academic curriculum of',
    width / 2,
    276,
    { align: 'center' }
  );

  doc.setTextColor(26, 54, 138); // Royal Blue
  doc.setFontSize(18);
  doc.setFont('times', 'bold');
  doc.text(cert.courseName, width / 2, 302, { align: 'center' });

  // Performance Badge Row
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Performance Score: ${cert.percentage}%   •   Accreditation ID: ${cert.certificateNumber}   •   Date: ${new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    width / 2,
    328,
    { align: 'center' }
  );

  if (cert.description) {
    doc.setFontSize(9);
    doc.setFont('times', 'italic');
    doc.setTextColor(120, 130, 145);
    doc.text(`"${cert.description}"`, width / 2, 350, { align: 'center', maxWidth: 540 });
  }

  // 8. SIGNATURES & OFFICIAL METALLIC ROSETTE SEAL
  const footerY = 478;

  // Center: Embossed Rosette Seal with Downward Ribbon Tails
  const sealCenterX = width / 2;
  const sealCenterY = footerY - 14;

  // Hanging Ribbon Tails
  doc.setFillColor(metallicDark[0], metallicDark[1], metallicDark[2]);
  // Left Tail
  doc.triangle(sealCenterX - 18, sealCenterY + 20, sealCenterX - 8, sealCenterY + 45, sealCenterX - 24, sealCenterY + 48, 'F');
  // Right Tail
  doc.triangle(sealCenterX + 18, sealCenterY + 20, sealCenterX + 8, sealCenterY + 45, sealCenterX + 24, sealCenterY + 48, 'F');

  // Seal Rosette Outer Circle (Metallic)
  doc.setFillColor(metallicPrimary[0], metallicPrimary[1], metallicPrimary[2]);
  doc.circle(sealCenterX, sealCenterY, 34, 'F');

  // Seal Inner Ring
  doc.setFillColor(metallicLight[0], metallicLight[1], metallicLight[2]);
  doc.circle(sealCenterX, sealCenterY, 28, 'F');
  doc.setDrawColor(metallicDark[0], metallicDark[1], metallicDark[2]);
  doc.setLineWidth(1);
  doc.circle(sealCenterX, sealCenterY, 25, 'S');

  // Seal Text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(metallicDark[0], metallicDark[1], metallicDark[2]);
  doc.text('VERIFIED', sealCenterX, sealCenterY - 6, { align: 'center' });
  doc.setFontSize(9);
  doc.text('★ ★ ★', sealCenterX, sealCenterY + 3, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('OFFICIAL SEAL', sealCenterX, sealCenterY + 12, { align: 'center' });

  // ONLY TWO SIGNATURES (Manually entered by Admin):
  // 1. Founder Cursive Signature (Left)
  const founderName = cert.foundersName || 'Dr. Arvind Mocosart';
  const founderTitle = cert.founderDesignation || 'Founder & Chancellor';
  const founderSig = cert.founderSignature || founderName;

  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(1);
  doc.line(90, footerY, 280, footerY);

  // Cursive Signature Representation (Grand Italic Script)
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(18);
  doc.setTextColor(26, 54, 138); // Royal Blue Signature Ink
  doc.text(founderSig, 185, footerY - 8, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(founderName, 185, footerY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(founderTitle, 185, footerY + 28, { align: 'center' });

  // 2. Co-Founder Cursive Signature (Right)
  const cofounderName = cert.cofounderName || 'Sanjana Rao';
  const cofounderTitle = cert.cofounderDesignation || 'Co-Founder & Operations Director';
  const cofounderSig = cert.cofounderSignature || cofounderName;

  doc.line(width - 280, footerY, width - 90, footerY);

  // Cursive Signature Representation
  doc.setFont('times', 'bolditalic');
  doc.setFontSize(18);
  doc.setTextColor(26, 54, 138); // Royal Blue Signature Ink
  doc.text(cofounderSig, width - 185, footerY - 8, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(15, 23, 42);
  doc.text(cofounderName, width - 185, footerY + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(cofounderTitle, width - 185, footerY + 28, { align: 'center' });

  // Bottom Watermark / Tamper Proof
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(160, 175, 195);
  doc.text('Tamper-evident credential issued via Mocosart Accreditation Protocol', width / 2, height - 25, { align: 'center' });

  const safeUserName = cert.userName.trim().replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`Mocosart_Certificate_${safeUserName}.pdf`);
}
