import React, { useState, useEffect } from 'react';
import { Search, Volume2, Book, Loader2, AlertCircle, ArrowRight, List, Quote, History, Tag, Trash2 } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Dictionary = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dict_history');
    if (saved) {
        setRecentSearches(JSON.parse(saved));
    }
  }, []);

  const addToHistory = (newWord) => {
    let updated = [newWord, ...recentSearches.filter(w => w !== newWord)];
    if (updated.length > 5) updated = updated.slice(0, 5); 
    setRecentSearches(updated);
    localStorage.setItem('dict_history', JSON.stringify(updated));
  };

  const clearHistory = () => {
      setRecentSearches([]);
      localStorage.removeItem('dict_history');
  };

  const handleSearch = async (e) => {
    if(e) e.preventDefault();
    if (!word.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    addToHistory(word);

    try {
      const res = await fetch('http://localhost:5000/api/dictionary/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi khi tra từ');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const playAudio = () => {
    if (!result) return;
    const utterance = new SpeechSynthesisUtterance(result.word);
    utterance.lang = 'en-US'; 
    window.speechSynthesis.speak(utterance);
  };
  const popularWords = ['Resilience', 'Sustainable', 'Mitigate', 'Diversity', 'Innovation'];

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans overflow-hidden">
      <Header />
      
      <main className="flex-1 pt-16 flex overflow-hidden">
        <div className="flex flex-1 h-full">
          
          <div className="hidden lg:flex lg:w-[30%] bg-white border-r border-gray-200 flex-col z-20 shadow-lg h-full">
            <div className="p-8 border-b border-gray-100">
              <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                  <Book className="w-6 h-6" /> 
                </div>
                Dictionary AI
              </h1>
              <p className="text-slate-500 text-sm mt-2 ml-1">Tra cứu từ vựng VSTEP chuẩn xác</p>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <form onSubmit={handleSearch} className="relative group mb-8">
                <div className="relative flex items-center">
                  <Search className="absolute left-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    className="w-full py-4 pl-12 pr-14 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" 
                    placeholder="Nhập từ vựng..."
                    value={word}
                    onChange={(e) => setWord(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={loading || !word.trim()}
                    className="absolute right-2 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 transition-all shadow-md shadow-blue-200"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                  </button>
                </div>
              </form>
              
              {recentSearches.length > 0 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><History size={12}/> Gần đây</p>
                        <button onClick={clearHistory} className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"><Trash2 size={10}/> Xóa</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {recentSearches.map((w, idx) => (
                            <button 
                                key={idx}
                                onClick={() => { setWord(w); handleSearch(); }}
                                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all"
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                  </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Tag size={12}/> Từ vựng VSTEP B1/B2</p>
                <div className="flex flex-wrap gap-2">
                  {popularWords.map(w => (
                    <button 
                      key={w} 
                      onClick={() => {setWord(w); handleSearch();}} 
                      className="px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-600 hover:border-blue-200 hover:bg-blue-50 transition-all"
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[70%] bg-slate-50/50 overflow-y-auto flex flex-col h-full">
            
            <div className="flex-1 p-6 lg:p-12 flex flex-col">
                {/* TRẠNG THÁI CHỜ */}
                {!result && !loading && !error && (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-300 animate-fade-in">
                    <Book className="w-24 h-24 mb-6 opacity-20" />
                    <p className="text-xl font-medium text-slate-400">Nhập từ vựng để bắt đầu tra cứu</p>
                </div>
                )}

                {/* TRẠNG THÁI LỖI */}
                {error && (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                    <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md border border-red-50">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Không tìm thấy</h3>
                    <p className="text-slate-500">{error}</p>
                    </div>
                </div>
                )}

                {/* TRẠNG THÁI CÓ KẾT QUẢ */}
                {result && !loading && (
                <div className="max-w-4xl mx-auto w-full animate-fade-in space-y-6">
                    <div className="bg-white rounded-3xl p-10 shadow-xl border border-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                        <div className="flex items-center gap-3 mb-3">
                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold text-xs uppercase tracking-wide border border-slate-200">{result.type}</span>
                            <span className="text-slate-400 font-medium text-lg font-mono">/{result.phonetic}/</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6 capitalize">{result.word}</h1>
                        <div className="pl-6 border-l-4 border-blue-500">
                            <h2 className="text-3xl font-bold text-blue-700 mb-3">{result.meaning_vi}</h2>
                            <p className="text-slate-600 text-lg leading-relaxed">{result.description}</p>
                        </div>
                        </div>
                        <button onClick={playAudio} className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-lg active:scale-95 group">
                        <Volume2 className="w-8 h-8" />
                        </button>
                    </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
                    <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-lg border border-slate-100">
                        <h3 className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 rounded-md"><Quote className="w-4 h-4" /></div> Ví dụ ngữ cảnh
                        </h3>
                        <div className="space-y-6">
                        {result.examples?.map((ex, idx) => (
                            <div key={idx} className="group">
                            <p className="text-xl font-medium text-slate-800 mb-2 group-hover:text-blue-700 transition-colors">"{ex.en}"</p>
                            <p className="text-slate-500 italic pl-4 border-l-2 border-slate-200 group-hover:border-blue-300 transition-colors">{ex.vi}</p>
                            </div>
                        ))}
                        </div>
                    </div>
                    <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 h-fit">
                        <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-6 flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-100 rounded-md"><List className="w-4 h-4" /></div> Từ đồng nghĩa
                        </h3>
                        <div className="flex flex-wrap gap-2">
                        {result.synonyms && result.synonyms.length > 0 ? (
                            result.synonyms.map((syn, i) => (
                            <span key={i} onClick={() => {setWord(syn); handleSearch();}} className="cursor-pointer px-3 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-sm font-medium hover:bg-indigo-50 hover:text-indigo-600 transition-all">{syn}</span>
                            ))
                        ) : ( <p className="text-slate-400 text-sm italic">Không có.</p> )}
                        </div>
                    </div>
                    </div>
                </div>
                )}
            </div>

            <div className="mt-auto hidden lg:block">
              <Footer />
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default Dictionary;