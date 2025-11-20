const router = require('express').Router();
const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Логин терапевта
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email и password обязательны' });


const row = db.prepare('SELECT * FROM therapists WHERE email = ?').get(email);
  if (!row) return res.status(401).json({ error: 'Неправильные учетные данные' });


const ok = await bcrypt.compare(password, row.password);
  if (!ok) return res.status(401).json({ error: 'Неправильные учетные данные' });


const token = jwt.sign({ therapistId: row.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ token, therapist: { id: row.id, name: row.name, email: row.email } });
});


// При желании можно добавить маршрут регистрации/инициализации терапевтов
module.exports = router;