
import React, { useState } from 'react';
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Phone,
    Mail,
    Calendar,
    MessageSquare,
    Trash2,
    CheckCircle2,
    Clock,
    ArrowRight,
    TrendingUp,
    Target,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { useCRM, CRMLead } from '../../hooks/useCRM';

const CRMView: React.FC = () => {
    const { leads, loading, updateLeadStatus, deleteLead } = useCRM();
    const [searchTerm, setSearchTerm] = useState('');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'contacted': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'qualified': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'customer': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'lost': return 'bg-red-500/10 text-red-500 border-red-500/20';
            default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
        }
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    return (
        <div className="space-y-10 animate-fade-in max-w-[1600px] mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 justify-between items-start lg:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic">
                        CRM <span className="text-red-600">LEADS</span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 font-medium">Gestão de novos contatos e interessados vindos do site.</p>
                </div>

                <div className="flex gap-4 w-full justify-end">
                    <div className="relative flex-grow max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nome, e-mail ou telefone..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-bold focus:outline-none focus:border-red-600/50 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="bg-white/5 hover:bg-white/10 text-white p-4 rounded-2xl border border-white/10 transition-all">
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Novos Leads', value: leads.filter(l => l.status === 'new').length, icon: <Users size={14} />, color: 'blue' },
                    { label: 'Em Atendimento', value: leads.filter(l => l.status === 'contacted').length, icon: <Clock size={14} />, color: 'yellow' },
                    { label: 'Convertidos', value: leads.filter(l => l.status === 'customer').length, icon: <CheckCircle2 size={14} />, color: 'green' },
                    { label: 'Taxa Conversão', value: leads.length ? Math.round((leads.filter(l => l.status === 'customer').length / leads.length) * 100) + '%' : '0%', icon: <TrendingUp size={14} />, color: 'red' },
                ].map((kpi, i) => (
                    <div key={i} className="glass p-6 rounded-[32px] border-white/5">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className={`text-${kpi.color}-500`}>{kpi.icon}</div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{kpi.label}</span>
                        </div>
                        <span className="text-2xl font-black text-white">{kpi.value}</span>
                    </div>
                ))}
            </div>

            {/* Leads List */}
            <div className="glass rounded-[40px] border-white/5 overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                        <span className="text-xs font-black uppercase tracking-[0.3em] text-gray-500 italic">Sincronizando Leads...</span>
                    </div>
                ) : filteredLeads.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-8 h-8 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-2 italic">Nenhum Lead Encontrado</h3>
                        <p className="text-gray-500 text-sm font-medium">Os novos contatos do site aparecerão aqui automaticamente.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-white/[0.02] border-b border-white/5">
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Origem</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Contato</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500">Mensagem</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Status</th>
                                    <th className="py-6 px-8 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredLeads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-white/[0.01] transition-all group">
                                        <td className="py-6 px-8">
                                            <div className="flex flex-col">
                                                <span className="text-white font-black uppercase tracking-tight text-xs">{lead.source}</span>
                                                <span className="text-[10px] text-gray-600 font-bold uppercase mt-1">
                                                    {new Date(lead.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-600 font-black italic uppercase">
                                                    {lead.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-black uppercase tracking-tight text-sm">{lead.name}</span>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <a href={`tel:${lead.phone}`} className="text-[10px] text-gray-500 font-bold hover:text-red-500 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" /> {lead.phone}
                                                        </a>
                                                        <span className="text-gray-700">|</span>
                                                        <a href={`mailto:${lead.email}`} className="text-[10px] text-gray-500 font-bold hover:text-red-500 flex items-center gap-1">
                                                            <Mail className="w-3 h-3" /> {lead.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-8 max-w-xs">
                                            <p className="text-gray-400 text-xs font-medium line-clamp-2 leading-relaxed italic">
                                                {lead.message || "Sem mensagem enviada."}
                                            </p>
                                        </td>
                                        <td className="py-6 px-8 text-center">
                                            <select
                                                value={lead.status}
                                                onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                                className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border focus:outline-none transition-all ${getStatusColor(lead.status)}`}
                                            >
                                                <option value="new">Novo</option>
                                                <option value="contacted">Chamado</option>
                                                <option value="qualified">Qualificado</option>
                                                <option value="customer">Vendido</option>
                                                <option value="lost">Perdido</option>
                                            </select>
                                        </td>
                                        <td className="py-6 px-8 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                                                    className="p-3 bg-green-600/10 text-green-500 rounded-xl hover:bg-green-600 hover:text-white transition-all"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => deleteLead(lead.id)}
                                                    className="p-3 bg-red-600/10 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CRMView;
