require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();


app.use(express.json());
app.use(cors({
  origin: ['http://localhost:5173'], 
  credentials: true
}));


app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));

app.get('/', (req, res) => res.json({ ok: true, msg: 'PT backend' }));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});