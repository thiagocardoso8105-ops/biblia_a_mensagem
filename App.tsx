
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import BibleReader from './components/BibleReader';
import SearchModal from './components/SearchModal';
import { generateDailyDevotional } from './services/geminiService';

const App: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState('gn');
  const [currentChapter, setCurrentChapter] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('sepia');
  const [dailyDevotional, setDailyDevotional] = useState<string | null>(null);
  const [showDevotional, setShowDevotional] = useState(false);

  useEffect(() => {
    const fetchDevotional = async () => {
      try {
        const res = await generateDailyDevotional();
        setDailyDevotional(res || null);
      } catch (e) {
        console.error("Devotional error");
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
        <div className="flex justify-end gap-3 mb-12">
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-stone-200/50 dark:bg-stone-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-amber-900 hover:text-white transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            Busca Inteligente
          </button>
          
          <button 
            onClick={() => setShowDevotional(!showDevotional)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${showDevotional ? 'bg-amber-900 text-white shadow-xl' : 'bg-stone-200/50 dark:bg-stone-800 shadow-sm'}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
            Devocional
          </button>
        </div>

        {showDevotional && dailyDevotional ? (
          <div className="animate-fade-in mb-12 bg-white/40 dark:bg-stone-800/40 backdrop-blur-md p-10 rounded-[2.5rem] border border-amber-200/30 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-800 mb-6">
              <div className="w-1.5 h-12 bg-amber-800 rounded-full"></div>
              <span className="font-black tracking-[0.3em] text-[10px] uppercase">O Pão de Hoje</span>
            </div>
            <div className="serif-text text-2xl italic text-stone-800 dark:text-stone-200 leading-relaxed">
              {dailyDevotional}
            </div>
            <button 
              onClick={() => setShowDevotional(false)}
              className="mt-8 text-amber-900 font-black text-[10px] uppercase tracking-widest border-b-2 border-amber-900/20 hover:border-amber-900 transition-all pb-1"
            >
              Começar a Leitura
            </button>
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

      {/* Floating Action for Help */}
      <button 
        onClick={() => setIsSearchOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-amber-900 text-white rounded-2xl flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all z-50 group border-b-4 border-amber-950"
      >
        <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </button>
    </Layout>
  );
};

export default App;
