'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import DefaultAvatar from '@/components/DefaultAvatar';

export default function Navbar() {
  const { user, userProfile, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-600">🌐 MyApp</Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-5">
          <Link href="/" className="text-sm text-gray-600 hover:text-blue-600 transition">หน้าแรก</Link>

          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-blue-600 transition">Dashboard</Link>
              <Link href="/profile" className="text-sm text-gray-600 hover:text-blue-600 transition">โปรไฟล์</Link>
              {userProfile?.role === 'admin' && (
                <Link href="/admin" className="text-sm text-purple-600 font-medium hover:text-purple-700 transition">
                  🛠 Admin
                </Link>
              )}
              <div className="flex items-center gap-2 border-l pl-4">
                <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  {userProfile?.avatarUrl ? (
                    <img src={userProfile.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <DefaultAvatar size={32} />
                  )}
                </div>
                <span className="text-sm text-gray-700 font-medium">{userProfile?.name || user.displayName || 'ผู้ใช้'}</span>
                <button
                  onClick={handleLogout}
                  className="ml-2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition"
                >
                  ออก
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-gray-600 hover:text-blue-600 transition">เข้าสู่ระบบ</Link>
              <Link href="/register" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition">
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-600" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-3 space-y-2">
          <Link href="/" className="block text-sm text-gray-600 py-1" onClick={() => setMenuOpen(false)}>หน้าแรก</Link>
          {user ? (
            <>
              <Link href="/dashboard" className="block text-sm text-gray-600 py-1" onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link href="/profile" className="block text-sm text-gray-600 py-1" onClick={() => setMenuOpen(false)}>โปรไฟล์</Link>
              {userProfile?.role === 'admin' && (
                <Link href="/admin" className="block text-sm text-purple-600 py-1" onClick={() => setMenuOpen(false)}>🛠 Admin</Link>
              )}
              <button onClick={handleLogout} className="block text-sm text-red-500 py-1">ออกจากระบบ</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block text-sm text-gray-600 py-1" onClick={() => setMenuOpen(false)}>เข้าสู่ระบบ</Link>
              <Link href="/register" className="block text-sm text-blue-600 py-1" onClick={() => setMenuOpen(false)}>สมัครสมาชิก</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
