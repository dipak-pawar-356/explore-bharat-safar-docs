// Explore Bharat Safar — Certificate Template & Rendering Unit Tests
// Reference: EBS-DOC-20-CERT Section 3

import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CertificateTemplateService } from './certificate-template.service';

describe('CertificateTemplateService', () => {
  let service: CertificateTemplateService;

  const mockParams = {
    certificateNumber: 'EBS-CERT-2026-HARI-8F3A21',
    participantName: 'Amitabh Sharma',
    experienceTitle: 'Harishchandragad Monsoon Escarpment Trek',
    experienceLocation: 'Ahmednagar, Maharashtra',
    highestAltitudeMeters: 1422,
    completionDate: '2026-08-15',
    verificationHash: '7f8b91a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0',
    qrDataUrl:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    directorName: 'Dr. Vikramaditya Joshi',
    leadGuideTitle: 'Chief Expedition Marshal',
  };

  beforeEach(() => {
    service = new CertificateTemplateService();
  });

  it('should synthesize a valid PDF vector document buffer', async () => {
    const pdfBuffer = await service.renderPdf(mockParams);

    assert.ok(pdfBuffer instanceof Buffer);
    assert.ok(pdfBuffer.length > 2000, `Buffer length ${pdfBuffer.length} should exceed 2KB`);

    // Verify PDF header '%PDF-'
    const header = pdfBuffer.subarray(0, 5).toString('ascii');
    assert.equal(header, '%PDF-');
  });

  it('should render a responsive SVG vector markup preview', () => {
    const svg = service.renderSvgPreview(mockParams);

    assert.ok(typeof svg === 'string');
    assert.ok(svg.includes('<svg'));
    assert.ok(svg.includes('</svg>'));
    assert.ok(svg.includes('Amitabh Sharma'));
    assert.ok(svg.includes('Harishchandragad Monsoon Escarpment Trek'));
    assert.ok(svg.includes('EBS-CERT-2026-HARI-8F3A21'));
    assert.ok(svg.includes('1,422m AMSL'));
  });
});
