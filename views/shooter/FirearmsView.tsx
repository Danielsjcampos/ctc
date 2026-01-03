
import React, { useState, useEffect } from 'react';
import {
  Crosshair,
  Plus,
  FileText,
  ArrowRightLeft,
  ShieldAlert,
  Loader2,
  X,
  CheckCircle2,
  Camera,
  Link as LinkIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../store/authStore';

const FirearmsView: React.FC = () => {
  const { user } = useAuth();
  const [firearms, setFirearms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    model: '',
    brand: '',
    caliber: '',
    sigma_number: '',
    image_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchArsenal = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('firearms')
      .select('*')
      .eq('owner_id', user.id)
      .eq('status', 'active');

    if (data) setFirearms(data);
    setLoading(false);
  };

  useEffect(() => { fetchArsenal(); }, [user]);

  const handleAddGun = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImageUrl = formData.image_url;

      if (selectedFile) {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('firearm-images')
          .upload(filePath, selectedFile);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('firearm-images')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      const { error } = await supabase.from('firearms').insert([{
        ...formData,
        image_url: finalImageUrl,
        owner_id: user?.id,
        status: 'active',
        acquisition_date: new Date().toISOString()
      }]);

      if (!error) {
        setShowAddModal(false);
        setFormData({ model: '', brand: '', caliber: '', sigma_number: '', image_url: '' });
        setSelectedFile(null);
        fetchArsenal();
      } else {
        alert('Erro ao registrar: Verifique se os dados estão corretos.');
      }
    } catch (err) {
      console.error(err);
      alert('Erro técnico ao realizar upload ou registro. Tente novamente.');
    }
    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Preview for UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-white">MEU <span className="text-red-600">ARSENAL</span></h1>
          <p className="text-gray-500 text-sm mt-1">Gestão de armamentos vinculados ao seu CR.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Armamento</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && firearms.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Sincronizando Acervo...</span>
          </div>
        ) : (
          firearms.map((gun) => (
            <div key={gun.id} className="glass rounded-[40px] border-white/5 overflow-hidden group hover:border-red-600/30 transition-all relative">
              <div className="h-48 relative overflow-hidden bg-[#111]">
                {gun.image_url ? (
                  <img src={gun.image_url} alt={gun.model} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-800">
                    <Crosshair className="w-16 h-16 mb-2" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em]">Sem Imagem</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
                <div className="absolute top-4 right-4 px-2 py-1 bg-green-500/20 text-green-500 border border-green-500/30 rounded text-[8px] font-black uppercase tracking-widest backdrop-blur-md">ATIVO</div>
              </div>

              <div className="p-8 space-y-6 relative z-10">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black uppercase text-white tracking-tighter leading-none">{gun.model}</h3>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-blue-500 uppercase tracking-widest">{gun.brand} • {gun.caliber}</p>
                    <span className="text-[9px] font-black text-gray-600">SIGMA: {gun.sigma_number}</span>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-white py-3 rounded-xl transition-all border border-white/5">
                    <FileText className="w-4 h-4" /> <span>CRAF</span>
                  </button>
                  <button className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-blue-600/10 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 py-3 rounded-xl transition-all border border-white/5">
                    <ArrowRightLeft className="w-4 h-4" /> <span>Mudar Status</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {!loading && firearms.length === 0 && (
          <div className="col-span-full glass p-20 rounded-[40px] border-white/5 flex flex-col items-center justify-center text-center space-y-4 border-dashed">
            <ShieldAlert className="w-12 h-12 text-gray-800" />
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">Nenhum armamento registrado no seu acervo digital.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-md animate-fade-in">
          <div className="glass w-full max-w-xl rounded-[40px] p-10 border-red-600/20 space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 blur-[60px]" />

            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Registrar <span className="text-red-600">Armamento</span></h2>
              <button onClick={() => setShowAddModal(false)} className="p-2 text-gray-500 hover:text-white bg-white/5 rounded-xl transition-all"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddGun} className="space-y-6">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Visual do Equipamento</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative aspect-video bg-white/5 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden group hover:border-red-600/50 transition-all">
                    {formData.image_url ? (
                      <img src={formData.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Camera className="w-6 h-6 text-gray-600 mb-2" />
                        <span className="text-[8px] font-black uppercase text-gray-500">Subir Foto</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />

                  </div>
                  <div className="space-y-3">
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                      <input
                        type="url"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-8 pr-4 text-[10px] text-white outline-none focus:border-red-600"
                        placeholder="Ou cole a URL da imagem..."
                        value={formData.image_url.startsWith('data:') ? '' : formData.image_url}
                        onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                      />
                    </div>
                    <p className="text-[8px] text-gray-600 uppercase font-bold leading-relaxed">Adicione uma foto para facilitar a identificação pela armaria do clube.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Modelo</label>
                  <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-600" placeholder="Ex: Glock G17" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Calibre</label>
                  <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-600" placeholder=".9mm, .40" value={formData.caliber} onChange={e => setFormData({ ...formData, caliber: e.target.value })} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Número SIGMA / Serial</label>
                <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-red-600" value={formData.sigma_number} onChange={e => setFormData({ ...formData, sigma_number: e.target.value })} />
              </div>

              <div className="flex gap-4 pt-6">
                <button type="submit" disabled={loading} className="flex-grow bg-red-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 shadow-xl shadow-red-600/20">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><span>Confirmar Registro</span> <CheckCircle2 className="w-4 h-4" /></>}
                </button>
                <button type="button" onClick={() => setShowAddModal(false)} className="px-8 border border-white/10 text-gray-500 rounded-2xl uppercase font-black text-[10px]">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirearmsView;
