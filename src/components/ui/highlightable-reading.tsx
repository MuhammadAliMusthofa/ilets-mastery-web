"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Highlighter, Eraser, Copy, FileEdit } from "lucide-react"

interface HighlightableReadingProps {
  content: string | React.ReactNode
  className?: string
}

export function HighlightableReading({ content, className }: HighlightableReadingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  const [toolbar, setToolbar] = useState<{
    visible: boolean
    x: number
    y: number
  }>({ visible: false, x: 0, y: 0 })

  // Menyimpan referensi ke selection saat ini
  const [currentSelection, setCurrentSelection] = useState<Range | null>(null)

  // Tangani saat mouse dilepas setelah melakukan block (selection)
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    // Memberi sedikit jeda agar browser selesai men-set getSelection()
    setTimeout(() => {
      const selection = window.getSelection()
      if (!selection || selection.isCollapsed || selection.toString().trim() === "") {
        setToolbar({ visible: false, x: 0, y: 0 })
        return
      }

      // Periksa apakah seleksi berada di dalam container ini
      if (containerRef.current && containerRef.current.contains(selection.anchorNode)) {
        const range = selection.getRangeAt(0)
        setCurrentSelection(range)
        
        // Ambil posisi teks yang diblok
        const rect = range.getBoundingClientRect()
        
        setToolbar({
          visible: true,
          // Posisikan di tengah atas teks yang diselect
          x: rect.left + rect.width / 2 + window.scrollX,
          // Beri jarak ke atas sedikit agar tidak menutupi teks
          y: rect.top + window.scrollY - 40,
        })
      } else {
        setToolbar({ visible: false, x: 0, y: 0 })
      }
    }, 10)
  }, [])

  // Sembunyikan toolbar jika user klik di tempat lain
  useEffect(() => {
    const handleDocumentMouseDown = (e: MouseEvent) => {
      // Jika klik di luar toolbar dan bukan sedang men-drag teks baru
      if (toolbar.visible) {
        // Biarkan onMouseUp yang menangani logic hide jika kliknya collapsed
      }
    }
    
    // Sembunyikan ketika mulai men-scroll agar posisi tidak aneh
    const handleScroll = () => {
      if (toolbar.visible) {
        setToolbar(prev => ({ ...prev, visible: false }))
      }
    }

    document.addEventListener("mousedown", handleDocumentMouseDown)
    window.addEventListener("scroll", handleScroll, true) // Capture scroll dari element manapun
    
    return () => {
      document.removeEventListener("mousedown", handleDocumentMouseDown)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [toolbar.visible])

  // Fungsi untuk menerapkan highlight
  const applyHighlight = (color: string) => {
    if (!currentSelection || !containerRef.current) return

    // Mengembalikan seleksi yang disimpan
    const selection = window.getSelection()
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(currentSelection)
    }

    containerRef.current.contentEditable = "true"
    containerRef.current.focus()
    document.execCommand("styleWithCSS", false, "true")
    
    if (color === "transparent") {
      document.execCommand("hiliteColor", false, "transparent")
      document.execCommand("backColor", false, "transparent")
    } else {
      document.execCommand("hiliteColor", false, color)
      document.execCommand("backColor", false, color)
    }

    containerRef.current.contentEditable = "false"
    selection?.removeAllRanges()
    setToolbar({ visible: false, x: 0, y: 0 })
  }

  // Fungsi untuk copy teks
  const handleCopy = () => {
    if (currentSelection) {
      navigator.clipboard.writeText(currentSelection.toString())
      setToolbar({ visible: false, x: 0, y: 0 })
      
      // Mengembalikan seleksi
      const selection = window.getSelection()
      if (selection) selection.removeAllRanges()
    }
  }

  return (
    <>
      <div 
        ref={containerRef}
        onMouseUp={handleMouseUp}
        className={`leading-relaxed text-slate-800 dark:text-slate-200 relative ${className || ""}`}
        style={{ outline: "none" }}
      >
        {content}
      </div>

      {/* Floating Toolbar ala British Council / Engnovate */}
      {toolbar.visible && (
        <div 
          className="absolute z-50 flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-md shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ 
            top: toolbar.y, 
            left: toolbar.x,
            transform: "translateX(-50%)" // Pusatkan di tengah titik X
          }}
          onMouseDown={(e) => {
            // Mencegah mousedown menghilangkan selection teks sebelum onClick tereksekusi
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {/* Highlight Kuning */}
          <button 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-yellow-500 transition-colors border-r border-slate-200 dark:border-slate-700"
            onClick={() => applyHighlight("#ffff00")}
            title="Highlight Yellow"
          >
            <Highlighter className="w-5 h-5" />
          </button>
          
          {/* Highlight Merah / Eraser (Bisa disesuaikan warnanya) */}
          <button 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-red-500 transition-colors border-r border-slate-200 dark:border-slate-700"
            onClick={() => applyHighlight("transparent")}
            title="Clear Highlight"
          >
            <Eraser className="w-5 h-5" />
          </button>

          {/* Add Note */}
          <button 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border-r border-slate-200 dark:border-slate-700"
            onClick={() => {
               alert("Notes are coming in a later release")
               setToolbar({ visible: false, x: 0, y: 0 })
            }}
            title="Add Note"
          >
            <FileEdit className="w-5 h-5" />
          </button>

          {/* Copy Text */}
          <button 
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            onClick={handleCopy}
            title="Copy Text"
          >
            <Copy className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  )
}
