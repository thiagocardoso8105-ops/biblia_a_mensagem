
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BibleReader from './components/BibleReader';
import SearchModal from './components/SearchModal';
import { generateDailyDevotional } from './services/geminiService';

const App: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState('genesis');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('sepia');
  const [dailyDevotional, setDailyDevotional] = useState<string | null>(null);
  const [showDevotional, setShowDevotional] = useState(false);
  const [isLoadingDevotional, setIsLoadingDevotional] = useState(true);

  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        setIsLoadingDevotional(true);
        const res = await generateDailyDevotional();
        setDailyDevotional(res || null);
      } catch (e) {
        console.error("Erro ao carregar devocional diário.");
      } finally {
        setIsLoadingDevotional(false);
      }
    };
    fetchDevotional();
  }, []);

  const handleBookSelect = (id: string) => {
    setSelectedBook(id);
    setCurrentChapter(1);
    setShowDevotional(false);
  };

  return (
    <Layout 
      selectedBook={selectedBook} 
      onBookSelect={handleBookSelect} 
      theme={theme} 
      setTheme={setTheme}
    >
      <div className="relative">
        <div className="flex flex-wrap justify-end gap-3 mb-16">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-5 py-3 bg-stone-500/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-amber-900 hover:text-white transition-all group"
          >
            <svg className="w-4 h-4 text-amber-700 group-hover:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Busca IA
          </button>
          
          <button 
            onClick={() => setShowDevotional(!showDevotional)}
            disabled={isLoadingDevotional}
            className={`
              flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all
              ${showDevotional 
                ? 'bg-amber-900 text-white shadow-xl shadow-amber-900/20' 
                : 'bg-stone-500/10 hover:bg-stone-500/20'}
            `}
          >
            {isLoadingDevotional ? (
              <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
              </svg>
            )}
            Pão de Hoje
          </button>
        </div>

        {showDevotional && dailyDevotional ? (
          <div className="animate-fade-in mb-12 max-w-2xl mx-auto">
            <div className="relative p-10 md:p-16 rounded-[3rem] bg-white dark:bg-stone-800 shadow-2xl border border-stone-200 dark:border-stone-700 overflow-hidden">
               <div className="absolute -top-10 -right-10 opacity-5 pointer-events-none">
                 <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.45l8.27 14.3H3.73L12 5.45z"/></svg>
               </div>
              <div className="flex items-center gap-3 mb-10">
                <div className="w-1.5 h-12 bg-amber-900 rounded-full"></div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-900/40">Inpiração Matinal</h4>
              </div>
              <div className="serif-text text-2xl md:text-3xl italic leading-relaxed text-stone-800 dark:text-stone-100">
                {dailyDevotional}
              </div>
              <button 
                onClick={() => setShowDevotional(false)}
                className="mt-12 text-[10px] font-black uppercase tracking-widest text-amber-900 border-b-2 border-amber-900/20 pb-1 hover:border-amber-900 transition-all"
              >
                Voltar à leitura →
              </button>
            </div>
          </div>
        ) : (
          <BibleReader 
            bookId={selectedBook} 
            chapter={currentChapter} 
            onChapterChange={setCurrentChapter} 
            theme={theme}
          />
        )}
      </div>

      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />

      {/* Floating Action for Search */}
      <button 
        onClick={() => setIsSearchOpen(true)}
        className="fixed bottom-10 right-10 md:hidden w-14 h-14 bg-amber-900 text-white rounded-2xl flex items-center justify-center shadow-2xl z-50 transition-transform active:scale-90"
        aria-label="Busca com IA"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </button>
    </Layout>
  );
};

export default App;
