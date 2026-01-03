
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Send,
  Filter,
  Search,
  RefreshCcw,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  Calendar,
  MoreHorizontal,
  Printer,
  ChevronRight,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const FinanceView: React.FC = () => {
  const [isBilling, setIsBilling] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [pendingExpense, setPendingExpense] = useState(0);

  useEffect(() => {
    fetchFinancials();
  }, []);

  const fetchFinancials = async () => {
    setLoading(true);
    const { data: sales } = await supabase
      .from('sales')
      .select('*, profiles(name, membership_type)')
      .order('created_at', { ascending: false });

    const { data: finTrans } = await supabase
      .from('financial_transactions')
      .select('*')
      .order('due_date', { ascending: false });

    if (sales || finTrans) {
      const combined: any[] = [];
      let income = 0;
      let expense = 0;
      let pendingExp = 0;

      sales?.forEach(s => {
        combined.push({
          id: s.id,
          type: 'income',
          amount: s.total,
          description: `Venda / Comanda: ${s.profiles?.name || 'Cliente Balcão'}`,
          status: s.status === 'paid' ? 'paid' : 'pending',
          date: s.closed_at || s.created_at,
          category: 'Vendas',
          origin: s.profiles?.name || 'Venda Direta'
        });
        if (s.status === 'paid') income += s.total;
      });

      finTrans?.forEach(t => {
        combined.push({
          id: t.id,
          type: t.type,
          amount: t.amount,
          description: t.description,
          status: t.status,
          date: t.payment_date || t.due_date,
          category: t.category,
          origin: t.type === 'expense' ? 'Fornecedor' : 'Diversos'
        });

        if (t.type === 'income' && t.status === 'paid') income += t.amount;
        if (t.type === 'expense') {
          if (t.status === 'paid') expense += t.amount;
          else pendingExp += t.amount;
        }
      });

      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(combined);
      setTotalIncome(income);
      setTotalExpense(expense);
      setPendingExpense(pendingExp);
    }
    setLoading(false);
  };

  const handleBatchBilling = () => {
    setIsBilling(true);
    setTimeout(() => setIsBilling(false), 2000);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-24 lg:pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter leading-none italic">CONTROLE <span className="text-blue-600">FINANCEIRO</span></h1>
          <p className="text-gray-500 text-[10px] md:text-sm mt-2 font-medium italic">Gestão de fluxo de caixa e faturamento.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-4 w-full md:w-auto">
          <button
            onClick={handleBatchBilling}
            disabled={isBilling}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center space-x-2"
          >
            {isBilling ? <RefreshCcw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>Faturamento Mensal</span>
          </button>
          <button className="w-full md:w-auto bg-white/5 hover:bg-white/10 text-white px-8 py-4 md:py-5 rounded-2xl md:rounded-3xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Relatórios</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass p-5 md:p-8 rounded-[32px] md:rounded-[48px] border-white/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-10 bg-green-600" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 border border-green-500/20"><TrendingUp className="w-4 h-4 md:w-6 md:h-6" /></div>
              <span className="hidden md:block text-[9px] font-black uppercase tracking-widest text-green-500 bg-green-500/5 px-3 py-1.5 rounded-xl">Receita</span>
            </div>
            <div>
              <span className="text-lg md:text-3xl font-black text-white italic">R$ {totalIncome.toFixed(2)}</span>
              <p className="text-[8px] md:text-[10px] uppercase font-black text-gray-600 tracking-widest mt-1">Realizado</p>
            </div>
          </div>
        </div>

        <div className="glass p-5 md:p-8 rounded-[32px] md:rounded-[48px] border-white/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-10 bg-red-600" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-red-500/10 rounded-2xl text-red-500 border border-red-500/20"><ArrowDownRight className="w-4 h-4 md:w-6 md:h-6" /></div>
            </div>
            <div>
              <span className="text-lg md:text-3xl font-black text-white italic">R$ {totalExpense.toFixed(2)}</span>
              <p className="text-[8px] md:text-[10px] uppercase font-black text-gray-600 tracking-widest mt-1">Despesas</p>
            </div>
          </div>
        </div>

        <div className="glass p-5 md:p-8 rounded-[32px] md:rounded-[48px] border-white/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-10 bg-blue-600" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20"><Calendar className="w-4 h-4 md:w-6 md:h-6" /></div>
            </div>
            <div>
              <span className="text-lg md:text-3xl font-black text-white italic">R$ {pendingExpense.toFixed(2)}</span>
              <p className="text-[8px] md:text-[10px] uppercase font-black text-gray-600 tracking-widest mt-1">A Pagar</p>
            </div>
          </div>
        </div>

        <div className="glass p-5 md:p-8 rounded-[32px] md:rounded-[48px] border-white/5 relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-10 bg-zinc-600" />
          <div className="relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <div className="p-3 bg-white/5 rounded-2xl text-white border border-white/10"><Wallet className="w-4 h-4 md:w-6 md:h-6" /></div>
            </div>
            <div>
              <span className={`text-lg md:text-3xl font-black italic ${(totalIncome - totalExpense) >= 0 ? 'text-white' : 'text-red-500'}`}>R$ {(totalIncome - totalExpense).toFixed(2)}</span>
              <p className="text-[8px] md:text-[10px] uppercase font-black text-gray-600 tracking-widest mt-1">Saldo</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 glass rounded-[32px] md:rounded-[48px] border-white/5 overflow-hidden flex flex-col h-full">
          <div className="p-6 md:p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter italic">Fluxo de <span className="text-blue-500">Caixa</span></h3>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-700 w-4 h-4" />
              <input type="text" placeholder="Buscar registros..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-xs text-white outline-none focus:border-blue-600 transition-all font-bold" />
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-3 p-4">
            {transactions.map((t) => (
              <div key={t.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group active:scale-95 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${t.type === 'income' ? 'bg-green-600/10 text-green-500' : 'bg-red-600/10 text-red-500'} border-white/5`}>
                    {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="block text-[11px] font-black text-white uppercase tracking-tight truncate max-w-[150px]">{t.description}</span>
                    <span className="text-[9px] text-gray-500 font-bold uppercase">{formatDate(t.date)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`block text-xs font-black italic ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>R$ {t.amount.toFixed(2)}</span>
                  <span className="text-[8px] font-black uppercase text-gray-600">{t.status === 'paid' ? 'Pago' : 'Pen.'}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto px-6">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-gray-500 bg-white/[0.01]">
                  <th className="px-6 py-8 italic font-black">Tipo</th>
                  <th className="px-6 py-8">Descrição / Origem</th>
                  <th className="px-6 py-8">Data</th>
                  <th className="px-6 py-8">Valor</th>
                  <th className="px-6 py-8 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {transactions.map((t) => (
                  <tr key={t.id} className="group hover:bg-white/[0.02] transition-colors font-bold">
                    <td className="px-6 py-8">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${t.type === 'income' ? 'bg-green-600/10 text-green-500 border-green-500/20' : 'bg-red-600/10 text-red-500 border-red-500/20'}`}>
                        {t.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white italic uppercase">{t.description}</span>
                        <span className="text-[9px] font-bold text-gray-600 uppercase mt-1">{t.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-8">
                      <span className="text-[10px] font-black text-gray-500 uppercase">{formatDate(t.date)}</span>
                    </td>
                    <td className="px-6 py-8 font-black italic">
                      <span className={t.type === 'income' ? 'text-white' : 'text-red-500'}>R$ {t.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-8 text-center">
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${t.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>
                        {t.status === 'paid' ? 'Liquidado' : 'Pendente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8 h-full">
          <div className="glass p-8 rounded-[40px] border-white/5 bg-zinc-950/40 space-y-8">
            <h3 className="text-xl font-black uppercase tracking-tighter italic text-white flex items-center gap-3">
              Análise <ArrowRight className="w-5 h-5 text-blue-500" />
            </h3>
            <div className="space-y-6">
              {[
                { label: 'Operacional', val: '45%', color: 'blue' },
                { label: 'Estoque', val: '32%', color: 'red' },
                { label: 'Marketing', val: '12%', color: 'green' }
              ].map((p, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">{p.label}</span>
                    <span className="text-xs font-black text-white italic">{p.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full bg-${p.color}-600`} style={{ width: p.val }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass p-8 rounded-[40px] border-blue-600/20 bg-blue-600/[0.02] space-y-4">
            <div className="flex items-center space-x-3 text-blue-500">
              <CheckCircle2 className="w-5 h-5" />
              <h4 className="text-[10px] font-black uppercase tracking-widest italic leading-none">Saúde de Caixa</h4>
            </div>
            <p className="text-[11px] text-gray-500 font-medium italic leading-relaxed">Próximos 7 dias com saldo garantido.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceView;
