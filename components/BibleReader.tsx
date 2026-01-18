
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
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  
  const book = BIBLE_BOOKS.find(b => b.id === bookId);

  useEffect(() => {
    const fetchChapterData = async () => {
      if (!book) return;
      setIsLoadingContent(true);
      setExplanation(null);
      stopAudio();

      try {
        const testamentPath = book.testament === 'Old' ? 'old-testament' : 'new-testament';
        // Ajuste o caminho abaixo conforme a estrutura exata que você colocou no projeto
        const response = await fetch(`./data/${testamentPath}/${bookId}/${chapter}.json`);
        
        if (!response.ok) throw new Error("Capítulo não encontrado");
        
        const data = await response.json();
        // Assume-se que o JSON tem um campo "verses" que é uma array de strings ou objetos
        // Ajustando para o formato comum do repo: array de strings
        setVerses(Array.isArray(data) ? data : data.verses || ["Erro ao formatar versículos."]);
      } catch (error) {
        console.error("Erro ao carregar capítulo:", error);
        setVerses(["Não foi possível carregar o conteúdo deste capítulo. Verifique se os arquivos JSON estão na pasta data."]);
      } finally {
        setIsLoadingContent(false);
      }
    };

    fetchChapterData();
  }, [bookId, chapter, book]);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
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
      setExplanation("Erro na conexão com o assistente.");
    } finally {
      setIsLoadingAi(false);
    }
  };

  const themeClasses = {
    light: 'bg-stone-50 text-stone-800',
    dark: 'bg-stone-900 text-stone-200',
    sepia: 'theme-sepia'
  };

  return (
    <div className={`p-4 md:p-8 rounded-3xl transition-colors duration-500 ${themeClasses[theme]} min-h-screen animate-fade-in`}>
      <div className="max-w-3xl mx-auto">
        {/* Header de Navegação */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-stone-200/50 dark:border-stone-700/50 pb-8">
          <div>
            <h2 className="text-5xl font-black tracking-tighter text-amber-900 dark:text-amber-500 mb-2">
              {book?.name} <span className="font-light opacity-50">{chapter}</span>
            </h2>
            <div className="flex gap-4">
              <button 
                disabled={isLoadingContent}
                onClick={handleListen}
                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${isPlaying ? 'text-red-600' : 'text-stone-400 hover:text-amber-800 disabled:opacity-20'}`}
              >
                {isPlaying ? (
                  <><div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div> Parar Áudio</>
                ) : (
                  <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg> Ouvir Capítulo</>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-white/10 p-1 rounded-2xl backdrop-blur-sm">
            <button 
              disabled={chapter <= 1 || isLoadingContent}
              onClick={() => onChapterChange(chapter - 1)}
              className="p-3 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-all disabled:opacity-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <span className="text-sm font-bold w-12 text-center">{chapter}</span>
            <button 
              disabled={chapter >= (book?.chaptersCount || 1) || isLoadingContent}
              onClick={() => onChapterChange(chapter + 1)}
              className="p-3 rounded-xl hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-all disabled:opacity-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {/* Conteúdo do Texto */}
        {isLoadingContent ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4 opacity-50">
            <div className="animate-spin h-10 w-10 border-4 border-amber-900 border-t-transparent rounded-full"></div>
            <p className="font-black uppercase tracking-widest text-xs">Abrindo pergaminhos...</p>
          </div>
        ) : (
          <article className="serif-text text-2xl leading-[1.7] space-y-8 mb-20 text-justify animate-fade-in">
            {verses.map((text, index) => (
              <p key={index} className="relative group transition-opacity hover:opacity-100 opacity-90">
                <span className="absolute -left-10 text-[10px] text-stone-400 font-sans font-bold select-none top-4">
                  {String(index + 1).padStart(2, '0')}
                </span>
                {text}
              </p>
            ))}
          </article>
        )}

        {/* Seção de IA */}
        {!isLoadingContent && (
          <div className="pt-12 border-t border-stone-200 dark:border-stone-800">
            {!explanation ? (
              <button 
                onClick={handleStudyWithAi}
                disabled={isLoadingAi}
                className="group flex items-center gap-4 bg-amber-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-amber-800 transition-all transform hover:-translate-y-1 shadow-xl shadow-amber-900/20"
              >
                {isLoadingAi ? (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                ) : (
                  <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                )}
                {isLoadingAi ? 'Analisando...' : 'Pedir Insight Teológico'}
              </button>
            ) : (
              <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-3xl p-8 border border-amber-100 dark:border-amber-900/30 animate-fade-in">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-900 rounded-2xl flex items-center justify-center text-amber-200 shadow-lg">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    </div>
                    <div>
                      <h3 className="font-black text-amber-900 dark:text-amber-200 uppercase tracking-widest text-xs">Insight da IA</h3>
                      <p className="text-amber-800/60 dark:text-amber-400/60 text-[10px]">Contextualização baseada em Peterson</p>
                    </div>
                  </div>
                  <button onClick={() => setExplanation(null)} className="text-stone-400 hover:text-stone-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <p className="text-lg leading-relaxed text-stone-700 dark:text-stone-300 whitespace-pre-wrap font-medium italic">
                  {explanation}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BibleReader;
