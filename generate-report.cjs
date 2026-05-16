// generate-report.cjs  — run with: node generate-report.cjs
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'TEST_REPORT.pdf');
const doc = new PDFDocument({ margin: 40, size: 'A4', info: { Title: 'NoorStudio Pre-Launch QA Test Report', Author: 'NoorStudio' } });
doc.pipe(fs.createWriteStream(OUT));

// ── Colour palette ──────────────────────────────────────────────────────────
const C = {
  navy:       '#2d3a8c',
  amber:      '#f59e0b',
  white:      '#ffffff',
  bg:         '#f0f2ff',
  border:     '#dde1f0',
  muted:      '#6b7280',
  text:       '#1a1a2e',
  green:      '#2e7d32',
  blue:       '#1565c0',
  purple:     '#6a1b9a',
  orange:     '#e65100',
  greenBg:    '#e8f5e9',
  blueBg:     '#e3f2fd',
  purpleBg:   '#f3e5f5',
  orangeBg:   '#fff3e0',
  pass:       '#bbf7d0',
  fail:       '#fee2e2',
  partial:    '#fef9c3',
};

// ── Layout constants ────────────────────────────────────────────────────────
const PAGE_W   = doc.page.width  - 80;  // usable width
const LEFT     = 40;
const COL = {
  id:       40,
  layer:    60,
  feature:  120,
  howto:    220,
  expected: 160,
  pass:     55,
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function rgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function tag(x, y, label, fg, bg) {
  const w = doc.widthOfString(label, { size: 7 }) + 10;
  doc.roundedRect(x, y - 1, w, 12, 3).fillColor(bg).fill();
  doc.fillColor(fg).fontSize(7).font('Helvetica-Bold').text(label, x + 5, y + 1, { lineBreak: false });
  return w;
}

function sectionHeader(title, num) {
  // check if we need a new page (less than 60pt remaining)
  if (doc.y > doc.page.height - 120) doc.addPage();
  const y = doc.y;
  doc.rect(LEFT, y, PAGE_W, 20).fillColor(C.navy).fill();
  doc.fillColor(C.white).fontSize(9).font('Helvetica-Bold')
     .text(title.toUpperCase(), LEFT + 10, y + 5, { lineBreak: false });
  // badge
  const badgeText = `${num} test${num !== 1 ? 's' : ''}`;
  const bw = doc.widthOfString(badgeText, { size: 7 }) + 12;
  doc.roundedRect(LEFT + PAGE_W - bw - 8, y + 4, bw, 13, 6)
     .fillColor('rgba(255,255,255,0.25)').fill();
  doc.fillColor(C.white).fontSize(7).font('Helvetica-Bold')
     .text(badgeText, LEFT + PAGE_W - bw - 3, y + 7, { lineBreak: false });
  doc.moveDown(0.2);
}

function tableHeader() {
  const y = doc.y;
  doc.rect(LEFT, y, PAGE_W, 16).fillColor(C.bg).fill();
  doc.fillColor(C.muted).fontSize(7).font('Helvetica-Bold');
  let x = LEFT + 4;
  ['#', 'Layer', 'Feature', 'How to test', 'Expected result', 'Pass?'].forEach((h, i) => {
    const widths = [COL.id, COL.layer, COL.feature, COL.howto, COL.expected, COL.pass];
    doc.text(h, x, y + 4, { width: widths[i], lineBreak: false });
    x += widths[i];
  });
  doc.y = y + 16;
}

function row(id, layerLabel, layerFg, layerBg, feature, howto, expected, shade) {
  const startY = doc.y;

  // calculate row height based on tallest cell
  const howtoh  = doc.heightOfString(howto,    { width: COL.howto    - 6, fontSize: 8 });
  const expH    = doc.heightOfString(expected, { width: COL.expected - 6, fontSize: 8 });
  const featH   = doc.heightOfString(feature,  { width: COL.feature  - 6, fontSize: 8 });
  const rowH    = Math.max(howtoh, expH, featH, 28) + 10;

  // page break if needed
  if (startY + rowH > doc.page.height - 60) {
    doc.addPage();
    tableHeader();
    return row(id, layerLabel, layerFg, layerBg, feature, howto, expected, shade);
  }

  // background
  if (shade) doc.rect(LEFT, startY, PAGE_W, rowH).fillColor('#fafafe').fill();

  // border lines
  doc.rect(LEFT, startY, PAGE_W, rowH).strokeColor(C.border).lineWidth(0.4).stroke();

  let x = LEFT + 4;
  const textY = startY + 5;

  // ID
  doc.fillColor(C.navy).fontSize(8).font('Helvetica-Bold')
     .text(id, x, textY, { width: COL.id - 6, lineBreak: false });
  x += COL.id;

  // Layer tag
  tag(x, textY, layerLabel, layerFg, layerBg);
  x += COL.layer;

  // Feature
  doc.fillColor(C.text).fontSize(8).font('Helvetica-Bold')
     .text(feature, x, textY, { width: COL.feature - 6, lineBreak: true });
  x += COL.feature;

  // How to test
  doc.fillColor(C.text).fontSize(7.5).font('Helvetica')
     .text(howto, x, textY, { width: COL.howto - 6, lineBreak: true });
  x += COL.howto;

  // Expected
  doc.fillColor('#444').fontSize(7.5).font('Helvetica')
     .text(expected, x, textY, { width: COL.expected - 6, lineBreak: true });
  x += COL.expected;

  // Checkbox
  doc.rect(x + 14, textY + 1, 14, 14).strokeColor('#aaa').lineWidth(0.8).stroke();

  doc.y = startY + rowH;
}

// ── Cover / Header ──────────────────────────────────────────────────────────
// Logo bar
doc.rect(LEFT, 40, PAGE_W, 50).fillColor(C.navy).fill();
doc.fillColor(C.white).fontSize(22).font('Helvetica-Bold').text('NoorStudio', LEFT + 16, 52, { lineBreak: false });
doc.fillColor(C.amber).fontSize(22).font('Helvetica-Bold').text('  QA', LEFT + 140, 52, { lineBreak: false });
doc.fillColor(C.white).fontSize(10).font('Helvetica').text('Pre-Launch Test Report — All Implemented Features', LEFT + 16, 76, { lineBreak: false });
doc.y = 100;

// Meta row
doc.fillColor(C.muted).fontSize(8).font('Helvetica')
   .text(`Generated: May 2026    |    Tester: _______________________    |    Environment: _______________________`, LEFT, doc.y);
doc.moveDown(0.8);

// Summary cards
const cardW = (PAGE_W - 12) / 4;
const cards = [
  { n: '16', label: 'Features Implemented' },
  { n: '8',  label: 'Backend Routes / Models' },
  { n: '10', label: 'Frontend Components' },
  { n: '41', label: 'Total Test Cases' },
];
const cardY = doc.y;
cards.forEach((c, i) => {
  const cx = LEFT + i * (cardW + 4);
  doc.rect(cx, cardY, cardW, 44).strokeColor(C.border).lineWidth(0.5).stroke();
  doc.fillColor(C.navy).fontSize(22).font('Helvetica-Bold').text(c.n, cx + 10, cardY + 6, { lineBreak: false });
  doc.fillColor(C.muted).fontSize(7.5).font('Helvetica').text(c.label, cx + 10, cardY + 30, { width: cardW - 16 });
});
doc.y = cardY + 52;

// Legend
doc.fillColor(C.muted).fontSize(7.5).font('Helvetica')
   .text('Checkbox legend:   □ Pass   □ Fail   □ Partial  (mark after testing)', LEFT, doc.y);
doc.moveDown(1);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION A — Security & Auth
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('A — Security & Authentication', 4);
tableHeader();
row('A-01','Backend',  C.green,  C.greenBg,  'Password min 10 chars',
    'Go to /auth → Sign Up. Try password "short123" (8 chars). Then try "ValidPass10!".',
    'Short password is rejected with validation error. 10-char password proceeds.', false);
row('A-02','Backend',  C.green,  C.greenBg,  'Common password block',
    'Try to sign up with password "password123" or "qwerty12345".',
    'Server returns error: "This password is too common."', true);
row('A-03','Backend',  C.green,  C.greenBg,  'Disposable email block',
    'Sign up with test@mailinator.com or test@tempmail.org.',
    'OTP not sent. Error: "Disposable email addresses are not allowed."', false);
row('A-04','Backend',  C.green,  C.greenBg,  'Banned user login block',
    'In Admin panel, ban a test account. Then try to log in with that account.',
    'Login rejected: "Your account has been suspended. Contact support@noorstudio.app."', true);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION B — Session Management
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('B — Session Management', 3);
tableHeader();
row('B-01','Full Stack',C.purple, C.purpleBg,'Active sessions list',
    'Log in on two different browsers. Go to /app/preferences → "Active sessions" section.',
    'Both sessions listed with device type, IP, last-active time. Current session shows "Current" badge.', false);
row('B-02','Full Stack',C.purple, C.purpleBg,'Logout all other devices',
    'On Browser A click "Sign out all other devices." Switch to Browser B and navigate to any /app/* route.',
    'Browser B is redirected to /auth. Browser A session remains active.', true);
row('B-03','Backend',  C.green,  C.greenBg,  'New device login alert email',
    'Log in from a different IP (e.g., VPN). Check the registered email inbox.',
    'Email received: "New device login detected" with the new IP address and timestamp.', false);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION C — Email Preferences
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('C — Email Preferences & Unsubscribe', 3);
tableHeader();
row('C-01','Frontend', C.blue,   C.blueBg,   'Preferences page loads',
    'Navigate to /app/preferences.',
    'Page loads with 3 sections: (1) Email notifications with 4 toggles, (2) Active sessions, (3) Privacy & data.', false);
row('C-02','Full Stack',C.purple, C.purpleBg,'Save email preferences',
    'Toggle off "Marketing & promotions." Click "Save changes."',
    'Toast: "Preferences saved." Refresh — toggle remains off.', true);
row('C-03','Backend',  C.green,  C.greenBg,  'One-click unsubscribe link',
    'Open any marketing email. Click the "Unsubscribe" link in the footer.',
    'Confirms unsubscribe without requiring login. All marketing emails disabled for that account.', false);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION D — GDPR Data Export
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('D — GDPR Data Export', 2);
tableHeader();
row('D-01','Full Stack',C.purple, C.purpleBg,'Download my data',
    'Go to /app/preferences → "Privacy & data" → Click "Download my data."',
    'Browser downloads a JSON file with user profile, projects, characters, and transactions.', false);
row('D-02','Backend',  C.green,  C.greenBg,  'Export auth guard',
    'Open a private window and call GET /api/user/export without a token.',
    'Server returns 401 Unauthorized. No data leaks.', true);

doc.addPage();

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION E — Report Button
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('E — In-Product Report Button', 3);
tableHeader();
row('E-01','Frontend', C.blue,   C.blueBg,   'Report button in editor',
    'Open any project at /app/projects/:id. Look at the dark status bar at the very bottom of the editor.',
    'A small flag icon button is visible. Hovering shows tooltip "Report this content."', false);
row('E-02','Frontend', C.blue,   C.blueBg,   'Report dialog flow',
    'Click the flag icon. Select "Inappropriate content." Add a description. Click "Submit Report."',
    'Dialog shows green checkmark success state: "Report submitted. Our team will review this shortly."', true);
row('E-03','Admin',    C.orange, C.orangeBg, 'Report in admin queue',
    'After submitting a report, go to /admin → Reports tab.',
    'Report appears with status "pending." Admin can click Review, Dismiss, or add an internal Note.', false);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION F — Admin Panel
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('F — Admin Panel', 6);
tableHeader();
row('F-01','Admin',    C.orange, C.orangeBg, 'Admin access guard',
    'Log in as a regular user. Navigate to /admin.',
    'Access denied — redirect or error. Only role:admin accounts can enter.', false);
row('F-02','Admin',    C.orange, C.orangeBg, 'Stats dashboard',
    'Log in as admin. Open /admin. Observe the 6 stat cards.',
    'Cards show: Total Users, Signups Today, Active Subs, Banned, Projects, AI Cost Today. Auto-refresh every 60s.', true);
row('F-03','Admin',    C.orange, C.orangeBg, 'Ban / Unban user',
    'Users tab → 3-dot menu → "Ban user" → enter reason. Then unban via same menu.',
    'User row shows banned indicator. Banned count increments. Banned user cannot log in. Unban restores login.', false);
row('F-04','Admin',    C.orange, C.orangeBg, 'Adjust credits',
    'Users tab → 3-dot menu → "Adjust credits" → enter +50 → Submit.',
    'Toast: "Credits adjusted." Credit count in the table updates immediately.', true);
row('F-05','Admin',    C.orange, C.orangeBg, 'View user books',
    'Users tab → 3-dot menu → "View books."',
    'Modal opens with a table of that user\'s books: title, status, creation date.', false);
row('F-06','Admin',    C.orange, C.orangeBg, 'Refund via Stripe',
    'Users tab → 3-dot menu → "Refund" → enter a Stripe charge ID and amount.',
    'Toast: success. Refund is processed. Verify in Stripe dashboard.', true);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION G — Margin Dashboard
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('G — Admin Margin Dashboard', 2);
tableHeader();
row('G-01','Admin',    C.orange, C.orangeBg, 'Margin tab loads',
    'Go to /admin → click "Margin" tab.',
    'Three cards: Est. MRR ($), AI Cost 30d ($), Gross Margin (%). Margin is color-coded green/amber/red.', false);
row('G-02','Admin',    C.orange, C.orangeBg, 'Daily chart',
    'Observe the bar chart below the metric cards.',
    'Up to 14 rows, each with date label, blue revenue bar, red cost bar, and $ labels on the right.', true);

doc.addPage();

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION H — Cookie Consent
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('H — Cookie Consent Banner', 3);
tableHeader();
row('H-01','Frontend', C.blue,   C.blueBg,   'Banner for new users',
    'Open app in incognito (or clear localStorage). Navigate to any page.',
    'Cookie consent banner appears at the bottom: "Reject non-essential" and "Accept all" buttons.', false);
row('H-02','Frontend', C.blue,   C.blueBg,   'Accept persists',
    'Click "Accept all." Refresh the page.',
    'Banner does not reappear. localStorage key noor_cookie_consent = "all".', true);
row('H-03','Frontend', C.blue,   C.blueBg,   'Reject persists',
    'Clear localStorage. Click "Reject non-essential." Refresh.',
    'Banner does not reappear. noor_cookie_consent = "essential".', false);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION I — Onboarding Tour
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('I — In-App Onboarding Tour', 3);
tableHeader();
row('I-01','Frontend', C.blue,   C.blueBg,   'Tour appears (new accounts)',
    'Use account <7 days old. Clear noor_onboarding_seen from localStorage. Wait ~2 seconds after login.',
    'Onboarding tour dialog opens automatically: Step 1 "Create your Universe" with Sparkles header + progress dots.', false);
row('I-02','Frontend', C.blue,   C.blueBg,   'Tour navigation (4 steps)',
    'Click "Next" through all 4 steps: Universe → Characters → Knowledge Base → Generate Book.',
    'Each step shows correct icon, title, description, and action button. On step 4, "Create my first book" links to /app/books/new.', true);
row('I-03','Frontend', C.blue,   C.blueBg,   'Skip persists',
    'Click "Skip tour." Refresh the page.',
    'Tour does not reappear. noor_onboarding_seen = "true" in localStorage.', false);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION J — NPS Widget
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('J — NPS Feedback Widget', 3);
tableHeader();
row('J-01','Frontend', C.blue,   C.blueBg,   'Widget appears (7d+ accounts)',
    'Account older than 7 days. Clear noor_nps_last_shown from localStorage. Wait ~10 seconds.',
    'NPS widget slides in at bottom-right: "Quick feedback" header with score buttons 0–10.', false);
row('J-02','Full Stack',C.purple, C.purpleBg,'Score + comment submit',
    'Select score 8. Enter optional comment. Click "Submit."',
    'Widget shows green checkmark "Thank you!" state. Score stored — verify via GET /api/feedback as admin.', true);
row('J-03','Frontend', C.blue,   C.blueBg,   'Minimize & dismiss',
    'Click ">" chevron to minimize. Click floating "Share feedback" pill to restore. Click X to dismiss.',
    'Minimize collapses to pill button. Restore works. Dismiss hides for 30 days (sets localStorage key).', false);

doc.addPage();

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION K — Cancellation Save Flow
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('K — Cancellation Save Flow', 4);
tableHeader();
row('K-01','Frontend', C.blue,   C.blueBg,   'Modal opens (no browser confirm)',
    'Go to /app/billing. Click "Cancel Plan" (visible when subscription is active).',
    'A multi-step modal opens — NOT the browser native confirm() dialog. Title: "Before you go — why are you canceling?"', false);
row('K-02','Full Stack',C.purple, C.purpleBg,'Survey step',
    'Select a reason (e.g., "It\'s too expensive"). Add optional feedback. Click "Continue."',
    'Survey submitted to POST /api/payments/cancel-survey. Modal advances to offer step.', true);
row('K-03','Frontend', C.blue,   C.blueBg,   'Save offer — keep plan',
    'On offer step, click the "Keep your plan + credits" card.',
    'Toast: "Keep creating! Your plan remains active." Modal closes. Subscription unchanged.', false);
row('K-04','Full Stack',C.purple, C.purpleBg,'Confirm cancellation',
    'On offer step click "No thanks, still cancel." On confirm step click "Yes, cancel subscription."',
    'Subscription cancelled in Stripe (cancelAtPeriodEnd=true). Toast shown. Billing page shows "Cancels on [date]" badge.', true);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION L — Credit Rollover
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('L — Credit Rollover on Upgrade', 2);
tableHeader();
row('L-01','Backend',  C.green,  C.greenBg,  'Upgrade bonus credits',
    'Note current credit balance. Upgrade from Creator to Author plan via /app/billing.',
    'Credit balance increases by +50 (Author bonus). Transaction history shows "Upgrade bonus: creator → author".', false);
row('L-02','Backend',  C.green,  C.greenBg,  'Credits never reset on upgrade',
    'Check credit balance before and after upgrading from Creator to Studio.',
    'Existing credits are preserved. Studio upgrade adds +150 bonus on top of existing balance.', true);

doc.moveDown(0.6);

// ═══════════════════════════════════════════════════════════════════════════
//  SECTION M — AI Usage & Feedback
// ═══════════════════════════════════════════════════════════════════════════
sectionHeader('M — AI Usage & Feedback Endpoints', 3);
tableHeader();
row('M-01','Admin',    C.orange, C.orangeBg, 'AI Usage tab',
    'Go to /admin → "AI Usage" tab. Toggle between 7d / 14d / 30d views.',
    'Table updates with provider, model, stage, success/fail icon, and token counts. Summary bar shows totals.', false);
row('M-02','Full Stack',C.purple, C.purpleBg,'Feedback endpoint',
    'Submit NPS score via widget (J-02). Then call GET /api/feedback as admin.',
    'Response includes npsAverage and feedback records with type, score, comment, page, and timestamp.', true);
row('M-03','Backend',  C.green,  C.greenBg,  'Unauthenticated feedback blocked',
    'POST to /api/feedback without an Authorization header.',
    'Server returns 401 Unauthorized.', false);

// ═══════════════════════════════════════════════════════════════════════════
//  Footer / Sign-off
// ═══════════════════════════════════════════════════════════════════════════
doc.moveDown(1.5);
const footerY = doc.y;
doc.rect(LEFT, footerY, PAGE_W, 0.5).fillColor(C.navy).fill();
doc.moveDown(0.4);
doc.fillColor(C.muted).fontSize(7.5).font('Helvetica')
   .text('41 test cases  |  Backend routes added: 14  |  New models: 4 (Session, Feedback, Report, StripeEvent)  |  New frontend components: 10', LEFT, doc.y);

// Signature block
const sigY = doc.y + 12;
doc.fillColor(C.text).fontSize(8).font('Helvetica-Bold').text('Tester sign-off', LEFT + PAGE_W - 160, sigY - 14);
doc.rect(LEFT + PAGE_W - 160, sigY + 10, 155, 0.5).fillColor('#bbb').fill();
doc.fillColor(C.muted).fontSize(7).font('Helvetica').text('Signature & Date', LEFT + PAGE_W - 160, sigY + 13);

doc.fillColor('#bbb').fontSize(7).font('Helvetica')
   .text('NoorStudio Pre-Launch QA — Confidential', LEFT, sigY + 16, { align: 'center', width: PAGE_W - 160 });

doc.end();
console.log('✅  PDF written to:', OUT);
