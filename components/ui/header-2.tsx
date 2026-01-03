'use client';
import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useScroll } from '@/components/ui/use-scroll';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useSystemSettings } from '@/hooks/useSystemSettings';

export function Header() {
    const [open, setOpen] = React.useState(false);
    const { settings } = useSystemSettings();
    const scrolled = useScroll(10);

    const links = [
        {
            label: 'Eventos',
            href: '/eventos',
            isExternal: true, // Mark as non-anchor
        },
        {
            label: 'O Clube',
            href: '#features',
        },
        {
            label: 'Planos',
            href: '#pricing',
        },
        {
            label: 'Ranking',
            href: '#ranking',
        },
        {
            label: 'Calendário',
            href: '#timeline',
        }
    ];

    React.useEffect(() => {
        if (open) {
            // Disable scroll
            document.body.style.overflow = 'hidden';
        } else {
            // Re-enable scroll
            document.body.style.overflow = '';
        }

        // Cleanup when component unmounts (important for Next.js)
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const handleScrollLink = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        setOpen(false);
        if (href.startsWith('#')) {
            e.preventDefault();
            const id = href.substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 mx-auto w-full border-b border-transparent transition-all duration-300',
                {
                    'bg-black/80 backdrop-blur-xl border-white/10 md:py-2': scrolled && !open,
                    'bg-transparent py-4': !scrolled && !open,
                    'bg-black': open,
                },
            )}
        >
            <nav
                className={cn(
                    'flex h-14 w-full max-w-7xl mx-auto items-center justify-between px-6 md:h-12',
                )}
            >
                {/* Logo Section */}
                <Link to="/" className="flex items-center space-x-3 group relative z-50">
                    {settings?.logo_url ? (
                        <img src={settings.logo_url} alt="Logo" className="h-10 w-auto object-contain" />
                    ) : (
                        <div className="relative">
                            <div className="absolute inset-0 bg-red-600 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                            <Shield className="w-8 h-8 text-red-600 relative z-10" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-xl font-black tracking-tighter leading-none text-white font-sans uppercase">
                            {settings?.club_name || (
                                <>CTC<span className="text-red-600">CRUZEIRO</span></>
                            )}
                        </span>
                        <span className="text-[8px] uppercase tracking-[0.3em] font-bold text-gray-400 group-hover:text-red-500 transition-colors">
                            Elite Shooting Club
                        </span>
                    </div>
                </Link>

                <div className="hidden items-center gap-2 md:flex">
                    {links.map((link, i) => (
                        link.href.startsWith('/') ? (
                            <Link
                                key={i}
                                to={link.href}
                                className={cn(buttonVariants({ variant: 'ghost' }), "text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-transparent")}
                            >
                                {link.label}
                            </Link>
                        ) : (
                            <a
                                key={i}
                                className={cn(buttonVariants({ variant: 'ghost' }), "text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-white hover:bg-transparent")}
                                href={link.href}
                                onClick={(e) => handleScrollLink(e, link.href)}
                            >
                                {link.label}
                            </a>
                        )
                    ))}
                    <div className="w-px h-6 bg-white/10 mx-2" />
                    <Button asChild variant="ghost" className="text-white hover:bg-white/10 font-bold uppercase tracking-widest text-xs">
                        <Link to="/login">Área do Membro</Link>
                    </Button>
                    <Button asChild className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-xs rounded-full px-6">
                        <Link to="/join">Começar Agora</Link>
                    </Button>
                </div>

                <Button size="icon" variant="ghost" onClick={() => setOpen(!open)} className="md:hidden text-white hover:bg-white/10 z-50">
                    <MenuToggleIcon open={open} className="w-6 h-6" duration={300} />
                </Button>
            </nav>

            <div
                className={cn(
                    'bg-black fixed inset-0 z-40 flex flex-col overflow-hidden md:hidden pt-24 px-6',
                    open ? 'block' : 'hidden',
                )}
            >
                <div
                    data-slot={open ? 'open' : 'closed'}
                    className={cn(
                        'data-[slot=open]:animate-in data-[slot=open]:zoom-in-95 data-[slot=closed]:animate-out data-[slot=closed]:zoom-out-95 ease-out',
                        'flex h-full w-full flex-col gap-y-8',
                    )}
                >
                    <div className="flex flex-col gap-6">
                        {links.map((link) => (
                            link.href.startsWith('/') ? (
                                <Link
                                    key={link.label}
                                    to={link.href}
                                    className="text-2xl font-black uppercase tracking-tight text-white/80 hover:text-red-500 transition-colors"
                                    onClick={() => setOpen(false)}
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <a
                                    key={link.label}
                                    className="text-2xl font-black uppercase tracking-tight text-white/80 hover:text-red-500 transition-colors"
                                    href={link.href}
                                    onClick={(e) => handleScrollLink(e, link.href)}
                                >
                                    {link.label}
                                </a>
                            )
                        ))}
                    </div>
                    <div className="flex flex-col gap-4 mt-auto mb-12">
                        <Button asChild variant="outline" className="w-full h-12 text-base uppercase font-bold border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
                            <Link to="/login" onClick={() => setOpen(false)}>Área do Membro</Link>
                        </Button>
                        <Button asChild className="w-full h-12 text-base uppercase font-bold bg-red-600 hover:bg-red-700 text-white">
                            <Link to="/join" onClick={() => setOpen(false)}>Começar Agora</Link>
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
