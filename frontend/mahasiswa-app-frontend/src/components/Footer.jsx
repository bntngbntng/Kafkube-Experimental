import React from 'react';

const Footer = () => {
  return (
    <footer className="py-8 mt-12 text-center text-slate-600 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4">
        <p>© {new Date().getFullYear()} Sistem Manajemen Mahasiswa. All rights reserved.</p>
        <p className="mt-2 text-sm">
          Dibangun dengan React, Vite, Tailwind CSS, dan GSAP
        </p>
      </div>
    </footer>
  );
};

export default Footer;