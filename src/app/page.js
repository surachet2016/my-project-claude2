'use client';

import Navbar from '@/components/Navbar';
import Carousel from '@/components/Carousel';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const news = [
  {
    id: 1,
    title: 'ข่าวสารประจำสัปดาห์',
    desc: 'อัปเดตข้อมูลและกิจกรรมล่าสุดสำหรับสมาชิกทุกท่าน ติดตามได้ที่นี่',
    date: '25 พ.ค. 2569',
    img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=250&fit=crop',
    tag: 'ข่าวสาร',
  },
  {
    id: 2,
    title: 'กิจกรรมพิเศษเดือนนี้',
    desc: 'ร่วมสนุกกับกิจกรรมมากมายที่เราได้จัดเตรียมไว้สำหรับสมาชิก',
    date: '24 พ.ค. 2569',
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop',
    tag: 'กิจกรรม',
  },
  {
    id: 3,
    title: 'โปรโมชั่นพิเศษสำหรับสมาชิก',
    desc: 'รับสิทธิพิเศษและส่วนลดมากมายสำหรับสมาชิกที่ลงทะเบียนวันนี้',
    date: '23 พ.ค. 2569',
    img: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=250&fit=crop',
    tag: 'โปรโมชั่น',
  },
];

const tagColors = {
  ข่าวสาร: 'bg-blue-100 text-blue-600',
  กิจกรรม: 'bg-green-100 text-green-600',
  โปรโมชั่น: 'bg-orange-100 text-orange-600',
};

export default function Home() {
  const { user, userProfile } = useAuth();

  const memberMenus = user
    ? [
        { label: 'Dashboard', href: '/dashboard', icon: '📊', desc: 'ภาพรวมบัญชีของคุณ' },
        { label: 'โปรไฟล์', href: '/profile', icon: '👤', desc: 'แก้ไขข้อมูลส่วนตัว' },
        ...(userProfile?.role === 'admin'
          ? [{ label: 'Admin Panel', href: '/admin', icon: '🛠', desc: 'จัดการผู้ใช้ระบบ' }]
          : []),
      ]
    : [
        { label: 'เข้าสู่ระบบ', href: '/login', icon: '🔐', desc: 'เข้าใช้งานบัญชีของคุณ' },
        { label: 'สมัครสมาชิก', href: '/register', icon: '✍️', desc: 'สร้างบัญชีใหม่ฟรี' },
        { label: 'ข่าวสาร', href: '#news', icon: '📰', desc: 'ติดตามข่าวสารล่าสุด' },
        { label: 'เกี่ยวกับเรา', href: '#about', icon: 'ℹ️', desc: 'รู้จักกับ MyApp' },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Carousel */}
        <Carousel />

        {/* Member Menu */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {user ? `สวัสดี, ${userProfile?.name || 'สมาชิก'} 👋` : 'เมนูสำหรับสมาชิก'}
            </h2>
            {userProfile?.role === 'admin' && (
              <span className="bg-purple-100 text-purple-600 text-xs font-medium px-3 py-1 rounded-full">
                🛠 Admin
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {memberMenus.map((menu) => (
              <Link
                key={menu.label}
                href={menu.href}
                className="bg-white flex flex-col items-center p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition text-center group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{menu.icon}</span>
                <span className="text-sm font-semibold text-gray-800">{menu.label}</span>
                <span className="text-xs text-gray-400 mt-1">{menu.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* News Section */}
        <section className="mt-12" id="news">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">📰 ข่าวสารล่าสุด</h2>
            <span className="text-sm text-blue-600 cursor-pointer hover:underline">ดูทั้งหมด →</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition cursor-pointer group"
              >
                <div className="overflow-hidden h-44">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tagColors[item.tag]}`}>{item.tag}</span>
                  <h3 className="font-bold text-gray-800 mt-2 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  <p className="text-xs text-gray-300 mt-3">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section className="mt-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white text-center" id="about">
          <h2 className="text-2xl font-bold mb-2">เกี่ยวกับ MyApp</h2>
          <p className="text-blue-100 max-w-lg mx-auto">
            ระบบจัดการสมาชิกที่ครบครัน ปลอดภัย และใช้งานง่าย
            พัฒนาด้วย Next.js และ Firebase
          </p>
          {!user && (
            <Link
              href="/register"
              className="inline-block mt-4 bg-white text-blue-600 font-semibold px-6 py-2 rounded-full hover:bg-blue-50 transition"
            >
              เริ่มต้นใช้งานฟรี
            </Link>
          )}
        </section>
      </main>

      <footer className="mt-12 py-6 text-center text-sm text-gray-400 border-t">
        © 2569 MyApp — พัฒนาด้วย Next.js + Firebase
      </footer>
    </div>
  );
}
