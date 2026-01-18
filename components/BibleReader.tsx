
import React, { useState, useEffect, useRef } from 'react';
import { BIBLE_BOOKS } from '../constants';
import { getBibleExplanation, speakVerses, playRawAudio } from '../services/geminiService';

interface BibleReaderProps {
  bookId: string;
  chapter: number;
  theme: 'light' | 'dark' | 'sepia';
  onChapterChange: (chapter: number) => void;
}

const BibleReader: React.FC<BibleReaderProps> = ({ bookId, chapter, theme, onChapterChange }) => {
  const [verses, setVerses] = useState<string[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const book = BIBLE_BOOKS.find(b => b.id === bookId);

  useEffect(() => {
    const fetchChapterData = async () => {
      if (!book) return;
      setIsLoadingContent(true);
      setError(null);
      setExplanation(null);
      stopAudio();

      try {
        const testamentPath = book.testament === 'Old' ? 'old-testament' : 'new-testament';
        // Ajustado para caminho relativo 'data/...'
        const url = `data/${testamentPath}/${bookId}/${chapter}.json`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Não foi possível encontrar o capítulo em: ${url}`);
        }
        
        const data = await response.json();
        const content = Array.isArray(data) ? data : (data.verses || []);
        
        if (content.length === 0) {
          setVerses(["Conteúdo indisponível para este capítulo."]);
        } else {
          setVerses(content);
        }
      } catch (err: any) {
        console.error("Erro de carregamento:", err);
        setError(`Erro: ${err.message}. Certifique-se que a pasta 'data' está na raiz do seu servidor/projeto.`);
        setVerses(["Não foi possível carregar o texto sagrado."]);
      } finally {
        setIsLoadingContent(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    fetchChapterData();
  }, [bookId, chapter, book]);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {}
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleListen = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }
    setIsPlaying(true);
    try {
      const audioData = await speakVerses(verses.join(' '));
      if (audioData) {
        audioSourceRef.current = await playRawAudio(audioData);
        audioSourceRef.current.onended = () => setIsPlaying(false);
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  const handleStudyWithAi = async () => {
    if (!book) return;
    setIsLoadingAi(true);
    try {
      const result = await getBibleExplanation(book.name, chapter, verses.join(' '));
      setExplanation(result || "Insight não disponível.");
    } catch (error) {
      setExplanation("Erro ao conectar com a IA.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="animate-fade-in pb-32">
      <div className="mb-12">
        <div className="flex items-baseline gap-4 mb-8">
          <h2 className="text-6xl font-black tracking-tighter text-amber-900/20 dark:text-amber-500/20 select-none">
            {chapter}
          </h2>
          <h3 className="text-3xl font-black tracking-tighter text-amber-900 dark:text-amber-500">
            {book?.name}
          </h3>
        </div>

        <div className="flex flex-wrap gap-3">
          <button 
            disabled={isLoadingContent || !!error}
            onClick={handleListen}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all
              ${isPlaying ? 'bg-red-600 text-white animate-pulse' : 'bg-stone-500/10 text-stone-600 dark:text-stone-300 hover:bg-stone-500/20 disabled:opacity-30'}
            `}
          >
            {isPlaying ? 'Parar Leitura' : 'Ouvir Capítulo'}
          </button>
          
          <button 
            disabled={isLoadingContent || isLoadingAi || !!error}
            onClick={handleStudyWithAi}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-amber-900 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-800 transition-all shadow-lg shadow-amber-900/20 disabled:opacity-30"
          >
            {isLoadingAi ? 'Consultando...' : 'Pedir Insight'}
          </button>
        </div>
      </div>

      {isLoadingContent ? (
        <div className="py-24 flex flex-col items-center justify-center gap-6 opacity-30">
          <div className="w-12 h-12 border-4 border-amber-900 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest">Carregando manuscrito...</p>
        </div>
      ) : error ? (
        <div className="py-24 p-8 border-2 border-dashed border-red-500/20 rounded-3xl text-center bg-red-50 dark:bg-red-900/10">
           <p className="text-red-500 font-bold mb-4">{error}</p>
           <p className="text-sm opacity-60">Dica: Se você está rodando localmente ou no Vercel, a pasta 'data' deve ser servida como estática.</p>
           <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-500 text-white rounded-xl text-xs font-bold">Tentar Novamente</button>
        </div>
      ) : (
        <div className="serif-text text-xl md:text-2xl leading-[1.8] text-justify space-y-10 selection:bg-amber-200 selection:text-amber-900">
          {verses.map((v, i) => (
            <p key={i} className="relative group hover:opacity-100 opacity-90 transition-opacity">
              <span className="absolute -left-8 md:-left-12 top-2 text-[10px] font-sans font-black opacity-30 group-hover:opacity-100 transition-opacity select-none">
                {i + 1}
              </span>
              {v}
            </p>
          ))}
        </div>
      )}

      {explanation && (
        <div className="mt-20 p-8 md:p-12 bg-amber-900 text-amber-50 rounded-[2.5rem] shadow-2xl animate-fade-in relative">
          <button 
            onClick={() => setExplanation(null)}
            className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1.5 h-10 bg-amber-400 rounded-full"></div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Insight Teológico</h4>
              <p className="text-lg font-bold">Luz sobre a passagem</p>
            </div>
          </div>
          <p className="text-lg leading-relaxed opacity-90 italic">
            {explanation}
          </p>
        </div>
      )}

      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:right-12 z-40">
        <div className={`flex items-center gap-1 p-1.5 rounded-full border shadow-2xl backdrop-blur-xl ${theme === 'dark' ? 'bg-stone-800 border-stone-700 text-white' : theme === 'sepia' ? 'bg-[#fcf8ef] border-[#e8dfc8] text-[#433422]' : 'bg-white border-stone-200 text-stone-900'}`}>
          <button 
            disabled={chapter <= 1 || isLoadingContent}
            onClick={() => onChapterChange(chapter - 1)}
            className="p-4 rounded-full hover:bg-stone-500/10 transition-all disabled:opacity-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="px-4 text-sm font-black opacity-40">
            {chapter} / {book?.chaptersCount}
          </div>
          <button 
            disabled={chapter >= (book?.chaptersCount || 1) || isLoadingContent}
            onClick={() => onChapterChange(chapter + 1)}
            className="p-4 rounded-full hover:bg-stone-500/10 transition-all disabled:opacity-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default BibleReader;
