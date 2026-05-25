'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '@/lib/firebase';
import Navbar from '@/components/Navbar';
import DefaultAvatar from '@/components/DefaultAvatar';

export default function ProfilePage() {
  const { user, userProfile, refreshProfile } = useAuth();
  const router = useRouter();
  const fileRef = useRef();

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    setName(userProfile?.name || user.displayName || '');
    setAvatarUrl(userProfile?.avatarUrl || '');
  }, [user, userProfile, router]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('ไฟล์ต้องไม่เกิน 5MB');
      return;
    }
    setUploading(true);
    setError('');
    try {
      // Resize & compress เป็น base64 ด้วย Canvas
      const base64 = await resizeImage(file, 300, 300);
      setAvatarUrl(base64);
    } catch (err) {
      setError('อ่านไฟล์ไม่สำเร็จ: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const resizeImage = (file, maxW, maxH) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target.result; };
      reader.onerror = reject;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxW) { h = (h * maxW) / w; w = maxW; } }
        else { if (h > maxH) { w = (w * maxH) / h; h = maxH; } }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await updateProfile(user, { displayName: name, photoURL: avatarUrl });
      await updateDoc(doc(db, 'users', user.uid), { name, avatarUrl });
      await refreshProfile();
      setSuccess('บันทึกสำเร็จ!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('บันทึกไม่สำเร็จ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">แก้ไขโปรไฟล์</h1>

          {/* Avatar Upload */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 border-4 border-blue-100 mb-3 cursor-pointer relative group"
              onClick={() => fileRef.current.click()}
            >
              {uploading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : avatarUrl ? (
                <>
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs">
                    เปลี่ยนรูป
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center group-hover:opacity-80 transition relative">
                  <DefaultAvatar size={112} bgColor="#E8EEF4" iconColor="#9DAEC2" />
                  <span className="absolute bottom-2 text-xs text-gray-500 group-hover:text-blue-500">คลิกเพื่ออัปโหลด</span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              disabled={uploading}
              className="text-sm text-blue-600 hover:underline disabled:opacity-50"
            >
              {uploading ? 'กำลังอัปโหลด...' : 'เปลี่ยนรูปโปรไฟล์'}
            </button>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG ไม่เกิน 2MB</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-4 text-center">
              ✅ {success}
            </div>
          )}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">
              ❌ {error}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 bg-white"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
              <div className={`w-full border rounded-lg px-4 py-2.5 text-sm ${userProfile?.role === 'admin' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-500'}`}>
                {userProfile?.role === 'admin' ? '🛠 ผู้ดูแลระบบ (Admin)' : '👤 สมาชิกทั่วไป (User)'}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
