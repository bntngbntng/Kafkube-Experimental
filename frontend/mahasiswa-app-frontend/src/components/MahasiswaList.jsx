import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { Users, RefreshCw, Calendar, Hash, User, BookOpen, Clock } from 'lucide-react'
import MahasiswaCard from './MahasiswaCard'

const MahasiswaList = ({ mahasiswa, loading, onRefresh }) => {
  const listRef = useRef(null)
  const titleRef = useRef(null)
  const statsRef = useRef(null)
  const cardsRef = useRef([])

  useEffect(() => {
    // animasi gaes biar keren dikit
    const tl = gsap.timeline()

    tl.fromTo(listRef.current,
      { opacity: 0, x: 50, scale: 0.95 },
      { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(titleRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      "-=0.4"
    )
    .fromTo(statsRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" },
      "-=0.3"
    )
  }, [])

  useEffect(() => {
    if (mahasiswa.length > 0) {
      gsap.fromTo(cardsRef.current,
        { opacity: 0, y: 30, scale: 0.9 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: "power2.out"
        }
      )
    }
  }, [mahasiswa])

  const handleRefresh = () => {
    const refreshBtn = document.querySelector('.refresh-btn')
    if (refreshBtn) {
      gsap.to(refreshBtn, {
        rotation: 360,
        duration: 0.6,
        ease: "power2.inOut"
      })
    }
    onRefresh()
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el)
    }
  }

  return (
    <div ref={listRef} className="dark-glass p-8 rounded-2xl shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <h2 ref={titleRef} className="text-2xl font-bold text-white">
            Daftar Mahasiswa
          </h2>
        </div>
        
        <button
          onClick={handleRefresh}
          className="refresh-btn p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 transform hover:scale-110"
          title="Refresh data"
        >
          <RefreshCw className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Stats */}
      <div ref={statsRef} className="bg-white/5 rounded-xl p-4 mb-6">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4" />
            <span>Total: <strong className="text-white">{mahasiswa.length}</strong> mahasiswa</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Terakhir diperbarui: <strong className="text-white">{new Date().toLocaleTimeString('id-ID')}</strong></span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4 w-8 h-8"></div>
            <p className="text-gray-300">Memuat data mahasiswa...</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && mahasiswa.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Belum ada data mahasiswa</h3>
          <p className="text-gray-400">Tambahkan mahasiswa pertama menggunakan form di sebelah kiri</p>
        </div>
      )}

      {/* Mahasiswa Cards */}
      {!loading && mahasiswa.length > 0 && (
        <div className="space-y-4">
          {mahasiswa.map((mhs, index) => (
            <div key={mhs.id} ref={addToCardsRef}>
              <MahasiswaCard mahasiswa={mhs} index={index} />
            </div>
          ))}
        </div>
      )}

      {/* Footer Info */}
      {!loading && mahasiswa.length > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-center text-sm text-gray-400">
            Menampilkan {mahasiswa.length} mahasiswa • Data diurutkan berdasarkan tanggal terbaru
          </p>
        </div>
      )}
    </div>
  )
}

export default MahasiswaList