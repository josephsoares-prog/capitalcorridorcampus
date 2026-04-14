const fs = require("fs");
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
        ShadingType, PageBreak, PageNumber, LevelFormat, ExternalHyperlink } = require("docx");

const NAVY = "1B3154";
const GOLD = "C9A227";
const DARK = "333333";
const LIGHT_GOLD = "FFF8E7";
const LIGHT_GREY = "F5F5F5";
const WHITE = "FFFFFF";

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: NAVY, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: WHITE, font: "Georgia", size: 20 })] })]
  });
}

function dataCell(text, width, opts = {}) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shade ? { fill: LIGHT_GREY, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: [new TextRun({ text, font: "Georgia", size: 20, color: DARK, bold: opts.bold || false })] })]
  });
}

function statusCell(status, width) {
  const colors = { "Delivered": "228B22", "MVP Live": "228B22", "In Progress": GOLD, "Planned": "666666", "Active": GOLD };
  const color = colors[status] || DARK;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    margins: cellMargins,
    children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: status, font: "Georgia", size: 20, color, bold: true })] })]
  });
}

const sections = [];

// ═══════════════════════════════════════════
// COVER PAGE
// ═══════════════════════════════════════════
sections.push({
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    }
  },
  children: [
    // Navy background effect via spacing
    new Paragraph({ spacing: { before: 4000 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "IBPROM CORP", font: "Georgia", size: 22, color: GOLD, bold: true, characterSpacing: 200 })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "\u2014", font: "Georgia", size: 22, color: GOLD })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "STRATEGIC ADVISORY", font: "Georgia", size: 20, color: NAVY, characterSpacing: 150 })]
    }),
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "CAPITAL CORRIDOR CAMPUS", font: "Georgia", size: 40, bold: true, color: NAVY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: "Strategic Engagement Overview", font: "Georgia", size: 28, color: DARK })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [new TextRun({ text: "UPDATE \u2014 April 14, 2026", font: "Georgia", size: 24, color: GOLD, bold: true })]
    }),
    new Paragraph({ spacing: { before: 800 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Prepared for", font: "Georgia", size: 20, color: "888888", italics: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "Dr. Nader Dormani", font: "Georgia", size: 26, color: NAVY, bold: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [new TextRun({ text: "Prepared by", font: "Georgia", size: 20, color: "888888", italics: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: "Joseph Soares, MBA, Adm.A., PMP", font: "Georgia", size: 22, color: NAVY })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 40 },
      children: [new TextRun({ text: "President, IBPROM Corp", font: "Georgia", size: 20, color: DARK })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [new TextRun({ text: "josephsoares.com", font: "Georgia", size: 20, color: GOLD })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200 },
      children: [new TextRun({ text: "CONFIDENTIAL", font: "Georgia", size: 18, color: GOLD, bold: true, characterSpacing: 200 })]
    }),
  ]
});

// ═══════════════════════════════════════════
// MAIN CONTENT
// ═══════════════════════════════════════════

const contentMargin = { top: 1440, right: 1440, bottom: 1440, left: 1440 };

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 200 },
    children: [new TextRun({ text, font: "Georgia", size: 28, bold: true, color: NAVY })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 160 },
    children: [new TextRun({ text, font: "Georgia", size: 24, bold: true, color: NAVY })]
  });
}

function body(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text, font: "Georgia", size: 22, color: DARK, italics: opts.italic || false, bold: opts.bold || false })]
  });
}

function bodyRuns(runs) {
  return new Paragraph({
    spacing: { after: 160 },
    children: runs.map(r => new TextRun({ text: r.text, font: "Georgia", size: 22, color: DARK, bold: r.bold || false, italics: r.italic || false }))
  });
}

function goldRule() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 1 } },
    children: []
  });
}

