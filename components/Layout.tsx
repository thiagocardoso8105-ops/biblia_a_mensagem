
import React, { useState } from 'react';
import { BIBLE_BOOKS } from '../constants';

interface LayoutProps {
  children: React.ReactNode;
  onBookSelect: (bookId: string) => void;
  selectedBook: string;
  theme: 'light' | 'dark' | 'sepia';
  setTheme: (theme: 'light' | 'dark' | 'sepia') => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onBookSelect, selectedBook, theme, setTheme }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 ${theme === 'dark' ? 'bg-stone-900 text-stone-100' : theme === 'sepia' ? 'theme-sepia' : 'bg-stone-50 text-stone-900'}`}>
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 sticky top-0 bg-inherit z-50 border-b border-stone-200/20 backdrop-blur-md">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 bg-stone-200/20 rounded-xl">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <h1 className="text-lg font-black tracking-tighter text-amber-800">A MENSAGEM</h1>
        <div className="flex gap-2">
           <button onClick={() => setTheme('sepia')} className="w-6 h-6 rounded-full bg-[#f4ecd8] border border-stone-300"></button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        w-80 bg-white/10 dark:bg-stone-950/10 backdrop-blur-xl border-r border-stone-200/10 z-40 overflow-y-auto
      `}>
        <div className="p-8">
          <div className="mb-12 flex items-center justify-between">
            <h1 className="text-3xl font-black tracking-tighter text-amber-900 dark:text-amber-500">A MENSAGEM</h1>
            <div className="hidden md:flex gap-1.5">
              <button onClick={() => setTheme('light')} className={`w-4 h-4 rounded-full bg-white border border-stone-200 ${theme === 'light' ? 'ring-2 ring-amber-800' : ''}`}></button>
              <button onClick={() => setTheme('sepia')} className={`w-4 h-4 rounded-full bg-[#f4ecd8] border border-stone-300 ${theme === 'sepia' ? 'ring-2 ring-amber-800' : ''}`}></button>
              <button onClick={() => setTheme('dark')} className={`w-4 h-4 rounded-full bg-stone-800 border border-stone-900 ${theme === 'dark' ? 'ring-2 ring-amber-500' : ''}`}></button>
            </div>
          </div>
          
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-stone-200/50"></div> Antigo Testamento
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {BIBLE_BOOKS.filter(b => b.testament === 'Old').map(book => (
                  <button
                    key={book.id}
                    onClick={() => { onBookSelect(book.id); setIsSidebarOpen(false); }}
                    className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedBook === book.id ? 'bg-amber-900 text-white shadow-lg active-book' : 'hover:bg-amber-900/5'}`}
                  >
                    {book.name}
                    {selectedBook === book.id && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                <div className="h-px flex-1 bg-stone-200/50"></div> Novo Testamento
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {BIBLE_BOOKS.filter(b => b.testament === 'New').map(book => (
                  <button
                    key={book.id}
                    onClick={() => { onBookSelect(book.id); setIsSidebarOpen(false); }}
                    className={`group flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedBook === book.id ? 'bg-amber-900 text-white shadow-lg active-book' : 'hover:bg-amber-900/5'}`}
                  >
                    {book.name}
                    {selectedBook === book.id && <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse"></div>}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-x-hidden">
        <div className="max-w-5xl mx-auto px-6 py-8 md:py-16">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
