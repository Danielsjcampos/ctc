import React, { useState, useEffect } from 'react';
import { Save, Upload, Loader2, Youtube, MapPin, Phone, Globe, Layout, Image as ImageIcon, ShieldCheck, Sparkles, Bot } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useSystemSettings } from '../../hooks/useSystemSettings';

const SettingsView: React.FC = () => {
    const { settings, loading: initialLoading, refetch } = useSystemSettings();
    const [formData, setFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

    const handleChange = (field: string, value: string) => {
        setFormData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setSaving(true);

        let error;

        const payload = {
            club_name: formData.club_name,
            address: formData.address,
            phone: formData.phone,
            whatsapp: formData.whatsapp,
            hero_video_id: formData.hero_video_id,
            logo_url: formData.logo_url,
            instagram_url: formData.instagram_url,
            facebook_url: formData.facebook_url,
            email_contact: formData.email_contact,
            membership_card_template: formData.membership_card_template,
            ai_provider: formData.ai_provider,
            ai_api_key: formData.ai_api_key,
            ai_avatar_url: formData.ai_avatar_url,
            updated_at: new Date().toISOString()
        };

        if (formData.id) {
            const { error: updateError } = await supabase
                .from('system_settings')
                .update(payload)
                .eq('id', formData.id);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from('system_settings')
                .insert([payload]);
            error = insertError;
        }

        if (error) {
            console.error('Error saving settings:', error);
            alert('Erro ao salvar configurações. Verifique o console.');
        } else {
            alert('Configurações atualizadas com sucesso!');
            refetch();
        }
        setSaving(false);
    };

    const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) return;
        setUploading(true);
        const file = event.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Need a 'system-assets' bucket or reuse 'firearm-images' for now (hack) or creating new bucket.
        // Let's assume 'firearm-images' works for any image for now to save time, OR use a public bucket if exists.
        // Ideally we created a 'public' bucket. Let's try 'firearm-images' as it exists.
        const { error: uploadError } = await supabase.storage
            .from('firearm-images')
            .upload(filePath, file);

        if (uploadError) {
            alert('Erro ao fazer upload. Verifique as permissões.');
            setUploading(false);
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('firearm-images')
            .getPublicUrl(filePath);

        setFormData((prev: any) => ({ ...prev, logo_url: publicUrl }));
        setUploading(false);
    };

    if (initialLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-red-600" /></div>;

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-center bg-zinc-900/50 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 backdrop-blur-md sticky top-0 z-10 gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-black uppercase text-white tracking-tighter">Ajustes <span className="text-red-600">Sistema</span></h1>
                    <p className="text-gray-400 text-[10px] md:text-sm">Identidade visual e informações do clube.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-xl shadow-red-600/20"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>Salvar Alterações</span>
                </button>
            </div>

            <div className="grid gap-8">

                {/* Identidade Visual */}
                <section className="bg-zinc-900/30 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 space-y-8">
                    <h2 className="text-lg md:text-xl font-black uppercase text-white flex items-center gap-3 italic">
                        <Layout className="w-5 h-5 text-red-600" /> Identidade <span className="text-red-600">Visual</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Logo do Clube</label>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-32 h-32 rounded-3xl bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden relative group shrink-0">
                                    {formData.logo_url ? (
                                        <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                                    ) : (
                                        <ImageIcon className="w-10 h-10 text-gray-700" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer">
                                            <Upload className="w-8 h-8 text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><Loader2 className="w-8 h-8 text-red-600 animate-spin" /></div>}
                                </div>
                                <div className="text-[10px] text-gray-500 text-center sm:text-left font-medium italic">
                                    Formatos PNG ou SVG recomendados. Fundo transparente.
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nome Fantasia</label>
                                <input
                                    value={formData.club_name || ''}
                                    onChange={(e) => handleChange('club_name', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-white font-bold focus:border-red-600 outline-none transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1 flex items-center gap-2">
                                    <Youtube className="w-4 h-4 text-red-600" /> ID Vídeo YouTube
                                </label>
                                <input
                                    value={formData.hero_video_id || ''}
                                    onChange={(e) => handleChange('hero_video_id', e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-white font-bold focus:border-red-600 outline-none transition-all font-mono text-xs"
                                    placeholder="qILJ5fZBSpc"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contato e Localização */}
                <section className="bg-zinc-900/30 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 space-y-8">
                    <h2 className="text-lg md:text-xl font-black uppercase text-white flex items-center gap-3 italic">
                        <MapPin className="w-5 h-5 text-red-600" /> Contato & <span className="text-red-600">Localização</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Endereço Administrativo</label>
                            <input
                                value={formData.address || ''}
                                onChange={(e) => handleChange('address', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-white font-bold focus:border-red-600 outline-none transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Telefone Fixo</label>
                            <input
                                value={formData.phone || ''}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-white font-bold focus:border-red-600 outline-none transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">WhatsApp</label>
                            <input
                                value={formData.whatsapp || ''}
                                onChange={(e) => handleChange('whatsapp', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-white font-bold focus:border-red-600 outline-none transition-all text-sm"
                                placeholder="5511999999999"
                            />
                        </div>
                    </div>
                </section>

                {/* Editor de Carteirinha */}
                <section className="bg-zinc-900/30 p-8 rounded-[40px] border border-white/5 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black uppercase text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-red-600" /> Modelo da Carteirinha
                        </h2>
                        <button
                            onClick={() => {
                                if (!formData.membership_card_template) {
                                    handleChange('membership_card_template', `
<div style="width: 450px; height: 280px; background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%); border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); padding: 25px; color: white; position: relative; font-family: sans-serif; overflow: hidden;">
    <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(220, 38, 38, 0.1); border-radius: 50%; filter: blur(50px);"></div>
    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 30px;">
        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="{{LOGO_URL}}" style="height: 40px; filter: drop-shadow(0 0 5px rgba(220,38,38,0.5));">
            <span style="font-weight: 900; letter-spacing: -1px; font-size: 18px;">ELITE SHIELD</span>
        </div>
        <div style="background: #dc2626; padding: 4px 12px; border-radius: 8px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">
            {{MEMBERSHIP_TYPE}}
        </div>
    </div>
    <div style="display: flex; gap: 20px; align-items: center;">
        <div style="width: 100px; height: 100px; border-radius: 12px; border: 2px solid rgba(220,38,38,0.3); overflow: hidden; background: #000;">
            <img src="{{CLIENT_PHOTO}}" style="width: 100%; height: 100%; object-fit: cover;">
        </div>
        <div style="flex: 1;">
            <div style="font-size: 10px; color: #666; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">Atirador Filiado</div>
            <div style="font-size: 20px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px; margin-bottom: 15px;">{{CLIENT_NAME}}</div>
        </div>
    </div>
    <div style="display: flex; gap: 40px; margin-top: 20px;">
        <div>
            <div style="font-size: 8px; color: #666; font-weight: bold; text-transform: uppercase;">ID Membro</div>
            <div style="font-size: 12px; font-weight: bold; color: #fff;">#{{ID_NUMBER}}</div>
        </div>
        <div>
            <div style="font-size: 8px; color: #666; font-weight: bold; text-transform: uppercase;">Válido até</div>
            <div style="font-size: 12px; font-weight: bold; color: #fff;">{{EXPIRY_DATE}}</div>
        </div>
    </div>
</div>`.trim());
                                }
                            }}
                            className="text-[9px] font-black uppercase text-red-600 hover:text-white transition-colors border border-red-600/20 px-3 py-1 rounded-lg"
                        >
                            Resetar p/ Padrão
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Editor HTML/CSS</label>
                            <textarea
                                value={formData.membership_card_template || ''}
                                onChange={(e) => handleChange('membership_card_template', e.target.value)}
                                className="w-full h-[300px] md:h-[400px] bg-black/40 border border-white/10 rounded-2xl p-6 text-xs font-mono text-gray-400 focus:border-red-600 outline-none transition-all resize-none"
                            />
                            <div className="p-4 bg-white/5 rounded-2xl space-y-3">
                                <p className="text-[9px] font-black uppercase text-gray-600">Tags de Replicação:</p>
                                <div className="flex flex-wrap gap-2">
                                    {['LOGO_URL', 'CLIENT_NAME', 'CLIENT_PHOTO', 'MEMBERSHIP_TYPE', 'EXPIRY_DATE', 'ID_NUMBER'].map(v => (
                                        <code key={v} className="text-[8px] bg-red-600/10 text-red-500 px-2 py-1 rounded-lg border border-red-600/10">{'{{' + v + '}}'}</code>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Visualização em Tempo Real</label>
                            <div className="flex-grow glass rounded-[32px] border-white/5 flex items-center justify-center p-4 md:p-8 bg-black/20 overflow-hidden min-h-[350px]">
                                <div
                                    dangerouslySetInnerHTML={{
                                        __html: (formData.membership_card_template || '')
                                            .replace(/{{LOGO_URL}}/g, formData.logo_url || '')
                                            .replace(/{{CLIENT_NAME}}/g, 'Atirador de Teste')
                                            .replace(/{{CLIENT_PHOTO}}/g, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200')
                                            .replace(/{{MEMBERSHIP_TYPE}}/g, 'ELITE')
                                            .replace(/{{EXPIRY_DATE}}/g, '31/12/2026')
                                            .replace(/{{ID_NUMBER}}/g, '0001')
                                    }}
                                    className="origin-center scale-[0.6] sm:scale-[0.8] md:scale-100"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* AI CONFIGURATION */}
                <section className="bg-zinc-900/30 p-6 md:p-8 rounded-[32px] md:rounded-[40px] border border-white/5 space-y-8">
                    <h2 className="text-lg md:text-xl font-black uppercase text-white flex items-center gap-3 italic">
                        <Sparkles className="w-5 h-5 text-cyan-400" /> Inteligência <span className="text-cyan-400">Artificial</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Provedor de AI</label>
                            <select
                                value={formData.ai_provider || 'openai'}
                                onChange={(e) => handleChange('ai_provider', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-white font-bold focus:border-cyan-400 outline-none transition-all text-sm appearance-none"
                            >
                                <option value="openai">OpenAI (GPT-4 / 3.5)</option>
                                <option value="gemini">Google Gemini</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Chave de API (Secret Key)</label>
                            <input
                                type="password"
                                value={formData.ai_api_key || ''}
                                onChange={(e) => handleChange('ai_api_key', e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-white font-bold focus:border-cyan-400 outline-none transition-all text-sm font-mono"
                                placeholder="sk-..."
                            />
                            <p className="text-[9px] text-gray-600 mt-2 ml-2">Sua chave será armazenada de forma segura na base de dados.</p>
                        </div>

                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-white/5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Avatar do Agente</label>
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-black/50 border border-white/10 flex items-center justify-center overflow-hidden relative group shrink-0">
                                    {formData.ai_avatar_url ? (
                                        <img src={formData.ai_avatar_url} alt="AI Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <Bot className="w-10 h-10 text-gray-700" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <label className="cursor-pointer">
                                            <Upload className="w-6 h-6 text-white" />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    if (!e.target.files || e.target.files.length === 0) return;
                                                    setUploading(true);
                                                    const file = e.target.files[0];
                                                    const fileName = `ai-avatar-${Date.now()}.${file.name.split('.').pop()}`;
                                                    const { error } = await supabase.storage.from('firearm-images').upload(fileName, file);

                                                    if (!error) {
                                                        const { data } = supabase.storage.from('firearm-images').getPublicUrl(fileName);
                                                        handleChange('ai_avatar_url', data.publicUrl);
                                                    } else {
                                                        alert('Erro no upload.');
                                                    }
                                                    setUploading(false);
                                                }}
                                                disabled={uploading}
                                            />
                                        </label>
                                    </div>
                                    {uploading && <div className="absolute inset-0 bg-black/80 flex items-center justify-center"><Loader2 className="w-6 h-6 text-cyan-400 animate-spin" /></div>}
                                </div>
                                <div className="flex-grow space-y-2 w-full">
                                    <input
                                        value={formData.ai_avatar_url || ''}
                                        onChange={(e) => handleChange('ai_avatar_url', e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 md:p-5 text-white font-bold focus:border-cyan-400 outline-none transition-all text-xs font-mono"
                                        placeholder="https://..."
                                    />
                                    <p className="text-[9px] text-gray-500 italic">Faça upload da imagem ou cole uma URL externa.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </section>
            </div>
        </div>
    );
};

export default SettingsView;
