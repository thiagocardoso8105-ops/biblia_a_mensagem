
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

  const themeColors = {
    light: 'bg-white text-stone-900 border-stone-200',
    dark: 'bg-stone-900 text-stone-100 border-stone-800',
    sepia: 'bg-[#f4ecd8] text-[#433422] border-[#e8dfc8]'
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 font-sans ${themeColors[theme]}`}>
      {/* Mobile Header */}
      <header className={`md:hidden flex items-center justify-between p-4 sticky top-0 z-50 border-b backdrop-blur-lg ${themeColors[theme]} bg-opacity-80`}>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
          className="p-2 rounded-xl hover:bg-stone-500/10"
          aria-label="Menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-sm font-black tracking-[0.2em] uppercase">A Mensagem</h1>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        w-72 border-r z-40 overflow-y-auto ${themeColors[theme]}
      `}>
        <div className="p-6">
          <div className="mb-10 flex flex-col gap-6">
            <h1 className="text-xl font-black tracking-[0.25em] uppercase text-amber-900 dark:text-amber-500">
              A Mensagem
            </h1>
            
            <div className="flex items-center gap-2 p-1.5 bg-stone-500/5 rounded-2xl w-fit">
              <button 
                onClick={() => setTheme('light')} 
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${theme === 'light' ? 'bg-white shadow-sm scale-110' : 'opacity-40 hover:opacity-100'}`}
                title="Luz"
              >
                <div className="w-4 h-4 rounded-full bg-stone-100 border border-stone-300"></div>
              </button>
              <button 
                onClick={() => setTheme('sepia')} 
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${theme === 'sepia' ? 'bg-[#fcf8ef] shadow-sm scale-110' : 'opacity-40 hover:opacity-100'}`}
                title="Sépia"
              >
                <div className="w-4 h-4 rounded-full bg-[#f4ecd8] border border-stone-400"></div>
              </button>
              <button 
                onClick={() => setTheme('dark')} 
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-stone-800 shadow-sm scale-110' : 'opacity-40 hover:opacity-100'}`}
                title="Escuro"
              >
                <div className="w-4 h-4 rounded-full bg-stone-900 border border-stone-700"></div>
              </button>
            </div>
          </div>
          
          <nav className="space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-4">
                Antigo Testamento
              </h3>
              <div className="flex flex-col gap-0.5">
                {BIBLE_BOOKS.filter(b => b.testament === 'Old').map(book => (
                  <button
                    key={book.id}
                    onClick={() => { onBookSelect(book.id); setIsSidebarOpen(false); }}
                    className={`
                      text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${selectedBook === book.id 
                        ? 'bg-amber-900 text-white shadow-md shadow-amber-900/10 translate-x-1' 
                        : 'hover:bg-stone-500/5 opacity-70 hover:opacity-100'}
                    `}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-stone-400 dark:text-stone-500 uppercase tracking-[0.2em] mb-4">
                Novo Testamento
              </h3>
              <div className="flex flex-col gap-0.5">
                {BIBLE_BOOKS.filter(b => b.testament === 'New').map(book => (
                  <button
                    key={book.id}
                    onClick={() => { onBookSelect(book.id); setIsSidebarOpen(false); }}
                    className={`
                      text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${selectedBook === book.id 
                        ? 'bg-amber-900 text-white shadow-md shadow-amber-900/10 translate-x-1' 
                        : 'hover:bg-stone-500/5 opacity-70 hover:opacity-100'}
                    `}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </section>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden relative h-screen overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8 md:py-16">
          {children}
        </div>
        {/* Progress Bar (Mock) */}
        <div className="fixed bottom-0 left-0 right-0 h-1 bg-stone-500/5 md:left-72">
           <div className="h-full bg-amber-900 w-1/3 transition-all duration-500"></div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
