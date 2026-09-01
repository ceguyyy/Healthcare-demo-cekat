import React, { useState, useMemo, useEffect } from 'react';
import { Category } from '../types/scenario';
import { Plus, Settings, ArrowRight, Search, X, Filter, SlidersHorizontal, ChevronLeft, ChevronRight, Lock, Globe, BookOpen } from 'lucide-react';

interface LandingPageProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onOpenLiveChat?: () => void;
  onOpenDocs?: () => void;
}

const ITEMS_PER_PAGE = 6;

export const LandingPage: React.FC<LandingPageProps> = ({
  categories,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onOpenLiveChat,
  onOpenDocs
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'name_asc' | 'name_desc'>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  // Reset to page 1 whenever filters or search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTag, sortBy]);

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE) || 1;

  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  const startIndex = filteredCategories.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, filteredCategories.length);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-start p-4 md:p-8 font-sans">
      
      <div className="w-full max-w-6xl space-y-8 flex-1">
        
        {/* Clean Top Navbar with Official Cekat.AI Logo & Internal Use Only Badge */}
        <div className="w-full bg-white text-slate-900 rounded-2xl px-6 py-4 shadow-sm flex items-center justify-between border border-slate-200">
          <div className="flex items-center gap-3">
            <img src="/cekat-logo.png" alt="Cekat.AI Logo" className="w-10 h-10 object-contain rounded-xl shadow-xs" />
            <span className="font-extrabold text-2xl tracking-tight text-slate-900">Cekat.AI</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDocs && (
              <button
                onClick={onOpenDocs}
                className="bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <BookOpen size={14} className="text-blue-600" /> Docs
              </button>
            )}
            <a
              href="https://chat.cekat.ai/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Globe size={14} className="text-emerald-600" /> Live Chat
            </a>
            <button
              onClick={onAddCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus size={15} /> Add Category
            </button>
          </div>
        </div>

        {/* Hero Banner with Prominent Search Input & Internal Use Only Pill */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 md:p-12 space-y-6 text-center shadow-lg relative overflow-hidden">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 font-extrabold text-xs px-4 py-1.5 rounded-full uppercase tracking-wider shadow-xs">
              <Lock size={13} className="text-amber-400" />
              <span>Internal Use Only</span>
            </div>
            <h1 className="font-black text-3xl md:text-5xl tracking-tight leading-tight">
              Showcase & Use Case Simulation Categories
            </h1>
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
              Explore interactive AI automation flows, system API integrations, and safe guardrail architectures tailored for your industry.
            </p>
          </div>

          {/* Large Hero Search Input Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories, industries, or keywords (e.g. Healthcare, Banking, Flow)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xl transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips & Sorting Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 md:p-6 space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Quick Filter Tag Chips */}
            <div className="flex items-center gap-2 flex-wrap">
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

            {/* Sort Controls */}
            <div className="flex items-center gap-3 shrink-0">
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
        </div>

        {/* Category Cards Grid & Pagination */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <span>Use Case Categories</span>
              <span className="text-xs bg-slate-100 text-slate-600 border border-slate-200 font-bold px-2.5 py-0.5 rounded-full">
                {filteredCategories.length} Domains Available
              </span>
            </h2>
          </div>

          {/* Render Paginated Category Grid (Max 6 per page) */}
          {filteredCategories.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4 group cursor-pointer border-l-4 border-l-blue-600"
                    onClick={() => onSelectCategory(cat)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl border border-blue-200 font-black">
                          {(() => {
                            const ic = cat.icon || 'fa-layer-group';
                            const isFaClass = ic.includes('fa-') && (ic.includes('fa-brands') || ic.includes('fa-regular') || ic.includes('fa-solid'));
                            return <i className={isFaClass ? ic : `fa-solid ${ic}`}></i>;
                          })()}
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

              {/* Pagination Bar & Indexing - Always Visible */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600 font-medium">
                
                {/* Indexing Info */}
                <div>
                  Showing <span className="font-bold text-slate-900">{startIndex}–{endIndex}</span> of <span className="font-bold text-slate-900">{filteredCategories.length}</span> categories
                </div>

                {/* Page Controls (Always Rendered) */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 rounded-xl font-extrabold text-xs transition cursor-pointer flex items-center justify-center ${
                          currentPage === p
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 font-bold bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-xs flex items-center gap-1"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>

              </div>
            </>
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

        {/* Footer */}
        <footer className="w-full text-center py-6 border-t border-slate-200 mt-8 text-xs text-slate-500 font-bold flex items-center justify-center gap-1.5">
          <Lock size={13} className="text-amber-600" />
          <span>Cekat.AI Enterprise Demo Platform — Internal Use Only</span>
        </footer>

      </div>

    </div>
  );
};
