import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  Plus, 
  Search, 
  LogOut, 
  FolderOpen, 
  StickyNote, 
  Home, 
  Settings, 
  CheckCircle2, 
  X, 
  Save, 
  Calendar,
  Moon,
  Sun,
  MoreHorizontal,
  Star,
  Trash2,
  ChevronRight,
  Camera,
  UserPlus,
  User as UserIcon
} from 'lucide-react';
import { api } from './services/api';
import { Note, User, Category, Todo } from './types';

// --- Constants ---

const CATEGORY_COLORS: Record<string, string> = {
  Receitas: 'bg-blue-100 text-blue-700',
  Dev: 'bg-yellow-100 text-yellow-700',
  Compras: 'bg-green-100 text-green-700',
  Pessoal: 'bg-purple-100 text-purple-700',
  Lazer: 'bg-pink-100 text-pink-700',
  Ideias: 'bg-orange-100 text-orange-700',
  Estudos: 'bg-indigo-100 text-indigo-700',
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

// --- Components ---

const Sidebar = ({ 
  user, 
  activeTab, 
  setActiveTab, 
  onLogout,
  onOpenSettings
}: { 
  user: User; 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenSettings: () => void;
}) => (
  <aside className="w-64 flex flex-col justify-between h-screen sticky top-0 bg-card-light/80 backdrop-blur-md border-r-4 border-white p-6 z-10 transition-colors duration-300">
    <div>
      <div className="flex items-center justify-center mb-10 pb-6 border-b-2 border-primary/20">
        <div className="relative">
          <img 
            alt="User avatar" 
            className="w-16 h-16 rounded-full border-4 border-primary object-cover" 
            src={user.avatar} 
            referrerPolicy="no-referrer"
          />
          <span className="absolute -bottom-2 -right-2 text-2xl">🎀</span>
        </div>
      </div>
      <nav className="space-y-4">
        {[
          { id: 'all', icon: Home, label: 'Início' },
          { id: 'notes', icon: StickyNote, label: 'Todas as Notas' },
          { id: 'favorites', icon: Heart, label: 'Favoritos' },
          { id: 'categories', icon: FolderOpen, label: 'Categorias' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-display font-bold ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-cute' 
                : 'text-text-light hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{user.name}</p>
        </div>
        <button 
          onClick={onOpenSettings}
          className="text-text-light/50 hover:text-primary transition-colors"
        >
          <Settings size={16} />
        </button>
      </div>
      <button 
        onClick={onLogout}
        className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-50 rounded-xl transition-all font-display font-semibold"
      >
        <LogOut size={20} />
        Sair
      </button>
    </div>
  </aside>
);

const SettingsModal = ({ 
  user, 
  onClose, 
  onUpdate 
}: { 
  user: User; 
  onClose: () => void; 
  onUpdate: (updatedUser: User) => void;
}) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await api.updateUser({ userId: user.id, name, avatar, password: password || undefined });
      onUpdate(updated);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-card-light w-full max-w-md rounded-3xl shadow-cute overflow-hidden border-4 border-white"
      >
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Settings size={24} /> Configurações 🎀
          </h2>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="flex flex-col items-center mb-4">
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <img 
                src={avatar} 
                alt="Profile Preview" 
                className="w-24 h-24 rounded-full border-4 border-primary object-cover shadow-md transition-transform group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera size={24} className="text-white" />
              </div>
              <input 
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
            </div>
            <p className="text-xs text-text-light/50 mt-2 font-bold">Clique para mudar a foto ✨</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-text-light/70 mb-1 ml-1">Nome de Usuária</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-primary/5 border-2 border-primary/20 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all font-body"
                placeholder="Seu nome fofo..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-text-light/70 mb-1 ml-1">Nova Senha (opcional)</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-primary/5 border-2 border-primary/20 rounded-xl py-3 px-4 focus:outline-none focus:border-primary transition-all font-body"
                placeholder="Deixe em branco para não alterar"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-display font-bold py-4 rounded-xl shadow-cute transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações ✨'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const NoteCard = ({ 
  note, 
  onClick, 
  onToggleFavorite 
}: { 
  note: Note; 
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
  key?: any;
}) => {
  return (
    <motion.article 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="bg-card-light rounded-2xl p-6 border-2 border-white hover:border-primary transition-all shadow-cute cursor-pointer relative overflow-hidden flex flex-col h-64 group"
    >
      <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 rounded-bl-full -z-0 transition-transform group-hover:scale-110" />
      <div className="flex justify-between items-start mb-4 z-10">
        <h2 className="font-display text-xl font-bold text-text-light line-clamp-2">{note.title}</h2>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          className={`transition-colors ${note.is_favorite ? 'text-primary' : 'text-text-light/30 hover:text-primary'}`}
        >
          <Heart size={20} fill={note.is_favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      <p className="text-text-light/80 text-sm line-clamp-4 flex-1 z-10">
        {note.content}
      </p>
      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-xs text-text-light/50 z-10">
        <span className="flex items-center gap-1">
          <Calendar size={12} /> 
          {new Date(note.created_at).toLocaleDateString()}
        </span>
        <span className={`px-2 py-1 rounded-md font-semibold ${CATEGORY_COLORS[note.category] || 'bg-gray-100 text-gray-700'}`}>
          {note.category}
        </span>
      </div>
    </motion.article>
  );
};

const NoteEditor = ({ 
  note, 
  onClose, 
  onSave,
  onDelete
}: { 
  note: Partial<Note>; 
  onClose: () => void; 
  onSave: (note: Partial<Note>) => void;
  onDelete?: (id: number) => void;
}) => {
  const [editedNote, setEditedNote] = useState<Partial<Note>>(note);
  const [newTodo, setNewTodo] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    const todos = [...(editedNote.todos || []), { task: newTodo, completed: false }];
    setEditedNote({ ...editedNote, todos });
    setNewTodo('');
  };

  const toggleTodo = (index: number) => {
    const todos = [...(editedNote.todos || [])];
    todos[index].completed = !todos[index].completed;
    setEditedNote({ ...editedNote, todos });
  };

  const removeTodo = (index: number) => {
    const todos = [...(editedNote.todos || [])];
    todos.splice(index, 1);
    setEditedNote({ ...editedNote, todos });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-3xl bg-card-light rounded-3xl shadow-cute border-2 border-primary/20 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b-2 border-dashed border-primary/20 bg-primary/5 relative">
          <button onClick={onClose} className="absolute top-4 right-6 text-text-light/50 hover:text-primary">
            <X size={24} />
          </button>
          <input 
            className="w-full bg-transparent border-none text-2xl font-bold focus:ring-0 p-0 text-text-light placeholder-text-light/30"
            placeholder="Dê um título fofo para sua nota..."
            value={editedNote.title || ''}
            onChange={(e) => setEditedNote({ ...editedNote, title: e.target.value })}
          />
          <div className="flex gap-2 mt-4">
            <select 
              className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20 focus:ring-0 outline-none"
              value={editedNote.category || 'Ideias'}
              onChange={(e) => setEditedNote({ ...editedNote, category: e.target.value })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-6 flex-grow overflow-y-auto flex flex-col gap-6">
          <textarea 
            className="w-full bg-transparent border-none focus:ring-0 p-0 text-text-light resize-none min-h-[100px] leading-relaxed placeholder-text-light/30"
            placeholder="Escreva os detalhes aqui... 🎀"
            value={editedNote.content || ''}
            onChange={(e) => setEditedNote({ ...editedNote, content: e.target.value })}
          />

          <div className="bg-background-light p-6 rounded-2xl border border-primary/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-primary">
                <CheckCircle2 size={20} /> Tarefas
              </h3>
              <span className="text-xs opacity-60">
                {(editedNote.todos?.filter(t => t.completed).length || 0)}/{(editedNote.todos?.length || 0)} Concluídas
              </span>
            </div>
            <ul className="space-y-3">
              {editedNote.todos?.map((todo, idx) => (
                <li key={idx} className="flex items-center gap-3 bg-card-light p-3 rounded-xl border border-primary/10 shadow-sm">
                  <input 
                    type="checkbox" 
                    checked={todo.completed} 
                    onChange={() => toggleTodo(idx)}
                    className="kawaii-checkbox"
                  />
                  <span className={`flex-1 ${todo.completed ? 'line-through opacity-50' : ''}`}>
                    {todo.task}
                  </span>
                  <button onClick={() => removeTodo(idx)} className="text-text-light/30 hover:text-red-500">
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-center gap-3 p-2">
              <button 
                onClick={handleAddTodo}
                className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/80 transition-colors"
              >
                <Plus size={14} />
              </button>
              <input 
                className="bg-transparent border-none flex-grow focus:ring-0 p-0 text-text-light placeholder-text-light/30 italic text-sm"
                placeholder="Adicionar nova tarefa..."
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTodo()}
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-background-light border-t-2 border-primary/20 flex justify-between items-center">
          {editedNote.id ? (
            <button 
              onClick={() => {
                if (isConfirmingDelete) {
                  onDelete?.(editedNote.id!);
                } else {
                  setIsConfirmingDelete(true);
                  setTimeout(() => setIsConfirmingDelete(false), 3000);
                }
              }}
              className={`${isConfirmingDelete ? 'bg-red-500 text-white px-4 py-2 rounded-lg' : 'text-red-400 hover:text-red-500'} flex items-center gap-2 font-bold px-4 transition-all`}
            >
              <Trash2 size={18} /> {isConfirmingDelete ? 'Confirmar?' : 'Excluir'}
            </button>
          ) : <div />}
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl font-bold text-text-light hover:bg-white transition-all"
            >
              Cancelar
            </button>
            <button 
              onClick={() => onSave(editedNote)}
              className="px-8 py-2.5 rounded-xl font-bold bg-primary text-white shadow-cute hover:bg-primary/90 transition-all flex items-center gap-2"
            >
              <Save size={18} /> Salvar Nota
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNote, setEditingNote] = useState<Partial<Note> | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  const fetchNotes = async () => {
    if (user) {
      const data = await api.getNotes(user.id);
      setNotes(data);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegistering) {
        const userData = await api.register(authForm.name, authForm.email, authForm.password);
        setUser(userData);
      } else {
        const userData = await api.login(authForm.email, authForm.password);
        setUser(userData);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleSaveNote = async (noteData: Partial<Note>) => {
    if (!user) return;
    if (noteData.id) {
      await api.updateNote(noteData.id, noteData);
    } else {
      await api.createNote({
        ...noteData,
        userId: user.id,
        category: noteData.category || 'Ideias',
        color: noteData.color || '#FFB6C1'
      });
    }
    setEditingNote(null);
    fetchNotes();
  };

  const handleDeleteNote = async (id: number) => {
    await api.deleteNote(id);
    setEditingNote(null);
    fetchNotes();
  };

  const handleToggleFavorite = async (note: Note) => {
    await api.updateNote(note.id, { ...note, is_favorite: !note.is_favorite });
    fetchNotes();
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const title = note.title || '';
      const content = note.content || '';
      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || 
                        activeTab === 'notes' || 
                        (activeTab === 'favorites' && note.is_favorite) ||
                        (activeTab === 'categories' && (!selectedCategory || note.category === selectedCategory));
      return matchesSearch && matchesTab;
    });
  }, [notes, activeTab, searchQuery, selectedCategory]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-pattern-light">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-4xl flex bg-card-light rounded-2xl shadow-cute overflow-hidden"
        >
          <div className="hidden md:flex flex-col items-center justify-center w-5/12 bg-secondary p-8 relative overflow-hidden">
            <div className="absolute top-4 left-4 text-4xl opacity-50">🌸</div>
            <div className="absolute bottom-10 right-8 text-4xl opacity-50">🍓</div>
            <div className="text-center z-10">
              <h2 className="font-accent text-4xl text-primary mb-4">Diário Sanrio</h2>
              <p className="text-lg font-semibold mb-6">Seu espaço mágico para ideias e segredos! 💖</p>
              <div className="relative w-48 h-48 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-tertiary">
                <img 
                  alt="Hello Kitty" 
                  className="rounded-full object-cover w-full h-full p-2" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP7W8yW4S8M-SHmnWi3SuhVurbsY4NI1Y2kuvoITJUf3d5NciLfTQIuDxTAnKe-ytlvCB2j2OIucchRBUry-BKyWMQ3X3aKe4BLZrMskvQOucpNng39-yceR8l_t5jZEqQsAWpv32jALhbhvI6UC-1hIlg6KYdqE4uCVAzZ9ejIv6tdFeP8SraZHg-XfH8PPsGipf8NZYhLBvkUizpg1-UhlOh-egZyhe3qv_tYMoHzWszbg0ieWPt53CBI0VXquq5lQz8YqW9KSQ"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-2 -right-2 text-3xl">🎀</div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>Anotações super fofas</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <CheckCircle2 size={16} className="text-primary" />
                  <span>Temas personalizáveis</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">
                {isRegistering ? 'Crie sua conta! ✨' : 'Bem-vindo de volta! 🐾'}
              </h1>
              <p className="text-sm text-gray-500">
                {isRegistering ? 'Junte-se ao nosso mundo mágico.' : 'Faça login para acessar seu cantinho especial.'}
              </p>
            </div>
            <form className="space-y-5" onSubmit={handleAuth}>
              {isRegistering && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                >
                  <label className="block text-sm font-bold mb-1 ml-1">Seu Nome <span className="text-primary">*</span></label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-tertiary">
                      <UserIcon size={18} />
                    </span>
                    <input 
                      className="w-full pl-10 pr-4 py-3 border-2 border-secondary rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
                      placeholder="Como devemos te chamar?"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      required={isRegistering}
                    />
                  </div>
                </motion.div>
              )}
              <div>
                <label className="block text-sm font-bold mb-1 ml-1">E-mail Mágico <span className="text-primary">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-tertiary">
                    <Search size={18} />
                  </span>
                  <input 
                    className="w-full pl-10 pr-4 py-3 border-2 border-secondary rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
                    placeholder="seunome@sanrio.com"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    required
                    type="email"
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1 ml-1">
                  <label className="block text-sm font-bold">Senha Secreta <span className="text-primary">*</span></label>
                  {!isRegistering && <a className="text-xs text-primary hover:underline font-semibold" href="#">Esqueceu?</a>}
                </div>
                <div className="relative">
                  <input 
                    className="w-full px-4 py-3 border-2 border-secondary rounded-xl bg-white focus:border-primary focus:ring-2 focus:ring-primary focus:ring-opacity-50 transition-all"
                    placeholder="••••••••"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    required
                    type="password"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-xl shadow-cute transition-all transform hover:-translate-y-1 flex justify-center items-center space-x-2 text-lg"
              >
                {isRegistering ? <UserPlus size={20} /> : <LogOut size={20} className="rotate-180" />}
                <span>{isRegistering ? 'Cadastrar' : 'Entrar'}</span>
              </button>
            </form>
            
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                {isRegistering ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}
                <button 
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="ml-2 text-primary font-bold hover:underline"
                >
                  {isRegistering ? 'Faça Login' : 'Cadastre-se agora! ✨'}
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-pattern-light">
      <Sidebar 
        user={user} 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'categories') setSelectedCategory(null);
        }} 
        onLogout={() => setUser(null)} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />
      
      <main className="flex-1 p-8 h-screen overflow-y-auto relative">
        <div className="fixed top-10 right-10 text-4xl opacity-50 pointer-events-none animate-bounce" style={{ animationDuration: '3s' }}>☁️</div>
        
        <header className="flex justify-between items-center mb-10 bg-card-light/60 backdrop-blur-sm p-6 rounded-2xl border-2 border-white shadow-cute">
          <div>
            <h1 className="font-display text-4xl font-extrabold text-primary tracking-tight flex items-center gap-3">
              {activeTab === 'favorites' ? 'Notas Favoritas' : 
               activeTab === 'categories' ? (selectedCategory ? `Categoria: ${selectedCategory}` : 'Categorias') :
               'Todas as Notas'} <span className="text-3xl">🌸</span>
            </h1>
            <p className="text-text-light/70 mt-2 font-medium">
              Bem-vinda de volta, {user.name}! Você tem {notes.length} notas salvas.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setEditingNote({})}
              className="bg-primary hover:bg-primary/90 text-white font-display font-bold py-3 px-6 rounded-xl shadow-cute transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <Plus size={20} />
              Nova Nota
              <span className="text-xl ml-1">🎀</span>
            </button>
          </div>
        </header>

        <div className="mb-8 relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={20} />
          <input 
            className="w-full bg-card-light border-2 border-primary/20 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all font-body text-text-light placeholder-text-light/50 shadow-cute"
            placeholder="Buscar nas suas anotações fofas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {activeTab === 'categories' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-3 mb-8 justify-center"
          >
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm border-2 ${
                selectedCategory === null 
                ? 'bg-primary text-white border-primary' 
                : 'bg-white text-text-light border-transparent hover:border-primary/30'
              }`}
            >
              Todas
            </button>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full font-bold transition-all shadow-sm border-2 ${
                  selectedCategory === cat 
                  ? 'bg-primary text-white border-primary' 
                  : `${CATEGORY_COLORS[cat]} border-transparent hover:border-primary/30`
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          <AnimatePresence mode="popLayout">
            {filteredNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onClick={() => setEditingNote(note)}
                onToggleFavorite={() => handleToggleFavorite(note)}
              />
            ))}
            <motion.article 
              layout
              onClick={() => setEditingNote({})}
              className="bg-card-light/50 rounded-2xl p-6 border-2 border-dashed border-primary/30 hover:border-primary transition-all flex flex-col items-center justify-center text-center cursor-pointer group h-64"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus size={32} className="text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold">Criar Nova Nota</h2>
              <p className="text-text-light/60 text-sm mt-2">Clique aqui para adicionar uma nova lembrança ou ideia.</p>
            </motion.article>
          </AnimatePresence>
        </div>

        {isSettingsOpen && (
          <SettingsModal 
            user={user} 
            onClose={() => setIsSettingsOpen(false)} 
            onUpdate={(updatedUser) => setUser(updatedUser)}
          />
        )}
      </main>

      <AnimatePresence>
        {editingNote && (
          <NoteEditor 
            note={editingNote} 
            onClose={() => setEditingNote(null)} 
            onSave={handleSaveNote}
            onDelete={handleDeleteNote}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
