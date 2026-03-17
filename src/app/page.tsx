import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

export default function Home() {
  return (
    // Kita kasih background gradient tipis biar efek kacanya kelihatan mantap
    <main className="relative flex min-h-screen items-center justify-center p-8 bg-gradient-to-br from-slate-100 via-blue-50 to-purple-50">
      
      {/* Bola blur dekorasi di background */}
      <div className="absolute top-20 left-40 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-40 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

      {/* Grid untuk jejerin 3 varian Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl z-10">
        
        {/* 1. CARD DEFAULT */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Default Card</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-500">Ini kartu biasa yang bersih dan rapi. Cocok buat area soal ujian atau form standar.</p>
            <Button variant="outline" className="w-full">Pilih Standar</Button>
          </CardContent>
        </Card>

        {/* 2. CARD GLASS (Efek Kaca) */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>Glassmorphism</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-600">Lihat gimana background di belakangnya jadi ngeblur? Mewah banget buat pamerin skor hasil ujian IELTS!</p>
            <Button variant="default" className="w-full bg-slate-900 text-white hover:bg-slate-800">Coba Glass</Button>
          </CardContent>
        </Card>

        {/* 3. CARD GRADIENT BORDER */}
        <Card variant="default">
          <CardHeader>
            <CardTitle>Gradient Border</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-slate-500">Border-nya warna-warni! Super cocok buat narik perhatian, misal buat fitur "Premium" atau "AI Assistant".</p>
            <Button variant="default" className="w-full bg-gradient-to-r from-pink-400 to-orange-400 border-0">Aktivasi AI</Button>
          </CardContent>
        </Card>

      </div>
    </main>
  )
}