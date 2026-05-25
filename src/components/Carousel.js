'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=500&fit=crop',
    title: 'ยินดีต้อนรับสู่ MyApp',
    desc: 'ระบบจัดการสมาชิกครบวงจร ใช้งานง่าย ปลอดภัย',
    badge: '🎉 ใหม่',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=500&fit=crop',
    title: 'โปรโมชั่นพิเศษสำหรับสมาชิก',
    desc: 'สมัครวันนี้รับสิทธิพิเศษมากมายที่คัดสรรมาเพื่อคุณ',
    badge: '🔥 Hot',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&h=500&fit=crop',
    title: 'ร่วมเป็นส่วนหนึ่งกับเรา',
    desc: 'ชุมชนที่เติบโตทุกวัน พร้อมฟีเจอร์ที่ตอบโจทย์ทุกความต้องการ',
    badge: '👥 Community',
  },
];

export default function Carousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative overflow-hidden rounded-2xl h-64 md:h-96 shadow-lg">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <img src={slide.url} alt={slide.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6 md:p-10">
            <span className="inline-block bg-blue-500 text-white text-xs px-3 py-1 rounded-full w-fit mb-2">{slide.badge}</span>
            <h2 className="text-white text-xl md:text-3xl font-bold">{slide.title}</h2>
            <p className="text-white/80 mt-1 text-sm md:text-base">{slide.desc}</p>
          </div>
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full w-9 h-9 flex items-center justify-center transition"
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white rounded-full w-9 h-9 flex items-center justify-center transition"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all ${index === current ? 'bg-white w-6' : 'bg-white/50 w-2'}`}
          />
        ))}
      </div>
    </div>
  );
}
