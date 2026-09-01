import React, { useState } from 'react';
import { Category, generateUUID } from '../types/scenario';
import { SupabaseService } from '../services/supabase';
import { Lock, Trash2, CheckCircle2, ShieldCheck, ExternalLink, HelpCircle, Info } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: Category | null;
  onCategorySaved: (cat: Category) => void;
  onCategoryDeleted?: (id: string) => void;
}

export const cleanFontAwesomeClass = (input: string): string => {
  if (!input) return 'fa-layer-group';
  let str = input.trim();
  
  const match = str.match(/class(?:Name)?=["']([^"']+)["']/i);
  if (match && match[1]) {
    str = match[1].trim();
  }
  
  str = str.replace(/<[^>]*>/g, '').trim();
  return str || 'fa-layer-group';
};

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
  const [showTooltip, setShowTooltip] = useState(false);

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
      setAuthError('Invalid authorization password. Please try again.');
    }
  };

  const handleIconChange = (val: string) => {
    const cleaned = cleanFontAwesomeClass(val);
    setIcon(cleaned);
  };

  const handleSaveCategory = async () => {
    if (!title) {
      alert('Please enter a Category Title!');
      return;
    }

    const cat: Category = {
      id: categoryToEdit ? categoryToEdit.id : generateUUID(),
      title,
      description,
      icon: cleanFontAwesomeClass(icon),
      badge,
      isCustom: true
    };

    await SupabaseService.saveCategory(cat);
    onCategorySaved(cat);
    onClose();
  };

  const handleDeleteCategory = async () => {
    if (!categoryToEdit) return;
    if (confirm(`Are you sure you want to delete category "${categoryToEdit.title}"?`)) {
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
                {categoryToEdit ? 'Edit Showcase Category' : 'Add New Category'}
              </h3>
              <p className="text-[11px] text-slate-400">Cekat AI Domain / Industry Manager</p>
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
              <h4 className="font-bold text-slate-900 text-base">Authorization Required</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">Enter authorization password to manage categories.</p>
            </div>

            <div className="w-full max-w-xs space-y-2">
              <input
                type="password"
                placeholder="Enter Password"
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
              <ShieldCheck size={16} /> Open Category Editor
            </button>
          </form>
        ) : (
          /* Main Category Form */
          <div className="p-6 space-y-4 text-xs text-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category Title / Industry</label>
              <input
                type="text"
                placeholder="e.g. Banking & Financial AI"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Short Description</label>
              <textarea
                rows={3}
                placeholder="Brief description of this industry domain..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <span>FontAwesome Icon</span>
                  <button
                    type="button"
                    onClick={() => setShowTooltip(!showTooltip)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <HelpCircle size={14} /> How to Custom Icon
                  </button>
                </label>
                
                <a
                  href="https://fontawesome.com/search?o=r&m=free"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full transition"
                >
                  <ExternalLink size={12} /> Explore FontAwesome.com
                </a>
              </div>

              {/* Tooltip & Step-by-Step Guide Box */}
              {showTooltip && (
                <div className="bg-blue-50/90 border border-blue-200 rounded-xl p-3 text-[11px] text-slate-700 space-y-1.5 animate-fade-up">
                  <div className="font-bold text-blue-900 flex items-center gap-1">
                    <Info size={14} className="text-blue-600" /> FontAwesome Icon Paste Guide:
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed">
                    <li>Open <a href="https://fontawesome.com/search?o=r&m=free" target="_blank" rel="noreferrer" className="text-blue-700 underline font-bold">FontAwesome Search (Free)</a>.</li>
                    <li>Find & click your desired icon (e.g., Shopify, Cart, Building).</li>
                    <li>Click **Copy HTML** on FontAwesome (example: <code className="bg-white px-1 py-0.5 rounded text-blue-800 font-mono">&lt;i class="fa-brands fa-shopify"&gt;&lt;/i&gt;</code>).</li>
                    <li>Paste directly into input field below. Class names will be extracted automatically!</li>
                  </ol>
                </div>
              )}

              <div className="flex items-center gap-2">
                {/* Icon Preview Box */}
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center text-lg font-black shrink-0 shadow-xs">
                  <i className={icon.includes('fa-') && (icon.includes('fa-brands') || icon.includes('fa-regular') || icon.includes('fa-solid')) ? icon : `fa-solid ${icon}`}></i>
                </div>

                <input
                  type="text"
                  placeholder='Paste HTML e.g. <i class="fa-brands fa-shopify"></i> or fa-building-columns'
                  value={icon}
                  onChange={(e) => handleIconChange(e.target.value)}
                  className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 text-xs bg-white font-mono focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Badge Label</label>
              <input
                type="text"
                placeholder="e.g. Finance & Banking"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white font-semibold text-blue-700"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              {categoryToEdit && categoryToEdit.isCustom ? (
                <button
                  type="button"
                  onClick={handleDeleteCategory}
                  className="text-red-600 hover:text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={14} /> Delete Category
                </button>
              ) : <div></div>}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCategory}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Save Category
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
