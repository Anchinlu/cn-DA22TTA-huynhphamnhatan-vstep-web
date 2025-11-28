import React, { useState, useEffect } from 'react';
import { 
  Search, Trash2, UserCog, Check, X, Loader2, 
  Shield, School, User 
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho việc chỉnh sửa quyền
  const [editingId, setEditingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(1);

  // 1. Lấy danh sách User từ API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vstep_token');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi tải danh sách user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Hàm Xóa User
  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn chắc chắn muốn xóa người dùng "${name}" không? Hành động này không thể hoàn tác.`)) {
      try {
        await fetch(`http://localhost:5000/api/users/${id}`, {
          method: 'DELETE'
        });
        // Cập nhật lại danh sách
        setUsers(users.filter(u => u.user_id !== id));
        alert("Đã xóa thành công!");
      } catch (error) {
        alert("Lỗi khi xóa.");
      }
    }
  };

  // 3. Hàm Cập nhật Quyền
  const handleUpdateRole = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/users/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vaiTroId: selectedRole })
      });
      
      // Cập nhật UI
      setUsers(users.map(u => u.user_id === id ? { ...u, vai_tro_id: selectedRole } : u));
      setEditingId(null);
      alert("Đã cập nhật quyền thành công!");
    } catch (error) {
      alert("Lỗi khi cập nhật.");
    }
  };

  // Helper: Chọn icon và màu theo Role
  const getRoleBadge = (roleId) => {
    switch(roleId) {
      case 3: return <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"><Shield size={12}/> Admin</span>;
      case 2: return <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold"><School size={12}/> Giáo viên</span>;
      default: return <span className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold"><User size={12}/> Học viên</span>;
    }
  };

  // Lọc danh sách theo tìm kiếm
  const filteredUsers = users.filter(u => 
    u.ho_ten?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Người dùng</h1>
          <p className="text-gray-500 text-sm">Xem và phân quyền thành viên</p>
        </div>
        
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Tìm theo tên hoặc email..." 
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">Họ và tên</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.user_id} className="hover:bg-blue-50/50 transition-colors group">
                    <td className="px-6 py-4 font-mono text-gray-400">#{user.user_id}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{user.ho_ten}</td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    
                    {/* Cột Vai trò (Có chế độ sửa) */}
                    <td className="px-6 py-4">
                      {editingId === user.user_id ? (
                        <div className="flex items-center gap-2">
                          <select 
                            className="p-1 border rounded text-sm"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(Number(e.target.value))}
                          >
                            <option value={1}>Học viên</option>
                            <option value={2}>Giáo viên</option>
                            <option value={3}>Admin</option>
                          </select>
                          <button onClick={() => handleUpdateRole(user.user_id)} className="text-green-600 hover:bg-green-100 p-1 rounded"><Check size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="text-red-600 hover:bg-red-100 p-1 rounded"><X size={16}/></button>
                        </div>
                      ) : (
                        getRoleBadge(user.vai_tro_id)
                      )}
                    </td>

                    {/* Cột Hành động */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setEditingId(user.user_id); setSelectedRole(user.vai_tro_id); }}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" 
                          title="Sửa quyền"
                        >
                          <UserCog size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.user_id, user.ho_ten)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-400">Không tìm thấy người dùng nào.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;