import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import os from "os";

const SESSIONS_DIR = path.join(os.tmpdir(), "website_maker_sessions");

// Ensure temp dir exists
if (!fs.existsSync(SESSIONS_DIR)) {
  fs.mkdirSync(SESSIONS_DIR, { recursive: true });
}

/**
 * Disk-backed session store for website builder projects.
 * Survives Next.js API route isolation and hot reloads.
 */
class SessionStore {
  constructor() {
    this.TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
  }

  _getFilePath(sessionId) {
    return path.join(SESSIONS_DIR, `${sessionId}.json`);
  }

  /**
   * Create a new session with generated project data.
   */
  create(data) {
    const sessionId = randomUUID();
    const session = {
      ...data,
      sessionId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      editHistory: [],
    };
    
    fs.writeFileSync(this._getFilePath(sessionId), JSON.stringify(session, null, 2));
    return sessionId;
  }

  /**
   * Get session data by ID.
   */
  get(sessionId) {
    const filePath = this._getFilePath(sessionId);
    if (!fs.existsSync(filePath)) return null;

    try {
      const session = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      // Check TTL
      if (Date.now() - session.updatedAt > this.TTL_MS) {
        this.delete(sessionId);
        return null;
      }

      return session;
    } catch (e) {
      return null;
    }
  }

  /**
   * Update a session's files and plan.
   */
  update(sessionId, updatedFiles, editPrompt, updatedPlan = null) {
    const session = this.get(sessionId);
    if (!session) throw new Error("Session not found: " + sessionId);

    // Store edit history
    session.editHistory.push({
      prompt: editPrompt,
      timestamp: Date.now(),
      changedFiles: Object.keys(updatedFiles),
    });

    // Merge updated files into existing files
    session.files = {
      ...session.files,
      ...updatedFiles,
    };

    // Persist the updated plan so future edits see the latest state
    if (updatedPlan) {
      session.plan = updatedPlan;
    }

    session.updatedAt = Date.now();
    fs.writeFileSync(this._getFilePath(sessionId), JSON.stringify(session, null, 2));
  }

  /**
   * Get all files for a session.
   */
  getFiles(sessionId) {
    const session = this.get(sessionId);
    return session?.files || null;
  }

  /**
   * Delete a session.
   */
  delete(sessionId) {
    const filePath = this._getFilePath(sessionId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  /**
   * Cleanup expired sessions (Called proactively if needed, though get() handles lazy cleanup).
   */
  cleanup() {
    try {
      const files = fs.readdirSync(SESSIONS_DIR);
      const now = Date.now();
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const filePath = path.join(SESSIONS_DIR, file);
        try {
          const stats = fs.statSync(filePath);
          if (now - stats.mtimeMs > this.TTL_MS) {
            fs.unlinkSync(filePath);
          }
        } catch (err) {}
      }
    } catch (e) {}
  }

  /**
   * Get session count (for monitoring).
   */
  get size() {
    try {
      return fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith(".json")).length;
    } catch (e) {
      return 0;
    }
  }
}

// Singleton instance
const sessionStore = new SessionStore();
export default sessionStore;
