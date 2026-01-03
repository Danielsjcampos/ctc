
import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, ArrowRight, Download, Loader2, ShoppingBag, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/authStore';

const ShooterFinanceView: React.FC = () => {
  const { user } = useAuth();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSale, setExpandedSale] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'open' | 'history'>('open');

  useEffect(() => {
    const fetchFinance = async () => {
      if (!user) return;
      setLoading(true);
      const { data } = await supabase
        .from('sales')
        .select('*')
        .eq('shooter_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setSales(data);
      setLoading(false);
    };
    fetchFinance();
  }, [user]);

  const totalPending = sales
    .filter(s => s.status === 'pending')
    .reduce((acc, s) => acc + s.total, 0);

  const filteredSales = sales.filter(s => {
    if (activeTab === 'open') return s.status === 'pending';
    return s.status === 'paid';
  });

  return (
    <div className="space-y-10 animate-fade-in">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Financeiro & <span className="text-red-600">Assinaturas</span></h1>
        <p className="text-gray-500 text-sm">Gerencie seus pagamentos, faturas e débitos de consumo no clube.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass p-10 rounded-[40px] border-red-600/20 bg-gradient-to-br from-red-600/5 to-transparent flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div className="p-4 bg-red-600/10 rounded-3xl text-red-600"><CreditCard className="w-8 h-8" /></div>
              <span className="text-[10px] font-black uppercase text-green-500 bg-green-500/10 px-3 py-1 rounded-full">Assinatura Ativa</span>
            </div>
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter text-white">{user?.membershipType?.toUpperCase() || 'PLANO ATIVO'}</h3>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Status de Adimplência: OK • Renovação Mensal</p>
            </div>
          </div>

          <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/5 flex justify-between items-center">
            <div>
              <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Débito de Consumo (Estante/Bar)</span>
              <span className="text-2xl font-black text-red-500">R$ {totalPending.toFixed(2)}</span>
            </div>
            <button className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest">Pagar Agora</button>
          </div>
        </div>

        <div className="glass p-8 rounded-[40px] border-white/5 space-y-8 flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('open')}
                className={`text-lg font-black uppercase tracking-tighter transition-colors ${activeTab === 'open' ? 'text-red-500' : 'text-gray-600 hover:text-white'}`}
              >
                Comandas Abertas
              </button>
              <div className="w-px bg-white/10 h-6" />
              <button
                onClick={() => setActiveTab('history')}
                className={`text-lg font-black uppercase tracking-tighter transition-colors ${activeTab === 'history' ? 'text-white' : 'text-gray-600 hover:text-white'}`}
              >
                Histórico
              </button>
            </div>
            <ShoppingBag className="w-5 h-5 text-gray-600" />
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {loading ? (
              <div className="py-20 flex justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>
            ) : filteredSales.length > 0 ? (
              filteredSales.map((sale) => (
                <div key={sale.id} className={`rounded-2xl border overflow-hidden transition-all ${sale.status === 'pending' ? 'bg-red-600/5 border-red-600/20' : 'bg-white/5 border-white/5'}`}>
                  <button
                    onClick={() => setExpandedSale(expandedSale === sale.id ? null : sale.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-10 rounded-full ${sale.status === 'paid' ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                      <div className="text-left">
                        <span className="block text-sm font-bold text-white">
                          {sale.status === 'pending' ? 'Comanda em Aberto' : `Pedido #${sale.id.slice(0, 4)}`}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{new Date(sale.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-right flex items-center space-x-4">
                      <div>
                        <span className="block text-sm font-black text-white">R$ {sale.total.toFixed(2)}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest ${sale.status === 'paid' ? 'text-green-500' : 'text-red-500'}`}>
                          {sale.status === 'paid' ? 'Pago' : 'Pendente'}
                        </span>
                      </div>
                      {expandedSale === sale.id ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>
                  </button>

                  {expandedSale === sale.id && (
                    <div className="bg-black/20 p-4 space-y-2 border-t border-white/5">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Itens do Consumo</p>
                      {sale.items && sale.items.map((item: any, idx: number) => (
                        <div key={`${sale.id}-${idx}`} className="flex justify-between text-xs text-gray-300">
                          <span>{item.name} <span className="opacity-50">x{item.qty || 1}</span></span>
                          <span>R$ {((item.price) * (item.qty || 1)).toFixed(2)}</span>
                        </div>
                      ))}
                      {sale.status === 'pending' && (
                        <div className="pt-4 mt-2 border-t border-white/5">
                          <p className="text-[10px] text-red-400 text-center uppercase font-bold bg-red-600/10 p-2 rounded-lg border border-red-600/20">
                            Dirija-se ao balcão para realizar o pagamento.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))) : (
              <div className="py-20 text-center text-gray-600 uppercase text-[10px] font-black">
                {activeTab === 'open' ? 'Nenhuma comanda aberta' : 'Nenhum histórico encontrado'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShooterFinanceView;
