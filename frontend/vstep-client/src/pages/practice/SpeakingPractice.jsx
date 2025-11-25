import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, RefreshCw, ArrowLeft, Clock } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const SpeakingPractice = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { part } = location.state || { part: '1' };

  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // State cho Recorder
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  // 1. Lấy đề thi
  useEffect(() => {
    fetch(`http://localhost:5000/api/speaking/test?part=${part}`)
      .then(res => res.json())
      .then(data => {
        setQuestion(data);
        setLoading(false);
      });
  }, [part]);

  // 2. Logic Ghi âm
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        chunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setAudioURL(null);
      
      // Timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err) {
      alert("Vui lòng cho phép truy cập Micro để ghi âm!");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      
      // Tắt đèn micro
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Đang tải...</div>;

  return (
    <div className="h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="h-16 bg-white shadow-sm flex items-center px-6 justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => navigate('/practice/speaking')} className="p-2 hover:bg-gray-100 rounded-full">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="font-bold text-gray-800">Speaking Part {part} Practice</h1>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* CỘT TRÁI: CÂU HỎI (50%) */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto bg-white border-r border-gray-200">
           <h2 className="text-2xl font-bold text-gray-900 mb-6">{question?.title}</h2>
           <div className="prose prose-lg text-gray-700" dangerouslySetInnerHTML={{ __html: question?.question_text }} />
        </div>

        {/* CỘT PHẢI: RECORDER (50%) */}
        <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center bg-gray-100 relative">
            
            {/* Visualizer vòng tròn */}
            <div className={`relative w-64 h-64 rounded-full border-4 flex items-center justify-center mb-8 transition-all duration-500 ${isRecording ? 'border-red-500 bg-red-50 scale-110' : 'border-gray-300 bg-white'}`}>
                {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-red-400 opacity-50 animate-ping"></div>
                )}
                <div className="text-center z-10">
                    <div className={`text-5xl font-mono font-bold mb-2 ${isRecording ? 'text-red-600' : 'text-gray-400'}`}>
                        {formatTime(recordingTime)}
                    </div>
                    <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">
                        {isRecording ? 'Đang Ghi Âm...' : 'Sẵn sàng'}
                    </p>
                </div>
            </div>

            {/* Control Buttons */}
            <div className="flex gap-6 items-center">
                {!isRecording ? (
                    <button 
                        onClick={startRecording}
                        className="w-20 h-20 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
                    >
                        <Mic size={32} />
                    </button>
                ) : (
                    <button 
                        onClick={stopRecording}
                        className="w-20 h-20 bg-gray-800 hover:bg-gray-900 text-white rounded-full flex items-center justify-center shadow-xl transition-transform hover:scale-105 active:scale-95"
                    >
                        <Square size={28} fill="currentColor" />
                    </button>
                )}
            </div>

            {/* Playback Area */}
            {audioURL && !isRecording && (
                <div className="mt-10 w-full max-w-md bg-white p-4 rounded-xl shadow-md animate-fade-in-up">
                    <p className="text-sm font-bold text-gray-500 mb-2 ml-1">Nghe lại bài nói:</p>
                    <audio src={audioURL} controls className="w-full" />
                    
                    <div className="mt-4 flex gap-3">
                        <button 
                            onClick={() => setAudioURL(null)} 
                            className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2"
                        >
                            <RefreshCw size={16} /> Thu lại
                        </button>
                        <button 
                            onClick={() => alert('Tính năng Nộp bài ghi âm sẽ cập nhật sau!')}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-md"
                        >
                            Nộp bài
                        </button>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default SpeakingPractice;