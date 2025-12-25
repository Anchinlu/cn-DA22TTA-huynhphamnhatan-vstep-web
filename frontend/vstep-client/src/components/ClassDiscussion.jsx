import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';

const ClassDiscussion = ({ classId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  
  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/classes/${classId}/discussions`);
      if (res.ok) setMessages(await res.json());
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); 
    return () => clearInterval(interval);
  }, [classId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('vstep_token');
    try {
      await fetch(`http://localhost:5000/api/classes/${classId}/discussions`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ noi_dung: newMessage })
      });
      setNewMessage('');
      fetchMessages(); 
    } catch (err) { alert("Lỗi gửi tin"); }
  };

  const currentUser = JSON.parse(localStorage.getItem('vstep_user') || '{}');

  return (
    // Giữ nguyên giao diện gọn gàng (h-450px)
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[450px] flex flex-col">
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-xl flex items-center gap-2">
        <MessageCircle className="text-blue-600" size={18}/>
        <h3 className="font-bold text-gray-700 text-sm">Thảo luận lớp học</h3>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/30">
        {loading ? <div className="text-center text-gray-400 text-xs mt-4">Đang tải...</div> : 
         messages.length === 0 ? <div className="text-center text-gray-400 text-xs py-10">Chưa có thảo luận nào.</div> :
         messages.map((msg) => {
           const isMe = msg.user_id === currentUser.id;
           const isTeacher = msg.vai_tro_id === 2; 

           return (
             <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
               {/* Avatar */}
               <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold ${isTeacher ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                 {msg.ho_ten.charAt(0)}
               </div>
               
               <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                 <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[11px] text-gray-500 font-bold">{msg.ho_ten}</span>
                    {isTeacher && <span className="text-[9px] bg-indigo-100 text-indigo-700 px-1 rounded font-bold">GV</span>}
                 </div>
                 {/* Bong bóng chat */}
                 <div className={`px-3 py-2 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none'}`}>
                   {msg.noi_dung}
                 </div>
                 <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                    {new Date(msg.ngay_tao).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                 </span>
               </div>
             </div>
           );
         })
        }
        {/* Đã bỏ div ref={messagesEndRef} */}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-2 border-t border-gray-100 bg-white rounded-b-xl flex gap-2">
        <input 
          type="text" 
          className="flex-1 px-3 py-2 bg-gray-100 rounded-lg border-transparent focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition text-sm"
          placeholder="Nhập tin nhắn..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-sm flex items-center justify-center">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
};

export default ClassDiscussion;