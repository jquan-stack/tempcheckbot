import { pool } from './db';

export type Medication = 'Panadol' | 'Ibuprofen';

export async function createRecord(userId: number, childName: string, temperature: number, medication: Medication, dosage: number) {
  let childRes = await pool.query('SELECT id FROM children WHERE user_id = $1 AND name = $2', [userId, childName]);
  let childId: number;

  if (childRes.rowCount === 0) {
    const insertRes = await pool.query('INSERT INTO children (user_id, name) VALUES ($1, $2) RETURNING id', [userId, childName]);
    childId = insertRes.rows[0].id;
  } else {
    childId = childRes.rows[0].id;
  }

  await pool.query(
    'INSERT INTO records (user_id, child_id, timestamp, temperature, medication, dosage) VALUES ($1, $2, $3, $4, $5, $6)',
    [userId, childId, Date.now(), temperature, medication, dosage]
  );
}

export async function getRecords(userId: number, childName: string, range: '6h' | '12h' | '1d' | '3d' | '7d') {
  const msMap = {
    '6h': 6 * 3600 * 1000,
    '12h': 12 * 3600 * 1000,
    '1d': 24 * 3600 * 1000,
    '3d': 3 * 24 * 3600 * 1000,
    '7d': 7 * 24 * 3600 * 1000,
  };
  const since = Date.now() - msMap[range];

  const res = await pool.query(
    `SELECT r.* FROM records r
     JOIN children c ON r.child_id = c.id
     WHERE r.user_id = $1 AND c.name = $2 AND r.timestamp >= $3
     ORDER BY r.timestamp DESC`,
    [userId, childName, since]
  );
  return res.rows;
}

export async function getNextFeed(userId: number, childName: string) {
  const res = await pool.query(
    `SELECT r.* FROM records r
     JOIN children c ON r.child_id = c.id
     WHERE r.user_id = $1 AND c.name = $2
     ORDER BY r.timestamp DESC`,
    [userId, childName]
  );
  const records = res.rows;
  const lastPanadol = records.find(r => r.medication === 'Panadol');
  const lastIbuprofen = records.find(r => r.medication === 'Ibuprofen');

  let nextPanadol = lastPanadol ? lastPanadol.timestamp + 4 * 3600 * 1000 : 0;
  let nextIbuprofen = lastIbuprofen ? lastIbuprofen.timestamp + 6 * 3600 * 1000 : 0;

  if (Math.abs(nextPanadol - nextIbuprofen) < 3600 * 1000) {
    if (nextPanadol < nextIbuprofen) nextIbuprofen += 3600 * 1000;
    else nextPanadol += 3600 * 1000;
  }

  return nextPanadol < nextIbuprofen
    ? { medication: 'Panadol', time: new Date(nextPanadol).toLocaleString() }
    : { medication: 'Ibuprofen', time: new Date(nextIbuprofen).toLocaleString() };
}
