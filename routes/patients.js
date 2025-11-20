const router = require('express').Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

// Middleware
function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Нет токена' });
  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.therapistId = payload.therapistId;
    next();
  } catch (e) {
    res.status(401).json({ error: 'Неверный токен' });
  }
}

// GET /api/patients
router.get('/', auth, (req, res) => {
  const rows = db.prepare('SELECT id, name, age, gender FROM patients WHERE therapist_id = ?').all(req.therapistId);
  res.json(rows);
});

// GET /api/patients/:id
router.get('/:id', auth, (req, res) => {
  const patient = db.prepare('SELECT id, name, age, gender, therapist_id FROM patients WHERE id = ? AND therapist_id = ?')
  .get(req.params.id, req.therapistId);
  if (!patient) return res.status(404).json({ error: 'Пациент не найден или не принадлежит вашему кабинету' });


const sessions = db.prepare('SELECT id, date, sud_rating, session_quality, therapist_notes FROM sessions WHERE patient_id = ? ORDER BY date DESC')
                    .all(patient.id);
  res.json({ patient, sessions });
});

// POST /api/patients/:id/sessions
router.post('/:id/sessions', auth, (req, res) => {
  const { sudRating, sessionQuality, therapistNotes } = req.body;


// Проверка, что пациент принадлежит текущему терапевту
  const patient = db.prepare('SELECT id FROM patients WHERE id = ? AND therapist_id = ?').get(req.params.id, req.therapistId);
  if (!patient) return res.status(404).json({ error: 'Пациент не найден или не принадлежит вам' });


// Валидация
  const sud = Number(sudRating);
  const qual = Number(sessionQuality);
  if (Number.isNaN(sud) || sud < 0 || sud > 10) return res.status(400).json({ error: 'sudRating должен быть числом 0-10' });
  if (Number.isNaN(qual) || qual < 0 || qual > 10) return res.status(400).json({ error: 'sessionQuality должен быть числом 0-10' });


  const stmt = db.prepare('INSERT INTO sessions (patient_id, sud_rating, session_quality, therapist_notes) VALUES (?, ?, ?, ?)');
  const info = stmt.run(patient.id, sud, qual, therapistNotes || '');
  res.json({ id: info.lastInsertRowid, patient_id: patient.id, sud_rating: sud, session_quality: qual, therapist_notes: therapistNotes || '' });
});


module.exports = router;