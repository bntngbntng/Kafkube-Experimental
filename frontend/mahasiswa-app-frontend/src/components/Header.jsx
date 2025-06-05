import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { GraduationCap, Users, Database, Strikethrough } from 'lucide-react'

const Header = () => {
  const headerRef = useRef(null)
  const titleRef = useRef(null)
  const subtitleRef = useRef(null)
  const iconRefs = useRef([])

  useEffect(() => {
    const tl = gsap.timeline()

    tl.fromTo(headerRef.current, 
      { opacity: 0, y: -50 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    )
    .fromTo(titleRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.7)" },
      "-=0.4"
    )
    .fromTo(subtitleRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" },
      "-=0.3"
    )

    iconRefs.current.forEach((icon, index) => {
      if (icon) {
        tl.fromTo(icon,
          { opacity: 0, scale: 0, rotation: -180 },
          { 
            opacity: 1, 
            scale: 1, 
            rotation: 0, 
            duration: 0.5,
            ease: "back.out(1.7)"
          },
          `-=${0.8 - (index * 0.1)}`
        )
      }
    })

    iconRefs.current.forEach((icon, index) => {
      if (icon) {
        gsap.to(icon, {
          y: -10,
          duration: 2 + (index * 0.3),
          ease: "power2.inOut",
          yoyo: true,
          repeat: -1,
          delay: index * 0.2
        })
      }
    })
  }, [])

  const addToIconRefs = (el) => {
    if (el && !iconRefs.current.includes(el)) {
      iconRefs.current.push(el)
    }
  }

  return (
    <header ref={headerRef} className="relative overflow-hidden">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          {/* Icons */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div ref={addToIconRefs} className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <GraduationCap className="w-8 h-8 text-blue-300" />
            </div>
            <div ref={addToIconRefs} className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <Users className="w-8 h-8 text-purple-300" />
            </div>
            <div ref={addToIconRefs} className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <Database className="w-8 h-8 text-indigo-300" />
            </div>
          </div>

          {/* Title */}
          <h1 
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tight"
          >
            <span className="gradient-text">Sistem Manajemen</span>
            <br />
            <span className="text-white">Mahasiswa</span>
          </h1>

          {/* Subtitle */}
          <p 
            ref={subtitleRef}
            className="text-xl md:text-2xl text-blue-200 max-w-2xl mx-auto leading-relaxed"
          >
            Kelola data mahasiswa dengan mudah dan efisien menggunakan teknologi modern
          </p>

          {/* Decorative line */}
          <div className="mt-8 flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 border border-white/20 rounded-full"></div>
        <div className="absolute top-40 right-32 w-24 h-24 border border-white/20 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 border border-white/20 rounded-full"></div>
      </div>
    </header>
  )
}

export default Header