const mainChildren = [

  // ── 1. PURPOSE OF THIS UPDATE ──
  heading1("1. Purpose of This Update"),
  goldRule(),

  body("This document updates the Strategic Engagement Overview originally delivered on April 11, 2026. It reflects the substantial progress made over the past three days across the Capital Corridor Campus advisory engagement, including new deliverables completed, tools deployed, and milestones reached."),

  body("The original engagement structure remains unchanged: eight independent component projects, each with its own analysis, financial model, and funding pathway. What has changed is the pace of execution and the volume of completed work. This update documents that progress for your records and for coordination with your professional advisors."),

  // ── 2. NEW DELIVERABLES SINCE APRIL 11 ──
  heading1("2. New Deliverables Since April 11"),
  goldRule(),

  heading2("2.1 Advisory Command Centre"),
  body("A secure, bilingual digital command centre has been built and deployed at campuscorridor.ca/command-centre.html. This is a password-protected portal that provides a real-time view of the entire advisory engagement: completed deliverables with downloadable documents, the eight engagement components with status indicators, the advisory team, a project timeline, and property information. Access code: CCC2026."),
  body("This tool was built so that you and your advisors can see the full scope of work at any time, without needing to sort through emails or files. It is updated regularly as new deliverables are completed."),

  heading2("2.2 Partnership Opportunity Document"),
  body("A professional partnership opportunity document has been prepared for institutional outreach. This document introduces the Capital Corridor Campus concept to potential institutional partners \u2014 universities, colleges, government agencies, and non-profit organizations \u2014 and describes the partnership model, available spaces, what the Campus brings to the table, and what we are looking for in a collaborator. It is designed to be sent directly to the heads of institutions we approach."),

  heading2("2.3 Salon-\u00C9cole Partnership Proposition (French)"),
  body("A French-language partnership proposition has been prepared specifically for the salon-academy concept, targeting francophone educational institutions. This document presents the ground floor opportunity, the hybrid salon-\u00E9cole model, what we bring (space, project management, government funding access), and what we seek in a partner (accreditation, teaching expertise, student pipeline). It is ready for distribution to C\u00E9gep de l\u2019Outaouais, the Commission scolaire des Draveurs, and private training institutions."),

  heading2("2.4 Ground Floor Commercial Listing Page"),
  body("A dedicated commercial listing page has been built and deployed for the ground floor space at 179 Promenade du Portage. The page includes professional photography, interactive floor plans, unit specifications, pricing ($4,800/month), and a direct inquiry form. This listing is now live at campuscorridor.ca/179-ground-floor.html and is being referenced in all broker communications."),

  heading2("2.5 Blog & Content Expansion"),
  body("The website content library has expanded from 25 articles to over 90 published blog articles in English and French. Topics cover tax implications of commercial property in Quebec, virtual office market trends, federal hybrid work policy impacts, LEED certification benefits, neighbourhood and restaurant guides, and parking solutions. All articles include structured data for search engine optimization."),

  heading2("2.6 Website Enhancements"),
  body("Several technical improvements have been made to the website: building exterior photography has been added, property pages have been enhanced with interactive galleries, a bilingual corridor page has been added showcasing the Promenade du Portage commercial ecosystem, and a cookies/privacy/terms infrastructure has been deployed for regulatory compliance."),

  // ── 3. ENGAGEMENT STATUS DASHBOARD ──
  heading1("3. Engagement Component Status"),
  goldRule(),

  body("The following table summarizes the current status of all eight engagement components as of April 14, 2026."),
  new Paragraph({ spacing: { after: 100 }, children: [] }),

  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [500, 3200, 1200, 4460],
    rows: [
      new TableRow({ children: [
        headerCell("#", 500),
        headerCell("Component", 3200),
        headerCell("Status", 1200),
        headerCell("Key Update", 4460),
      ]}),
      new TableRow({ children: [
        dataCell("1", 500), dataCell("Hybrid Salon-Academy Feasibility", 3200, { bold: true }),
        statusCell("Delivered", 1200),
        dataCell("Analysis (EN+FR) delivered. Partnership proposition (FR) ready. ESSOR application in preparation with your accountant.", 4460)
      ]}),
      new TableRow({ children: [
        dataCell("2", 500), dataCell("Virtual Office & Flexible Workspace", 3200, { bold: true }),
        statusCell("MVP Live", 1200),
        dataCell("Three-tier product live on website. PayPal payment links active. Awaiting first transaction to validate model.", 4460)
      ]}),
      new TableRow({ children: [
        dataCell("3", 500), dataCell("Innovation & Research Laboratory", 3200, { bold: true }),
        statusCell("Planned", 1200),
        dataCell("Non-profit entity design phase. Institutional partner identification in progress. CED and NSERC funding pathways mapped.", 4460)
      ]}),
      new TableRow({ children: [
        dataCell("4", 500), dataCell("Leadership & Professional Training", 3200, { bold: true }),
        statusCell("Planned", 1200),
        dataCell("Partnership opportunity document ready for distribution to training providers. Existing tenant conversion strategy defined.", 4460)
      ]}),
      new TableRow({ children: [
        dataCell("5", 500), dataCell("Government Funding Strategy", 3200, { bold: true }),
        statusCell("In Progress", 1200),
        dataCell("ESSOR Volet 1A application in preparation. CanadaBuys, MERX, and SEAO registrations complete. Cross-component funding map active.", 4460)
      ]}),
      new TableRow({ children: [
        dataCell("6", 500), dataCell("Tax & Wealth Architecture", 3200, { bold: true }),
        statusCell("Planned", 1200),
        dataCell("Strategic considerations memo delivered April 11. Coordination with your accountant to follow. Holding company and family trust observations prepared.", 4460)
      ]}),
      new TableRow({ children: [
        dataCell("7", 500), dataCell("Capital Attraction Strategy", 3200, { bold: true }),
        statusCell("In Progress", 1200),
        dataCell("International proposal review complete (\u00D6zt\u00FCrk Holding). Counter-proposal framework delivered. Positioning strategy for global capital being developed.", 4460)
      ]}),
      new TableRow({ children: [
        dataCell("8", 500), dataCell("Governance & Entity Structure", 3200, { bold: true }),
        statusCell("Planned", 1200),
        dataCell("Advisory board composition defined. Non-profit formation framework in development. Professional management practices being documented.", 4460)
      ]}),
    ]
  }),

  new Paragraph({ spacing: { after: 200 }, children: [] }),

  // ── 4. CUMULATIVE WORK INVENTORY ──
  heading1("4. Cumulative Work Inventory"),
  goldRule(),

  body("The following is a complete inventory of work delivered across the engagement to date. This represents the foundation on which all eight components are being built."),

  new Paragraph({ spacing: { after: 100 }, children: [] }),

  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4000, 3200, 2160],
    rows: [
      new TableRow({ children: [
        headerCell("Deliverable", 4000),
        headerCell("Category", 3200),
        headerCell("Date", 2160),
      ]}),
      ...([
        ["CCC Brand & Positioning System", "Brand Strategy", "March 2026"],
        ["campuscorridor.ca \u2014 Full Bilingual Website", "Digital Platform", "March 2026"],
        ["Property Pages (179 + 191)", "Digital Platform", "March 2026"],
        ["Virtual Office Product (3 tiers)", "Revenue Product", "March 2026"],
        ["Flex Space Product (3 tiers)", "Revenue Product", "March 2026"],
        ["Property Fact Sheets (EN + FR)", "Marketing", "March 2026"],
        ["Google Business Profile (Verified)", "Marketing", "March 2026"],
        ["Yelp for Business Profile (Claimed)", "Marketing", "April 2026"],
        ["CanadaBuys Registration (100%)", "Gov\u2019t Procurement", "April 2026"],
        ["MERX Registration", "Gov\u2019t Procurement", "April 2026"],
        ["SEAO Registration + Alerts", "Gov\u2019t Procurement", "April 2026"],
        ["Commercial Broker Outreach Program", "Distribution", "March 2026"],
        ["\u00D6zt\u00FCrk Holding Proposal Review", "Capital Attraction", "April 2026"],
        ["Counter-Proposal Framework + Letter", "Capital Attraction", "April 2026"],
        ["Salon-Academy Feasibility (EN + FR)", "Component 1", "April 11"],
        ["Salon-\u00C9cole Partnership Proposition (FR)", "Component 1", "April 13"],
        ["Partnership Opportunity Document", "Institutional Outreach", "April 13"],
        ["Strategic Considerations Memo", "Component 6", "April 11"],
        ["Ground Floor Commercial Listing", "Digital Platform", "April 13"],
        ["Advisory Command Centre (HTML)", "Project Management", "April 13"],
        ["90+ SEO Blog Articles (EN + FR)", "Content Marketing", "Ongoing"],
        ["100-Day Content Calendar", "Content Strategy", "April 2026"],
        ["LinkedIn Post Series (EN + FR)", "Social Marketing", "April 2026"],
        ["Virtual Tour Videos (179 + 191)", "Marketing", "March 2026"],
        ["GA4 Analytics Integration", "Digital Platform", "March 2026"],
        ["Google Search Console (3 properties)", "SEO", "April 2026"],
        ["PayPal Payment Links (6 products)", "Revenue Infrastructure", "April 2026"],
        ["Thank-You Confirmation Page", "Lead Capture", "April 2026"],
        ["Corridor Page (Bilingual)", "Digital Platform", "April 13"],
      ]).map(([name, cat, date]) =>
        new TableRow({ children: [
          dataCell(name, 4000),
          dataCell(cat, 3200),
          dataCell(date, 2160),
        ]})
      )
    ]
  }),

  new Paragraph({ spacing: { after: 200 }, children: [] }),
  bodyRuns([
    { text: "Total deliverables to date: ", bold: true },
    { text: "29 major items across brand strategy, digital platform, revenue products, government procurement, institutional outreach, capital attraction, and project management." }
  ]),

  // ── 5. DIGITAL PLATFORM SUMMARY ──
  heading1("5. Digital Platform Summary"),
  goldRule(),

  body("The digital infrastructure supporting the Campus has reached a significant scale. The following metrics reflect the current state of the platform:"),

  new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [5000, 4360],
    rows: [
      new TableRow({ children: [headerCell("Metric", 5000), headerCell("Value", 4360)] }),
      ...([
        ["Total web pages published", "96+"],
        ["Blog articles (EN + FR)", "90+"],
        ["Product pages live", "6 (3 Virtual Office + 3 Flex Space)"],
        ["Property pages", "4 (179, 191, ground floor, corridor)"],
        ["Payment links active", "6 (PayPal \u2014 interim)"],
        ["Google Business Profile", "Verified \u2014 13 customer interactions"],
        ["Yelp for Business", "Claimed \u2014 pending approval"],
        ["Government platforms registered", "3 (CanadaBuys, MERX, SEAO)"],
        ["Analytics tracking", "GA4 active on all pages"],
        ["Search engine coverage", "3 properties verified in GSC"],
      ]).map(([m, v]) =>
        new TableRow({ children: [dataCell(m, 5000), dataCell(v, 4360, { bold: true })] })
      )
    ]
  }),

  new Paragraph({ spacing: { after: 200 }, children: [] }),

  // ── 6. ADVISORY COMMAND CENTRE ──
  heading1("6. Advisory Command Centre"),
  goldRule(),

  body("A secure command centre has been deployed to provide you and your advisors with a real-time view of the engagement. The command centre is accessible at:"),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: "campuscorridor.ca/command-centre.html", font: "Georgia", size: 24, bold: true, color: NAVY })]
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text: "Access Code: CCC2026", font: "Georgia", size: 22, color: GOLD, bold: true })]
  }),
  body("The command centre includes: a dashboard with key metrics, all completed deliverables with downloadable documents, the eight engagement components with current status, the advisory team, a project timeline, and property information. It is bilingual (English and French) and designed for use on any device."),
  body("This command centre can be shared with your accountant and legal counsel as needed. It provides a single reference point for the entire engagement without requiring access to internal files or email threads."),

  // ── 7. NEXT STEPS ──
  heading1("7. Immediate Next Steps"),
  goldRule(),

  bodyRuns([
    { text: "ESSOR Volet 1A Application", bold: true },
    { text: " \u2014 being finalized with your accountant for submission. Covers the salon-academy feasibility study and reimburses up to 50% of eligible consulting fees. This is the first revenue event for the engagement." }
  ]),
  bodyRuns([
    { text: "Salon-\u00C9cole Institutional Outreach", bold: true },
    { text: " \u2014 the French-language partnership proposition is ready for distribution. C\u00E9gep de l\u2019Outaouais, the Commission scolaire des Draveurs, and select private training institutions are the primary targets. We are prepared to begin outreach on your approval." }
  ]),
  bodyRuns([
    { text: "Virtual Office First Transaction", bold: true },
    { text: " \u2014 the product is live and payment-ready. First confirmed booking validates the model and triggers expansion planning. Marketing activation is in progress." }
  ]),
  bodyRuns([
    { text: "Tax & Wealth Architecture Coordination", bold: true },
    { text: " \u2014 preliminary observations have been delivered in the Strategic Considerations Memo. The next step is coordination with your accountant to validate and refine these observations. This coordination is a priority." }
  ]),
  bodyRuns([
    { text: "Capital Attraction \u2014 Continued Development", bold: true },
    { text: " \u2014 building on the international proposal review, a structured approach to positioning your portfolio for global investment. The \u00D6zt\u00FCrk experience has provided a detailed understanding of how these relationships are negotiated." }
  ]),
  bodyRuns([
    { text: "Remaining Components", bold: true },
    { text: " \u2014 delivered in sequence over the engagement period, each with its own analysis, financial model, and funding application where applicable." }
  ]),

  new Paragraph({ spacing: { before: 600 }, children: [] }),

  new Paragraph({
    border: { top: { style: BorderStyle.SINGLE, size: 4, color: GOLD, space: 8 } },
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text: "IBPROM Corp", font: "Georgia", size: 22, color: NAVY, bold: true })]
  }),
  body("josephsoares.com"),
  body("Gatineau, Quebec"),
];

sections.push({
  properties: {
    page: {
      size: { width: 12240, height: 15840 },
      margin: contentMargin
    }
  },
  headers: {
    default: new Header({
      children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Capital Corridor Campus \u2014 Strategic Engagement Overview \u2014 CONFIDENTIAL", font: "Georgia", size: 16, color: "999999", italics: true })]
      })]
    })
  },
  footers: {
    default: new Footer({
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: GOLD, space: 4 } },
        children: [
          new TextRun({ text: "IBPROM Corp  |  josephsoares.com  |  Page ", font: "Georgia", size: 16, color: "999999" }),
          new TextRun({ children: [PageNumber.CURRENT], font: "Georgia", size: 16, color: "999999" }),
        ]
      })]
    })
  },
  children: mainChildren
});

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Georgia", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Georgia", color: NAVY },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Georgia", color: NAVY },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 1 } },
    ]
  },
  sections
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/sessions/cool-awesome-volta/mnt/Capital_Corridor_Campus/CCC_Strategic_Engagement_Overview_Update_2026-04-14.docx", buffer);
  console.log("Strategy update DOCX created successfully.");
});
