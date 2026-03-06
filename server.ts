import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("notes.db");
db.pragma('foreign_keys = ON');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    avatar TEXT
  );

  -- Insert a default user if none exists
  INSERT OR IGNORE INTO users (id, email, password, name, avatar) 
  VALUES (1, 'user@sanrio.com', 'password', 'Sabrina Moura', 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRfzjr18wCj9uOXenp_9G9TSML8yninvScWh04aw3KRo83SLo-Yqg8mzo2DIDf9QYF1-sBAoHydN4d0o9j0Ivcb0fw--0AvKS0UVwWSQR_UmRboqpuON0NiecU6NR4PKYDXQS0szx_Az9g4_wR8D82-Qe-jcqjoHtV3-G14uhfvSLK0E27a7NfHHTkQKXvEF2KB9NoSkZV1VYGSRNtfC-XG5rLhnySuJPlww8AKxDl0je3DSmuUItZmtFWwZ5h2QIO8E6kheQVCCY');

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    content TEXT,
    category TEXT,
    color TEXT,
    is_favorite INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    note_id INTEGER,
    task TEXT,
    completed INTEGER DEFAULT 0,
    FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Auth Endpoints
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
    
    if (!user) {
      return res.status(401).json({ error: "Usuário não encontrado" });
    }

    // Simple password check (In a real app, use bcrypt)
    if (password && user.password && password !== user.password) {
      return res.status(401).json({ error: "Senha incorreta" });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;
    
    try {
      const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
      if (existingUser) {
        return res.status(400).json({ error: "Este e-mail já está em uso" });
      }

      const defaultAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCRfzjr18wCj9uOXenp_9G9TSML8yninvScWh04aw3KRo83SLo-Yqg8mzo2DIDf9QYF1-sBAoHydN4d0o9j0Ivcb0fw--0AvKS0UVwWSQR_UmRboqpuON0NiecU6NR4PKYDXQS0szx_Az9g4_wR8D82-Qe-jcqjoHtV3-G14uhfvSLK0E27a7NfHHTkQKXvEF2KB9NoSkZV1VYGSRNtfC-XG5rLhnySuJPlww8AKxDl0je3DSmuUItZmtFWwZ5h2QIO8E6kheQVCCY";
      
      const info = db.prepare(
        "INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)"
      ).run(name, email, password, defaultAvatar);

      res.json({
        id: info.lastInsertRowid,
        name,
        email,
        avatar: defaultAvatar
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Erro ao criar conta" });
    }
  });

  // Notes API
  app.get("/api/notes", (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const notes = db.prepare("SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    const notesWithTodos = notes.map(note => {
      const todos = db.prepare("SELECT * FROM todos WHERE note_id = ?").all(note.id);
      return { ...note, todos };
    });
    res.json(notesWithTodos);
  });

  app.post("/api/notes", (req, res) => {
    const { userId, title, content, category, color, todos } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const info = db.prepare(
      "INSERT INTO notes (user_id, title, content, category, color) VALUES (?, ?, ?, ?, ?)"
    ).run(userId, title, content, category, color);
    
    const noteId = info.lastInsertRowid;
    
    if (todos && Array.isArray(todos)) {
      const insertTodo = db.prepare("INSERT INTO todos (note_id, task, completed) VALUES (?, ?, ?)");
      for (const todo of todos) {
        insertTodo.run(noteId, todo.task, todo.completed ? 1 : 0);
      }
    }

    res.json({ id: noteId, title, content, category, color, todos: todos || [] });
  });

  app.put("/api/notes/:id", (req, res) => {
    const { id } = req.params;
    const { title, content, category, color, is_favorite, todos } = req.body;
    
    db.prepare(
      "UPDATE notes SET title = ?, content = ?, category = ?, color = ?, is_favorite = ? WHERE id = ?"
    ).run(title, content, category, color, is_favorite ? 1 : 0, id);

    if (todos && Array.isArray(todos)) {
      // Simple sync: delete all and re-insert
      db.prepare("DELETE FROM todos WHERE note_id = ?").run(id);
      const insertTodo = db.prepare("INSERT INTO todos (note_id, task, completed) VALUES (?, ?, ?)");
      for (const todo of todos) {
        insertTodo.run(id, todo.task, todo.completed ? 1 : 0);
      }
    }

    res.json({ success: true });
  });

  app.delete("/api/notes/:id", (req, res) => {
    const { id } = req.params;
    db.prepare("DELETE FROM notes WHERE id = ?").run(id);
    res.json({ success: true });
  });

  // User Settings API
  app.put("/api/user", (req, res) => {
    const { userId, name, avatar, password } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    
    if (password) {
      db.prepare("UPDATE users SET name = ?, avatar = ?, password = ? WHERE id = ?").run(name, avatar, password, userId);
    } else {
      db.prepare("UPDATE users SET name = ?, avatar = ? WHERE id = ?").run(name, avatar, userId);
    }

    const user = db.prepare("SELECT id, email, name, avatar FROM users WHERE id = ?").get(userId);
    res.json(user);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
