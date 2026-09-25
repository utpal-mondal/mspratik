"use client";

import React, { forwardRef } from "react";

/* =========================================================
   Types
========================================================= */

interface PdfLayoutProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  watermarkImageUrl?: string;
}

/* =========================================================
   Header
========================================================= */

interface PdfHeaderProps {
  title?: string;
}

function PdfHeader({ title = "Invoice" }: PdfHeaderProps) {
  return (
    <div className="pdf-header">
      <div className="pdf-masthead">
        <h1 className="pdf-masthead-title">{title}</h1>
        <img
          src="/images/unique-logo.png"
          alt="Company Logo"
          className="pdf-logo"
        />
      </div>

      <div className="pdf-rule">
        <span className="red" />
        <span className="blue" />
        <span className="red" />
        <span className="blue" />
        <span className="red" />
      </div>
    </div>
  );
}

/* =========================================================
   Footer
========================================================= */

function PdfFooter() {
  return (
    <div className="pdf-footer">
      <div className="pdf-contact">

        {/* Address */}
        <div className="pdf-contact-item">

          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fill="#29abe2"
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
            />

            <circle
              cx="12"
              cy="9"
              r="2.6"
              fill="#3a3a3a"
            />
          </svg>

          <span>
            Thurledeweg 125, 3044 ER, Rotterdam,
            <br />
            Portugal
          </span>

        </div>

        {/* Email */}
        <div className="pdf-contact-item">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#29abe2"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="8.5"
            />

            <ellipse
              cx="11"
              cy="11"
              rx="4"
              ry="8.5"
            />

            <line
              x1="2.5"
              y1="11"
              x2="19.5"
              y2="11"
            />

            <line
              x1="4"
              y1="6"
              x2="18"
              y2="6"
            />

            <line
              x1="4"
              y1="16"
              x2="18"
              y2="16"
            />
          </svg>

          <a href="mailto:Sales@unique-tel.com">
            Sales@unique-tel.com
          </a>

        </div>

        {/* Phone */}
        <div className="pdf-contact-item pdf-phone">

          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#29abe2"
            strokeWidth="1.6"
            strokeLinecap="round"
            aria-hidden="true"
          >

            <rect
              x="8.5"
              y="3"
              width="7"
              height="18"
              rx="1.6"
            />

            <line
              x1="10.8"
              y1="5.4"
              x2="13.2"
              y2="5.4"
            />

            <line
              x1="10.4"
              y1="18.4"
              x2="13.6"
              y2="18.4"
            />

            <path d="M5.6 7.2a7 7 0 0 0 0 9.6M3 5.2a10.5 10.5 0 0 0 0 13.6" />

            <path d="M18.4 7.2a7 7 0 0 1 0 9.6M21 5.2a10.5 10.5 0 0 1 0 13.6" />

          </svg>

          <span className="pdf-phone-number">
            0031-6-87062606
          </span>

        </div>

      </div>

      {/* Bottom Strip */}
      <div className="pdf-strip">

        <div className="pdf-strip-one" />

        <div className="pdf-strip-two" />

        <div className="pdf-strip-three">
          <b>BTW:</b>
          PL863051157B01
        </div>

      </div>
    </div>
  );
}

/* =========================================================
   Generate PDF Layout
========================================================= */

const PdfLayout = forwardRef<
  HTMLDivElement,
  PdfLayoutProps
