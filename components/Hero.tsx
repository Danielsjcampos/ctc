import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { ProgressiveBlur } from '@/components/ui/progressive-blur';
import { ChevronRight, Target, Shield, Zap, Flag, Crosshair } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

const Hero: React.FC = () => {
  const { settings } = useSystemSettings();
  const videoId = settings?.hero_video_id || 'qILJ5fZBSpc';

  return (
    <section className="relative w-full h-screen min-h-screen overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-black/40 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />

        <iframe
          className="absolute top-1/2 left-1/2 pointer-events-none opacity-60"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&enablejsapi=1&disablekb=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          style={{
            width: '300vw',
            height: '168.75vw', /* 16:9 of 300vw */
            minHeight: '300dvh',
            minWidth: '533.31dvh', /* 16:9 of 300dvh */
            transform: 'translate(-50%, -50%)',
            border: 'none'
          }}
        />
      </div>

      {/* 2. Main Content */}
      <div className="relative z-10 flex flex-col justify-center h-full px-6 pt-20 pb-20 md:px-12 lg:pt-32">
        <div className="mx-auto max-w-7xl w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.9] mb-8">
              {settings?.club_name ? (
                <>
                  Instinto <br />
                  <span className="text-yellow-500">Elite</span> <span className="text-white">&</span> <br />
                  <span className="text-red-600">Precisão</span>
                </>
              ) : (
                <>
                  Instinto <br />
                  <span className="text-yellow-500">Elite</span> <span className="text-white">&</span> <br />
                  <span className="text-red-600">Precisão</span>
                </>
              )}
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-gray-300 mb-10 font-medium">
              O maior complexo de tiro tático e esportivo da região. Estrutura de nível internacional para quem exige excelência e segurança absoluta.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="h-14 rounded-full pl-8 pr-6 text-base bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] border-none transition-transform hover:scale-105">
                <Link to="/join">
                  <span className="text-nowrap mr-2">Começar Agora</span>
                  <ChevronRight className="ml-1 w-5 h-5" />
                </Link>
              </Button>
              <Button
                key={2}
                asChild
                size="lg"
                variant="outline"
                className="h-14 rounded-full px-8 text-base bg-transparent hover:bg-white/10 text-white border-white/30 font-bold uppercase tracking-widest backdrop-blur-sm transition-transform hover:scale-105">
                <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">
                  <span className="text-nowrap">Tour Virtual</span>
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Partner Slider (Footer of Hero) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-black/60 backdrop-blur-md py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-8">
          <p className="text-sm text-gray-400 font-bold uppercase tracking-widest whitespace-nowrap">Parceiros Oficiais</p>
          <div className="w-full overflow-hidden mask-gradient-x">
            <InfiniteSlider gap={60} duration={30}>
              <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <Target className="w-6 h-6 text-red-600" />
                <span className="text-xl font-black text-white italic">GLOCK</span>
              </div>
              <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <Shield className="w-6 h-6 text-yellow-500" />
                <span className="text-xl font-black text-white italic">TAURUS</span>
              </div>
              <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <Zap className="w-6 h-6 text-blue-500" />
                <span className="text-xl font-black text-white italic">SIG SAUER</span>
              </div>
              <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <Flag className="w-6 h-6 text-green-500" />
                <span className="text-xl font-black text-white italic">CBC</span>
              </div>
              <div className="flex items-center space-x-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <Crosshair className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-black text-white italic">MAGPUL</span>
              </div>
            </InfiniteSlider>
          </div>
        </div>
      </div>
    </section >
  );
};

export default Hero;
