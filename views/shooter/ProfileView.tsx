
import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Camera, Save, Loader2, ShieldCheck, CreditCard } from 'lucide-react';
import { useAuth } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

const ProfileView: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        photo_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                email: user.email || '',
                photo_url: user.photo_url || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: formData.name,
                    phone: formData.phone,
                    photo_url: formData.photo_url
                })
                .eq('id', user.id);

            if (error) throw error;

            // Update local state
            updateUser({
                ...user,
                name: formData.name,
                phone: formData.phone,
                photo_url: formData.photo_url
            });

            alert('Perfil atualizado com sucesso!');
        } catch (err: any) {
            alert('Erro ao atualizar perfil: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;
        setUploading(true);
        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `profile-${user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        try {
            const { error: uploadError } = await supabase.storage
                .from('firearm-images') // Reusing as it exists
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('firearm-images')
                .getPublicUrl(filePath);

            setFormData(prev => ({ ...prev, photo_url: publicUrl }));
        } catch (err: any) {
            alert('Erro no upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
            <div className="flex justify-between items-end bg-zinc-900/40 p-10 rounded-[40px] border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-[32px] bg-black/50 border-2 border-white/10 overflow-hidden relative">
                            {formData.photo_url ? (
                                <img src={formData.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-full h-full p-8 text-gray-700" />
                            )}
                            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                <Camera className="w-8 h-8 text-white" />
                                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
                            </label>
                            {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black uppercase text-white tracking-tighter">Meu <span className="text-red-600">Perfil</span></h2>
                        <p className="text-gray-500 text-sm">Gerencie suas informações e foto da carteirinha.</p>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading || uploading}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Salvar Perfil
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="glass p-8 rounded-[40px] border-white/5 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6 italic">Informações Básicas</h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-red-600 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                        <div className="space-y-2 opacity-50">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email (Não editável)</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    value={formData.email}
                                    disabled
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white cursor-not-allowed"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Telefone / WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                                <input
                                    value={formData.phone}
                                    onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:border-red-600 outline-none transition-all font-bold"
                                    placeholder="(00) 00000-0000"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass p-8 rounded-[40px] border-white/5 flex flex-col justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 mb-6 italic">Visualização da Carteirinha</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Sua foto de perfil será utilizada para gerar sua **ID Digital**. Certifique-se de que a foto esteja nítida e com boa iluminação para facilitar sua identificação no clube.
                        </p>
                    </div>
                    <div className="p-6 bg-red-600/10 rounded-3xl border border-red-600/20 space-y-4">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-red-600" />
                            <span className="text-[10px] font-black uppercase text-white">Status do Associado</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Categoria:</span>
                            <span className="text-xs font-black text-red-600 uppercase italic">{user?.membership_type || 'RECRUTA'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Validade:</span>
                            <span className="text-xs font-black text-white">{user?.affiliation_expiry || 'Sem Vínculo'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileView;
