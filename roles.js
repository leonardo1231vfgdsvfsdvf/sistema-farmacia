// backend/routes/roles.js
import express from 'express';
import db from '../db.js'; // asegúrate que tu conexión también use `export default`

const router = express.Router();

router.get('/roles', (req, res) => {
  db.query('SELECT id, rol FROM roles', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

export default router;
