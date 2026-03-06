export interface Todo {
  id?: number;
  note_id?: number;
  task: string;
  completed: boolean;
}

export interface Note {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category: string;
  color: string;
  is_favorite: boolean;
  created_at: string;
  todos: Todo[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  avatar: string;
}

export type Category = 'Receitas' | 'Dev' | 'Compras' | 'Pessoal' | 'Lazer' | 'Ideias' | 'Estudos';
