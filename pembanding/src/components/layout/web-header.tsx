'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X } from 'lucide-react'
import { useLanguage } from '@/hooks/use-language'

export function WebHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const { dictionary, language, setLanguage } = useLanguage()

  const toggleMenu = () => setIsOpen(!isOpen)

  const changeLanguage = (lang: string) => {
    // Type assertion to ensure the lang is a valid Language key
    setLanguage(lang as keyof typeof import('@/lib/dictionaries').dictionaries)
  }

  return (
    <header className="bg-background/80 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <Image src="/logo.png" alt="MudaKarya Logo" width={100} height={40} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {dictionary.navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <div className="hidden md:flex items-center gap-2 text-sm font-medium">
                <button 
                    onClick={() => changeLanguage('id')} 
                    className={`transition-colors ${language === 'id' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}>
                    ID
                </button>
                <span className="text-muted-foreground">|</span>
                <button 
                    onClick={() => changeLanguage('en')} 
                    className={`transition-colors ${language === 'en' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}>
                    EN
                </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={toggleMenu}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
        </div>
      </div>

      {/* Mobile Menu (Collapsible) */}
      {isOpen && (
        <div className="md:hidden bg-background border-t">
          <nav className="container py-4 flex flex-col gap-4">
            {dictionary.navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary"
                onClick={() => setIsOpen(false)} // Close menu on click
              >
                {link.label}
              </Link>
            ))}
             {/* Language Switcher for Mobile */}
            <div className="flex items-center gap-2 text-sm font-medium pt-2 border-t border-muted-foreground/10">
                <button 
                    onClick={() => {changeLanguage('id'); setIsOpen(false);}} 
                    className={`transition-colors ${language === 'id' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}>
                    Indonesia
                </button>
                <span className="text-muted-foreground">|</span>
                <button 
                    onClick={() => {changeLanguage('en'); setIsOpen(false);}} 
                    className={`transition-colors ${language === 'en' ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'}`}>
                    English
                </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
