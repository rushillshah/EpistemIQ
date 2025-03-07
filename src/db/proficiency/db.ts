import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import * as vscode from 'vscode';

import { applyMigrations } from '../migrations';

import { TOPIC_CATEGORIES } from '../../constants';

let db: Database | null = null;

export async function initDatabase(context: vscode.ExtensionContext) {
  try {
    console.log('[DB] Initializing database...');
    const dbPath = vscode.Uri.joinPath(context.globalStorageUri, 'proficiency.db').fsPath;
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
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
    
    console.log('[DB] Proficiency table ensured.');

    await ensureTopicsExist();
  } catch (error) {
    console.error('[DB] Error initializing database:', error);
  }
}

async function ensureTopicsExist() {
  if (!db) return;

  for (const topic of TOPIC_CATEGORIES) {
    try {
      const existing = await db.get('SELECT * FROM proficiency WHERE topic = ?', topic);

      if (!existing) {
        await db.run(
          `INSERT INTO proficiency (topic, accuracy, total_questions, average_time, last_tested) 
           VALUES (?, ?, ?, ?, ?)`,
          topic, 0, 0, 0, null
        );
      }
    } catch (error) {
      console.error(`[DB] Error ensuring topic exists: ${topic}`, error);
    }
  }
}

export async function getProficiency(topic: string) {
  return db?.get('SELECT * FROM proficiency WHERE topic = ?', topic);
}

export async function updateProficiency(topic: string, isCorrect: boolean, responseTime: number) {
  if (!db) return;

  const existing = await getProficiency(topic);
  const lastTested = new Date().toISOString();

  if (existing) {
    const newTotalQuestions = existing.total_questions + 1;
    const newAccuracy = ((existing.accuracy * existing.total_questions) + (isCorrect ? 100 : 0)) / newTotalQuestions;
    const newAverageTime = ((existing.average_time * existing.total_questions) + responseTime) / newTotalQuestions;

    await db.run(
      'UPDATE proficiency SET accuracy = ?, total_questions = ?, average_time = ?, last_tested = ? WHERE topic = ?', 
      newAccuracy, newTotalQuestions, newAverageTime, lastTested, topic
    );
  } else {
    await db.run(
      `INSERT INTO proficiency (topic, accuracy, total_questions, average_time, last_tested) 
       VALUES (?, ?, ?, ?, ?)`,
      topic, isCorrect ? 100 : 0, 1, responseTime, lastTested
    );
  }

  await insertQuizEntry(topic, isCorrect, responseTime);
}

export async function insertQuizEntry(topic: string, isCorrect: boolean, responseTime: number) {
  if (!db) return;

  try {
    await db.run(
      `INSERT INTO quiz_entries (topic, is_correct, response_time) VALUES (?, ?, ?)`,
      topic, isCorrect ? 1 : 0, responseTime
    );
    console.log(`[DB] Quiz entry added for topic: ${topic}`);
  } catch (error) {
    console.error('[DB] Error inserting quiz entry:', error);
  }
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
    console.log('[DB] Fetching quiz history...');
    const data = await db.all('SELECT * FROM quiz_entries ORDER BY timestamp DESC');
    console.log('[DB] Retrieved quiz history:', data);
    return data;
  } catch (error) {
    console.error('[DB] Error fetching quiz history:', error);
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
    try {
      await db.run(
        `INSERT OR IGNORE INTO proficiency (topic, accuracy, total_questions, average_time, last_tested) 
         VALUES (?, ?, ?, ?, ?)`,
        topic, Math.floor(Math.random() * 100), Math.floor(Math.random() * 30), Math.floor(Math.random() * 2000), new Date().toISOString()
      );
    } catch (error) {
      console.error(`[DB] Error inserting test data for: ${topic}`, error);
    }
  }
}

export async function reseedDatabase() {
  if (!db) return;
  
  try {
    console.log('[DB] Reseeding database with random values...');

    // Clear existing proficiency and quiz data.
    await db.run('DELETE FROM proficiency');
    await db.run('DELETE FROM quiz_entries');

    for (const topic of TOPIC_CATEGORIES) {
      const accuracy = Math.floor(Math.random() * 101); // Random accuracy between 0-100
      const totalQuestions = Math.floor(Math.random() * 50) + 1; // Random total questions between 1-50
      const averageTime = Math.floor(Math.random() * 3000) + 500; // Random response time between 500-3500ms
      const lastTested = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(); // Random date within last 30 days

      await db.run(
        `INSERT INTO proficiency (topic, accuracy, total_questions, average_time, last_tested)
         VALUES (?, ?, ?, ?, ?)`,
        topic, accuracy, totalQuestions, averageTime, lastTested
      );
    }
    
    console.log('[DB] Successfully reseeded database with random testing data.');
  } catch (error) {
    console.error('[DB] Error reseeding database:', error);
  }
}