>(({ children, className = "", title = "Invoice", watermarkImageUrl = "/images/unique-logo.png" }, ref) => {

  return (
    <>
      <style jsx global>{`

        /* =====================================================
           PDF ROOT
        ===================================================== */

        .pdf-page {
          width: 210mm;
          min-height: 297mm;
          margin: 24px auto;
          background: #ffffff;
          position: relative;
          box-shadow: 0 2px 18px rgba(0, 0, 0, 0.18);
          overflow: hidden;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .pdf-header {
          background: #ffffff;
          width: 100%;
        }

        .pdf-masthead {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8mm 7mm 0 7mm;
        }

        .pdf-masthead-title {
          font-size: 20pt;
          font-weight: 700;
          color: #000000;
          margin: 0;
        }

        .pdf-logo {
          width: 50mm;
          height: auto;
          display: block;
        }

        .pdf-rule {
          display: flex;
          height: 1.8mm;
          margin: 10mm 7mm 0 7mm;
        }

        .pdf-rule span {
          flex: 1;
        }

        .pdf-rule .red {
          background: #e5232b;
        }

        .pdf-rule .blue {
          background: #1b8fd2;
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .pdf-content {
          padding: 1.5mm 12mm 10mm 12mm;
          font-family:
            "Segoe UI",
            Roboto,
            "Helvetica Neue",
            Arial,
            sans-serif;
          color: #2b2b2b;
          font-size: 10pt;
          line-height: 1.4;
        }

        .pdf-content p {
          margin: 0 0 1em;
        }

        /* =====================================================
           WATERMARK
        ===================================================== */

        .pdf-watermark {
          display: none;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          user-select: none;
        }

        .pdf-watermark img {
          width: 120mm;
          height: auto;
          opacity: 0.05;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .pdf-footer {
          background: #ffffff;
          width: 100%;
        }

        .pdf-contact {
          background: #3a3a3a;
          color: #ffffff;

          display: grid;
          grid-template-columns: 1.25fr 1fr 1fr;

          align-items: center;

          gap: 6mm;

          padding: 5mm 8mm;
        }

        .pdf-contact-item {
          display: flex;
          align-items: center;

          gap: 3.5mm;

          font-size: 9.5pt;
          line-height: 1.35;
        }

        .pdf-contact-item svg {
          flex: 0 0 auto;
          width: 9mm;
          height: 9mm;
        }

        .pdf-contact-item a {
          color: #ffffff;
          text-decoration: none;
        }

        .pdf-contact-item:last-child {
          justify-content: flex-end;
        }

        .pdf-phone-number {
          font-size: 11.5pt;
          letter-spacing: 0.01em;
        }

        /* =====================================================
           FOOTER STRIP
        ===================================================== */

        .pdf-strip {
          display: flex;
          align-items: center;

          height: 9mm;

          font-size: 9.5pt;
        }

        .pdf-strip-one {
          width: 20%;
          height: 100%;
          background: #29abe2;
        }

        .pdf-strip-two {
          width: 20%;
          height: 100%;
          background: #1b8fd2;
        }

        .pdf-strip-three {
          flex: 1;

          height: 100%;

          background: #0f6aad;

          color: #ffffff;

          display: flex;
          align-items: center;
          justify-content: flex-end;

          padding-right: 8mm;

          letter-spacing: 0.02em;
        }

        .pdf-strip-three b {
          margin-right: 0.5em;
        }

        /* =====================================================
           COMMON PDF CONTENT STYLES
        ===================================================== */

        .pdf-document-title {
          font-size: 18pt;
          font-weight: 700;

          color: #16336b;

          margin: 0 0 2mm 0;
        }

        .pdf-document-subtitle {
          font-size: 10pt;
          color: #6b7280;

          margin: 0 0 3mm 0;
        }

        .pdf-badge {
          display: inline-block;

          padding: 1.5mm 3mm;

          border-radius: 2mm;

          font-size: 8.5pt;
          font-weight: 600;

          color: #ffffff;
          background: #1b8fd2;

          margin-left: 3mm;

          vertical-align: middle;
        }

        .pdf-badge.paid {
          background: #16a34a;
        }

        .pdf-badge.unpaid {
          background: #e5232b;
        }

        .pdf-section {
          margin-bottom: 6mm;
        }

        .pdf-section-title {
          font-size: 10pt;
          font-weight: 700;

          color: #16336b;

          text-transform: uppercase;

          letter-spacing: 0.04em;

          border-bottom: 1px solid #e2e8f0;

          padding-bottom: 1.5mm;

          margin: 0 0 3mm 0;
        }

        /* =====================================================
           ADDRESS
        ===================================================== */

        .pdf-addresses {
          display: grid;

          grid-template-columns: 1fr 1fr;

          gap: 6mm;

          margin-bottom: 6mm;
        }

        .pdf-address-card {
          border: 1px solid #e2e8f0;

          border-radius: 2mm;

          padding: 4mm 5mm;
        }

        .pdf-address-card h4 {
          font-size: 9.5pt;

          font-weight: 700;

          color: #16336b;

          margin: 0 0 2mm 0;
        }

        .pdf-address-card p {
          font-size: 9pt;

          color: #475569;

          margin: 0 0 0.5mm 0;

          line-height: 1.4;
        }

        /* =====================================================
           INFO GRID
        ===================================================== */

        .pdf-info-grid {
          display: grid;

          grid-template-columns:
            1fr
            1fr
            1fr;

          gap: 3mm 6mm;

          margin-bottom: 6mm;
        }

        .pdf-info-row {
          display: flex;
          flex-direction: column;

          border-bottom: 1px solid #f1f5f9;

          padding-bottom: 1.5mm;
        }

        .pdf-info-label {
          font-size: 7.5pt;

          font-weight: 600;

          color: #1b8fd2;

          text-transform: uppercase;

          letter-spacing: 0.03em;
        }

        .pdf-info-value {
          font-size: 9.5pt;

          color: #1e293b;

          font-weight: 500;
        }

        /* =====================================================
           TABLE
        ===================================================== */

        .pdf-table {
          width: 100%;

          border-collapse: collapse;

          margin-bottom: 3mm;

          font-size: 8.5pt;
        }

        .pdf-table thead th {
          background: #f8fafc;

          color: #475569;

          font-weight: 600;

          text-transform: uppercase;

          letter-spacing: 0.03em;

          font-size: 7.5pt;

          padding: 2.5mm 3mm;

          border-bottom: 1px solid #cbd5e1;

          text-align: left;

          white-space: nowrap;

          vertical-align: middle;
        }

        .pdf-table thead th.right {
          text-align: right;

          min-width: 14mm;
        }

        .pdf-table thead th.center {
          text-align: center;
        }

        .pdf-table tbody td {
          padding: 2.5mm 3mm;

          border-bottom: 1px solid #e2e8f0;

          color: #1e293b;

          vertical-align: top;
        }

        .pdf-table tbody td.right {
          text-align: right;

          white-space: nowrap;

          min-width: 14mm;
        }

        .pdf-table tbody td.center {
          text-align: center;
        }

        .pdf-table tbody tr:nth-child(even) {
          background: #f8fafc;
        }

        /* =====================================================
           TOTALS
        ===================================================== */

        .pdf-totals {
          width: 45%;

          margin-left: auto;

          font-size: 9pt;
        }

        .pdf-total-row {
          display: flex;

          justify-content: space-between;

          padding: 1.5mm 3mm;

          border-bottom: 1px solid #f1f5f9;
        }

        .pdf-total-row.grand {
          font-weight: 700;

          font-size: 10.5pt;

          color: #16336b;

          border-bottom: 2px solid #16336b;

          padding-top: 2.5mm;

          margin-top: 1mm;
        }

        .pdf-total-label {
          color: #64748b;
        }

        .pdf-total-row.grand .pdf-total-label {
          color: #16336b;
        }

        /* =====================================================
           EMPTY
        ===================================================== */

        .pdf-no-data {
          text-align: center;

          color: #94a3b8;

          font-style: italic;

          padding: 4mm;
        }

        /* =====================================================
           PRINT
        ===================================================== */

        @page {
          size: A4;
          margin: 0;
        }

        @media print {

          html,
          body {
            width: 210mm;
            margin: 0;
            padding: 0;
            background: #ffffff;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .pdf-page {
            width: 210mm;

            min-height: auto;

            margin: 0;

            box-shadow: none;

            overflow: visible;
          }

          /*
           * Header
           */

          .pdf-header {
            position: fixed;

            top: 0;
            left: 0;
            right: 0;

            height: 42mm;

            z-index: 100;
          }

          /*
           * Footer
           */

          .pdf-footer {
            position: fixed;

            bottom: 0;
            left: 0;
            right: 0;

            height: 26mm;

            z-index: 100;
          }

          /*
           * Watermark
           */

          .pdf-watermark {
            display: flex;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1;
          }

          /*
           * Content
           *
           * Reserve header/footer space.
           */

          .pdf-content {
            padding-top: 44mm;

            padding-bottom: 34mm;

            position: relative;

            z-index: 2;
          }

          /*
           * Prevent tables/sections from
           * breaking unnecessarily.
           */

          .pdf-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .pdf-address-card {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .pdf-info-row {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .pdf-table {
            break-inside: auto;
          }

          .pdf-table thead {
            display: table-header-group;
          }

          .pdf-table tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          .pdf-totals {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }

        /* =====================================================
           RESPONSIVE PREVIEW
        ===================================================== */

        @media screen and (max-width: 230mm) {

          .pdf-page {
            width: 100%;
            margin: 0;
          }

          .pdf-contact {
            grid-template-columns: 1fr;

            gap: 4mm;
          }

          .pdf-contact-item:last-child {
            justify-content: flex-start;
          }

          .pdf-addresses {
            grid-template-columns: 1fr;
          }

          .pdf-info-grid {
            grid-template-columns: 1fr 1fr;
          }

          .pdf-totals {
            width: 60%;
          }
        }

      `}</style>

      <div
        ref={ref}
        className={`pdf-page ${className}`}
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <PdfHeader title={title} />

        {/* ===================================================
            WATERMARK
        =================================================== */}
        <div className="pdf-watermark">
          <img
            src={watermarkImageUrl}
            alt=""
            aria-hidden="true"
          />
        </div>

        {/* ===================================================
            DYNAMIC CONTENT
        =================================================== */}

        <main className="pdf-content">
          {children}
        </main>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <PdfFooter />

      </div>
    </>
  );
});

PdfLayout.displayName = "PdfLayout";

export default PdfLayout;