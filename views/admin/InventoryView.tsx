
import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Tag,
  Layers,
  AlertTriangle,
  Edit3,
  Trash2,
  ShoppingCart,
  CheckCircle2,
  X,
  Loader2,
  FileCode,
  Store,
  Coffee,
  Shield,
  ArrowRight,
  TrendingDown,
  Calendar,
  DollarSign,
  PlusCircle,
  Truck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { BusinessUnit } from '../../types';

interface StockEntryItem {
  id?: string;
  product_id: string;
  name: string;
  quantity: number;
  unit_cost: number;
}

const InventoryView: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [activeUnit, setActiveUnit] = useState<BusinessUnit | 'ALL'>('ALL');

  // Stock Entry State
  const [entryItems, setEntryItems] = useState<StockEntryItem[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [paymentType, setPaymentType] = useState<'immediate' | 'future' | 'installments'>('immediate');
  const [dueDate, setDueDate] = useState('');
  const [installments, setInstallments] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Municao',
    price: 0,
    stock: 0,
    unit: 'un',
    business_unit: 'CLUB' as BusinessUnit
  });

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*').order('name');
    if (activeUnit !== 'ALL') query = query.eq('business_unit', activeUnit);

    const { data } = await query;
    if (data) setProducts(data);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [activeUnit]);

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([formData]);
    if (!error) {
      setShowModal(false);
      fetchProducts();
    }
  };

  const handleAddEntryItem = (product: any) => {
    const existing = entryItems.find(item => item.product_id === product.id);
    if (existing) {
      setEntryItems(entryItems.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setEntryItems([...entryItems, { product_id: product.id, name: product.name, quantity: 1, unit_cost: product.price * 0.7 }]);
    }
  };

  const handleRemoveEntryItem = (id: string) => {
    setEntryItems(entryItems.filter(item => item.product_id !== id));
  };

  const calculateEntryTotal = () => {
    return entryItems.reduce((acc, curr) => acc + (curr.quantity * curr.unit_cost), 0);
  };

  const handleCompleteEntry = async () => {
    if (entryItems.length === 0) return;
    setLoading(true);

    try {
      // 1. Create Stock Entry
      const { data: entry, error: entryError } = await supabase
        .from('stock_entries')
        .insert([{
          supplier_name: supplierName,
          total_amount: calculateEntryTotal(),
          status: 'completed'
        }])
        .select()
        .single();

      if (entryError) throw entryError;

      // 2. Create Entry Items & Update Product Stock
      for (const item of entryItems) {
        await supabase.from('stock_entry_items').insert([{
          entry_id: entry.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost
        }]);

        // Increment stock
        const product = products.find(p => p.id === item.product_id);
        if (product) {
          await supabase.from('products').update({
            stock: product.stock + item.quantity
          }).eq('id', item.product_id);
        }
      }

      // 3. Create Financial Transaction (Expense)
      const totalPerInstallment = calculateEntryTotal() / installments;
      const baseDate = dueDate ? new Date(dueDate) : new Date();

      for (let i = 0; i < installments; i++) {
        const transDate = new Date(baseDate);
        transDate.setMonth(transDate.getMonth() + i);

        await supabase.from('financial_transactions').insert([{
          type: 'expense',
          amount: totalPerInstallment,
          description: `Compra de Estoque: ${supplierName}${installments > 1 ? ` (${i + 1}/${installments})` : ''}`,
          category: 'Estoque',
          status: paymentType === 'immediate' && i === 0 ? 'paid' : 'pending',
          due_date: transDate.toISOString().split('T')[0],
          payment_date: paymentType === 'immediate' && i === 0 ? new Date().toISOString() : null,
          related_id: entry.id
        }]);
      }

      alert('Entrada de estoque realizada com sucesso! Financeiro atualizado.');
      setShowEntryModal(false);
      setEntryItems([]);
      setSupplierName('');
      fetchProducts();
    } catch (error) {
      console.error(error);
      alert('Erro ao processar entrada de estoque.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-white italic">GESTOR DE <span className="text-red-600">ESTOQUE</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Controle unificado do Grupo Econômico (Clube, Loja e Bar).</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setShowEntryModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-blue-600/30 transition-all flex items-center space-x-2 group"
          >
            <Truck className="w-4 h-4 group-hover:animate-bounce" />
            <span>Entrada de Mercadoria</span>
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-red-600/30 transition-all flex items-center space-x-2 group"
          >
            <Plus className="w-4 h-4 group-hover:scale-110" />
            <span>Novo Produto</span>
          </button>
        </div>
      </div>

      {/* Seletor de Grupo Econômico */}
      <div className="flex space-x-2 p-1.5 bg-[#0a0a0a] rounded-3xl w-fit border border-white/5">
        {[
          { id: 'ALL', label: 'Todos os Negócios', icon: <Package size={14} /> },
          { id: 'CLUB', label: 'Clube / Estande', icon: <Shield size={14} /> },
          { id: 'SHOP', label: 'Loja de Armas', icon: <Store size={14} /> },
          { id: 'BAR', label: 'Cantina / Bar', icon: <Coffee size={14} /> },
        ].map((u) => (
          <button
            key={u.id}
            onClick={() => setActiveUnit(u.id as any)}
            className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-3 ${activeUnit === u.id ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'
              }`}
          >
            {u.icon}
            <span>{u.label}</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="glass p-8 rounded-[40px] border-white/5 space-y-3 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-600/10 rounded-full blur-2xl group-hover:bg-blue-600/20 transition-all" />
          <Layers className="w-6 h-6 text-blue-500" />
          <span className="block text-3xl font-black text-white italic">{products.length}</span>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Itens no Catálogo</p>
        </div>
        <div className="glass p-8 rounded-[40px] border-white/5 space-y-3 relative overflow-hidden group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-600/10 rounded-full blur-2xl group-hover:bg-yellow-600/20 transition-all" />
          <AlertTriangle className="w-6 h-6 text-yellow-500" />
          <span className="block text-3xl font-black text-white italic">
            {products.filter(p => p.stock < 50).length}
          </span>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Baixo Estoque</p>
        </div>
      </div>

      <div className="glass rounded-[48px] border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase font-black tracking-widest text-gray-500 bg-white/[0.02]">
                <th className="px-10 py-8 italic font-black">Produto</th>
                <th className="px-6 py-8">Unidade de Negócio</th>
                <th className="px-6 py-8">Preço Venda</th>
                <th className="px-6 py-8">Qtd. Atual</th>
                <th className="px-10 py-8 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center space-x-5">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-red-500 border border-white/10 group-hover:border-red-600/50 transition-all">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-white uppercase tracking-tight italic">{p.name}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{p.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-8">
                    <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border ${p.business_unit === 'CLUB' ? 'border-blue-500/20 text-blue-500 bg-blue-500/5' :
                        p.business_unit === 'SHOP' ? 'border-red-500/20 text-red-500 bg-red-500/5' :
                          'border-green-500/20 text-green-500 bg-green-500/5'
                      }`}>
                      {p.business_unit === 'CLUB' ? 'Clube / Estande' : p.business_unit === 'SHOP' ? 'Loja Física' : 'Cantina / Bar'}
                    </span>
                  </td>
                  <td className="px-6 py-8">
                    <span className="text-sm font-black text-white italic">R$ {p.price.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-8">
                    <div className="flex items-center space-x-2 bg-white/5 w-fit px-3 py-1.5 rounded-xl border border-white/5">
                      <span className={`text-sm font-black italic ${p.stock < 50 ? 'text-yellow-500' : 'text-green-500'}`}>{p.stock}</span>
                      <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{p.unit}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white border border-white/5 hover:border-white/10 transition-all"><Edit3 className="w-4 h-4" /></button>
                      <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-red-600 border border-white/5 hover:border-red-600/20 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Produto */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="glass w-full max-w-lg rounded-[48px] p-12 border-red-600/20 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[80px] -z-10" />

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Novo <span className="text-red-600">Produto</span></h2>
              <button onClick={() => setShowModal(false)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Descrição do Produto *</label>
                <input
                  type="text" required
                  placeholder="Ex: Munição .9mm CBC Gold"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 transition-all font-bold placeholder:text-gray-800"
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Unidade de Negócio</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold uppercase text-xs"
                    onChange={e => setFormData({ ...formData, business_unit: e.target.value as BusinessUnit })}
                  >
                    <option value="CLUB">Clube / Estande</option>
                    <option value="SHOP">Loja de Armas</option>
                    <option value="BAR">Cantina / Bar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Preço de Venda *</label>
                  <input
                    type="number" step="0.01" required
                    placeholder="R$ 0,00"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold placeholder:text-gray-800"
                    onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-8">
                <button type="submit" className="flex-grow bg-red-600 hover:bg-red-700 text-white py-5 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-red-600/30 transition-all">Salvar no Catálogo</button>
                <button type="button" onClick={() => setShowModal(false)} className="px-10 border border-white/10 text-gray-500 rounded-3xl uppercase font-black text-[10px] hover:bg-white/5">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Entrada de Mercadoria (Stock Entry) */}
      {showEntryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="glass w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-[48px] border-blue-600/20">

            {/* Modal Header */}
            <div className="p-10 border-b border-white/5 flex justify-between items-center bg-blue-600/[0.02]">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">Entrada de <span className="text-blue-500">Mercadoria</span></h2>
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Reposição de estoque e lançamento financeiro automático</p>
              </div>
              <button onClick={() => setShowEntryModal(false)} className="p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-white border border-white/5"><X className="w-6 h-6" /></button>
            </div>

            <div className="flex-grow overflow-hidden flex flex-col lg:flex-row">
              {/* Left Side: Items selection & List */}
              <div className="lg:w-2/3 p-10 space-y-8 overflow-y-auto custom-scrollbar border-r border-white/5">

                {/* Search Product to ADD */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 italic ml-2">Adicionar Itens ao Pedido</label>
                  <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Pesquisar produto pelo nome..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-8 text-white font-bold outline-none focus:border-blue-600 transition-all placeholder:text-gray-800"
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase();
                        if (val.length > 2) {
                          // This is handled visually below but could be a dropdown
                        }
                      }}
                    />

                    {/* Inline results list (simplified for demo, usually a dropdown) */}
                    <div className="mt-4 grid grid-cols-2 gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {products.slice(0, 6).map(p => (
                        <button
                          key={p.id}
                          onClick={() => handleAddEntryItem(p)}
                          className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-blue-600/50 hover:bg-blue-600/5 text-left transition-all group"
                        >
                          <PlusCircle className="w-5 h-5 text-gray-600 group-hover:text-blue-500" />
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-white uppercase italic">{p.name}</span>
                            <span className="text-[9px] text-gray-600 font-bold uppercase">Estoque: {p.stock}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Items List */}
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Itens no Carrinho de Entrada
                  </h4>

                  {entryItems.length === 0 ? (
                    <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[40px]">
                      <ShoppingCart className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                      <p className="text-gray-600 text-xs font-black uppercase tracking-widest italic">A lista de entrada está vazia</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {entryItems.map(item => (
                        <div key={item.product_id} className="glass p-6 rounded-[32px] border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-600/20 italic font-black">#</div>
                            <div>
                              <span className="block text-sm font-black text-white italic uppercase tracking-tight">{item.name}</span>
                              <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">Produto SKU-{item.product_id.slice(0, 5)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-8">
                            <div className="flex flex-col items-center">
                              <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Quantidade</label>
                              <div className="flex items-center gap-3">
                                <button className="text-gray-500 hover:text-white" onClick={() => setEntryItems(entryItems.map(i => i.product_id === item.product_id ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}>-</button>
                                <input
                                  className="bg-zinc-900 border border-white/10 w-16 text-center py-1 rounded-lg text-sm font-black text-white"
                                  value={item.quantity}
                                  onChange={e => setEntryItems(entryItems.map(i => i.product_id === item.product_id ? { ...i, quantity: parseInt(e.target.value) || 1 } : i))}
                                />
                                <button className="text-gray-500 hover:text-white" onClick={() => setEntryItems(entryItems.map(i => i.product_id === item.product_id ? { ...i, quantity: i.quantity + 1 } : i))}>+</button>
                              </div>
                            </div>

                            <div className="flex flex-col items-end">
                              <label className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">Custo Unitário</label>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 font-black">R$</span>
                                <input
                                  className="bg-zinc-900 border border-white/10 w-24 text-right py-1 px-2 rounded-lg text-sm font-black text-white italic"
                                  value={item.unit_cost.toFixed(2)}
                                  onChange={e => setEntryItems(entryItems.map(i => i.product_id === item.product_id ? { ...i, unit_cost: parseFloat(e.target.value) || 0 } : i))}
                                />
                              </div>
                            </div>

                            <button onClick={() => handleRemoveEntryItem(item.product_id)} className="p-3 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Supplier & Finance Config */}
              <div className="lg:w-1/3 p-10 bg-black/40 space-y-8 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic ml-2">Dados do Fornecedor</label>
                    <input
                      type="text"
                      required
                      placeholder="Nome do Fornecedor / NF-e"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-blue-600 italic placeholder:text-gray-800"
                      value={supplierName}
                      onChange={e => setSupplierName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic ml-2">Configuração Financeira</label>

                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'immediate', label: 'Pagamento Imediato', icon: <DollarSign className="w-4 h-4" /> },
                        { id: 'future', label: 'Lançamento Futuro (30 dias)', icon: <TrendingDown className="w-4 h-4" /> },
                        { id: 'installments', label: 'Compra Parcelada', icon: <Calendar className="w-4 h-4" /> }
                      ].map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setPaymentType(t.id as any)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentType === t.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/10'}`}
                        >
                          {t.icon}
                          <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                        </button>
                      ))}
                    </div>

                    {paymentType !== 'immediate' && (
                      <div className="space-y-4 pt-4 animate-in slide-in-from-top-2 duration-300">
                        {paymentType === 'installments' && (
                          <div className="space-y-2">
                            <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Número de Parcelas</label>
                            <input
                              type="number" min="1" max="24"
                              className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-5 text-white font-black italic"
                              value={installments}
                              onChange={e => setInstallments(parseInt(e.target.value) || 1)}
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="text-[8px] font-black text-gray-600 uppercase tracking-[0.2em] ml-2">Data de Vencimento (1ª Parcela)</label>
                          <input
                            type="date"
                            className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 px-5 text-zinc-400 font-black uppercase text-xs"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6 pt-10 border-t border-white/5">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Total do Pedido</span>
                    <div className="text-right">
                      <span className="block text-4xl font-black text-white italic leading-none">R$ {calculateEntryTotal().toFixed(2)}</span>
                      {installments > 1 && (
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-2 block">
                          {installments}x de R$ {(calculateEntryTotal() / installments).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCompleteEntry}
                    disabled={loading || entryItems.length === 0 || !supplierName}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <span>Finalizar Entrada</span>
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryView;
