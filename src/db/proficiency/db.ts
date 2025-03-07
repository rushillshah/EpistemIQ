import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as vscode from 'vscode';

import { applyMigrations } from '../migrations';

import { TOPIC_CATEGORIES } from '../../constants';

let db: Database | null = null;

export async function initDatabase(context: vscode.ExtensionContext) {
  const dbPath = vscode.Uri.joinPath(
    context.globalStorageUri,
    'proficiency.db'
  ).fsPath;
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
      CREATE TABLE IF NOT EXISTS meta (
        key TEXT PRIMARY KEY,
        value TEXT
      )
    `);

  await applyMigrations(db);

  await db.exec(`
      CREATE TABLE IF NOT EXISTS proficiency (
        topic TEXT PRIMARY KEY,
        accuracy REAL DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        average_time REAL DEFAULT 0,
        last_tested TEXT DEFAULT NULL
      );
    `);

  await reseedDatabase();
}

// async function ensureTopicsExist() {
//   if (!db) return;

//   for (const topic of TOPIC_CATEGORIES) {
//       const existing = await db.get('SELECT * FROM proficiency WHERE topic = ?', topic);

//       if (!existing) {
//         await db.run(
//           `INSERT INTO proficiency (topic, accuracy, total_questions, average_time, last_tested)
//            VALUES (?, ?, ?, ?, ?)`,
//           topic, 0, 0, 0, null
//         );
//       }
//   }
// }

export async function getProficiency(topic: string) {
  return db?.get('SELECT * FROM proficiency WHERE topic = ?', topic);
}

export async function updateProficiency(
  topic: string,
  isCorrect: boolean,
  responseTime: number
) {
  if (!db) return;

  const existing = await getProficiency(topic);
  const lastTested = new Date().toISOString();

  if (existing) {
    const newTotalQuestions = existing.total_questions + 1;
    const newAccuracy =
      (existing.accuracy * existing.total_questions + (isCorrect ? 100 : 0)) /
      newTotalQuestions;
    const newAverageTime =
      (existing.average_time * existing.total_questions + responseTime) /
      newTotalQuestions;

    await db.run(
      'UPDATE proficiency SET accuracy = ?, total_questions = ?, average_time = ?, last_tested = ? WHERE topic = ?',
      newAccuracy,
      newTotalQuestions,
      newAverageTime,
      lastTested,
      topic
    );
  } else {
    await db.run(
      `INSERT INTO proficiency (topic, accuracy, total_questions, average_time, last_tested) 
       VALUES (?, ?, ?, ?, ?)`,
      topic,
      isCorrect ? 100 : 0,
      1,
      responseTime,
      lastTested
    );
  }

  await insertQuizEntry(topic, isCorrect, responseTime);
}

export async function insertQuizEntry(
  topic: string,
  isCorrect: boolean,
  responseTime: number
) {
  if (!db) return;
  await db.run(
    `INSERT INTO quiz_entries (topic, is_correct, response_time) VALUES (?, ?, ?)`,
    topic,
    isCorrect ? 1 : 0,
    responseTime
  );
}

export async function getAllProficiency(): Promise<Proficiency[]> {
  if (!db) {
    return [];
  }

  try {
    const data = await db.all('SELECT * FROM proficiency');
    return data;
  } catch {
    return [];
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getQuizHistory(): Promise<any[]> {
  if (!db) return [];

  try {
    const data = await db.all(
      'SELECT * FROM quiz_entries ORDER BY timestamp DESC'
    );
    return data;
  } catch {
    return [];
  }
}

export async function resetProficiency() {
  if (!db) return;
  await db.run('DELETE FROM proficiency');
}

export async function insertTestData() {
  if (!db) return;

  for (const topic of TOPIC_CATEGORIES) {
    await db.run(
      `INSERT OR IGNORE INTO proficiency (topic, accuracy, total_questions, average_time, last_tested) 
         VALUES (?, ?, ?, ?, ?)`,
      topic,
      Math.floor(Math.random() * 100),
      Math.floor(Math.random() * 30),
      Math.floor(Math.random() * 2000),
      new Date().toISOString()
    );
  }
}

export async function reseedDatabase() {
  if (!db) return;

  await db.run('DELETE FROM proficiency');
  await db.run('DELETE FROM quiz_entries');

  for (const topic of TOPIC_CATEGORIES) {
    const accuracy = Math.floor(Math.random() * 101);
    const totalQuestions = Math.floor(Math.random() * 50) + 1;
    const averageTime = Math.floor(Math.random() * 501) + 500; // Random response time between 500-1000ms
    const lastTested = new Date(
      Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
    ).toISOString();

    await db.run(
      `INSERT INTO proficiency (topic, accuracy, total_questions, average_time, last_tested)
         VALUES (?, ?, ?, ?, ?)`,
      topic,
      accuracy,
      totalQuestions,
      averageTime,
      lastTested
    );
  }
}
