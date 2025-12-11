import React, { useState, useEffect } from 'react';
import { 
  School, Plus, Users, Copy, Loader2, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Thêm hook này

const ClassManagement = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form tạo lớp
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  // Fetch Data (Phiên bản Debug)
  const fetchClasses = async () => {
    try {
      const token = localStorage.getItem('vstep_token');
      console.log("Token gửi đi:", token); // Xem ở Console trình duyệt (F12)

      const res = await fetch('http://localhost:5000/api/classes', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      console.log("Status API:", res.status); // Xem mã lỗi (200, 401, 500?)

      if (res.ok) {
        const data = await res.json();
        console.log("Dữ liệu nhận được:", data); // Xem có bao nhiêu lớp
        setClasses(data);
      } else {
        const errText = await res.text();
        alert(`Lỗi API: ${res.status} - ${errText}`); // Hiện thông báo lỗi ngay trên màn hình
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối Server (Kiểm tra Backend đã bật chưa?)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('vstep_token');
      const res = await fetch('http://localhost:5000/api/classes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ten_lop: newClassName, mo_ta: newClassDesc })
      });
      
      if (res.ok) {
        alert("Tạo lớp thành công!");
        setShowModal(false);
        setNewClassName('');
        setNewClassDesc('');
        fetchClasses();
      }
    } catch (err) {
      alert("Lỗi tạo lớp.");
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã lớp: ${code}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Lớp học</h1>
          <p className="text-gray-500 text-sm">Danh sách các lớp bạn đang phụ trách</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold shadow-md flex items-center gap-2"
        >
          <Plus size={20} /> Tạo lớp mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <School size={24} />
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); copyCode(cls.ma_lop); }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                  >
                    {cls.ma_lop} <Copy size={12}/>
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{cls.ten_lop}</h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{cls.mo_ta}</p>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={16} /> {cls.so_hoc_vien || 0} học viên
                </div>
              </div>

              <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                {/* === NÚT BẤM CHUYỂN HƯỚNG === */}
                <button 
                  onClick={() => navigate(`/admin/class/${cls.id}`)}
                  className="w-full py-2.5 bg-white border border-blue-200 text-blue-600 font-bold rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  Vào lớp & Quản lý <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL TẠO LỚP (Giữ nguyên) */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Tạo lớp học mới</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp</label>
                <input 
                  type="text" required 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="VD: Luyện thi B1 K24"
                  value={newClassName}
                  onChange={e => setNewClassName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea 
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  value={newClassDesc}
                  onChange={e => setNewClassDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg">Hủy</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">Tạo ngay</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;