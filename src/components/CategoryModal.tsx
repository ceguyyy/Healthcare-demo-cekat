import React, { useState } from 'react';
import { Category } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, Plus, Trash2, CheckCircle2, ShieldCheck, Layers } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onCategorySaved: (cat: Category) => void;
  onCategoryDeleted?: (id: string) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categoryToEdit,
  onCategorySaved,
  onCategoryDeleted
}) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Form State
  const [title, setTitle] = useState(categoryToEdit?.title || '');
  const [description, setDescription] = useState(categoryToEdit?.description || '');
  const [icon, setIcon] = useState(categoryToEdit?.icon || 'fa-layer-group');
  const [badge, setBadge] = useState(categoryToEdit?.badge || 'Custom Category');

  React.useEffect(() => {
    if (categoryToEdit) {
      setTitle(categoryToEdit.title);
      setDescription(categoryToEdit.description);
      setIcon(categoryToEdit.icon);
      setBadge(categoryToEdit.badge);
    } else {
      setTitle('');
      setDescription('');
      setIcon('fa-layer-group');
      setBadge('Custom Category');
    }
  }, [categoryToEdit]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPassword = import.meta.env.VITE_SA_PASSWORD || 'SAteamCekat@';
    if (passwordInput === validPassword) {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Password SA Team tidak valid. Coba lagi!');
    }
  };

  const handleSaveCategory = async () => {
    if (!title) {
      alert('Mohon isi Judul Kategori!');
      return;
    }

    const cat: Category = {
      id: categoryToEdit ? categoryToEdit.id : generateUUID(),
      title,
      description,
      icon,
      badge,
      isCustom: true
    };

    await SupabaseService.saveCategory(cat);
    onCategorySaved(cat);
    onClose();
  };

  const handleDeleteCategory = async () => {
    if (!categoryToEdit) return;
    if (confirm(`Apakah Anda yakin ingin menghapus kategori "${categoryToEdit.title}"?`)) {
      await SupabaseService.deleteCategory(categoryToEdit.id);
      if (onCategoryDeleted) onCategoryDeleted(categoryToEdit.id);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              CAT
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {categoryToEdit ? 'Edit Kategori Showcase' : 'Tambah Kategori Baru'}
              </h3>
              <p className="text-[11px] text-slate-400">CRUD Kategori Domain/Industri Cekat AI</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        {/* Auth Guard Form */}
        {!isAuthenticated ? (
          <form onSubmit={handlePasswordSubmit} className="p-8 flex flex-col items-center justify-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl border border-blue-200 shadow-sm">
              <Lock size={24} />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900 text-base">Otentikasi SA Team Required</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Masukkan password SA Team untuk mengubah kategori.</p>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <input
                type="password"
                placeholder="Masukkan Password (e.g. SAteamCekat@)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:outline-none focus:border-blue-600 shadow-xs"
              />
              {authError && <p className="text-[11px] text-red-600 font-semibold text-center">{authError}</p>}
            </div>

            <button
              type="submit"
              className="w-full max-w-xs bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={16} /> Buka Category Editor
            </button>
          </form>
        ) : (
          /* Main Category Form */
          <div className="p-6 space-y-4 text-xs text-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Judul Kategori / Industri</label>
              <input
                type="text"
                placeholder="e.g. Banking & Financial AI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Deskripsi Singkat Kategori</label>
              <textarea
                rows={3}
                placeholder="Penjelasan singkat mengenai bidang industri ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Ikon (FontAwesome Class)</label>
                <input
                  type="text"
                  placeholder="e.g. fa-building-columns"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Teks Badge Label</label>
                <input
                  type="text"
                  placeholder="e.g. Finance & Banking"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold text-blue-700"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              {categoryToEdit && categoryToEdit.isCustom ? (
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} /> Hapus Kategori
                </button>
              ) : <div></div>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Simpan Kategori
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
