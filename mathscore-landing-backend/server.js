const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Disable caching for all API responses so the landing page always gets the latest data
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

const DB_FILE = path.join(__dirname, 'db.json');

const defaultData = {
  settings: {
    heroTitle: "SAT Matematikani zamonaviy metodlar yordamida, ingliz tilida tez va samarali o'rganing",
    heroSubtitle: "Jahon standartlariga mos ta'lim. Yuqori ball oling va nufuzli xorijiy universitetlarga grant yutish imkoniyatini qo'lga kiriting.",
    contactPhone: "+998 99 824 46 18",
    contactAddress: "Toshkent shahri, Sergeli tumani",
    telegramLink: "https://t.me/math_teacher_m"
  },
  results: [
    { id: 1, score: 'SAT 1520', name: 'Azizbek K.', color: 'text-primary' },
    { id: 2, score: 'SAT 1480', name: 'Malika O.', color: 'text-tertiary' },
    { id: 3, score: 'A-Level A*', name: 'Sardor T.', color: 'text-secondary' },
    { id: 4, score: 'SAT 1550', name: 'Durdona S.', color: 'text-primary' }
  ],
  pricing: [
    { id: 1, title: 'SAT Matematika', description: 'Noldan boshlab yuqori darajagacha intensiv tayyorgarlik. Ingliz tilida masalalar yechish.', price: '600,000', type: 'primary' },
    { id: 2, title: 'A-Level Math', description: 'Kembrij dasturi asosida chuqurlashtirilgan matematika. Pure Math va Mechanics.', price: '700,000', type: 'tertiary' },
    { id: 3, title: 'Matematika Foundation', description: 'Asosiy matematik bilimlarni mustahkamlash va ingliz tilidagi terminlarga moslashish.', price: '500,000', type: 'secondary' }
  ]
};

function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.get('/api/settings', (req, res) => {
  const db = readDB();
  res.json(db.settings);
});

app.put('/api/settings', (req, res) => {
  const db = readDB();
  db.settings = { ...db.settings, ...req.body };
  writeDB(db);
  res.json(db.settings);
});

app.get('/api/results', (req, res) => {
  const db = readDB();
  res.json(db.results);
});

app.post('/api/results', (req, res) => {
  const db = readDB();
  const newResult = { id: Date.now(), ...req.body };
  db.results.push(newResult);
  writeDB(db);
  res.json(newResult);
});

app.delete('/api/results/:id', (req, res) => {
  const db = readDB();
  db.results = db.results.filter(r => r.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

app.put('/api/results/bulk', (req, res) => {
  const db = readDB();
  db.results = req.body;
  writeDB(db);
  res.json({ success: true });
});

app.get('/api/pricing', (req, res) => {
  const db = readDB();
  res.json(db.pricing);
});

app.post('/api/pricing', (req, res) => {
  const db = readDB();
  const newPricing = { id: Date.now(), ...req.body };
  db.pricing.push(newPricing);
  writeDB(db);
  res.json(newPricing);
});

app.delete('/api/pricing/:id', (req, res) => {
  const db = readDB();
  db.pricing = db.pricing.filter(p => p.id !== parseInt(req.params.id));
  writeDB(db);
  res.json({ success: true });
});

app.put('/api/pricing/bulk', (req, res) => {
  const db = readDB();
  db.pricing = req.body;
  writeDB(db);
  res.json({ success: true });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Landing backend running on port ${PORT}`);
});
