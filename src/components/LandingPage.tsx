import React, { useState, useMemo } from 'react';
import { Category } from '../types/scenario';
import { Plus, Settings, ArrowRight, Search, X, Filter, SlidersHorizontal } from 'lucide-react';

interface LandingPageProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  categories,
  onSelectCategory,
  onAddCategory,
  onEditCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'name_asc' | 'name_desc'>('default');

  // Extract unique badges for quick filter chips
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    categories.forEach(c => {
      if (c.badge) tags.add(c.badge);
    });
    return Array.from(tags);
  }, [categories]);

  // Filter & Sort logic
  const filteredCategories = useMemo(() => {
    return categories
      .filter(cat => {
        const q = searchQuery.toLowerCase().trim();
        const matchSearch = !q || 
          cat.title.toLowerCase().includes(q) || 
          cat.description.toLowerCase().includes(q) || 
          cat.badge.toLowerCase().includes(q);

        const matchTag = selectedTag === 'ALL' || cat.badge.toLowerCase().trim() === selectedTag.toLowerCase().trim();

        return matchSearch && matchTag;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === 'name_desc') {
          return b.title.localeCompare(a.title);
        }
        return 0;
      });
  }, [categories, searchQuery, selectedTag, sortBy]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-start p-4 md:p-8 font-sans">
      
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Clean Top Navbar with Official Cekat.AI Logo */}
        <div className="w-full bg-white text-slate-900 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between border border-slate-200">
          <div className="flex items-center gap-3">
            <img src="/cekat-logo.png" alt="Cekat.AI Logo" className="w-10 h-10 object-contain rounded-xl shadow-xs" />
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">Cekat.AI</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onAddCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={15} /> Add Category
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 space-y-4 text-center shadow-lg relative overflow-hidden">
          <h1 className="font-black text-3xl md:text-5xl tracking-tight leading-tight">
            Showcase & Use Case Simulation Categories
          </h1>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
            Explore interactive AI automation flows, system API integrations, and safe guardrail architectures tailored for your industry.
          </p>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 md:p-6 space-y-4 shadow-xs">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Live Search Input */}
            <div className="relative w-full md:w-96">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search categories, keywords, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-2.5 rounded-2xl border border-slate-300 text-xs bg-white font-medium focus:outline-none focus:border-blue-600 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                <SlidersHorizontal size={14} className="text-blue-600" />
                <span>Sort by:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold text-slate-800 focus:outline-none focus:border-blue-600 cursor-pointer shadow-xs"
              >
                <option value="default">Default</option>
                <option value="name_asc">Alphabetical (A - Z)</option>
                <option value="name_desc">Alphabetical (Z - A)</option>
              </select>
            </div>

          </div>

          {/* Quick Filter Tag Chips */}
          <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-slate-200">
            <span className="text-[11px] font-extrabold text-slate-500 uppercase flex items-center gap-1 mr-1">
              <Filter size={11} /> Filter Badge:
            </span>
            
            <button
              onClick={() => setSelectedTag('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                selectedTag === 'ALL'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              All ({categories.length})
            </button>

            {availableTags.map((tag) => {
              const count = categories.filter(c => c.badge.toLowerCase().trim() === tag.toLowerCase().trim()).length;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer border ${
                    selectedTag.toLowerCase().trim() === tag.toLowerCase().trim()
                      ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tag} ({count})
                </button>
              );
            })}
          </div>

        </div>

        {/* Category Cards Grid Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <span>Use Case Categories</span>
              <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 font-bold px-2.5 py-0.5 rounded-full">
                {filteredCategories.length} Domains Available
              </span>
            </h2>
          </div>

          {/* Render Filtered Category Grid */}
          {filteredCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group cursor-pointer border-l-4 border-l-blue-600"
                  onClick={() => onSelectCategory(cat)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl border border-blue-200 font-black">
                        <i className={cat.icon.includes('fa-') && (cat.icon.includes('fa-brands') || cat.icon.includes('fa-regular') || cat.icon.includes('fa-solid')) ? cat.icon : `fa-solid ${cat.icon}`}></i>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-700 font-mono font-bold text-[10px] px-3 py-1 rounded-full border border-slate-200">
                          {cat.badge}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditCategory(cat);
                          }}
                          className="text-slate-400 hover:text-blue-600 text-xs p-1 font-semibold"
                          title="Edit Category"
                        >
                          <Settings size={15} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition">
                        {cat.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
                    <span>Open Simulator & Canvas Flow</span>
                    <ArrowRight size={16} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Search State */
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <Search size={22} />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">No Categories Found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  No categories match search query <span className="font-bold text-blue-600">"{searchQuery}"</span> or filter <span className="font-bold text-blue-600">"{selectedTag}"</span>.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag('ALL');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Reset Search Filter
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
