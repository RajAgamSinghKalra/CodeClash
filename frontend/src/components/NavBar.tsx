"use client"
import React, { useState } from 'react'
import ModeToggle from './theme-switcher'
import { Instrument_Serif } from 'next/font/google'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Shield, Satellite, Zap, Rocket, Menu, X, Code } from 'lucide-react'
import { useRouter } from 'next/navigation'

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
})

function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const navigationItems = [
    {
      name: 'Manage Inventory',
      href: '/items',
      icon: Shield,
      gradient: 'from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
    },
    {
      name: 'Detect From Webcam',
      href: '/detect/webcam',
      icon: Satellite,
      gradient: 'from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'
    },
    {
      name: 'Detect From Video',
      href: '/detect/realtime',
      icon: Zap,
      gradient: 'from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
    },
    {
      name: 'Detect From Image',
      href: '/detect/image',
      icon: Rocket,
      gradient: 'from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
    },
    {
      name: 'Tech Stack',
      href: '/tech',
      icon: Code,
      gradient: 'from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
    }
  ]

  return (
    <div className='fixed w-full flex items-center justify-between backdrop-blur-lg px-6 py-4 z-50 cosmic-border'>
      {/* Logo */}
      <Link href='/' className={`text-2xl ${instrumentSerif.className} bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent`}>
        SpaceSavers
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        {navigationItems.map((item) => (
          <Button
            key={item.name}
            onClick={() => router.push(item.href)}
            className={`bg-gradient-to-r ${item.gradient} text-white border-0 transition-all duration-300 hover:scale-105`}
            size="sm"
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </Button>
        ))}
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white hover:bg-white/10"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <ModeToggle />
      </div>

      {/* Desktop Theme Toggle */}
      <div className="hidden md:block">
        <ModeToggle />
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-black/90 backdrop-blur-lg border-t border-purple-400/30 md:hidden">
          <div className="flex flex-col p-4 gap-2">
            {navigationItems.map((item) => (
              <Button
                key={item.name}
                onClick={() => {
                  router.push(item.href)
                  setIsMenuOpen(false)
                }}
                className={`bg-gradient-to-r ${item.gradient} text-white border-0 transition-all duration-300 hover:scale-105 w-full justify-start`}
                size="sm"
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NavBar

