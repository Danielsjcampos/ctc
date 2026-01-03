
import React, { useState, useEffect, useMemo } from 'react';
import { History, Download, Filter, Target, Loader2, MapPin, TrendingUp, Calendar, ChevronDown, PieChart as PieChartIcon, BarChart as BarChartIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/authStore';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#dc2626', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const HabitualView: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'week' | 'month' | 'year'>('all');

  const [specificMonth, setSpecificMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const fetchHabitual = async () => {
      if (!user) return;
      setLoading(true);

      let query = supabase
        .from('club_sessions')
        .select('*')
        .eq('shooter_id', user.id)
        .eq('status', 'completed')
        .order('check_in_at', { ascending: false });

      const now = new Date();

      // Filter Logic
      if (filterPeriod === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('check_in_at', weekAgo);
      } else if (filterPeriod === 'month') {
        // Last 30 Days
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('check_in_at', monthAgo);
      } else if (filterPeriod === 'year') {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString();
        query = query.gte('check_in_at', yearAgo);
      } else if (filterPeriod === 'specific_month') {
        // Specific Month Logic
        const [year, month] = specificMonth.split('-');
        const startDate = `${year}-${month}-01T00:00:00`;
        const nextMonthDate = new Date(parseInt(year), parseInt(month), 1);
        const lastDayDate = new Date(nextMonthDate.getTime() - 24 * 60 * 60 * 1000);
        const endDate = lastDayDate.toISOString().split('T')[0] + 'T23:59:59';

        query = query.gte('check_in_at', startDate).lte('check_in_at', endDate);
      }

      const { data } = await query;
      if (data) setSessions(data);
      setLoading(false);
    };
    fetchHabitual();
  }, [user, filterPeriod, specificMonth]);

  // Analytics Calculations
  const analytics = useMemo(() => {
    if (!sessions.length) return null;

    const totalShots = sessions.reduce((acc, s) => acc + (s.total_shots || 0), 0);
    const avgDistance = sessions.reduce((acc, s) => acc + (s.distance_meters || 0), 0) / sessions.length;

    // Weapon Usage
    const weaponMap: any = {};
    sessions.forEach(s => {
      const model = s.firearm_model || 'Arma do Clube';
      weaponMap[model] = (weaponMap[model] || 0) + 1;
    });
    const weaponData = Object.entries(weaponMap).map(([name, value]) => ({ name, value }));

    // Caliber Usage
    const caliberMap: any = {};
    sessions.forEach(s => {
      const cal = s.caliber || 'N/A';
      caliberMap[cal] = (caliberMap[cal] || 0) + (s.total_shots || 0);
    });
    const caliberData = Object.entries(caliberMap).map(([name, value]) => ({ name, value }));

    // Monthly Trend
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const trendMap: any = {};
    sessions.forEach(s => {
      const date = new Date(s.check_in_at);
      const key = `${monthNames[date.getMonth()]}/${date.getFullYear().toString().slice(-2)}`;
      trendMap[key] = (trendMap[key] || 0) + 1;
    });
    const trendData = Object.entries(trendMap).reverse().map(([name, value]) => ({ name, value }));

    return { totalShots, avgDistance: avgDistance.toFixed(1), weaponData, caliberData, trendData };
  }, [sessions]);



  const generatePDFReport = () => {
    if (!user) return;
    if (!sessions.length) {
      alert('Não há registros de treino neste período para gerar o relatório.');
      return;
    }

    const doc = new jsPDF();

    // --- HEADER ---
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 40, 'F');

    // Title
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Red
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO DE", 20, 18);
    doc.setTextColor(255, 255, 255); // White
    doc.text("HABITUALIDADE", 20, 28);

    // Club Info (Right Side)
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "bold");
    doc.text("ELITE COMMAND - CLUBE DE TIRO", 200, 15, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("CNPJ: 00.000.000/0001-00", 200, 20, { align: "right" });
    doc.text("Av. Central, 1000 - Centro, São Paulo - SP", 200, 24, { align: "right" });
    doc.text("Tel: (11) 99999-9999 | contato@elitecommand.com.br", 200, 28, { align: "right" });
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 200, 35, { align: "right" });

    // --- SHOOTER INFO ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("IDENTIFICAÇÃO DO ATIRADOR", 20, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome Completo: ${user.name.toUpperCase()}`, 20, 65);
    doc.text(`CPF: ${user.cpf || 'N/D'}`, 20, 72);
    doc.text(`Categoria: ${user.membershipType || 'Atirador'}`, 20, 79);

    // Period Info
    let periodText = filterPeriod === 'specific_month' ? specificMonth : filterPeriod.toUpperCase();
    doc.text(`Período do Relatório: ${periodText}`, 120, 65);
    doc.text(`Total de Registros: ${sessions.length}`, 120, 72);

    // --- TABLE ---
    const tableColumn = ["Data", "Horário", "Armamento", "Calibre", "Disparos", "Raia"];
    const tableRows = sessions.map(s => [
      new Date(s.check_in_at).toLocaleDateString(),
      new Date(s.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      s.firearm_model || 'Arma do Clube',
      s.caliber || 'N/A',
      s.total_shots,
      s.lane_number || '-'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // --- SIGNATURES ---
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    const signatureY = finalY + 40;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);

    // Signature 1
    doc.line(20, signatureY, 90, signatureY);
    doc.setFontSize(8);
    doc.text("ASSINATURA DO INSTRUTOR", 20, signatureY + 5);

    // Signature 2
    doc.line(120, signatureY, 190, signatureY);
    doc.text("ASSINATURA DO ATIRADOR", 120, signatureY + 5);

    doc.save(`habitualidade_${user.name.toLowerCase().replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Histórico de <span className="text-red-600">Habitualidade</span></h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Análise completa de performance e registros legais.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
              { id: 'all', label: 'Tudo' },
              { id: 'week', label: '7D' },
              { id: 'month', label: '30D' },
              { id: 'year', label: '1A' },
              { id: 'specific_month', label: 'Mês' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setFilterPeriod(p.id as any)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${filterPeriod === p.id ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {filterPeriod === 'specific_month' && (
            <input
              type="month"
              className="bg-white/5 border border-white/10 rounded-2xl py-2 px-4 text-white text-xs outline-none focus:border-red-600 transition-all font-bold uppercase"
              value={specificMonth}
              onChange={e => setSpecificMonth(e.target.value)}
            />
          )}

          <button
            onClick={generatePDFReport}
            className="group bg-white text-black hover:bg-red-600 hover:text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all shadow-xl shadow-white/5"
          >
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Extrair Relatório</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="p-3 bg-red-600/10 rounded-2xl text-red-600 w-fit mb-4"><Calendar className="w-5 h-5" /></div>
          <span className="block text-3xl font-black text-white">{sessions.length}</span>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Sessões</p>
        </div>
        <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-600 w-fit mb-4"><Target className="w-5 h-5" /></div>
          <span className="block text-3xl font-black text-white">{analytics?.totalShots || 0}</span>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Disparos Totais</p>
        </div>
        <div className="glass p-8 rounded-[40px] border-white/5 bg-gradient-to-br from-white/[0.02] to-transparent">
          <div className="p-3 bg-green-600/10 rounded-2xl text-green-600 w-fit mb-4"><TrendingUp className="w-5 h-5" /></div>
          <span className="block text-3xl font-black text-white">{analytics?.avgDistance || 0}m</span>
          <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mt-1">Distância Média</p>
        </div>
        <div className="glass p-8 rounded-[40px] border-red-600/20 bg-red-600/[0.03] flex items-center justify-center">
          <div className="text-center">
            <span className="block text-2xl font-black text-green-500 italic">REGULAR</span>
            <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest mt-1">Status no Exército</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Trend Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-[40px] border-white/5">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
              <BarChartIcon className="w-5 h-5 text-red-600" /> Frequência de Treinos
            </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0a0a0a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: 'bold', color: '#fff' }}
                />
                <Bar dataKey="value" fill="#dc2626" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weapons Usage */}
        <div className="glass p-8 rounded-[40px] border-white/5">
          <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2 mb-8">
            <PieChartIcon className="w-5 h-5 text-red-600" /> Equipamento vs Uso
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.weaponData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics?.weaponData?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {analytics?.weaponData?.map((w: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-[8px] font-black uppercase text-gray-500 truncate">{w.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="glass rounded-[48px] border-white/5 overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-lg font-black uppercase tracking-tighter italic">Histórico Detalhado</h3>
          <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{sessions.length} Entradas</div>
        </div>
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Buscando Arquivos...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/[0.02]">
                <tr className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  <th className="px-10 py-6">Data / Hora</th>
                  <th className="px-10 py-6">Setor/Raia</th>
                  <th className="px-10 py-6">Plataforma</th>
                  <th className="px-10 py-6 text-center">Volume</th>
                  <th className="px-10 py-6 text-center">Distância</th>
                  <th className="px-10 py-6 text-right">Calibre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sessions.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.03] transition-all group cursor-default">
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white uppercase">{new Date(s.check_in_at).toLocaleDateString()}</span>
                        <span className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Início: {new Date(s.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-600/10 rounded-lg text-red-600"><MapPin className="w-3 h-3" /></div>
                        <span className="text-xs text-gray-300 font-black uppercase italic tracking-tighter">Raia {s.lane_number}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <span className="text-xs text-white font-black uppercase tracking-tighter group-hover:text-red-500 transition-colors">{s.firearm_model || 'Glock G17 (Clube)'}</span>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 group-hover:border-red-600/30 transition-all">
                        <Target className="w-3 h-3 text-red-600" />
                        <span className="font-black text-white text-xs">{s.total_shots || 0}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center font-black text-xs text-gray-400">
                      {s.distance_meters || 0}m
                    </td>
                    <td className="px-10 py-6 text-right">
                      <span className="px-3 py-1 bg-blue-600/10 text-blue-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-600/20">{s.caliber || '9mm'}</span>
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-40 text-center">
                      <div className="opacity-20 flex flex-col items-center">
                        <History className="w-16 h-16 mb-4" />
                        <p className="text-xs font-black uppercase tracking-widest">Aguardando seu próximo treinamento</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitualView;
