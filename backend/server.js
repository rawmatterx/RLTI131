/* Minimal Express backend for I-131 Therapy Assistant persistence */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const PORT = process.env.PORT || 3001;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN; // optional; if not set, allow all

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(cors(FRONTEND_ORIGIN ? { origin: FRONTEND_ORIGIN } : { origin: true }));

const dataDir = path.join(__dirname, 'data');
const assessmentsDir = path.join(dataDir, 'assessments');
const auditFile = path.join(dataDir, 'audit.json');

function ensureDataDirs() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(assessmentsDir)) fs.mkdirSync(assessmentsDir, { recursive: true });
  if (!fs.existsSync(auditFile)) fs.writeFileSync(auditFile, '[]');
}

function appendAudit(entry) {
  try {
    const audit = JSON.parse(fs.readFileSync(auditFile, 'utf-8'));
    audit.push(entry);
    fs.writeFileSync(auditFile, JSON.stringify(audit, null, 2));
  } catch (e) {
    console.error('Failed to write audit log', e);
  }
}

app.get('/health', (req, res) => {
  res.json({ ok: true, service: 'i131-backend', time: new Date().toISOString() });
});

app.post('/api/assessments', (req, res) => {
  ensureDataDirs();
  const payload = req.body || {};
  const id = payload.id || `asm-${Date.now()}`;
  const filePath = path.join(assessmentsDir, `${id}.json`);

  try {
    fs.writeFileSync(filePath, JSON.stringify(payload, null, 2));
    appendAudit({ id, event: 'assessment_saved', timestamp: new Date().toISOString(), status: payload.assessment?.status, rulebookVersion: payload.rulebookVersion });
    res.status(201).json({ id, saved: true });
  } catch (e) {
    console.error('Save failed', e);
    res.status(500).json({ error: 'Failed to save assessment' });
  }
});

app.get('/api/assessments', (req, res) => {
  ensureDataDirs();
  const files = fs.readdirSync(assessmentsDir).filter(f => f.endsWith('.json'));
  res.json({ count: files.length, files });
});

app.get('/api/assessments/:id', (req, res) => {
  ensureDataDirs();
  const filePath = path.join(assessmentsDir, `${req.params.id}.json`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  res.json(data);
});

app.get('/api/audit', (req, res) => {
  ensureDataDirs();
  const data = JSON.parse(fs.readFileSync(auditFile, 'utf-8'));
  res.json({ count: data.length, items: data });
});

app.listen(PORT, () => {
  ensureDataDirs();
  console.log(`I-131 backend listening on http://localhost:${PORT}`);
  if (FRONTEND_ORIGIN) console.log(`CORS allowed for ${FRONTEND_ORIGIN}`);
});
