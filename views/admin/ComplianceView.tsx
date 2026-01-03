
import React, { useState } from 'react';
import { ShieldCheck, History, Database, Search, FileText, Download, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ComplianceView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM

  const generateMonthlyReport = async () => {
    setLoading(true);
    try {
      // Construct Start Date: YYYY-MM-01T00:00:00Z (First day of month)
      const [year, month] = reportMonth.split('-');
      const startOfMonth = `${year}-${month}-01T00:00:00`;

      // Construct End Date: Last day of month
      // We create a date for the 1st of the NEXT month, then subtract 1 second/day to get last day of current month
      const nextMonthDate = new Date(parseInt(year), parseInt(month), 1);
      const lastDayDate = new Date(nextMonthDate.getTime() - 24 * 60 * 60 * 1000); // Go back one day
      const endOfMonth = lastDayDate.toISOString().split('T')[0] + 'T23:59:59';

      console.log(`Querying sessions between ${startOfMonth} and ${endOfMonth}`);

      const { data: sessions, error } = await supabase
        .from('club_sessions')
        .select('*, profiles(name, cpf)')
        .gte('check_in_at', startOfMonth)
        .lte('check_in_at', endOfMonth)
        .order('check_in_at', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Sessions found:', sessions);

      if (!sessions || sessions.length === 0) {
        alert(`Nenhum registro de habitualidade encontrado entre ${new Date(startOfMonth).toLocaleDateString()} e ${new Date(endOfMonth).toLocaleDateString()}. Verifique se há treinos 'completados' para este mês.`);
        setLoading(false);
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
      doc.text("RELATÓRIO MENSAL", 20, 18);
      doc.setTextColor(255, 255, 255); // White
      doc.text("AUDITORIA & COMPLIANCE", 20, 28);

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

      // Stats
      const totalShots = sessions.reduce((acc, curr) => acc + (curr.total_shots || 0), 0);
      const uniqueShooters = new Set(sessions.map(s => s.shooter_id)).size;

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`MÊS DE REFERÊNCIA: ${reportMonth}`, 20, 50);

      doc.setFont("helvetica", "normal");
      doc.text(`Total de Presenças: ${sessions.length}`, 20, 58);
      doc.text(`Atiradores Distintos: ${uniqueShooters}`, 80, 58);
      doc.text(`Total de Disparos: ${totalShots}`, 140, 58);

      // Table
      const tableColumn = ["Data", "Atirador", "CPF", "Armamento", "Calibre", "Tiros"];
      const tableRows = sessions.map(s => [
        new Date(s.check_in_at).toLocaleDateString() + ' ' + new Date(s.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        s.profiles?.name || s.shooter_name || 'N/D',
        s.profiles?.cpf || 'N/D',
        s.firearm_model || 'N/D',
        s.caliber || 'N/A',
        s.total_shots
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
        columnStyles: {
          1: { fontStyle: 'bold' } // Atirador Column
        }
      });

      // --- SIGNATURES ---
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      const signatureY = finalY + 40;

      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);

      // Signature 1
      doc.line(20, signatureY, 90, signatureY);
      doc.setFontSize(8);
      doc.text("RESPONSÁVEL TÉCNICO", 20, signatureY + 5);

      // Signature 2
      doc.line(120, signatureY, 190, signatureY);
      doc.text("DIRETORIA", 120, signatureY + 5);

      doc.save(`relatorio_habitualidade_${reportMonth}.pdf`);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao gerar relatório: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Auditoria & <span className="text-red-600">Compliance</span></h1>
          <p className="text-gray-500 text-sm mt-1">Gestão de logs e relatórios operacionais consolidados.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.02]">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-red-600/10 rounded-2xl text-red-600"><FileText className="w-6 h-6" /></div>
            <h3 className="text-lg font-black uppercase tracking-tighter text-white italic">Relatório Mensal</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Mês de Referência</label>
              <input
                type="month"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm outline-none focus:border-red-600 transition-all font-bold"
                value={reportMonth}
                onChange={e => setReportMonth(e.target.value)}
              />
            </div>

            <button
              onClick={generateMonthlyReport}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Gerar Habitualidade Mensal
            </button>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.02] flex flex-col justify-center items-center text-center space-y-4">
          <Database className="w-8 h-8 text-blue-500" />
          <div>
            <span className="block text-2xl font-black text-white">100%</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Integridade Blockchain</p>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.02] flex flex-col justify-center items-center text-center space-y-4">
          <ShieldCheck className="w-8 h-8 text-green-500" />
          <div>
            <span className="block text-2xl font-black text-white">ATIVO</span>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Monitoramento 24/7</p>
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-[40px] border-white/5 bg-[#0a0a0a]/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 px-4">
          <div className="flex items-center space-x-3">
            <History className="w-5 h-5 text-red-600" />
            <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Logs de Atividade</h3>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors group-focus-within:text-red-500" />
            <input type="text" placeholder="Filtrar por usuário ou ação..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-xs outline-none focus:border-red-600 transition-all text-white font-medium" />
          </div>
        </div>

        <div className="space-y-4">
          {[
            { user: 'Ricardo Silva', action: 'Alteração de Plano - ID #204', category: 'Financeiro', ip: '187.54.12.3', time: 'Há 5 min' },
            { user: 'Sistema', action: 'Backup Automático - Cluster AWS', category: 'Sistema', ip: '127.0.0.1', time: 'Há 24 min' },
            { user: 'Ana Souza', action: 'Inclusão de Atirador - Carlos Mendes', category: 'Cadastro', ip: '187.54.12.8', time: 'Há 1h' },
            { user: 'Admin Master', action: 'Relatório Mensal Gerado', category: 'Compliance', ip: '192.168.1.1', time: 'Agora' },
          ].map((l, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5 group hover:bg-white/[0.05] transition-all">
              <div className="flex items-center space-x-6">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 font-black text-xs italic">{l.user.charAt(0)}</div>
                <div>
                  <span className="block font-black text-white text-xs uppercase tracking-tight">{l.user}</span>
                  <span className="text-gray-500 text-[10px] font-medium">{l.action}</span>
                </div>
              </div>
              <div className="flex items-center space-x-8 mt-4 md:mt-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">{l.category}</span>
                <span className="font-mono text-[9px] text-gray-600">{l.ip}</span>
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{l.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceView;
