const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const db = new Database('database.db');
db.pragma('foreign_keys = ON');

const saltRounds = 12;

// Создание таблиц (при первом запуске)
db.exec(`
CREATE TABLE IF NOT EXISTS therapists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  age INTEGER,
  gender TEXT,
  therapist_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES therapists(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  sud_rating INTEGER CHECK (sud_rating BETWEEN 0 AND 10),
  session_quality INTEGER CHECK (session_quality BETWEEN 0 AND 10),
  therapist_notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);
`);

// Добавление дефолтного терапевта и связанных пациентов
const getTherapist = db.prepare('SELECT id FROM therapists WHERE email = ?');
let therapistRow = getTherapist.get('ivanov@example.com');
let therapistId;

if (!therapistRow) {
  const hash = bcrypt.hashSync('password', saltRounds); // замените на реальный пароль или env
  const insertTherapist = db.prepare('INSERT INTO therapists (name, email, password) VALUES (?, ?, ?)');
  insertTherapist.run('Dr. Иванов', 'ivanov@example.com', hash);
  therapistRow = getTherapist.get('ivanov@example.com');
}

// Привязанные пациенты
const existingPatients = db.prepare('SELECT COUNT(*) as c FROM patients WHERE therapist_id = ?').get(therapistRow.id);
therapistId = therapistRow.id;

if (existingPatients.c === 0) {
  const insertPatient = db.prepare('INSERT INTO patients (name, age, gender, therapist_id) VALUES (?, ?, ?, ?)');
  const patientsToSeed = [
    { name: 'Анна Петрова', age: 29, gender: 'ж' },
    { name: 'Игорь Васильев', age: 42, gender: 'м' },
    { name: 'Мария Смирнова', age: 34, gender: 'ж' }
  ];
  for (const p of patientsToSeed) {
    insertPatient.run(p.name, p.age, p.gender, therapistId);
  }
}

module.exports = db;
