import React, { useState } from 'react';
import { Search, Volume2, Book, ArrowRight, Loader2, AlertCircle, Save, Star, Share2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dictionary = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
      if (!res.ok) throw new Error('Không tìm thấy từ này.');
      const data = await res.json();
      setResult(data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    const audioSrc = result?.phonetics?.find(p => p.audio && p.audio !== '')?.audio;
    if (audioSrc) new Audio(audioSrc).play();
    else alert("Từ này chưa có file phát âm.");
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900">
      <Header />

      <main className="flex-grow pt-24 pb-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          
          {/* --- 1. SEARCH SECTION (Floating Style) --- */}
          <div className="relative z-10 mb-12 text-center">
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">Dictionary</h1>
            <p className="text-slate-500 mb-8 font-medium">Tra cứu chuẩn xác - Phát âm bản xứ</p>

            <div className="bg-white p-2 rounded-full shadow-xl shadow-blue-100/50 border border-slate-100 flex items-center transition-all focus-within:ring-4 focus-within:ring-blue-100 focus-within:border-blue-400 max-w-xl mx-auto">
              <div className="pl-4 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <form onSubmit={handleSearch} className="flex-1">
                <input
                  type="text"
                  className="w-full p-3 bg-transparent outline-none text-lg text-slate-700 placeholder-slate-400 font-medium"
                  placeholder="Nhập từ vựng (VD: serenity...)"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  autoFocus
                />
              </form>
              <button 
                onClick={handleSearch}
                disabled={loading || !word.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-all disabled:bg-slate-200 disabled:cursor-not-allowed flex-shrink-0 mr-1"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* --- 2. RESULT AREA --- */}
          
          {/* Error State */}
          {error && (
            <div className="max-w-md mx-auto bg-white border border-red-100 rounded-2xl p-8 text-center shadow-sm animate-fade-in-up">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Không tìm thấy</h3>
              <p className="text-slate-500 mt-1 text-sm">Rất tiếc, chúng tôi không tìm thấy định nghĩa cho từ này.</p>
            </div>
          )}

          {/* Success State */}
          {result && !loading && (
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden animate-fade-in-up">
              
              {/* Header: Word & Audio */}
              <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 p-8 sm:p-10 text-white">
                <div className="absolute top-0 right-0 p-6 opacity-10">
                  <Book className="w-32 h-32 transform rotate-12" />
                </div>
                
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-5xl sm:text-6xl font-bold tracking-tight mb-2">{result.word}</h2>
                    <div className="flex items-center gap-3 text-blue-200 text-xl font-mono">
                      <span>{result.phonetic || result.phonetics[0]?.text}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center backdrop-blur-sm transition text-white" title="Lưu từ">
                        <Star className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={playAudio}
                      className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30 transition transform hover:scale-105 active:scale-95"
                      title="Phát âm"
                    >
                      <Volume2 className="w-6 h-6 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Body: Meanings */}
              <div className="p-8 sm:p-10 space-y-10">
                {result.meanings.map((meaning, index) => (
                  <div key={index} className="group">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm uppercase tracking-wide border border-slate-200">
                        {meaning.partOfSpeech}
                      </span>
                      <div className="h-px bg-slate-100 flex-1 group-hover:bg-blue-100 transition-colors"></div>
                    </div>

                    <ul className="space-y-6">
                      {meaning.definitions.slice(0, 3).map((def, idx) => (
                        <li key={idx} className="relative pl-6">
                          {/* Bullet decoration */}
                          <div className="absolute left-0 top-2.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          
                          <p className="text-lg text-slate-700 font-medium leading-relaxed">
                            {def.definition}
                          </p>
                          
                          {def.example && (
                            <div className="mt-2 pl-4 border-l-2 border-slate-200 text-slate-500 italic text-base">
                              "{def.example}"
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Footer: Synonyms (nếu có) */}
              {result.meanings[0]?.synonyms?.length > 0 && (
                <div className="bg-slate-50 px-8 py-6 border-t border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Từ đồng nghĩa</p>
                  <div className="flex flex-wrap gap-2">
                    {result.meanings[0].synonyms.slice(0, 5).map(syn => (
                      <span key={syn} className="px-3 py-1 bg-white border border-slate-200 rounded-full text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 cursor-pointer transition">
                        {syn}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* --- 3. EMPTY STATE (Start Screen) --- */}
          {!result && !loading && !error && (
             <div className="mt-16 text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-lg shadow-blue-100 mb-6 animate-bounce-slow">
                   <Book className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-700 mb-2">Bắt đầu hành trình từ vựng</h3>
                <p className="text-slate-500 max-w-sm mx-auto">Nhập bất kỳ từ tiếng Anh nào để xem định nghĩa chi tiết và ví dụ ngữ cảnh.</p>
             </div>
          )}

        </div>
      </main>

      <Footer />
      
      {/* CSS Animation nhỏ */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-bounce-slow { animation: bounce 3s infinite; }
      `}</style>
    </div>
  );
};

export default Dictionary;