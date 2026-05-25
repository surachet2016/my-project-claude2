'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import DefaultAvatar from '@/components/DefaultAvatar';

// Secondary Firebase App สำหรับสร้าง user โดยไม่ logout admin
const getSecondaryAuth = () => {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };
  const secondaryApp = getApps().find((a) => a.name === 'secondary')
    || initializeApp(firebaseConfig, 'secondary');
  return getAuth(secondaryApp);
};

const emptyForm = { name: '', email: '', password: '', role: 'user' };

export default function AdminPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit state
  const [editUser, setEditUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [saving, setSaving] = useState(false);

  // Add User state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState(emptyForm);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    if (userProfile && userProfile.role !== 'admin') { router.push('/dashboard'); return; }
    if (userProfile?.role === 'admin') fetchUsers();
  }, [user, userProfile]);

  const fetchUsers = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, 'users'));
    setUsers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  const changeRole = async (uid, role) => {
    await updateDoc(doc(db, 'users', uid), { role });
    setUsers((prev) => prev.map((u) => (u.id === uid ? { ...u, role } : u)));
  };

  const handleDelete = async (uid) => {
    if (!confirm('ต้องการลบผู้ใช้นี้ออกจากระบบหรือไม่?')) return;
    await deleteDoc(doc(db, 'users', uid));
    setUsers((prev) => prev.filter((u) => u.id !== uid));
  };

  const openEdit = (u) => { setEditUser(u); setEditName(u.name || ''); };

  const handleEditSave = async () => {
    setSaving(true);
    await updateDoc(doc(db, 'users', editUser.id), { name: editName });
    setUsers((prev) => prev.map((u) => (u.id === editUser.id ? { ...u, name: editName } : u)));
    setEditUser(null);
    setSaving(false);
  };

  // เพิ่มสมาชิกใหม่โดย admin
  const handleAddUser = async (e) => {
    e.preventDefault();
    setAddError('');
    if (addForm.password.length < 6) {
      setAddError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    setAddLoading(true);
    try {
      const secondaryAuth = getSecondaryAuth();
      const { user: newUser } = await createUserWithEmailAndPassword(
        secondaryAuth, addForm.email, addForm.password
      );
      await updateProfile(newUser, { displayName: addForm.name });
      await setDoc(doc(db, 'users', newUser.uid), {
        uid: newUser.uid,
        name: addForm.name,
        email: addForm.email,
        role: addForm.role,
        avatarUrl: '',
        createdAt: new Date().toISOString(),
      });
      await signOut(secondaryAuth); // logout จาก secondary app
      setUsers((prev) => [...prev, {
        id: newUser.uid,
        uid: newUser.uid,
        name: addForm.name,
        email: addForm.email,
        role: addForm.role,
        avatarUrl: '',
        createdAt: new Date().toISOString(),
      }]);
      setAddForm(emptyForm);
      setShowAddModal(false);
    } catch (err) {
      const msg = {
        'auth/email-already-in-use': 'Email นี้ถูกใช้งานแล้ว',
        'auth/invalid-email': 'รูปแบบ Email ไม่ถูกต้อง',
        'auth/weak-password': 'รหัสผ่านไม่ปลอดภัยพอ',
      };
      setAddError(msg[err.code] || 'เกิดข้อผิดพลาด: ' + err.message);
    } finally {
      setAddLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center mt-20">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🛠 Admin Panel</h1>
            <p className="text-sm text-gray-400">จัดการผู้ใช้ทั้งหมดในระบบ</p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="ค้นหา ชื่อ / Email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
            />
            <button
              onClick={() => { setShowAddModal(true); setAddError(''); setAddForm(emptyForm); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2"
            >
              ➕ เพิ่มสมาชิก
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400">ผู้ใช้ทั้งหมด</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{users.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400">Admin</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">
              {users.filter((u) => u.role === 'admin').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400">User ทั่วไป</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {users.filter((u) => u.role !== 'admin').length}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">ผู้ใช้</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">บทบาท</th>
                  <th className="px-5 py-3 text-left">วันที่สมัคร</th>
                  <th className="px-5 py-3 text-left">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <DefaultAvatar size={36} />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{u.name || '-'}</p>
                          {u.id === user.uid && (
                            <span className="text-xs text-blue-500">(คุณ)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{u.email}</td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        disabled={u.id === user.uid}
                        className={`border rounded-lg px-2 py-1 text-xs focus:outline-none ${u.role === 'admin' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-gray-200 text-gray-600 bg-gray-50'} disabled:opacity-50`}
                      >
                        <option value="user">👤 User</option>
                        <option value="admin">🛠 Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('th-TH') : '-'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="text-xs text-blue-500 hover:text-blue-700 font-medium">แก้ไข</button>
                        {u.id !== user.uid && (
                          <button onClick={() => handleDelete(u.id)} className="text-xs text-red-400 hover:text-red-600 font-medium">ลบ</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400">ไม่พบผู้ใช้</div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">✏️ แก้ไขข้อมูลผู้ใช้</h2>
            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                {editUser.avatarUrl ? (
                  <img src={editUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <DefaultAvatar size={40} />
                )}
              </div>
              <p className="text-sm text-gray-500">{editUser.email}</p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleEditSave} disabled={saving} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
                <button onClick={() => setEditUser(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-5">➕ เพิ่มสมาชิกใหม่</h2>

            {addError && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">❌ {addError}</div>
            )}

            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอกชื่อ-นามสกุล"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="กรอก Email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                <input
                  type="password"
                  required
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">👤 User</option>
                  <option value="admin">🛠 Admin</option>
                </select>
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {addLoading ? 'กำลังเพิ่ม...' : '➕ เพิ่มสมาชิก'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
