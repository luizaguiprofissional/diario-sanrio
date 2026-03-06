import { Note, User } from "../types";

const API_BASE = "/api";

export const api = {
  async login(email: string, password?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao fazer login");
    return data;
  },

  async register(name: string, email: string, password?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Erro ao criar conta");
    return data;
  },

  async getNotes(userId: number): Promise<Note[]> {
    const res = await fetch(`${API_BASE}/notes?userId=${userId}`);
    return res.json();
  },

  async createNote(note: Partial<Note> & { userId: number }): Promise<Note> {
    const res = await fetch(`${API_BASE}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    return res.json();
  },

  async updateNote(id: number, note: Partial<Note>): Promise<void> {
    await fetch(`${API_BASE}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
  },

  async deleteNote(id: number): Promise<void> {
    await fetch(`${API_BASE}/notes/${id}`, {
      method: "DELETE",
    });
  },

  async updateUser(userData: { userId: number; name: string; avatar: string; password?: string }): Promise<User> {
    const res = await fetch(`${API_BASE}/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    return res.json();
  },
};
