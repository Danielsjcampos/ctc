
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
  ChevronRight,
  Plus,
  LayoutGrid,
  List
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // New State for Create & Profiles
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [propertyFilter, setPropertyFilter] = useState<'all' | 'club' | 'shooter'>('all');
  const [newWeapon, setNewWeapon] = useState({
    owner_id: null as string | null,
    model: '',
    brand: '',
    caliber: '',
    sigma_number: '',
    location: 'Cofre',
    status: 'available',
    owner_type: 'club' // temporary UI state
  });

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

  const handleCreateWeapon = async () => {
    setLoading(true);
    const payload = {
      owner_id: newWeapon.owner_type === 'club' ? null : newWeapon.owner_id,
      model: newWeapon.model,
      brand: newWeapon.brand,
      caliber: newWeapon.caliber,
      sigma_number: newWeapon.sigma_number,
      location: newWeapon.location,
      status: newWeapon.status
    };

    const { error } = await supabase.from('firearms').insert([payload]);

    if (error) {
      alert('Erro ao cadastrar: ' + error.message);
    } else {
      alert('Armamento cadastrado com sucesso!');
      setShowCreateModal(false);
      setNewWeapon({
        owner_id: null, model: '', brand: '', caliber: '', sigma_number: '', location: 'Cofre', status: 'available', owner_type: 'club'
      });
      fetchArmoryData();
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
    const matchesProperty = propertyFilter === 'all'
      ? true
      : propertyFilter === 'club'
        ? i.owner === 'CLUBE / LOJA'
        : i.owner !== 'CLUBE / LOJA';

    const matchesSearch = (i.model && i.model.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.sigma_number && i.sigma_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (i.owner && i.owner.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesLocation && matchesStatus && matchesSearch && matchesProperty;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
      {/* Header & Search */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic">MAPA DE <span className="text-red-600">ARMAS</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium italic">Gestão operacional de localização e status em tempo real do arsenal.</p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto items-center">
          <div className="relative flex-grow lg:w-64">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-5 h-5 font-black" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-16 pr-6 text-xs text-white outline-none focus:border-red-600 transition-all font-bold placeholder:text-gray-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="hidden sm:flex bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] items-center gap-2 shadow-lg shadow-red-600/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xl:inline">Cadastrar</span>
          </button>
        </div>
      </div>

      {/* Mobile Create Button (External to Header for better layout) */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="sm:hidden w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-all mb-4"
      >
        <Plus className="w-4 h-4" />
        <span>Cadastrar Novo Armamento</span>
      </button>

      {/* Property Filter */}
      <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
        {[
          { id: 'all', label: 'Todo Acervo' },
          { id: 'club', label: 'Armas do Clube' },
          { id: 'shooter', label: 'Armas de Terceiros' }
        ].map(opt => (
          <button
            key={opt.id}
            onClick={() => setPropertyFilter(opt.id as any)}
            className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${propertyFilter === opt.id ? 'bg-zinc-800 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            {opt.label}
          </button>
        ))}
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

      {/* Items Display */}
      {viewMode === 'list' ? (
        // List View
        <div className="glass rounded-[32px] border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white/5 border-b border-white/5">
                <tr>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Modelo / Arma</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Calibre</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Proprietário</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Localização</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="p-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-red-600" /></td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan={6} className="p-10 text-center text-gray-500 text-xs font-bold uppercase">Nenhum registro encontrado</td></tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => setEditingItem(item)}>
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                            {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover rounded-xl" /> : <Crosshair className="w-5 h-5 text-gray-600" />}
                          </div>
                          <div>
                            <span className="block text-white font-bold text-sm uppercase">{item.model}</span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{item.brand} • {item.sigma_number}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-sm font-bold text-gray-400 uppercase">{item.caliber}</td>
                      <td className="p-6">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wide border ${item.owner === 'CLUBE / LOJA' ? 'bg-red-600/10 text-red-500 border-red-600/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'}`}>
                          {item.owner === 'CLUBE / LOJA' ? 'Clube' : item.owner.split(' ')[0]}
                        </span>
                      </td>
                      <td className="p-6 text-xs font-bold text-gray-300 uppercase">{item.location}</td>
                      <td className="p-6">
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'available' ? 'bg-green-500' : item.status === 'in_use' ? 'bg-blue-500' : item.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          {item.status === 'available' ? 'Disp.' : item.status === 'in_use' ? 'Pista' : item.status === 'maintenance' ? 'Manut.' : 'Baixa'}
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <ChevronRight className="w-5 h-5 text-gray-600 inline-block group-hover:text-white transition-colors" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
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
      )}

      {/* Modal Create Weapon */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-fade-in">
          <div className="glass w-full max-w-2xl rounded-[48px] p-12 border-red-600/20 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 blur-[120px] -z-10" />

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Cadastrar <span className="text-red-600">Novo Armamento</span></h2>
              <button onClick={() => setShowCreateModal(false)} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="space-y-6">
              {/* Owner Type Switch */}
              <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                <button
                  onClick={() => setNewWeapon({ ...newWeapon, owner_type: 'club' })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newWeapon.owner_type === 'club' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Acervo do Clube
                </button>
                <button
                  onClick={() => setNewWeapon({ ...newWeapon, owner_type: 'shooter' })}
                  className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newWeapon.owner_type === 'shooter' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-white'}`}
                >
                  Arma de Atirador
                </button>
              </div>

              {/* Shooter Selection if type is shooter */}
              {newWeapon.owner_type === 'shooter' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Selecionar Proprietário</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs font-bold outline-none focus:border-red-600 transition-all"
                    onChange={(e) => setNewWeapon({ ...newWeapon, owner_id: e.target.value })}
                    value={newWeapon.owner_id || ''}
                  >
                    <option value="">Selecione um atirador...</option>
                    {allProfiles.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Modelo</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs font-bold outline-none focus:border-red-600"
                    placeholder="Ex: G17 Gen5"
                    value={newWeapon.model}
                    onChange={(e) => setNewWeapon({ ...newWeapon, model: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Marca</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs font-bold outline-none focus:border-red-600"
                    placeholder="Ex: Glock"
                    value={newWeapon.brand}
                    onChange={(e) => setNewWeapon({ ...newWeapon, brand: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Calibre</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs font-bold outline-none focus:border-red-600"
                    placeholder="Ex: 9mm"
                    value={newWeapon.caliber}
                    onChange={(e) => setNewWeapon({ ...newWeapon, caliber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">SIGMA / Registro</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xs font-bold outline-none focus:border-red-600"
                    placeholder="Nº de Série"
                    value={newWeapon.sigma_number}
                    onChange={(e) => setNewWeapon({ ...newWeapon, sigma_number: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Localização Inicial</label>
                <div className="flex gap-2">
                  {locations.map(loc => (
                    <button
                      key={loc}
                      onClick={() => setNewWeapon({ ...newWeapon, location: loc })}
                      className={`px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all flex-grow ${newWeapon.location === loc ? 'bg-white text-black border-white' : 'bg-white/5 text-gray-500 border-white/5'}`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateWeapon}
                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white rounded-[24px] font-black uppercase tracking-widest shadow-xl shadow-red-600/30 transition-all mt-4"
              >
                Confirmar Cadastro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Existing) */}
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
