
import React, { useState } from 'react';
import { searchBibleConcepts } from '../services/geminiService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    try {
      const res = await searchBibleConcepts(query);
      setResults(res || "Nenhum resultado encontrado.");
    } catch (err) {
      setResults("Erro ao realizar a busca.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Busca Temática (IA)</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSearch} className="p-6">
          <div className="relative">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: 'Versículos sobre ansiedade' ou 'Onde fala sobre o amor?'"
              className="w-full bg-stone-100 dark:bg-stone-800 border-none rounded-xl px-4 py-4 pr-12 focus:ring-2 focus:ring-amber-500 transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-amber-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </div>
          <p className="mt-2 text-xs text-stone-500">Busque por ideias, sentimentos ou passagens específicas.</p>
        </form>

        <div className="flex-1 overflow-y-auto p-6 pt-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin h-8 w-8 border-4 border-amber-800 border-t-transparent rounded-full"></div>
              <p className="text-stone-500 animate-pulse">Sondando as escrituras...</p>
            </div>
          ) : results ? (
            <div className="prose dark:prose-invert max-w-none text-stone-700 dark:text-stone-300 whitespace-pre-wrap bg-stone-50 dark:bg-stone-800/50 p-6 rounded-xl border border-stone-200 dark:border-stone-700">
              {results}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-stone-100 dark:bg-stone-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <p className="text-stone-500">Faça sua primeira pergunta acima.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
