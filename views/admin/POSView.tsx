
import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  User,
  Search,
  CreditCard,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Zap,
  ArrowRight,
  Receipt,
  Wallet,
  Smartphone,
  Banknote,
  Calculator,
  Loader2,
  Printer,
  Crosshair,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSystemSettings } from '../../hooks/useSystemSettings';

const POSView: React.FC = () => {
  const { settings } = useSystemSettings();
  const [activeTab, setActiveTab] = useState<'new_sale' | 'commands'>('new_sale');

  // Data States
  const [products, setProducts] = useState<any[]>([]);
  const [clubFirearms, setClubFirearms] = useState<any[]>([]);
  const [shooters, setShooters] = useState<any[]>([]);
  const [openCommands, setOpenCommands] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Cart State (New Sale)
  const [cart, setCart] = useState<any[]>([]);
  const [selectedShooter, setSelectedShooter] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Checkout State (Closing Command)
  const [selectedCommandShooter, setSelectedCommandShooter] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Visitor Sale State
  const [isVisitor, setIsVisitor] = useState(false);
  const [visitorPaymentMethod, setVisitorPaymentMethod] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'commands') {
      fetchOpenCommands();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoadingInitial(true);
    try {
      const { data: p } = await supabase.from('products').select('*');
      const { data: s } = await supabase.from('profiles').select('*');
      const { data: f } = await supabase.from('firearms').select('*').is('owner_id', null).eq('status', 'available');

      if (p) setProducts(p);
      if (s) setShooters(s);
      if (f) setClubFirearms(f);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoadingInitial(false);
    }
  };

  const fetchOpenCommands = async () => {
    const { data: sales } = await supabase
      .from('sales')
      .select('*, profiles(name, cpf, membership_type)')
      .eq('status', 'pending');

    if (sales) {
      const grouped = sales.reduce((acc: any, sale: any) => {
        const shooterId = sale.shooter_id;
        if (!acc[shooterId]) {
          acc[shooterId] = {
            shooter_id: shooterId,
            shooter_name: sale.profiles?.name || 'Desconhecido',
            shooter_cpf: sale.profiles?.cpf || '',
            shooter_type: sale.profiles?.membership_type || 'Visitante',
            sales: [],
            total_debt: 0
          };
        }
        acc[shooterId].sales.push(sale);
        acc[shooterId].total_debt += sale.total;
        return acc;
      }, {});

      setOpenCommands(Object.values(grouped));
    }
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

  const handleLaunchToCommand = async () => {
    if (!selectedShooter) { alert('Selecione um atirador'); return; }

    setLoading(true);
    const { error } = await supabase.from('sales').insert([{
      shooter_id: selectedShooter.id,
      total: cartTotal,
      items: cart,
      status: 'pending'
    }]);

    if (!error) {
      alert('Itens lançados na comanda de ' + selectedShooter.name);
      setCart([]);
      setSelectedShooter(null);
      fetchOpenCommands();
    }
    setLoading(false);
  };

  const handleCloseAccount = async () => {
    if (!selectedCommandShooter || !paymentMethod) return;

    setLoading(true);
    const { error } = await supabase
      .from('sales')
      .update({
        status: 'paid',
        payment_method: paymentMethod,
        closed_at: new Date().toISOString()
      })
      .eq('shooter_id', selectedCommandShooter.shooter_id)
      .eq('status', 'pending');

    if (!error) {
      alert('Conta fechada com sucesso!');
      setSelectedCommandShooter(null);
      setPaymentMethod('');
      fetchOpenCommands();
    }
    setLoading(false);
    setLoading(false);
  };

  const handleVisitorCheckout = async () => {
    if (!visitorPaymentMethod) { alert('Selecione uma forma de pagamento para venda avulsa.'); return; }

    setLoading(true);
    const { error } = await supabase.from('sales').insert([{
      shooter_id: null, // Visitor (no profile)
      total: cartTotal,
      items: cart,
      status: 'paid', // Immediate payment
      payment_method: visitorPaymentMethod,
      closed_at: new Date().toISOString()
    }]);

    if (!error) {
      alert('Venda avulsa finalizada com sucesso!');
      setCart([]);
      setIsVisitor(false);
      setVisitorPaymentMethod('');
      // Optional: Print receipt here
    } else {
      alert('Erro ao finalizar venda: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-fade-in min-h-[calc(100vh-140px)] flex flex-col pb-24 lg:pb-0">
      {/* TABS HEADER */}
      <div className="flex space-x-1 p-1 bg-white/5 rounded-2xl w-full md:w-fit border border-white/5 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('new_sale')}
          className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'new_sale' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          Nova Venda
        </button>
        <button
          onClick={() => setActiveTab('commands')}
          className={`flex-1 md:flex-none px-4 md:px-8 py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'commands' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
        >
          Comandas ({openCommands.length})
        </button>
      </div>

      {activeTab === 'new_sale' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow overflow-hidden">
          {/* CATALOGO */}
          <div className="lg:col-span-8 flex flex-col space-y-4 md:space-y-6 h-full overflow-hidden">
            <div className="glass p-4 md:p-6 rounded-[32px] border-white/5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between shrink-0">
              <h2 className="text-lg md:text-xl font-black uppercase tracking-tighter text-white">CATÁLOGO DE <span className="text-red-600">PRODUTOS</span></h2>
              <div className="relative w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                <input type="text" placeholder="Buscar item..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 md:py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-red-600" onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            {loadingInitial ? (
              <div className="flex-grow flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Carregando Inventário...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 overflow-y-auto custom-scrollbar pr-2 pb-10">
                {/* Section: Armas do Clube */}
                {clubFirearms.filter(f => f.model.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
                  <button
                    key={f.id}
                    onClick={() => addToCart({ ...f, name: `Locação: ${f.model}`, price: 50, category: 'Armamento', isFirearm: true })}
                    className="glass p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-blue-600/20 hover:border-blue-600 text-left group transition-all relative overflow-hidden active:scale-95"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Crosshair className="w-8 md:w-12 h-8 md:h-12" />
                    </div>
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div className="p-2 md:p-3 bg-blue-600/10 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Crosshair className="w-4 md:w-5 h-4 md:h-5 text-blue-500 group-hover:text-white" />
                      </div>
                      <span className="text-[7px] md:text-[9px] font-black uppercase text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-md">Clube</span>
                    </div>
                    <span className="block text-xs md:text-sm font-black text-white group-hover:text-blue-500 transition-colors mb-1 line-clamp-1">{f.model}</span>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-1">
                      <span className="text-sm md:text-lg font-black text-white leading-none">R$ 50.00</span>
                      <span className="text-[7px] md:text-[8px] font-bold text-gray-600 uppercase italic">{f.caliber}</span>
                    </div>
                  </button>
                ))}

                {/* Section: Produtos */}
                {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="glass p-4 md:p-6 rounded-[24px] md:rounded-[32px] border-white/5 hover:border-red-600/30 text-left group transition-all active:scale-95"
                  >
                    <div className="flex justify-between items-start mb-3 md:mb-4">
                      <div className="p-2 md:p-3 bg-white/5 rounded-xl group-hover:bg-red-600/20 group-hover:text-red-500 transition-all">
                        <Zap className="w-4 md:w-5 h-4 md:h-5" />
                      </div>
                      <span className="text-[7px] md:text-[10px] font-black uppercase text-gray-500 truncate ml-2">{p.category}</span>
                    </div>
                    <span className="block text-xs md:text-sm font-black text-white group-hover:text-red-500 transition-colors mb-1 line-clamp-1">{p.name}</span>
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-1">
                      <span className="text-sm md:text-lg font-black text-white leading-none">R$ {p.price.toFixed(2)}</span>
                      <span className="text-[7px] md:text-[9px] font-bold text-gray-600 uppercase truncate">Estoque: {p.stock}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CARRINHO LAUNCHER */}
          <div className="lg:col-span-4 flex flex-col space-y-6 h-full overflow-hidden">
            <div className="glass p-6 md:p-8 rounded-[32px] md:rounded-[40px] border-white/5 flex-grow flex flex-col space-y-6 md:space-y-8 overflow-hidden">
              <div className="space-y-4 shrink-0">
                <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-red-600" /> LANÇAMENTO
                </h3>

                {/* Visitor Toggle */}
                <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                  <button
                    onClick={() => { setIsVisitor(false); setVisitorPaymentMethod(''); }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isVisitor ? 'bg-zinc-800 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                  >
                    Membro / Atirador
                  </button>
                  <button
                    onClick={() => { setIsVisitor(true); setSelectedShooter(null); }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${isVisitor ? 'bg-green-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                  >
                    Visitante (Avulso)
                  </button>
                </div>

                {!isVisitor ? (
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none"
                    onChange={e => setSelectedShooter(shooters.find(s => s.id === e.target.value))}
                    value={selectedShooter ? selectedShooter.id : ''}
                  >
                    <option value="">Selecione o Atirador...</option>
                    {shooters.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cpf})</option>)}
                  </select>
                ) : (
                  <div className="p-4 bg-green-600/10 border border-green-600/20 rounded-2xl">
                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mb-3 text-center">Pagamento Imediato</p>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'pix', label: 'PIX', icon: <Smartphone className="w-4 h-4" /> },
                        { id: 'credit_card', label: 'Créd.', icon: <CreditCard className="w-4 h-4" /> },
                        { id: 'debit_card', label: 'Déb.', icon: <CreditCard className="w-4 h-4" /> },
                        { id: 'cash', label: 'Din.', icon: <Banknote className="w-4 h-4" /> },
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setVisitorPaymentMethod(method.id)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${visitorPaymentMethod === method.id
                            ? 'bg-green-600 text-white border-green-500 shadow-lg'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          {method.icon}
                          <span className="text-[8px] font-black uppercase">{method.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-grow overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-gray-500">R$ {item.price.toFixed(2)} x {item.qty}</span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0 ml-4">
                      <span className="text-sm font-black text-white">R$ {(item.price * item.qty).toFixed(2)}</span>
                      <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-red-500/50 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-700 opacity-30 gap-2">
                    <ShoppingCart className="w-10 h-10" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Carrinho Vazio</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4 shrink-0">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Total</span>
                  <span className="text-3xl md:text-4xl font-black text-white tracking-tighter">R$ {cartTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={isVisitor ? handleVisitorCheckout : handleLaunchToCommand}
                  disabled={cart.length === 0 || (!isVisitor && !selectedShooter) || (isVisitor && !visitorPaymentMethod) || loading}
                  className={`w-full text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center space-x-3 shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isVisitor ? 'bg-green-600 hover:bg-green-700 shadow-green-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>{isVisitor ? 'Finalizar Venda Avulsa' : 'Lançar na Comanda'}</span><ArrowRight className="w-5 h-5" /></>}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-hidden">
          {/* LISTA DE COMANDAS */}
          <div className={`${selectedCommandShooter ? 'hidden lg:block' : 'block'} col-span-1 lg:border-r border-white/5 lg:pr-8 space-y-4 overflow-y-auto custom-scrollbar pb-10`}>
            <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-6">Contas <span className="text-red-600">Pendentes</span></h3>
            {openCommands.length === 0 ? (
              <p className="text-gray-500 italic text-sm">Nenhuma comanda aberta no momento.</p>
            ) : (
              openCommands.map((cmd) => (
                <button
                  key={cmd.shooter_id}
                  onClick={() => { setSelectedCommandShooter(cmd); setPaymentMethod(''); }}
                  className={`w-full text-left p-6 rounded-3xl border transition-all ${selectedCommandShooter?.shooter_id === cmd.shooter_id
                    ? 'bg-red-600 text-white border-red-500 shadow-xl shadow-red-600/20'
                    : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-black tracking-widest opacity-75">{cmd.shooter_type}</span>
                    <span className="text-lg font-black">R$ {cmd.total_debt.toFixed(2)}</span>
                  </div>
                  <span className="block text-xl font-black uppercase tracking-tight">{cmd.shooter_name}</span>
                  <span className="text-[10px] block mt-1 opacity-50">{cmd.sales.length} itens lançados</span>
                </button>
              ))
            )}
          </div>

          {/* DETALHES E FECHAMENTO */}
          <div className={`${!selectedCommandShooter ? 'hidden lg:block' : 'block'} col-span-2 glass rounded-[32px] md:rounded-[40px] p-6 md:p-10 border-white/5 flex flex-col relative overflow-hidden h-full`}>
            {selectedCommandShooter ? (
              <>
                <button onClick={() => setSelectedCommandShooter(null)} className="lg:hidden absolute top-6 right-6 p-2 bg-white/5 rounded-xl z-20">
                  <X className="w-5 h-5" />
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 pb-8 border-b border-white/5 gap-4">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white">{selectedCommandShooter.shooter_name}</h2>
                    <p className="text-blue-500 font-black uppercase tracking-widest mt-1 text-[10px]">{selectedCommandShooter.shooter_cpf}</p>
                  </div>
                  <div className="text-right w-full md:w-auto">
                    <span className="block text-[8px] md:text-[10px] font-black uppercase text-gray-500 tracking-widest">A Pagar</span>
                    <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">R$ {selectedCommandShooter.total_debt.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto mb-8 custom-scrollbar space-y-2 pr-2">
                  {selectedCommandShooter.sales.map((sale: any) => (
                    <div key={sale.id} className="space-y-2">
                      {sale.items.map((item: any, idx: number) => (
                        <div key={`${sale.id}-${idx}`} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[11px] font-bold text-gray-300">{item.name} <span className="opacity-50 text-[9px] ml-2">x{item.qty}</span></span>
                          <span className="text-xs font-black text-white">R$ {(item.price * item.qty).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-6 shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => {
                        // Print logic preserved from previous stable version
                        const printWindow = window.open('', '', 'width=600,height=800');
                        if (printWindow) {
                          const clubLogo = settings?.logo_url || '';
                          const clubName = settings?.club_name || 'ELITE SHIELD CLUB';
                          printWindow.document.write(`<html><body><h2>${clubName}</h2><hr/><p>Cliente: ${selectedCommandShooter.shooter_name}</p><p>Total: R$ ${selectedCommandShooter.total_debt.toFixed(2)}</p></body></html>`);
                          printWindow.document.close();
                          printWindow.print();
                        }
                      }}
                      className="w-full bg-white/5 hover:bg-white/10 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center space-x-2 border border-white/5"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Imprimir Conferência</span>
                    </button>
                    <h4 className="md:hidden text-[9px] font-black uppercase tracking-widest text-gray-500 mt-2">Pagamento</h4>
                  </div>

                  <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {[
                      { id: 'pix', label: 'PIX', icon: <Smartphone className="w-4 h-4 md:w-6 md:h-6" /> },
                      { id: 'credit_card', label: 'Créd.', icon: <CreditCard className="w-4 h-4 md:w-6 md:h-6" /> },
                      { id: 'debit_card', label: 'Déb.', icon: <CreditCard className="w-4 h-4 md:w-6 md:h-6" /> },
                      { id: 'cash', label: 'Din.', icon: <Banknote className="w-4 h-4 md:w-6 md:h-6" /> },
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 md:p-4 rounded-xl md:rounded-2xl border flex flex-col items-center justify-center gap-1 md:gap-2 transition-all ${paymentMethod === method.id
                          ? 'bg-green-600 text-white border-green-500 shadow-lg'
                          : 'bg-white/5 border-white/5 text-gray-500 hover:bg-white/10 hover:text-white'
                          }`}
                      >
                        {method.icon}
                        <span className="text-[8px] md:text-[10px] font-black uppercase">{method.label}</span>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleCloseAccount}
                    disabled={!paymentMethod || loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 disabled:text-gray-600 text-white py-5 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-widest text-xs md:text-sm shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Fechar Conta</span><CheckCircle2 className="w-5 h-5" /></>}
                  </button>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4 opacity-30">
                <Receipt className="w-16 md:w-20 h-16 md:h-20" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center">Selecione uma comanda</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default POSView;
