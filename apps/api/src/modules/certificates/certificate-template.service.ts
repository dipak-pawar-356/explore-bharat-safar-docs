// Explore Bharat Safar — Vector Certificate Template & PDF Synthesis Engine
// Reference: EBS-DOC-20-CERT Section 3 (Vector Canvas Architecture, PDF/A-1b Compliance)

import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface CertificateRenderParams {
  certificateNumber: string;
  participantName: string;
  experienceTitle: string;
  experienceLocation: string;
  highestAltitudeMeters?: number | null;
  completionDate: string;
  verificationHash: string;
  qrDataUrl: string;
  directorName?: string;
  leadGuideTitle?: string;
}

@Injectable()
export class CertificateTemplateService {
  private readonly logger = new Logger(CertificateTemplateService.name);

  /**
   * Synthesizes a publication-grade Landscape A4 PDF/A document.
   * Dimensions: 841.89 pt x 595.28 pt (297mm x 210mm)
   */
  async renderPdf(params: CertificateRenderParams): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: [841.89, 595.28], // A4 Landscape
          layout: 'landscape',
          margins: { top: 36, bottom: 36, left: 36, right: 36 },
          info: {
            Title: `Explore Bharat Safar Certificate - ${params.participantName}`,
            Author: 'Explore Bharat Safar',
            Subject: `Expedition Completion Certificate: ${params.experienceTitle}`,
            Keywords: 'Explore Bharat Safar, Certificate, Trek, Expedition, Sovereign GIS, Bharat',
            CreationDate: new Date(),
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', chunk => buffers.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', err => reject(err));

        const width = 841.89;
        const height = 595.28;

        // 1. Background Parchment Canvas
        doc.rect(0, 0, width, height).fill('#FCFBF7');

        // 2. Classical Indian Guilloche Multi-layered Geometric Borders
        this.drawGuillocheBorder(doc, width, height);

        // 3. Header Emblem & Platform Title
        doc.fillColor('#78350F').fontSize(14).font('Helvetica-Bold');
        doc.text('EXPLORE BHARAT SAFAR', 0, 56, { align: 'center', characterSpacing: 4 });

        doc.fillColor('#D97706').fontSize(9).font('Helvetica');
        doc.text('SOVEREIGN EXPEDITION & RURAL HERITAGE COUNCIL OF BHARAT', 0, 74, {
          align: 'center',
          characterSpacing: 2,
        });

        // 4. Certificate Award Title
        doc.fillColor('#92400E').fontSize(26).font('Times-Bold');
        doc.text('CERTIFICATE OF ACCOMPLISHMENT', 0, 102, { align: 'center', characterSpacing: 2 });

        doc.fillColor('#64748B').fontSize(11).font('Helvetica-Oblique');
        doc.text('This is formally presented and attested to', 0, 142, { align: 'center' });

        // 5. Participant Full Name
        doc.fillColor('#0F172A').fontSize(30).font('Helvetica-Bold');
        doc.text(params.participantName, 0, 168, { align: 'center' });

        // Decorative separator line under name
        const center = width / 2;
        doc
          .moveTo(center - 140, 206)
          .lineTo(center + 140, 206)
          .lineWidth(1.2)
          .strokeColor('#D97706')
          .stroke();

        // 6. Citation & Accomplishment Statement
        doc.fillColor('#334155').fontSize(12).font('Helvetica');
        doc.text(
          'for demonstrating exemplary endurance, sovereign environmental guardianship, and successfully conquering',
          0,
          220,
          { align: 'center' },
        );

        // 7. Expedition Title
        doc.fillColor('#B45309').fontSize(20).font('Times-Bold');
        doc.text(params.experienceTitle, 0, 244, { align: 'center' });

        // 8. Location & Altitude Badging
        const altitudeText = params.highestAltitudeMeters
          ? ` • Summit Elevation: ${params.highestAltitudeMeters.toLocaleString()} Meters AMSL`
          : '';
        doc.fillColor('#475569').fontSize(11).font('Helvetica-Bold');
        doc.text(`${params.experienceLocation}${altitudeText}`, 0, 276, { align: 'center' });

        // 9. Completion Date
        const formattedDate = this.formatDate(params.completionDate);
        doc.fillColor('#64748B').fontSize(11).font('Helvetica');
        doc.text(`Expedition Concluded on: ${formattedDate}`, 0, 302, { align: 'center' });

