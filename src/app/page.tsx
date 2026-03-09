import { Headphones, BookOpen, PenTool, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/Card/Card";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white p-8">
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        
        {/* CARD 1: LISTENING */}
        <Card className="bg-mon-green text-white h-[320px] w-full max-w-[260px] mx-auto group">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <Headphones size={18} className="opacity-80" />
            <CardTitle>Listening Test</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex items-center justify-center mt-10">
            {/* Tempat animasi 3D nantinya */}
            <div className="h-40 w-40 bg-white/10 rounded-full animate-pulse" />
          </CardContent>

          {/* Tombol Plus yang dirakit manual di dalam Card
          <button className="absolute bottom-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-mon-dark text-white shadow-sm transition-transform hover:scale-110">
            <Plus size={20} strokeWidth={2.5} />
          </button> */}
        </Card>

        {/* CARD 2: READING */}
        <Card className="bg-mon-light text-mon-dark border border-gray-200 h-[320px] w-full max-w-[260px] mx-auto group">
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <BookOpen size={18} className="opacity-80" />
            <CardTitle>Reading Test</CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 flex items-center justify-center mt-10">
            <div className="h-40 w-40 bg-white rounded-full shadow-sm" />
          </CardContent>

          {/* <button className="absolute bottom-5 right-5 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-mon-dark shadow-md transition-transform hover:scale-110">
            <Plus size={20} strokeWidth={2.5} />
          </button> */}
        </Card>

        {/* Nanti Card 3 (Writing) tinggal lu copy-paste aja pola yang sama! */}

      </div>
    </main>
  );
}