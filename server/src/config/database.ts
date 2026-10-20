import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const dbPath = process.env.DATABASE_FILE || './data/taskflow.db';
const resolvedDbPath = path.resolve(process.cwd(), dbPath);

// Ensure data directory exists
const dataDir = path.dirname(resolvedDbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new sqlite3.Database(resolvedDbPath, (err) => {
  if (err) {
    console.error('[DATABASE] Failed to connect to SQLite:', err.message);
  } else {
    console.log('[DATABASE] Connected to SQLite database at', resolvedDbPath);
  }
});

// Promisified database helpers
export function dbRun(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function dbGet<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row as T | undefined);
    });
  });
}

export function dbAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows as T[]);
    });
  });
}

// Database initialization and migrations
export async function initDatabase(): Promise<void> {
  // Enforce foreign key constraints and WAL journal mode
  await dbRun('PRAGMA foreign_keys = ON;');
  await dbRun('PRAGMA journal_mode = WAL;');

  // 1. Users table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // 2. Projects table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      owner_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 3. Project Members table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS project_members (
      project_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'member',
      joined_at TEXT NOT NULL,
      PRIMARY KEY (project_id, user_id),
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // 4. Tasks table
  await dbRun(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'todo',
      priority TEXT NOT NULL DEFAULT 'medium',
      assignee_id TEXT,
      created_by TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  // Indexes for relational performance
  await dbRun('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_project_members_user ON project_members(user_id);');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);');
  await dbRun('CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON tasks(assignee_id);');

  // Seed default demonstration users only if explicitly requested
  if (process.env.SEED_DEMO_DATA === 'true') {
    const userCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM users;');
    if (!userCount || userCount.count === 0) {
      console.log('[DATABASE] Seeding initial production demo dataset...');
    const now = new Date().toISOString();
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    const ownerId = uuidv4();
    const memberId = uuidv4();
    const traineeId = uuidv4();

    await dbRun(
      `INSERT INTO users (id, email, password_hash, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [ownerId, 'owner@taqat-gaza.com', defaultPasswordHash, 'Enterprise Admin', 'owner', now, now]
    );

    await dbRun(
      `INSERT INTO users (id, email, password_hash, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [memberId, 'member@taqat-gaza.com', defaultPasswordHash, 'Lead Engineer', 'member', now, now]
    );

    await dbRun(
      `INSERT INTO users (id, email, password_hash, display_name, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [traineeId, 'trainee@taqat-gaza.com', defaultPasswordHash, 'Software Trainee', 'trainee', now, now]
    );

    // Initial demo project
    const projectId = uuidv4();
    await dbRun(
      `INSERT INTO projects (id, name, description, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        'TaskFlow Enterprise Engine',
        'Mission-critical SQL backed project management system built for high throughput and reliability.',
        ownerId,
        now,
        now
      ]
    );

    // Add members to project
    await dbRun(
      `INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`,
      [projectId, ownerId, 'owner', now]
    );
    await dbRun(
      `INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`,
      [projectId, memberId, 'member', now]
    );
    await dbRun(
      `INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`,
      [projectId, traineeId, 'trainee', now]
    );

    // Initial demo tasks
    const tasks = [
      {
        id: uuidv4(),
        title: 'Complete SQL Relational Migration',
        description: 'Pure SQL relational database engine established with foreign keys and cascade operations.',
        status: 'done',
        priority: 'high',
        assignee_id: ownerId
      },
      {
        id: uuidv4(),
        title: 'Enterprise Authentication Gateway',
        description: 'Deploy bcrypt password encryption and RFC-compliant JWT Bearer token sessions.',
        status: 'in_progress',
        priority: 'high',
        assignee_id: memberId
      },
      {
        id: uuidv4(),
        title: 'Production Infrastructure Verification',
        description: 'Verify connectivity to taskflow-taqat.apps.taqat.acadamay API endpoints.',
        status: 'todo',
        priority: 'medium',
        assignee_id: traineeId
      }
    ];

    for (const t of tasks) {
      await dbRun(
        `INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [t.id, projectId, t.title, t.description, t.status, t.priority, t.assignee_id, ownerId, now, now]
      );
    }

    console.log('[DATABASE] Seeding completed successfully.');
    }
  }
}