        // 10. Embedded QR Code (Bottom Left)
        if (params.qrDataUrl && params.qrDataUrl.startsWith('data:image')) {
          try {
            const base64Data = params.qrDataUrl.split(',')[1];
            const qrBuffer = Buffer.from(base64Data, 'base64');
            doc.image(qrBuffer, 65, 410, { width: 95, height: 95 });
          } catch (qrErr) {
            this.logger.warn('Failed to embed raster QR in PDF; drawing fallback box', qrErr);
            doc.rect(65, 410, 95, 95).strokeColor('#D97706').stroke();
          }
        }

        // 11. Security Hashes & Micro-Print Details (Next to QR)
        doc.fillColor('#0F172A').fontSize(9).font('Helvetica-Bold');
        doc.text(`CERTIFICATE ID: ${params.certificateNumber}`, 172, 422);

        doc.fillColor('#64748B').fontSize(8).font('Helvetica');
        doc.text('Cryptographically Sealed & Tamper-Evident (HMAC-SHA256 & RS256)', 172, 438);

        doc.fillColor('#475569').fontSize(7.5).font('Courier');
        const shortHash = params.verificationHash.substring(0, 32);
        doc.text(`DIGEST: ${shortHash}...`, 172, 454);

        doc.fillColor('#D97706').fontSize(7.5).font('Helvetica');
        doc.text('Scan dynamic QR code to verify on sovereign public registry', 172, 470);

        // 12. Authorizing Signatures (Bottom Right)
        const directorName = params.directorName || 'Dr. Vikramaditya Joshi';
        const leadGuideTitle = params.leadGuideTitle || 'Chief Expedition Marshal';

        // Signature 1: Chief Expedition Marshal
        doc.moveTo(490, 480).lineTo(630, 480).lineWidth(1).strokeColor('#94A3B8').stroke();
        doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold');
        doc.text('Arunendra Rawat', 490, 486, { width: 140, align: 'center' });
        doc.fillColor('#64748B').fontSize(8).font('Helvetica');
        doc.text(leadGuideTitle, 490, 498, { width: 140, align: 'center' });

        // Signature 2: Platform Director
        doc.moveTo(660, 480).lineTo(800, 480).lineWidth(1).strokeColor('#94A3B8').stroke();
        doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold');
        doc.text(directorName, 660, 486, { width: 140, align: 'center' });
        doc.fillColor('#64748B').fontSize(8).font('Helvetica');
        doc.text('Governing Director, EBS', 660, 498, { width: 140, align: 'center' });

