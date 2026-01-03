
import React, { useState } from 'react';
import { ShieldCheck, Camera, Upload, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const MembershipForm: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    rg: '',
    rg_date: '',
    cpf: '',
    birth_date: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    cr_number: '',
    military_region: '',
    cr_validity: '',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPhoto(URL.createObjectURL(e.target.files[0]));
      // In a real app, you would upload this file to Supabase Storage here
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic validation
      if (!formData.full_name || !formData.email || !formData.cpf) {
        alert('Por favor, preencha os campos obrigatórios.');
        setLoading(false);
        return;
      }

      // Insert into Supabase
      const { error } = await supabase
        .from('membership_requests')
        .insert([{
          ...formData, // Map form fields to table columns
          // Convert empty strings to null for dates/optional fields if needed, 
          // but supabase handles empty strings for text fine. Dates might need care.
          rg_date: formData.rg_date || null,
          birth_date: formData.birth_date || null,
          cr_validity: formData.cr_validity || null,
          photo_url: photo // Storing object URL is temporary/local only. In prod needs storage.
        }]);

      if (error) throw error;

      setSubmitted(true);
    } catch (error: any) {
      console.error('Error submitting form:', error);
      alert('Erro ao enviar proposta: ' + (error.message || 'Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="glass max-w-lg w-full p-12 rounded-[40px] text-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border-4 border-green-500/30">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">Ficha <span className="text-red-600">Recebida!</span></h2>
            <p className="text-gray-400">Sua proposta de adesão foi enviada para o Conselho de Administração. Você receberá um retorno em até 48 horas úteis.</p>
          </div>
          <Link to="/" className="inline-block bg-white text-black px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all">
            Voltar para o Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] py-20 px-6">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ShieldCheck className="w-8 h-8 text-red-600" />
            <span className="text-xl font-black tracking-tighter">ELITE SHIELD</span>
          </Link>
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Ficha de Adesão e Registro v2.4</span>
        </div>

        <div className="glass p-10 md:p-16 rounded-[50px] border-white/5 space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter">Proposta de <span className="text-red-600">Filiação</span></h1>
            <p className="text-gray-400 text-sm">Preencha os dados abaixo seguindo rigorosamente a sua documentação oficial.</p>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Foto e Dados Básicos */}
            <div className="grid md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Foto 3x4 (Digital)</label>
                <div className="relative aspect-[3/4] bg-white/5 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center overflow-hidden group hover:border-red-600 transition-all">
                  {photo ? (
                    <img src={photo} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="w-8 h-8 text-gray-700 mb-2" />
                      <span className="text-[8px] font-black uppercase text-gray-600">Upload Foto</span>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} accept="image/*" />
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Nome Completo</label>
                  <input
                    type="text" required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                    placeholder="Como no RG/CNH"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">E-mail</label>
                    <input
                      type="email" required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Celular / WhatsApp</label>
                    <input
                      type="tel" required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                      value={formData.phone}
                      onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">RG</label>
                    <input
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                      value={formData.rg}
                      onChange={e => setFormData({ ...formData, rg: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Data Emissão</label>
                    <input
                      type="date" required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                      value={formData.rg_date}
                      onChange={e => setFormData({ ...formData, rg_date: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">CPF</label>
                    <input
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                      placeholder="000.000.000-00"
                      value={formData.cpf}
                      onChange={e => setFormData({ ...formData, cpf: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Data Nascimento</label>
                    <input
                      type="date" required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                      value={formData.birth_date}
                      onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-600">Localização</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Endereço Residencial</label>
                  <input
                    type="text" required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                    placeholder="Rua, Número, Complemento"
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Bairro</label>
                  <input
                    type="text" required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                    value={formData.neighborhood}
                    onChange={e => setFormData({ ...formData, neighborhood: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cidade</label>
                    <input
                      type="text" required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                      value={formData.city}
                      onChange={e => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">UF</label>
                    <input
                      type="text" required maxLength={2}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-center uppercase text-white"
                      value={formData.state}
                      onChange={e => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Documentação Legal */}
            <div className="space-y-6 pt-6 border-t border-white/5">
              <h3 className="text-xs font-black uppercase tracking-widest text-red-600">Documentação Legal</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Número do CR (Opcional)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                    value={formData.cr_number}
                    onChange={e => setFormData({ ...formData, cr_number: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Região Militar (RM)</label>
                  <input
                    type="text"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                    value={formData.military_region}
                    onChange={e => setFormData({ ...formData, military_region: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Validade CR</label>
                  <input
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-red-600 transition-all text-white"
                    value={formData.cr_validity}
                    onChange={e => setFormData({ ...formData, cr_validity: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-6 bg-red-600/5 border border-red-600/10 rounded-3xl space-y-4">
                <p className="text-[10px] text-gray-500 uppercase font-black leading-relaxed">Documentos Necessários para Apresentação Física:</p>
                <ul className="text-[10px] text-gray-400 space-y-2">
                  <li className="flex items-center space-x-2"><CheckCircle className="w-3 h-3 text-red-600" /> <span>Cópia do CR, Identidade e CPF</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-3 h-3 text-red-600" /> <span>Comprovante de residência atualizado</span></li>
                  <li className="flex items-center space-x-2"><CheckCircle className="w-3 h-3 text-red-600" /> <span>Certidão de Antecedentes Criminais (Na ausência de CR)</span></li>
                </ul>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-red-600/20 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>Enviar Proposta de Adesão</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MembershipForm;
