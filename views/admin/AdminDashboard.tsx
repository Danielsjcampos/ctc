import React, { useState, useEffect } from 'react';
import {
  Users,
  Target,
  TrendingUp,
  AlertCircle,
  ShieldCheck,
  Loader2,
  Calendar,
  Trophy,
  Medal,
  Crown,
  DollarSign,
  Briefcase,
  Crosshair,
  FileWarning,
  UserCheck,
  Box,
  Activity
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useRanking } from '../../hooks/useRanking';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { ranking } = useRanking();

  // State for all metrics
  const [metrics, setMetrics] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalLeads: 0,
    totalStudents: 0, // Unique students
    totalCourses: 0,
    courseEnrollments: 0,
    totalRevenue: 0,
    totalShots: 0,
    clubWeapons: 0,
    affiliateWeapons: 0,
    blockedAccounts: 0,
    expiringAffiliations: 0,
    expiredDocs: 0
  });

  const [financialData, setFinancialData] = useState<any[]>([]);
  const [weaponRanking, setWeaponRanking] = useState<any[]>([]);
  const [expiringMembers, setExpiringMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // 1. Fetch Profiles (Affiliates, Status, Expiry)
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, status, is_affiliated, affiliation_expiry, role, ranking_points, name');

        // 2. Fetch CRM Leads
        const { count: leadsCount } = await supabase
          .from('crm_leads')
          .select('*', { count: 'exact', head: true });

        // 3. Fetch Courses
        const { data: courses } = await supabase
          .from('courses')
          .select('id, enrolled, price');

        // 4. Fetch Event Leads (Enrollments & Financials)
        const { data: eventLeads } = await supabase
          .from('event_leads')
          .select('amount_paid, created_at, email'); // Payment status? assuming amount_paid > 0 is valid revenue

        // 5. Fetch Sales (Financials)
        const { data: sales } = await supabase
          .from('sales')
          .select('total, created_at');

        // 6. Fetch Club Sessions (Shots, Weapons usage)
        const { data: sessions } = await supabase
          .from('club_sessions')
          .select('total_shots, firearm_model');

        // 7. Fetch Firearms (Arsenal)
        // Note: We need to know which are Club vs Affiliate. 
        // We'll fetch all and filter by owner's role if we can join, or just basic count for now.
        // Supabase select with join matches specific syntax.
        const { data: firearms } = await supabase
          .from('firearms')
          .select('id, owner_id, profiles(role)');

        // --- PROCESSING DATA ---

        const now = new Date();
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(now.getDate() + 30);

        // Profiles Metrics
        const safeProfiles = profiles || [];
        const totalAffiliates = safeProfiles.filter(p => p.is_affiliated).length;
        const activeAffiliates = safeProfiles.filter(p => p.is_affiliated && p.status === 'active').length;
        const blockedAccounts = safeProfiles.filter(p => p.status === 'blocked').length;

        // Alerts
        const expiring = safeProfiles.filter(p => {
          if (!p.affiliation_expiry) return false;
          const expiry = new Date(p.affiliation_expiry);
          return expiry > now && expiry <= thirtyDaysFromNow;
        });

        const expired = safeProfiles.filter(p => {
          if (!p.affiliation_expiry) return false;
          const expiry = new Date(p.affiliation_expiry);
          return expiry < now;
        });

        // Courses Metrics
        const safeCourses = courses || [];
        const totalCoursesCount = safeCourses.length;
        const courseEnrollmentsCount = safeCourses.reduce((acc, curr) => acc + (curr.enrolled || 0), 0);

        // Count unique emails as students
        const uniqueStudents = new Set((eventLeads || []).map(l => l.email || '')).size;

        // Financials
        let revenue = 0;
        const history: { date: string, amount: number }[] = [];

        (sales || []).forEach(s => {
          revenue += Number(s.total) || 0;
          history.push({ date: s.created_at.split('T')[0], amount: Number(s.total) || 0 });
        });
        (eventLeads || []).forEach(l => {
          revenue += Number(l.amount_paid) || 0;
          history.push({ date: l.created_at.split('T')[0], amount: Number(l.amount_paid) || 0 });
        });

        // Group history by month (last 6 months usually looks good)
        const aggregatedHistory = history.reduce((acc: any, curr) => {
          const month = curr.date.substring(0, 7); // YYYY-MM
          acc[month] = (acc[month] || 0) + curr.amount;
          return acc;
        }, {});

        const chartData = Object.keys(aggregatedHistory).sort().map(k => ({
          name: k,
          revenue: aggregatedHistory[k]
        }));


        // Operation Metrics
        const safeSessions = sessions || [];
        const totalShotsCount = safeSessions.reduce((acc, curr) => acc + (curr.total_shots || 0), 0);

        // Weapon Ranking
        const modelCounts: Record<string, number> = {};
        safeSessions.forEach(s => {
          if (s.firearm_model) {
            modelCounts[s.firearm_model] = (modelCounts[s.firearm_model] || 0) + 1; // Usage count
            // Or sum shots? "Rank das armas mais usadas" - usage frequency is good.
          }
        });
        const weaponRank = Object.entries(modelCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Arsenals
        // @ts-ignore
        const safeFirearms = firearms || [];
        let clubW = 0;
        let affiliateW = 0;

        safeFirearms.forEach((f: any) => {
          // If owner is ADMIN, allow it as Club Weapon
          const role = f.profiles?.role;
          if (role === 'ADMIN') clubW++;
          else affiliateW++;
        });


        setMetrics({
          totalAffiliates,
          activeAffiliates,
          totalLeads: leadsCount || 0,
          totalStudents: uniqueStudents,
          totalCourses: totalCoursesCount,
          courseEnrollments: courseEnrollmentsCount,
          totalRevenue: revenue,
          totalShots: totalShotsCount,
          clubWeapons: clubW,
          affiliateWeapons: affiliateW,
          blockedAccounts,
          expiringAffiliations: expiring.length,
          expiredDocs: expired.length // Using expired affiliation as proxy for now
        });

        setFinancialData(chartData);
        setWeaponRanking(weaponRank);
        setExpiringMembers([...expiring, ...expired].slice(0, 5)); // Show top 5 urgent

      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
      <p className="text-white/50 animate-pulse text-sm">CARREGANDO SISTEMA ELITE...</p>
    </div>
  );

  // Animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={container}
      className="space-y-8 max-w-[1800px] mx-auto pb-20"
    >
      {/* HEADER */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-center md:items-end gap-6 text-center md:text-left border-b border-white/5 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
            ELITE <span className="text-red-600">COMMAND</span>
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-2 uppercase font-black tracking-widest italic opacity-50">
            Painel Operacional Avançado
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white/5 p-1 rounded-xl flex border border-white/5">
            <button className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 transition-all text-white">
              Relatórios
            </button>
          </div>
        </div>
      </motion.div>

      {/* METRICS GRID - MAIN KPI */}
      <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <KpiCard icon={<DollarSign />} label="Faturamento Total" value={`R$ ${(metrics.totalRevenue / 1000).toFixed(1)}k`} color="emerald" trend="+15%" />
        <KpiCard icon={<Users />} label="Total Afiliados" value={metrics.totalAffiliates} color="blue" subValue={`${metrics.activeAffiliates} Ativos`} />
        <KpiCard icon={<Activity />} label="Total Leads" value={metrics.totalLeads} color="purple" />
        <KpiCard icon={<Target />} label="Disparos (Clube)" value={metrics.totalShots} color="orange" />
        <KpiCard icon={<Crosshair />} label="Ranking Clube" value="#1" color="yellow" subValue="Elite Tier" />
      </motion.div>

      {/* SECONDARY METRICS */}
      <motion.div variants={container} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricBox label="Cursos Ativos" value={metrics.totalCourses} icon={<Briefcase size={16} />} />
        <MetricBox label="Inscrições" value={metrics.courseEnrollments} icon={<UserCheck size={16} />} />
        <MetricBox label="Armas (Clube)" value={metrics.clubWeapons} icon={<Box size={16} />} />
        <MetricBox label="Armas (Filiados)" value={metrics.affiliateWeapons} icon={<ShieldCheck size={16} />} />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FINANCIAL CHART */}
        <motion.div variants={item} className="lg:col-span-2 glass p-6 md:p-8 rounded-[32px] border-white/5 min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-emerald-500" />
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Evolução Financeira</h3>
            </div>
            <select className="bg-black/30 border border-white/10 rounded-lg px-3 py-1 text-xs text-white uppercase font-bold text-right">
              <option>Últimos 6 Meses</option>
              <option>Ano Atual</option>
            </select>
          </div>
          <div className="flex-grow w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#666" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ALERTS & NOTIFICATIONS */}
        <motion.div variants={item} className="glass p-6 md:p-8 rounded-[32px] border-white/5 flex flex-col h-full bg-red-900/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <AlertCircle className="text-red-500 animate-pulse" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-white">Alertas Operacionais</h3>
          </div>

          <div className="space-y-4 relative z-10 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {metrics.expiredDocs > 0 && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                <FileWarning className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-black text-red-100 uppercase">Documentos Vencidos</p>
                  <p className="text-xs text-red-300 mt-1">{metrics.expiredDocs} afiliados com documentação irregular.</p>
                </div>
              </div>
            )}
            {metrics.expiringAffiliations > 0 && (
              <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-3">
                <Calendar className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-black text-orange-100 uppercase">Afiliações a Vencer</p>
                  <p className="text-xs text-orange-300 mt-1">{metrics.expiringAffiliations} afiliações vencem em 30 dias.</p>
                </div>
              </div>
            )}

            {expiringMembers.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs font-bold text-gray-300 truncate w-[140px]">{m.name || 'Membro'}</span>
                <span className="text-[10px] uppercase tracking-wider text-red-400 font-black border border-red-900/30 px-2 py-1 rounded bg-red-900/20">
                  {m.affiliation_expiry ? new Date(m.affiliation_expiry).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            ))}

            {metrics.expiredDocs === 0 && metrics.expiringAffiliations === 0 && (
              <div className="text-center py-10 opacity-50">
                <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                <p className="text-xs uppercase font-bold text-gray-400">Tudo Operacional</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* WEAPON RANKING */}
        <motion.div variants={item} className="glass p-6 rounded-[32px] border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <Crosshair className="text-orange-500" />
            <h3 className="text-lg font-black uppercase tracking-tighter text-white">Arsenal Mais Utilizado</h3>
          </div>

          <div className="space-y-4">
            {weaponRanking.map((w, idx) => (
              <div key={idx} className="group relative">
                <div className="flex justify-between items-center text-xs uppercase font-bold text-gray-400 mb-1 z-10 relative px-1">
                  <span className="text-white group-hover:text-orange-400 transition-colors">#{idx + 1} {w.name}</span>
                  <span>{w.count} Usos</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(w.count / (weaponRanking[0]?.count || 1)) * 100}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-orange-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CLUB RANKING LIST */}
        <motion.div variants={item} className="glass p-6 rounded-[32px] border-white/5 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Crown className="text-yellow-500" />
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">Ranking Geral</h3>
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Temporada 2024</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ranking.slice(0, 6).map((member, index) => (
              <div key={member.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all hover:bg-white/[0.07]">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-lg 
                      ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black' :
                    index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-black' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-black' :
                        'bg-white/10 text-gray-500'}`}>
                  {index + 1}
                </div>
                <div className="flex-grow">
                  <h4 className="text-sm font-black text-white uppercase">{member.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded text-gray-300 font-bold uppercase">{member.role}</span>
                    <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-widest">{member.ranking_points} PTS</span>
                  </div>
                </div>
                {index < 3 && <Trophy size={16} className={index === 0 ? 'text-yellow-500' : index === 1 ? 'text-slate-400' : 'text-orange-500'} />}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

    </motion.div>
  );
};

// HELPER COMPONENTS

const KpiCard = ({ icon, label, value, color, trend, subValue }: any) => {
  const colorMap: any = {
    blue: "from-blue-500 to-cyan-500",
    emerald: "from-emerald-500 to-green-500",
    red: "from-red-500 to-rose-500",
    purple: "from-purple-500 to-indigo-500",
    orange: "from-orange-500 to-amber-500",
    yellow: "from-yellow-400 to-orange-400"
  };

  const textMap: any = {
    blue: "text-blue-500",
    emerald: "text-emerald-500",
    red: "text-red-500",
    purple: "text-purple-400",
    orange: "text-orange-500",
    yellow: "text-yellow-500"
  };

  return (
    <div className="glass p-5 rounded-[24px] border-white/5 relative overflow-hidden group hover:border-white/20 transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorMap[color]} opacity-10 blur-[50px] group-hover:opacity-20 transition-all`} />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        <div className="flex justify-between items-start">
          <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${textMap[color]} shadow-inner`}>
            {icon}
          </div>
          {trend && <span className="text-[9px] font-black uppercase bg-white/5 px-2 py-1 rounded text-emerald-400">{trend}</span>}
        </div>

        <div>
          <span className="text-2xl lg:text-3xl font-black tracking-tighter text-white block truncate">{value}</span>
          <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mt-1">{label}</p>
          {subValue && <p className="text-[9px] text-gray-400 mt-2 font-medium italic border-t border-white/5 pt-2">{subValue}</p>}
        </div>
      </div>
    </div>
  )
}

const MetricBox = ({ label, value, icon }: any) => (
  <div className="glass p-4 rounded-2xl border-white/5 flex items-center gap-4 hover:bg-white/5 transition-all">
    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400">
      {icon}
    </div>
    <div>
      <span className="block text-xl font-black text-white tracking-tight">{value}</span>
      <span className="text-[9px] uppercase font-bold text-gray-600 tracking-wider">{label}</span>
    </div>
  </div>
)

export default AdminDashboard;