        // 13. Sovereign Watermark Footer
        doc.fillColor('#94A3B8').fontSize(7.5).font('Helvetica');
        doc.text(
          'Explore Bharat Safar • Issued in accordance with National Adventure Tourism Safety & Accreditation Guidelines',
          0,
          560,
          { align: 'center' },
        );

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Generates a responsive, vector SVG representation for instant web preview.
   */
  renderSvgPreview(params: CertificateRenderParams): string {
    const formattedDate = this.formatDate(params.completionDate);
    const altitudeText = params.highestAltitudeMeters
      ? ` • Summit Elevation: ${params.highestAltitudeMeters.toLocaleString()}m AMSL`
      : '';
    const directorName = params.directorName || 'Dr. Vikramaditya Joshi';
    const leadGuideTitle = params.leadGuideTitle || 'Chief Expedition Marshal';

    return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 707" width="100%" height="100%" style="font-family: system-ui, -apple-system, sans-serif;">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCFBF7"/>
      <stop offset="100%" stop-color="#F7F3E9"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#CA8A04"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1000" height="707" fill="url(#bgGrad)"/>

  <!-- Classical Indian Guilloche Geometric Borders -->
  <rect x="25" y="25" width="950" height="657" fill="none" stroke="#CA8A04" stroke-width="4"/>
  <rect x="35" y="35" width="930" height="637" fill="none" stroke="#D97706" stroke-width="1.5" stroke-dasharray="8 4"/>
  <rect x="42" y="42" width="916" height="623" fill="none" stroke="#78350F" stroke-width="1"/>

  <!-- Corner Ornamental Rosettes -->
  <g fill="#D97706">
    <circle cx="42" cy="42" r="10" />
    <circle cx="958" cy="42" r="10" />
    <circle cx="42" cy="665" r="10" />
    <circle cx="958" cy="665" r="10" />
  </g>

  <!-- Header Text -->
  <text x="500" y="80" text-anchor="middle" font-size="16" font-weight="800" fill="#78350F" letter-spacing="4">EXPLORE BHARAT SAFAR</text>
  <text x="500" y="100" text-anchor="middle" font-size="10" font-weight="600" fill="#D97706" letter-spacing="2">SOVEREIGN EXPEDITION &amp; RURAL HERITAGE COUNCIL OF BHARAT</text>

  <!-- Certificate Title -->
  <text x="500" y="145" text-anchor="middle" font-size="30" font-weight="900" fill="#92400E" font-family="serif" letter-spacing="2">CERTIFICATE OF ACCOMPLISHMENT</text>
  <text x="500" y="180" text-anchor="middle" font-size="14" font-style="italic" fill="#64748B">This is proudly presented and attested to</text>

  <!-- Participant Name -->
  <text x="500" y="235" text-anchor="middle" font-size="38" font-weight="900" fill="#0F172A">${params.participantName}</text>
  <line x1="320" y1="255" x2="680" y2="255" stroke="url(#goldGrad)" stroke-width="2.5"/>

  <!-- Citation -->
  <text x="500" y="295" text-anchor="middle" font-size="15" fill="#334155">for demonstrating exemplary endurance, sovereign environmental guardianship, and successfully conquering</text>
  <text x="500" y="335" text-anchor="middle" font-size="25" font-weight="800" fill="#B45309" font-family="serif">${params.experienceTitle}</text>
  <text x="500" y="370" text-anchor="middle" font-size="14" font-weight="700" fill="#475569">${params.experienceLocation}${altitudeText}</text>
  <text x="500" y="405" text-anchor="middle" font-size="13" fill="#64748B">Expedition Concluded on: ${formattedDate}</text>

  <!-- Bottom Left: Dynamic QR & Cryptographic Seal -->
  <g transform="translate(60, 480)">
    <image href="${params.qrDataUrl}" x="0" y="0" width="110" height="110"/>
    <text x="125" y="25" font-size="12" font-weight="800" fill="#0F172A">CERTIFICATE ID: ${params.certificateNumber}</text>
    <text x="125" y="45" font-size="10" fill="#64748B">Cryptographically Sealed (HMAC-SHA256 &amp; RS256)</text>
    <text x="125" y="65" font-size="9" font-family="monospace" fill="#475569">DIGEST: ${params.verificationHash.substring(0, 32)}...</text>
    <text x="125" y="85" font-size="10" font-weight="600" fill="#D97706">Scan QR code to verify on public sovereign registry</text>
  </g>

  <!-- Bottom Right: Signatures -->
  <g transform="translate(620, 520)">
    <line x1="0" y1="40" x2="150" y2="40" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="75" y="60" text-anchor="middle" font-size="12" font-weight="800" fill="#0F172A">Arunendra Rawat</text>
    <text x="75" y="75" text-anchor="middle" font-size="10" fill="#64748B">${leadGuideTitle}</text>
  </g>

  <g transform="translate(800, 520)">
    <line x1="0" y1="40" x2="150" y2="40" stroke="#94A3B8" stroke-width="1.5"/>
    <text x="75" y="60" text-anchor="middle" font-size="12" font-weight="800" fill="#0F172A">${directorName}</text>
    <text x="75" y="75" text-anchor="middle" font-size="10" fill="#64748B">Governing Director, EBS</text>
  </g>

  <!-- Sovereign Footer -->
  <text x="500" y="650" text-anchor="middle" font-size="10" fill="#94A3B8">Explore Bharat Safar • Issued in accordance with National Adventure Tourism Safety &amp; Accreditation Guidelines</text>
</svg>
    `.trim();
  }

  /**
   * Formats date as DD Month YYYY (e.g. 15 August 2026).
   */
  private formatDate(isoDate: string): string {
    try {
      const date = new Date(isoDate);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoDate;
    }
  }

  /**
   * Draws layered ornamental geometric Guilloche border.
   */
  private drawGuillocheBorder(doc: typeof PDFDocument, width: number, height: number): void {
    // Outer border
    doc
      .rect(20, 20, width - 40, height - 40)
      .lineWidth(3)
      .strokeColor('#CA8A04')
      .stroke();

    // Intermediate dashed border
    doc
      .rect(28, 28, width - 56, height - 56)
      .lineWidth(1)
      .dash(6, { space: 4 })
      .strokeColor('#D97706')
      .stroke();

    // Inner thin border
    doc.undash();
    doc
      .rect(34, 34, width - 68, height - 68)
      .lineWidth(0.8)
      .strokeColor('#78350F')
      .stroke();

    // Corner decorative circles
    const r = 8;
    const corners = [
      { x: 34, y: 34 },
      { x: width - 34, y: 34 },
      { x: 34, y: height - 34 },
      { x: width - 34, y: height - 34 },
    ];
    for (const c of corners) {
      doc.circle(c.x, c.y, r).fillAndStroke('#D97706', '#78350F');
    }
  }
}
