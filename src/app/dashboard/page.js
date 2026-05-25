'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import DefaultAvatar from '@/components/DefaultAvatar';

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push('/login');
  }, [user, router]);

  if (!user) return null;

  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white mb-6 flex items-center gap-5">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white flex-shrink-0">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <DefaultAvatar size={64} bgColor="#DBEAFE" iconColor="#93C5FD" />
            )}
          </div>
          <div>
            <p className="text-blue-100 text-sm">ยินดีต้อนรับกลับมา</p>
            <h1 className="text-2xl font-bold">{userProfile?.name || user.displayName || 'สมาชิก'}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${isAdmin ? 'bg-purple-400/30 text-purple-100' : 'bg-blue-400/30 text-blue-100'}`}>
              {isAdmin ? '🛠 Admin' : '👤 User'}
            </span>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">Email</p>
            <p className="font-medium text-gray-800 truncate">{user.email}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">สถานะ</p>
            <p className="font-medium text-green-600">✅ ใช้งานอยู่</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <p className="text-xs text-gray-400 mb-1">วันที่สมัคร</p>
            <p className="font-medium text-gray-800">
              {userProfile?.createdAt
                ? new Date(userProfile.createdAt).toLocaleDateString('th-TH')
                : '-'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-bold text-gray-800 mb-4">เมนูด่วน</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/profile" className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition text-center">
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs font-medium text-blue-700">แก้ไขโปรไฟล์</span>
            </Link>
            <Link href="/" className="flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition text-center">
              <span className="text-2xl mb-1">🏠</span>
              <span className="text-xs font-medium text-gray-700">หน้าแรก</span>
            </Link>
            {isAdmin && (
              <Link href="/admin" className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition text-center">
                <span className="text-2xl mb-1">🛠</span>
                <span className="text-xs font-medium text-purple-700">Admin Panel</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
