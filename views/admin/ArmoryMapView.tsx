
import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  MapPin,
  Search,
  ArrowRightLeft,
  ShieldCheck,
  Wrench,
  ShoppingBag,
  Package,
  Target,
  Camera,
  Save,
  X,
  Loader2,
  User,
  Activity,
  Calendar,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ArmoryMapView: React.FC = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [uploading, setUploading] = useState(false);

  const locations = ['Cofre', 'Pista', 'Manutenção', 'Vitrine', 'Expedição'];
  const statuses = [
    { id: 'available', label: 'Disponível / Cofre', color: 'green' },
    { id: 'in_use', label: 'Em Uso (Pista)', color: 'blue' },
    { id: 'maintenance', label: 'Em Manutenção', color: 'yellow' },
    { id: 'sold', label: 'Vendida / Baixa', color: 'red' }
  ];

  const fetchArmoryData = async () => {
    setLoading(true);
    const { data: firearms } = await supabase.from('firearms').select('*');
    const { data: profiles } = await supabase.from('profiles').select('id, name');

    if (firearms && profiles) {
      const mappedItems = firearms.map(gun => {
        const owner = profiles.find(p => p.id === gun.owner_id);
        return {
          ...gun,
          owner: owner ? owner.name : 'CLUBE / LOJA',
          location: gun.location || 'Cofre'
        };
      });
      setItems(mappedItems);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArmoryData();
  }, []);

  const handleUpdate = async () => {
    if (!editingItem) return;
    setLoading(true);

    const { error } = await supabase
      .from('firearms')
      .update({
        model: editingItem.model,
        brand: editingItem.brand,
        caliber: editingItem.caliber,
        sigma_number: editingItem.sigma_number,
        location: editingItem.location,
        status: editingItem.status,
        image_url: editingItem.image_url
      })
      .eq('id', editingItem.id);

    if (!error) {
      setEditingItem(null);
      fetchArmoryData();
    } else {
      console.error('Database error:', error);
      alert(`Erro ao atualizar arma: ${error.message}\nVerifique se a coluna 'location' foi criada no Supabase.`);
    }
    setLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    setUploading(true);
    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('firearm-images')
      .upload(filePath, file);

    if (uploadError) {
      alert('Erro ao fazer upload da imagem.');
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('firearm-images')
      .getPublicUrl(filePath);

    setEditingItem({ ...editingItem, image_url: publicUrl });
    setUploading(false);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'in_use': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'maintenance': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'sold': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const filteredItems = items.filter(i => {
    const matchesLocation = filter === 'Todos' || i.location === filter;
    const matchesStatus = statusFilter === 'Todos' || i.status === statusFilter;
    const matchesSearch = (i.model && i.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.sigma_number && i.sigma_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.owner && i.owner.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesLocation && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic">MAPA DE <span className="text-red-600">ARMAS</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium italic">Gestão operacional de localização e status em tempo real do arsenal.</p>
        </div>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5 font-black" />
          <input
            type="text"
            placeholder="Modelo, SIGMA ou Proprietário..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-xs text-white outline-none focus:border-red-600 transition-all font-bold placeholder:text-gray-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Primary Filters (Location) */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 mr-2 italic">Setores:</span>
          {['Todos', ...locations].map((loc) => (
            <button
              key={loc}
              onClick={() => setFilter(loc)}
              className={`px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${filter === loc ? 'bg-red-600 text-white border-red-600 shadow-2xl shadow-red-600/30' : 'text-gray-600 border-white/5 hover:border-white/10 hover:text-white bg-white/5'}`}
            >
              {loc}
            </button>
          ))}
        </div>

        {/* Secondary Filters (Status) */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-700 mr-2 italic">Status Operacional:</span>
          <button
            onClick={() => setStatusFilter('Todos')}
            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${statusFilter === 'Todos' ? 'bg-white text-black border-white' : 'text-gray-600 border-white/5 hover:border-white/10 hover:text-white'}`}
          >
            Todos Status
          </button>
          {statuses.map((stat) => (
            <button
              key={stat.id}
              onClick={() => setStatusFilter(stat.id)}
              className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${statusFilter === stat.id ? 'bg-zinc-800 text-white border-white/10' : 'text-gray-600 border-white/5 hover:border-white/10 hover:text-white'}`}
            >
              {stat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          <div className="col-span-full py-40 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-red-600 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Sincronizando Arsenal com a Nuvem...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="col-span-full py-40 text-center border-2 border-dashed border-white/5 rounded-[48px]">
            <Crosshair className="w-16 h-16 text-zinc-900 mx-auto mb-6" />
            <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Nenhum armamento filtrado</h3>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mt-2">Ajuste os filtros ou verifique a pesquisa</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setEditingItem(item)}
              className="glass p-8 rounded-[48px] border-white/5 group hover:border-red-600/40 transition-all relative overflow-hidden cursor-pointer h-[400px] flex flex-col justify-between"
            >
              {/* Background Weapon Image or Icon */}
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-10 transition-opacity">
                <Crosshair className="w-48 h-48" />
              </div>

              {item.image_url && (
                <div className="absolute inset-0 z-0 opacity-10 group-hover:opacity-30 transition-opacity p-6">
                  <img src={item.image_url} alt={item.model} className="w-full h-full object-contain filter grayscale invert" />
                </div>
              )}

              <div className="relative z-10 space-y-8">
                {/* Upper Badge Layer */}
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-[24px] border transition-all ${getStatusStyle(item.status)}`}>
                    {item.location === 'Cofre' && <ShieldCheck className="w-6 h-6" />}
                    {item.location === 'Pista' && <Target className="w-6 h-6" />}
                    {item.location === 'Manutenção' && <Wrench className="w-6 h-6" />}
                    {item.location === 'Vitrine' && <ShoppingBag className="w-6 h-6" />}
                    {item.location === 'Expedição' && <Package className="w-6 h-6" />}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 text-gray-400 font-mono">
                      {item.sigma_number || 'N/A'}
                    </span>
                    <span className="text-[7px] font-black uppercase tracking-widest text-zinc-700 mt-2 mr-1">SIGMA ID</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-black uppercase text-white tracking-tighter italic group-hover:text-red-500 transition-colors">{item.model}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 italic">{item.brand || 'PLATAFORMA'}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-800" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600">{item.caliber || 'VAR'}</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <User className="w-3 h-3 text-zinc-600" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">{item.owner}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                        <MapPin className="w-3 h-3 text-zinc-600" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{item.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Status Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${item.status === 'available' ? 'bg-green-500' :
                    item.status === 'in_use' ? 'bg-blue-500' :
                      item.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white italic">
                    {item.status === 'available' ? 'Cofre / Disponível' :
                      item.status === 'in_use' ? 'Em Pista' :
                        item.status === 'maintenance' ? 'Em Manutenção' : 'Baixado / Vendido'}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center group-hover:bg-red-600 group-hover:border-red-600 transition-all">
                  <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-fade-in">
          <div className="glass w-full max-w-2xl rounded-[48px] p-12 border-red-600/20 space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[120px] -z-10" />

            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter italic">Gestão de <span className="text-red-600">Ativo</span></h2>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">ID: {editingItem.id.slice(0, 8)}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-500 hover:text-white transition-all border border-white/5"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-10">
              {/* Image & Main Info */}
              <div className="space-y-6">
                <div className="aspect-square rounded-[40px] bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                  {editingItem.image_url ? (
                    <img src={editingItem.image_url} alt="Preview" className="w-full h-full object-contain p-6" />
                  ) : (
                    <Crosshair className="w-24 h-24 text-zinc-900" />
                  )}
                  <label className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera className="w-10 h-10 text-white mb-3" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Alterar Fotografia</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                  {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><Loader2 className="w-10 h-10 text-red-600 animate-spin" /></div>}
                </div>

                <div className="p-6 bg-white/5 border border-white/5 rounded-[32px] space-y-3">
                  <div className="flex justify-between italic">
                    <span className="text-[10px] font-black uppercase text-gray-500">Proprietário</span>
                    <span className="text-[10px] font-black uppercase text-white">{editingItem.owner}</span>
                  </div>
                  <div className="flex justify-between italic">
                    <span className="text-[10px] font-black uppercase text-gray-500">Cadastrado em</span>
                    <span className="text-[10px] font-black uppercase text-white">{new Date(editingItem.acquisition_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Edit Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Modelo Operacional</label>
                  <input
                    value={editingItem.model}
                    onChange={e => setEditingItem({ ...editingItem, model: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-red-600 transition-all text-sm uppercase italic"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Calibre</label>
                    <input
                      value={editingItem.caliber}
                      onChange={e => setEditingItem({ ...editingItem, caliber: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-red-600 text-sm uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Número SIGMA</label>
                    <input
                      value={editingItem.sigma_number}
                      onChange={e => setEditingItem({ ...editingItem, sigma_number: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white font-bold outline-none focus:border-red-600 text-sm uppercase"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Localização Atual</label>
                  <div className="grid grid-cols-2 gap-2">
                    {locations.map(loc => (
                      <button
                        key={loc}
                        onClick={() => setEditingItem({ ...editingItem, location: loc })}
                        className={`p-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${editingItem.location === loc ? 'bg-white text-black border-white shadow-xl' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-white/10'}`}
                      >
                        {loc}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Status de Disponibilidade</label>
                  <select
                    value={editingItem.status}
                    onChange={e => setEditingItem({ ...editingItem, status: e.target.value })}
                    className="w-full bg-[#0a0a0a] border border-white/10 rounded-2xl py-4 px-6 text-white font-black outline-none focus:border-red-600 uppercase text-[10px] tracking-widest"
                  >
                    <option value="available">Cofre / Disponível</option>
                    <option value="in_use">Em Uso (Pista)</option>
                    <option value="maintenance">Manutenção Mecânica</option>
                    <option value="sold">Baixa / Vendida</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleUpdate}
                disabled={loading || uploading}
                className="flex-grow bg-red-600 hover:bg-red-700 text-white py-6 rounded-[32px] font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-3 shadow-2xl shadow-red-600/40 group transition-all"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                  <>
                    <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span>Salvar Alterações Operacionais</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="px-10 border border-white/10 text-gray-500 rounded-[32px] uppercase font-black text-[10px] hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArmoryMapView;
