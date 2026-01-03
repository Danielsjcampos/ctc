
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  Calendar,
  CreditCard,
  ShieldCheck,
  LogOut,
  Bell,
  Menu,
  X,
  History,
  FileText,
  Crosshair,
  ShoppingCart,
  BookOpen,
  MapPin,
  Settings,
  Package,
  Zap,
  Boxes,
  Trophy,
  BadgeCheck,
  UserCircle,
  MoreVertical,
  Plus
} from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { Permission } from '../../types';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { Sidebar, SidebarBody, SidebarLink } from '../ui/sidebar';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
  permission?: Permission;
}

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const staffMenuItems: MenuItem[] = [
    { name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin', permission: 'VIEW_DASHBOARD' },
    { name: 'Portaria / Check-in', icon: <MapPin className="w-5 h-5" />, path: '/admin/checkin', permission: 'MANAGE_CHECKIN' },
    { name: 'PDV / Vendas', icon: <ShoppingCart className="w-5 h-5" />, path: '/admin/pos', permission: 'VIEW_FINANCE' },
    { name: 'Atiradores', icon: <Users className="w-5 h-5" />, path: '/admin/shooters', permission: 'MANAGE_SHOOTERS' },
    { name: 'Mapa de Armas', icon: <Crosshair className="w-5 h-5" />, path: '/admin/armory-map', permission: 'MANAGE_ARMORY' },
    { name: 'Estoque / Produtos', icon: <Package className="w-5 h-5" />, path: '/admin/inventory', permission: 'MANAGE_INVENTORY' },
    { name: 'Agenda & Pistas', icon: <Calendar className="w-5 h-5" />, path: '/admin/agenda', permission: 'VIEW_AGENDA' },
    { name: 'Faturamento', icon: <CreditCard className="w-5 h-5" />, path: '/admin/finance', permission: 'VIEW_FINANCE' },
    { name: 'Gestão Cursos', icon: <BookOpen className="w-5 h-5" />, path: '/admin/courses', permission: 'MANAGE_COURSES' },
    { name: 'Gestão do Ranking', icon: <Trophy className="w-5 h-5" />, path: '/admin/ranking', permission: 'MANAGE_STAFF' },
    { name: 'CRM / Leads', icon: <Zap className="w-5 h-5" />, path: '/admin/crm', permission: 'MANAGE_SHOOTERS' },
    { name: 'Equipe / Staff', icon: <Settings className="w-5 h-5" />, path: '/admin/staff', permission: 'MANAGE_STAFF' },
    { name: 'Compliance', icon: <ShieldCheck className="w-5 h-5" />, path: '/admin/logs', permission: 'VIEW_COMPLIANCE' },
    { name: 'Configurações', icon: <Settings className="w-5 h-5" />, path: '/admin/settings', permission: 'MANAGE_STAFF' },
  ];

  const shooterMenuItems: MenuItem[] = [
    { name: 'Painel', icon: <LayoutDashboard className="w-5 h-5" />, path: '/portal' },
    { name: 'Minha Raia', icon: <Calendar className="w-5 h-5" />, path: '/portal/book' },
    { name: 'Habitualidade', icon: <History className="w-5 h-5" />, path: '/portal/habitual' },
    { name: 'Acervo', icon: <Crosshair className="w-5 h-5" />, path: '/portal/guns' },
    { name: 'Documentos', icon: <FileText className="w-5 h-5" />, path: '/portal/docs' },
    { name: 'Financeiro', icon: <CreditCard className="w-5 h-5" />, path: '/portal/finance' },
    { name: 'Comprar Cursos', icon: <ShoppingCart className="w-5 h-5" />, path: '/portal/courses' },
    { name: 'Minha ID Digital', icon: <BadgeCheck className="w-5 h-5 text-red-500" />, path: '/portal/membership' },
    { name: 'Meu Perfil', icon: <UserCircle className="w-5 h-5" />, path: '/portal/profile' },
  ];

  const getVisibleMenu = () => {
    if (!user) return [];
    if (user.role === 'SHOOTER') return shooterMenuItems;
    if (user.role === 'ADMIN') return staffMenuItems;

    return staffMenuItems.filter(item =>
      !item.permission || (user.permissions && user.permissions.includes(item.permission))
    );
  };

  const currentMenu = getVisibleMenu();

  const Logo = () => (
    <Link to="/" className="flex items-center space-x-2 py-2">
      <ShieldCheck className="w-8 h-8 text-blue-600 flex-shrink-0" />
      <motion.div
        animate={{ opacity: open ? 1 : 0, display: open ? 'block' : 'none' }}
        className="flex flex-col overflow-hidden"
      >
        <span className="text-sm font-black tracking-tighter leading-none whitespace-nowrap">CTC-CRUZEIRO</span>
        <span className="text-[8px] uppercase tracking-widest text-red-600 font-bold whitespace-nowrap">Portal Gestão</span>
      </motion.div>
    </Link>
  );

  const LogoIcon = () => (
    <Link to="/" className="flex items-center justify-center py-2">
      <ShieldCheck className="w-8 h-8 text-blue-600" />
    </Link>
  );

  const [showAllModules, setShowAllModules] = useState(false);

  const adminNavItems = [
    { name: 'Home', icon: <LayoutDashboard className="w-6 h-6" />, path: '/admin' },
    { name: 'Vendas', icon: <ShoppingCart className="w-6 h-6" />, path: '/admin/pos' },
    { name: 'Membros', icon: <Users className="w-6 h-6" />, path: '/admin/shooters' },
    { name: 'Caixa', icon: <CreditCard className="w-6 h-6" />, path: '/admin/finance' },
    { name: 'Ajustes', icon: <Settings className="w-6 h-6" />, path: '/admin/settings' },
  ];

  const shooterNavItems = [
    { name: 'Carteira', icon: <BadgeCheck className="w-6 h-6" />, path: '/portal/membership' },
    { name: 'Acervo', icon: <Crosshair className="w-6 h-6" />, path: '/portal/guns' },
    { name: 'Menu', icon: <div />, path: '#' }, // Placeholder/Central Button Slot
    { name: 'Finanças', icon: <CreditCard className="w-6 h-6" />, path: '/portal/finance' },
    { name: 'Habitual', icon: <History className="w-6 h-6" />, path: '/portal/habitual' },
  ];

  const mainNavItems = user?.role === 'SHOOTER' ? shooterNavItems : adminNavItems;

  const AllModulesOverlay = () => (
    <AnimatePresence>
      {showAllModules && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl p-8 pb-32 overflow-y-auto"
        >
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-2xl font-black uppercase tracking-tighter">Todos os <span className="text-red-600">Módulos</span></h3>
            <button onClick={() => setShowAllModules(false)} className="p-3 bg-white/5 rounded-2xl">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
            {currentMenu.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setShowAllModules(false);
                }}
                className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-white/5 border border-white/5 active:scale-95 transition-all"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl text-red-600">
                  {item.icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">
                  {item.name}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const MobileBottomNav = () => (
    <div className="lg:hidden fixed bottom-6 left-6 right-6 h-20 z-50">
      {/* Background & Decor Layer - Handles styling and clips the internal glow */}
      <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-2xl rounded-[32px] border border-white/10 shadow-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-red-600/20 blur-3xl rounded-full" />
      </div>

      {/* Content Layer - Allows overflow for the floating button */}
      <div className="relative h-full flex items-center justify-around px-4">
        {mainNavItems.map((item, idx) => {
          if (idx === 2) return (
            <button
              key="all-modules"
              onClick={() => setShowAllModules(true)}
              className="relative -top-8 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-xl shadow-red-600/40 border-4 border-[#050505] active:scale-95 transition-all group z-10"
            >
              <Plus className="w-8 h-8 text-white group-hover:rotate-90 transition-transform" />
            </button>
          );

          const isActive = location.pathname === item.path;

          return (
            <button
              key={idx}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 transition-all z-10",
                isActive ? "text-red-600" : "text-gray-500"
              )}
            >
              {item.icon}
              <span className="text-[8px] font-black uppercase tracking-widest">{item.name}</span>
              {isActive && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-red-600 rounded-full mt-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden text-white font-sans w-full relative">
      <div className="hidden lg:flex">
        <Sidebar open={open} setOpen={setOpen} animate={true}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {currentMenu.map((link, idx) => (
                  <SidebarLink
                    key={idx}
                    link={{
                      label: link.name,
                      href: link.path,
                      icon: (
                        <span className={cn(
                          "transition-colors",
                          location.pathname === link.path ? "text-blue-500" : "text-gray-500 group-hover/sidebar:text-white"
                        )}>
                          {link.icon}
                        </span>
                      )
                    }}
                    className={cn(
                      location.pathname === link.path ? "bg-white/5" : ""
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4 border-t border-white/5 pt-4">
              <SidebarLink
                onClick={handleLogout}
                link={{
                  label: "Sair Agora",
                  href: "#",
                  icon: <LogOut className="h-5 w-5 text-red-500 flex-shrink-0" />
                }}
                className="hover:bg-red-500/10"
              />
              <SidebarLink
                link={{
                  label: user?.name || "Usuário",
                  href: user?.role === 'SHOOTER' ? "/portal" : "/admin",
                  icon: (
                    <div className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black flex-shrink-0">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                  ),
                }}
              />
            </div>
          </SidebarBody>
        </Sidebar>
      </div>

      <div className="flex-grow flex flex-col overflow-hidden w-full relative">
        <header className="h-20 bg-[#0a0a0a] border-b border-white/5 flex items-center justify-between px-6 md:px-8 shrink-0 z-40">
          <div className="flex items-center space-x-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              {user?.role === 'SHOOTER' ? 'ÁREA DO ATIRADOR' : 'PAINEL ADMINISTRATIVO'}
            </h2>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6">
            <button onClick={handleLogout} className="lg:hidden p-2 text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-5 h-5" />
            </button>
            <button className="relative p-2 text-gray-400 hover:text-white">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full border border-[#0a0a0a]" />
            </button>
            <div className="flex items-center space-x-3 border-l border-white/10 pl-4 md:pl-6">
              <div className="text-right hidden sm:block">
                <span className="block text-sm font-black leading-none">{user?.name}</span>
                <span className="text-[8px] uppercase text-blue-500 font-black tracking-[0.2em]">{user?.membershipType || user?.role}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto p-6 md:p-10 bg-[#070707] custom-scrollbar pb-32 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <MobileBottomNav />
      <AllModulesOverlay />
    </div>
  );
};

export default DashboardLayout;
