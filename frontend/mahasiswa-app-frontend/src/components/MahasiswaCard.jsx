import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { User, Hash, BookOpen, Calendar, Clock } from 'lucide-react'

const MahasiswaCard = ({ mahasiswa, index }) => {
  const cardRef = useRef(null)

  useEffect(() => {
    // Hover animations
    const card = cardRef.current
    
    const handleMouseEnter = () => {
      gsap.to(card, {
        scale: 1.03,
        y: -5,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.to(card.querySelector('.card-glow'), {
        opacity: 0.6,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    const handleMouseLeave = () => {
      gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      })
      
      gsap.to(card.querySelector('.card-glow'), {
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      })
    }

    if (card) {
      card.addEventListener('mouseenter', handleMouseEnter)
      card.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        card.removeEventListener('mouseenter', handleMouseEnter)
        card.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getAvatarColor = (index) => {
    const colors = [
      'from-blue-500 to-purple-600',
      'from-green-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-pink-600',
      'from-indigo-500 to-blue-600',
      'from-teal-500 to-green-600'
    ]
    return colors[index % colors.length]
  }

  return (
    <div 
      ref={cardRef}
      className="relative bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 transition-all duration-300 cursor-pointer"
    >
      {/* Glow efek silaw men */}
      <div className="card-glow absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 -z-10"></div>
      
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className={`w-12 h-12 bg-gradient-to-r ${getAvatarColor(index)} rounded-full flex items-center justify-center flex-shrink-0`}>
          <span className="text-white font-bold text-sm">
            {getInitials(mahasiswa.nama)}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1 truncate">
                {mahasiswa.nama}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Hash className="w-3 h-3" />
                <span>{mahasiswa.nim}</span>
              </div>
            </div>
            
            {/* Status badge */}
            <div className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full text-xs font-medium">
              Aktif
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            {mahasiswa.jurusan && (
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <BookOpen className="w-4 h-4 text-blue-400" />
                <span>{mahasiswa.jurusan}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span>Terdaftar: {formatDate(mahasiswa.created_at)}</span>
            </div>
            
            {mahasiswa.updated_at !== mahasiswa.created_at && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Diperbarui: {formatDate(mahasiswa.updated_at)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ID Badge */}
      <div className="absolute top-4 right-4 bg-white/10 text-gray-300 px-2 py-1 rounded-md text-xs font-mono">
        ID: {mahasiswa.id}
      </div>
    </div>
  )
}

export default MahasiswaCard