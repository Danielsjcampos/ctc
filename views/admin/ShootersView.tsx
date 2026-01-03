
import React, { useState, useEffect } from 'react';
import {
  Search,
  X,
  Loader2,
  ChevronRight,
  Trash2,
  Edit3,
  History,
  Activity,
  UserPlus,
  CheckCircle2,
  ShieldAlert,
  Crosshair,
  Plus,
  Camera,
  Link as LinkIcon,
  Save,
  ShieldX,
  ArrowRight,
  MapPin,
  ShoppingCart,
  Calendar,
  Users,
  UserX,
  FileText,
  CreditCard,
  Target,
  Receipt
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ShootersView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ativos' | 'bloqueados' | 'requests'>('ativos');
  const [loading, setLoading] = useState(true);
  const [shooters, setShooters] = useState<any[]>([]);
  const [selectedShooter, setSelectedShooter] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddGunModal, setShowAddGunModal] = useState(false);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [shooterArsenal, setShooterArsenal] = useState<any[]>([]);
  const [shooterSales, setShooterSales] = useState<any[]>([]);
  const [shooterSessions, setShooterSessions] = useState<any[]>([]);

  // Membership Requests State
  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);

  // Form para nova arma
  const [gunData, setGunData] = useState({ model: '', brand: '', caliber: '', sigma_number: '', image_url: '' });

  // Form para atirador (Criação e Edição)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    is_affiliated: false,
    affiliation_expiry: '',
    status: 'active',
    membership_type: 'Recruta'
  });

  const [sessionData, setSessionData] = useState({
    firearm_id: '',
    firearm_model: '',
    total_shots: 0,
    caliber: '',
    lane_number: '01',
    distance_meters: 10
  });

  // Renewal State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [renewData, setRenewData] = useState({
    amount: 350, // Default annual fee
    validity_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
    payment_method: 'PIX'
  });

  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('name');

    if (data) setShooters(data);

    // Fetch Requests
    const { data: requestData } = await supabase
      .from('membership_requests')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestData) setRequests(requestData);

    setLoading(false);
  };

  const fetchShooterDetails = async (id: string) => {
    console.log('Fetching details for shooter:', id);
    // Fetch Arsenal
    const { data: arsenal, error: arsenalError } = await supabase.from('firearms').select('*').eq('owner_id', id).eq('status', 'available');
    console.log('Arsenal data:', arsenal, arsenalError);
    if (arsenal) setShooterArsenal(arsenal);

    // Fetch Sales
    const { data: sales } = await supabase.from('sales').select('*').eq('shooter_id', id).eq('status', 'pending');
    if (sales) setShooterSales(sales);

    // Fetch Sessions (Habitualidade)
    const { data: sessions } = await supabase
      .from('club_sessions')
      .select('*')
      .eq('shooter_id', id)
      .order('check_in_at', { ascending: false });
    if (sessions) setShooterSessions(sessions);
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (selectedShooter) {
      fetchShooterDetails(selectedShooter.id);
      setFormData({
        name: selectedShooter.name || '',
        email: selectedShooter.email || '',
        cpf: selectedShooter.cpf || '',
        phone: selectedShooter.phone || '',
        is_affiliated: selectedShooter.is_affiliated || false,
        affiliation_expiry: selectedShooter.affiliation_expiry || '',
        status: selectedShooter.status || 'active',
        membership_type: selectedShooter.membership_type || 'Recruta'
      });
    }
  }, [selectedShooter]);

  const handleSaveShooter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isEditMode && selectedShooter) {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', selectedShooter.id);

      if (!error) {
        setShowCreateModal(false);
        setIsEditMode(false);
        fetchData();
        setSelectedShooter({ ...selectedShooter, ...formData });
      }
    } else {
      const { error } = await supabase
        .from('profiles')
        .insert([formData]);

      if (!error) {
        setShowCreateModal(false);
        fetchData();
      }
    }
    setLoading(false);
  };

  const handleApproveRequest = async (request: any) => {
    if (!confirm(`Confirma a aprovação de ${request.full_name}? Isso criará um perfil de atirador.`)) return;
    setLoading(true);

    try {
      // 1. Create Profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          name: request.full_name,
          email: request.email,
          cpf: request.cpf,
          phone: request.phone,
          role: 'SHOOTER',
          status: 'active',
          membership_type: 'Recruta',
          is_affiliated: true, // Assuming approval means affiliation
          affiliation_expiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(), // 1 year validity default
          photo_url: request.photo_url
        }])
        .select()
        .single();

      if (profileError) throw profileError;

      // 2. Update Request Status
      const { error: requestError } = await supabase
        .from('membership_requests')
        .update({ status: 'approved' })
        .eq('id', request.id);

      if (requestError) throw requestError;

      alert('Atirador cadastrado com sucesso!');
      setSelectedRequest(null);
      fetchData();

    } catch (error: any) {
      console.error('Error approving request:', error);
      alert('Erro ao aprovar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!confirm('Deseja realmente rejeitar/arquivar este pedido?')) return;
    setLoading(true);
    const { error } = await supabase
      .from('membership_requests')
      .update({ status: 'rejected' })
      .eq('id', requestId);

    if (!error) {
      setSelectedRequest(null);
      fetchData();
    }
    setLoading(false);
  };

  const handleDeleteShooter = async () => {
    if (!selectedShooter) return;
    if (!confirm('Tem certeza que deseja excluir este atirador?')) return;

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', selectedShooter.id);

    if (!error) {
      setSelectedShooter(null);
      fetchData();
    }
    setLoading(false);
  };

  const handleToggleStatus = async () => {
    if (!selectedShooter) return;
    const newStatus = selectedShooter.status === 'active' ? 'blocked' : 'active';

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', selectedShooter.id);

    if (!error) {
      setSelectedShooter({ ...selectedShooter, status: newStatus });
      fetchData();
    }
    setLoading(false);
  };

  const handleAddGunToShooter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShooter) return;

    setLoading(true);
    const { error } = await supabase.from('firearms').insert([{
      ...gunData,
      owner_id: selectedShooter.id,
      status: 'available',
      acquisition_date: new Date().toISOString()
    }]);

    if (error) {
      console.error('Error adding firearm:', error);
      alert('Erro ao adicionar arma: ' + error.message);
    } else {
      setShowAddGunModal(false);
      setGunData({ model: '', brand: '', caliber: '', sigma_number: '', image_url: '' });
      fetchShooterDetails(selectedShooter.id);
    }
    setLoading(false);
  };

  const handleAddSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShooter) return;

    setLoading(true);
    console.log('Registering session with data:', sessionData);

    const { error } = await supabase.from('club_sessions').insert([{
      shooter_id: selectedShooter.id,
      shooter_name: selectedShooter.name,
      firearm_id: sessionData.firearm_id || null,
      firearm_model: sessionData.firearm_model,
      total_shots: sessionData.total_shots,
      caliber: sessionData.caliber,
      lane_number: sessionData.lane_number,
      distance_meters: sessionData.distance_meters || 0,
      status: 'completed',
      check_in_at: new Date().toISOString(),
      check_out_at: new Date().toISOString()
    }]);

    if (error) {
      console.error('Error adding session:', error);
      alert('Erro ao registrar treino: ' + error.message);
    } else {
      setShowAddSessionModal(false);
      setSessionData({ firearm_id: '', firearm_model: '', total_shots: 0, caliber: '', lane_number: '01', distance_meters: 10 });
      fetchShooterDetails(selectedShooter.id);
    }
    setLoading(false);
  };

  const handleRenewMembership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShooter) return;
    setLoading(true);

    try {
      // 1. Register Sale (Financial)
      const { error: saleError } = await supabase.from('sales').insert([{
        shooter_id: selectedShooter.id,
        total: renewData.amount,
        items: [{
          description: `Renovação Anuidade (Venc: ${new Date(renewData.validity_date).toLocaleDateString()})`,
          price: renewData.amount,
          type: 'membership_fee'
        }],
        status: 'completed', // Assuming immediate payment
        payment_method: renewData.payment_method,
        closed_at: new Date().toISOString()
      }]);

      if (saleError) throw saleError;

      // 2. Update Profile (Validity & Status)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          affiliation_expiry: renewData.validity_date,
          status: 'active',
          is_affiliated: true
        })
        .eq('id', selectedShooter.id);

      if (profileError) throw profileError;

      alert('Anuidade renovada com sucesso!');
      setIsRenewModalOpen(false);

      // Update local state
      setSelectedShooter(prev => ({
        ...prev,
        affiliation_expiry: renewData.validity_date,
        status: 'active',
        is_affiliated: true
      }));
      fetchData();

    } catch (error: any) {
      console.error('Error renewing membership:', error);
      alert('Erro ao renovar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateHabitualidadePDF = (shooter: any, sessions: any[]) => {
    const doc = new jsPDF();

    // --- HEADER ---
    doc.setFillColor(15, 15, 15);
    doc.rect(0, 0, 210, 40, 'F');

    // Title
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Red
    doc.setFont("helvetica", "bold");
    doc.text("RELATÓRIO DE", 20, 18);
    doc.setTextColor(255, 255, 255); // White
    doc.text("HABITUALIDADE", 20, 28);

    // Club Info (Right Side)
    doc.setFontSize(9);
    doc.setTextColor(200, 200, 200);
    doc.setFont("helvetica", "bold");
    doc.text("ELITE COMMAND - CLUBE DE TIRO", 200, 15, { align: "right" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("CNPJ: 00.000.000/0001-00", 200, 20, { align: "right" });
    doc.text("Av. Central, 1000 - Centro, São Paulo - SP", 200, 24, { align: "right" });
    doc.text("Tel: (11) 99999-9999 | contato@elitecommand.com.br", 200, 28, { align: "right" });
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 200, 35, { align: "right" });

    // --- SHOOTER INFO ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("IDENTIFICAÇÃO DO ATIRADOR", 20, 55);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Nome Completo: ${shooter.name.toUpperCase()}`, 20, 65);
    doc.text(`CPF: ${shooter.cpf || 'N/D'}`, 20, 72);
    doc.text(`Categoria: ${shooter.membership_type.toUpperCase()}`, 20, 79);

    doc.text(`Total de Registros: ${sessions.length}`, 140, 65);

    // --- TABLE ---
    const tableColumn = ["Data", "Horário", "Armamento", "Calibre", "Disparos", "Local"];
    const tableRows = sessions.map(session => [
      new Date(session.check_in_at).toLocaleDateString(),
      new Date(session.check_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      session.firearm_model,
      session.caliber || 'N/A',
      session.total_shots,
      `Raia ${session.lane_number || '--'}`
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 90,
      theme: 'grid',
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    // --- SIGNATURES ---
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    const signatureY = finalY + 40;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);

    // Signature 1
    doc.line(20, signatureY, 90, signatureY);
    doc.setFontSize(8);
    doc.text("ASSINATURA DO INSTRUTOR", 20, signatureY + 5);

    // Signature 2
    doc.line(120, signatureY, 190, signatureY);
    doc.text("ASSINATURA DO ATIRADOR", 120, signatureY + 5);

    doc.save(`habitualidade_${shooter.name.toLowerCase().replace(/ /g, '_')}.pdf`);
  };

  const filteredShooters = shooters.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cpf?.includes(searchTerm);
    const matchesTab = activeTab === 'ativos' ? s.status === 'active' : s.status === 'blocked';
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">GESTÃO DE <span className="text-red-600">ATIRADORES</span></h1>
          <p className="text-gray-500 text-sm mt-2 font-medium">Controle de filiados, acervo e habitualidade.</p>
        </div>
        <button
          onClick={() => {
            setIsEditMode(false);
            setFormData({ name: '', email: '', cpf: '', phone: '', is_affiliated: false, affiliation_expiry: '', status: 'active', membership_type: 'Recruta' });
            setShowCreateModal(true);
          }}
          className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 shadow-2xl shadow-red-600/20 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Cadastrar Atirador</span>
        </button>
      </div>

      <div className="glass p-8 rounded-[40px] border-white/5 space-y-8 bg-[#0a0a0a]/50 backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          <div className="flex-grow relative group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5 transition-colors group-focus-within:text-red-600" />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou CPF..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 md:py-5 pl-14 pr-8 text-white outline-none focus:border-red-600/50 font-bold transition-all placeholder:text-gray-700 text-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 w-fit">
            <button
              onClick={() => setActiveTab('ativos')}
              className={`w-12 h-10 md:w-14 md:h-12 flex items-center justify-center rounded-xl transition-all ${activeTab === 'ativos' ? 'bg-red-600 text-white shadow-xl shadow-red-600/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              title="Atiradores Ativos"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('bloqueados')}
              className={`w-12 h-10 md:w-14 md:h-12 flex items-center justify-center rounded-xl transition-all ${activeTab === 'bloqueados' ? 'bg-zinc-800 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              title="Atiradores Inativos / Bloqueados"
            >
              <UserX className="w-5 h-5" />
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`w-12 h-10 md:w-14 md:h-12 flex items-center justify-center rounded-xl transition-all relative ${activeTab === 'requests' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
              title="Solicitações de Adesão"
            >
              <FileText className="w-5 h-5" />
              {requests.length > 0 && <span className="absolute top-2 right-2 md:top-3 md:right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </button>
          </div>
        </div>

        {/* Mobile Grid */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {loading ? (
            <div className="py-20 text-center col-span-1">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-red-600" />
            </div>
          ) : filteredShooters.map(shooter => (
            <button key={shooter.id} onClick={() => setSelectedShooter(shooter)} className="glass p-5 rounded-3xl border-white/5 text-left flex items-center justify-between group active:scale-95 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center text-red-600 font-black italic">{shooter.name.charAt(0)}</div>
                <div>
                  <span className="block text-sm font-black text-white uppercase">{shooter.name.split(' ')[0]} {shooter.name.split(' ').slice(1).join(' ').charAt(0)}.</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase ${shooter.status === 'active' ? 'text-green-500' : 'text-red-500'}`}>{shooter.status === 'active' ? 'Regular' : 'Bloqueado'}</span>
                    <span className="text-[8px] font-black uppercase text-gray-600 italic">| {shooter.membership_type}</span>
                  </div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                <th className="px-8 py-4">Atirador</th>
                <th className="px-8 py-4">Status</th>
                <th className="px-8 py-4">Categoria</th>
                <th className="px-8 py-4">Filiado</th>
                <th className="px-8 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {activeTab === 'requests' ? (
                requests.map(req => (
                  <tr key={req.id} className="group cursor-pointer" onClick={() => setSelectedRequest(req)}>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all rounded-l-[24px] border-y border-l border-white/5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-black text-lg italic">
                          {req.full_name?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white uppercase tracking-tight">{req.full_name}</div>
                          <div className="text-[10px] text-gray-500 font-medium">{req.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all border-y border-white/5">
                      <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-500">
                        Pendente
                      </span>
                    </td>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all border-y border-white/5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{req.city}/{req.state}</span>
                    </td>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all border-y border-white/5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{new Date(req.created_at).toLocaleDateString()}</span>
                    </td>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all rounded-r-[24px] border-y border-r border-white/5 text-right">
                      <button className="p-3 bg-white/5 rounded-xl text-blue-500 hover:text-white hover:bg-blue-600 transition-all">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                filteredShooters.map(shooter => (
                  <tr key={shooter.id} className="group cursor-pointer" onClick={() => setSelectedShooter(shooter)}>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all rounded-l-[24px] border-y border-l border-white/5">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600 font-black text-lg italic">
                          {shooter.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white uppercase tracking-tight">{shooter.name}</div>
                          <div className="text-[10px] text-gray-500 font-medium">{shooter.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all border-y border-white/5">
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${shooter.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {shooter.status === 'active' ? 'Regular' : 'Bloqueado'}
                      </span>
                    </td>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all border-y border-white/5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">{shooter.membership_type}</span>
                    </td>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all border-y border-white/5">
                      <div className="flex items-center space-x-2">
                        {shooter.is_affiliated ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-gray-700" />
                        )}
                        <span className="text-[10px] font-black text-white">{shooter.is_affiliated ? 'SIM' : 'NÃO'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 bg-white/[0.02] group-hover:bg-white/[0.05] transition-all rounded-r-[24px] border-y border-r border-white/5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Actions */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShooter(shooter);
                            setIsRenewModalOpen(true);
                          }}
                          className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-green-500 hover:bg-green-500/10 transition-all tooltip"
                          title="Lançar Anuidade / Renovar"
                        >
                          <CreditCard className="w-5 h-5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShooter(shooter);
                            setSessionData({
                              firearm_id: '',
                              firearm_model: '',
                              caliber: '',
                              total_shots: 0,
                              lane_number: '01',
                              distance_meters: 10
                            });
                            setShowAddSessionModal(true);
                          }}
                          className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
                          title="Lançar Habitualidade"
                        >
                          <Target className="w-5 h-5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedShooter(shooter);
                          }}
                          className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-yellow-500 hover:bg-yellow-500/10 transition-all"
                          title="Ver Comanda / Detalhes"
                        >
                          <Receipt className="w-5 h-5" />
                        </button>

                        <div className="w-px h-6 bg-white/10 mx-2" />

                        <button className="p-3 bg-white/5 rounded-xl text-gray-500 group-hover:text-red-600 transition-all">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detalhes do Atirador */}
      {selectedShooter && !showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6 bg-black/95 md:backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass w-full md:max-w-6xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto md:rounded-[48px] p-6 md:p-10 border-red-600/20 custom-scrollbar relative bg-[#0a0a0a]">
            {/* Fechar Modal */}
            <button onClick={() => setSelectedShooter(null)} className="absolute top-6 md:top-8 right-6 md:right-8 p-3 md:p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all z-20">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start mb-8 md:mb-12 gap-8">
              <div className="flex flex-col md:flex-row items-center md:items-start text-center md:text-left space-y-4 md:space-y-0 md:space-x-8 w-full md:w-auto">
                <div className="w-20 md:w-24 h-20 md:h-24 rounded-[24px] md:rounded-[32px] bg-red-600/10 border border-red-600/20 flex items-center justify-center text-3xl md:text-4xl font-black text-red-600 italic">
                  {selectedShooter.name.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-2">
                    <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-white italic">{selectedShooter.name}</h2>
                    <span className={`px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest ${selectedShooter.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {selectedShooter.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <div className="flex flex-col md:flex-row items-center text-gray-500 md:space-x-6 text-[10px] md:text-xs font-bold uppercase tracking-widest gap-2">
                    <span>{selectedShooter.email}</span>
                    <span className="hidden md:block">•</span>
                    <span>{selectedShooter.phone}</span>
                  </div>
                  <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-2">
                    <span className="bg-red-600/10 text-red-500 px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-red-600/20 flex items-center gap-2">
                      <Activity className="w-2.5 md:w-3 h-2.5 md:h-3" />
                      {selectedShooter.membership_type}
                    </span>
                    {selectedShooter.is_affiliated && (
                      <span className="bg-blue-600/10 text-blue-500 px-3 md:px-4 py-1 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-blue-600/20 flex items-center gap-2">
                        <LinkIcon className="w-2.5 md:w-3 h-2.5 md:h-3" />
                        Filiado
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-auto justify-center">
                <button
                  onClick={() => {
                    setIsEditMode(true);
                    setShowCreateModal(true);
                  }}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all border border-white/5"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-10">
                {/* Financial Section */}
                <div className="glass p-10 rounded-[40px] border-white/5 relative overflow-hidden bg-white/[0.02]">
                  <div className="absolute top-0 right-0 p-8">
                    <ShieldAlert className="w-12 h-12 text-red-600/10" />
                  </div>
                  <div className="flex justify-between items-center mb-8">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Consumo em Aberto</h3>
                      <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-1">Pendências na Comanda Digital</p>
                    </div>
                    {shooterSales.length > 0 && (
                      <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all">
                        Fechar Conta <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="h-48 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center p-8">
                    {shooterSales.length > 0 ? (
                      <div className="w-full space-y-4">
                        {shooterSales.map(sale => (
                          <div key={sale.id} className="flex justify-between items-center p-4 bg-red-600/5 rounded-2xl border border-red-600/10">
                            <span className="text-xs font-bold text-gray-400">Cupom #{sale.id.slice(0, 8).toUpperCase()}</span>
                            <span className="text-sm font-black text-white">R$ {sale.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Nenhum débito pendente registrado</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Arsenal Section */}
                <div className="glass p-10 rounded-[40px] border-white/5 bg-white/[0.02]">
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-red-600/10 rounded-2xl text-red-600"><Crosshair className="w-6 h-6" /></div>
                      <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Acervo Registrado</h3>
                    </div>
                    <button
                      onClick={() => setShowAddGunModal(true)}
                      className="bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all border border-white/5"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar Arma
                    </button>
                  </div>

                  <div className="h-full min-h-[200px] border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center p-8">
                    {shooterArsenal.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                        {shooterArsenal.map(gun => (
                          <div key={gun.id} className="flex items-center space-x-5 p-5 bg-white/[0.02] rounded-[32px] border border-white/5 hover:border-red-600/30 transition-all group relative overflow-hidden">
                            <div className="w-20 h-20 bg-black rounded-2xl overflow-hidden flex-shrink-0">
                              <img src={gun.image_url || 'https://via.placeholder.com/80'} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                              <div className="text-sm font-black text-white uppercase">{gun.model}</div>
                              <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mb-2">{gun.caliber} • {gun.brand || 'Original'}</div>
                              <div className="text-[8px] bg-white/5 px-2 py-0.5 rounded-md text-gray-500 font-black tracking-widest uppercase">SIGMA: {gun.sigma_number}</div>
                            </div>
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button className="text-red-500 p-2 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Sem armamento registrado no sistema</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-8">
                {/* User Stats/Actions */}
                <div className="glass p-8 rounded-[40px] border-white/5 bg-zinc-900/40 space-y-10">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6 italic">Controle de Habitualidade</h4>

                  {/* Status Card */}
                  <div className={`p-6 rounded-2xl border ${selectedShooter.affiliation_expiry && new Date(selectedShooter.affiliation_expiry) > new Date() ? 'bg-green-600/10 border-green-600/20' : 'bg-red-600/10 border-red-600/20'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Situação da Filiação</span>
                      {selectedShooter.affiliation_expiry && new Date(selectedShooter.affiliation_expiry) > new Date()
                        ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                        : <ShieldAlert className="w-4 h-4 text-red-500" />
                      }
                    </div>
                    <div className="text-xl font-black text-white uppercase italic">
                      {selectedShooter.affiliation_expiry
                        ? (new Date(selectedShooter.affiliation_expiry) > new Date() ? 'VIGENTE' : 'VENCIDO')
                        : 'PENDENTE'}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold mt-1">
                      Vencimento: {selectedShooter.affiliation_expiry ? new Date(selectedShooter.affiliation_expiry).toLocaleDateString() : '--/--/----'}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsRenewModalOpen(true)}
                    className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all bg-green-600 text-white shadow-xl shadow-green-600/20 hover:bg-green-700 active:scale-95 border-none outline-none cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lançar Anuidade / Renovar</span>
                  </button>

                  <button
                    onClick={() => {
                      setSessionData({
                        firearm_id: '',
                        firearm_model: '',
                        caliber: '',
                        total_shots: 0,
                        lane_number: '01',
                        distance_meters: 10
                      });
                      setShowAddSessionModal(true);
                    }}
                    className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all bg-white/5 text-white hover:bg-white/10 active:scale-95 border border-white/10 outline-none cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Lançar Habitualidade</span>
                  </button>
                  <button onClick={handleToggleStatus} className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5">
                    {selectedShooter.status === 'active' ? (
                      <><ShieldAlert className="w-4 h-4" /> Bloquear Acesso</>
                    ) : (
                      <><CheckCircle2 className="w-4 h-4" /> Reativar Acesso</>
                    )}
                  </button>
                  <button onClick={handleDeleteShooter} className="w-full py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all bg-red-600/5 text-red-500/50 hover:bg-red-600/10 hover:text-red-500 border border-red-600/10">
                    <Trash2 className="w-4 h-4" /> Excluir Registro
                  </button>
                </div>

                {/* Training Logs */}
                <div className="glass p-8 rounded-[40px] border-white/5 bg-white/[0.01]">
                  <div className="flex justify-between items-center mb-8">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 italic">Histórico de Treinos</h4>
                    {shooterSessions.length > 0 && (
                      <button
                        onClick={() => generateHabitualidadePDF(selectedShooter, shooterSessions)}
                        className="px-4 py-2 bg-red-600/10 text-red-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-600/20"
                      >
                        Gerar PDF
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {shooterSessions.length > 0 ? (
                      shooterSessions.map(session => (
                        <div key={session.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-red-600/5 transition-all">
                          <div>
                            <span className="block text-xs font-black text-white uppercase">{session.firearm_model}</span>
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{new Date(session.check_in_at).toLocaleDateString()} • {session.total_shots} disparos</span>
                          </div>
                          <div className="p-2 bg-red-600/10 rounded-lg text-red-600">
                            <History className="w-3 h-3" />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-20 text-center">
                        <p className="text-[10px] text-gray-700 font-black uppercase tracking-widest italic">Nenhum treino registrado</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes da Solicitação */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center md:p-6 bg-black/95 md:backdrop-blur-xl animate-in fade-in duration-300">
          <div className="glass w-full md:max-w-4xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto md:rounded-[48px] p-6 md:p-10 border-blue-600/20 custom-scrollbar relative bg-[#0a0a0a]">
            <button onClick={() => setSelectedRequest(null)} className="absolute top-6 md:top-8 right-6 md:right-8 p-3 md:p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all z-20">
              <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="flex items-start gap-8 mb-8">
              <div className="w-24 h-24 rounded-3xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center text-blue-600 font-black text-4xl italic flex-shrink-0">
                {selectedRequest.full_name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">{selectedRequest.full_name}</h2>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mt-2">Solicitação de Filiação</p>
                <span className="inline-block mt-4 px-4 py-1.5 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase tracking-widest border border-yellow-500/20">
                  Aguardando Aprovação
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Dados Pessoais</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] uppercase text-gray-600 font-bold">CPF</span>
                    <span className="text-white font-bold">{selectedRequest.cpf}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-gray-600 font-bold">RG</span>
                    <span className="text-white font-bold">{selectedRequest.rg} (Emissão: {new Date(selectedRequest.rg_date).toLocaleDateString()})</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-gray-600 font-bold">Nascimento</span>
                    <span className="text-white font-bold">{new Date(selectedRequest.birth_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Contato & Endereço</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] uppercase text-gray-600 font-bold">Contato</span>
                    <span className="text-white font-bold block">{selectedRequest.email}</span>
                    <span className="text-white font-bold block">{selectedRequest.phone}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-gray-600 font-bold">Endereço</span>
                    <span className="text-white font-bold block">{selectedRequest.address}</span>
                    <span className="text-white font-bold block">{selectedRequest.neighborhood} - {selectedRequest.city}/{selectedRequest.state}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleApproveRequest(selectedRequest)}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-green-600/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Aprovar e Cadastrar
              </button>
              <button
                onClick={() => handleRejectRequest(selectedRequest.id)}
                className="px-8 bg-red-600/10 hover:bg-red-600/20 text-red-500 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] transition-all border border-red-600/20"
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar/Editar Atirador */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/98 backdrop-blur-2xl">
          <div className="flex min-h-full items-center justify-center p-4 md:p-6">
            <div className="glass w-full max-w-4xl rounded-[32px] md:rounded-[48px] p-6 md:p-12 border-red-600/20 space-y-8 md:space-y-12 animate-in zoom-in-95 duration-500 bg-[#0a0a0a]">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white italic">{isEditMode ? 'Editar' : 'Novo'} <span className="text-red-600">Atirador</span></h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setIsEditMode(false);
                  }}
                  className="p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all border border-white/5"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSaveShooter} className="space-y-6 md:space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 italic">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3">Nome Completo</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 md:py-6 px-6 md:px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3">E-mail de Contato</label>
                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 md:py-6 px-6 md:px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3">CPF</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 md:py-6 px-6 md:px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={formData.cpf} onChange={e => setFormData({ ...formData, cpf: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3">Celular/WhatsApp</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 md:py-6 px-6 md:px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3">Categoria Operacional</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 md:py-6 px-6 md:px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm appearance-none" value={formData.membership_type} onChange={e => setFormData({ ...formData, membership_type: e.target.value })}>
                      <option value="Recruta" className="bg-zinc-900">Recruta</option>
                      <option value="Elite" className="bg-zinc-900">Elite</option>
                      <option value="Master" className="bg-zinc-900">Master</option>
                      <option value="Instrutor" className="bg-zinc-900">Instrutor</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-3">Status do Cadastro</label>
                    <select
                      className="w-full bg-white/5 border border-white/10 rounded-3xl py-4 md:py-6 px-6 md:px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm appearance-none"
                      value={formData.status}
                      onChange={e => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active" className="bg-zinc-900">Ativo / Regular</option>
                      <option value="blocked" className="bg-zinc-900">Bloqueado / Inativo</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 p-8 bg-zinc-900/50 rounded-[32px] space-y-6 border border-white/5">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-6 rounded-full relative transition-all cursor-pointer ${formData.is_affiliated ? 'bg-red-600' : 'bg-gray-800'}`} onClick={() => setFormData({ ...formData, is_affiliated: !formData.is_affiliated })}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_affiliated ? 'left-5' : 'left-1'}`} />
                      </div>
                      <label className="text-xs font-black uppercase tracking-widest text-white cursor-pointer select-none italic">Este atirador é filiado ao clube?</label>
                    </div>

                    {formData.is_affiliated && (
                      <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Vencimento da Filiação (SIGMA/CR)</label>
                        <input type="date" className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={formData.affiliation_expiry} onChange={e => setFormData({ ...formData, affiliation_expiry: e.target.value })} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-grow bg-red-600 hover:bg-red-700 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-3 shadow-2xl shadow-red-600/30 group transition-all border-none outline-none cursor-pointer"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <span>{isEditMode ? 'Salvar Alterações' : 'Confirmar Cadastro'}</span>
                        <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setIsEditMode(false);
                    }}
                    className="px-10 border border-white/10 text-gray-500 rounded-3xl uppercase font-black text-[10px] hover:bg-white/5 transition-all border-none outline-none cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Adicionar Arma pelo Admin */}
      {showAddGunModal && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/95 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4 md:p-6">
            <div className="glass w-full max-w-xl rounded-[32px] md:rounded-[48px] p-6 md:p-12 border-red-600/20 space-y-8 md:space-y-10 bg-[#0a0a0a]">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Novo <span className="text-red-600">Armamento</span></h2>
                <button onClick={() => setShowAddGunModal(false)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all border border-white/5"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleAddGunToShooter} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Modelo</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={gunData.model} onChange={e => setGunData({ ...gunData, model: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Calibre</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={gunData.caliber} onChange={e => setGunData({ ...gunData, caliber: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Marca</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={gunData.brand} onChange={e => setGunData({ ...gunData, brand: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Número SIGMA</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={gunData.sigma_number} onChange={e => setGunData({ ...gunData, sigma_number: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Link da Foto (URL)</label>
                  <input type="url" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" placeholder="https://..." value={gunData.image_url} onChange={e => setGunData({ ...gunData, image_url: e.target.value })} />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-red-600/30 transition-all border-none outline-none cursor-pointer">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Registrar no Arsenal'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Renovação Anuidade */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setIsRenewModalOpen(false)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-white italic">Renovar <span className="text-green-500">Filiação</span></h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Lançamento Financeiro e Validação</p>
              </div>
              <button onClick={() => setIsRenewModalOpen(false)}><X size={20} className="text-gray-500 hover:text-white transition-colors" /></button>
            </div>
            <form onSubmit={handleRenewMembership} className="p-8 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block ml-2">Valor da Anuidade (R$)</label>
                <input required type="number" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xl font-black text-white focus:border-green-500 outline-none transition-colors" value={renewData.amount} onChange={e => setRenewData({ ...renewData, amount: parseFloat(e.target.value) })} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block ml-2">Nova Data de Vencimento</label>
                <input required type="date" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm font-bold text-white focus:border-green-500 outline-none transition-colors" value={renewData.validity_date} onChange={e => setRenewData({ ...renewData, validity_date: e.target.value })} />
                <p className="text-[9px] text-gray-600 mt-2 ml-2">O acesso ao clube será liberado até esta data.</p>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block ml-2">Método de Pagamento</label>
                <div className="grid grid-cols-3 gap-3">
                  {['PIX', 'CARTÃO', 'DINHEIRO'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setRenewData({ ...renewData, payment_method: m })}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${renewData.payment_method === m ? 'bg-green-600 border-green-600 text-white' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-green-600/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirmar Renovação</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lançar Habitualidade */}
      {showAddSessionModal && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-black/95 backdrop-blur-md">
          <div className="flex min-h-full items-center justify-center p-4 md:p-6">
            <div className="glass w-full max-w-xl rounded-[32px] md:rounded-[48px] p-6 md:p-12 border-red-600/20 space-y-8 md:space-y-10 animate-in zoom-in-95 duration-300 bg-[#0a0a0a]">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-white italic">Registrar <span className="text-red-600">Habitualidade</span></h2>
                  <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">Atirador: {selectedShooter?.name}</p>
                </div>
                <button onClick={() => setShowAddSessionModal(false)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white transition-all border border-white/5"><X className="w-6 h-6" /></button>
              </div>

              <form onSubmit={handleAddSession} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Arma Utilizada</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm appearance-none"
                    value={sessionData.firearm_id}
                    onChange={(e) => {
                      const gun = shooterArsenal.find(g => g.id === e.target.value);
                      if (gun) {
                        setSessionData({
                          ...sessionData,
                          firearm_id: gun.id,
                          firearm_model: gun.model,
                          caliber: gun.caliber
                        });
                      } else if (e.target.value === 'CLUB') {
                        setSessionData({
                          ...sessionData,
                          firearm_id: '',
                          firearm_model: 'Arma do Clube',
                          caliber: ''
                        });
                      }
                    }}
                  >
                    <option value="" className="bg-zinc-900">Selecione uma arma...</option>
                    <option value="CLUB" className="bg-zinc-900">Arma do Clube</option>
                    {shooterArsenal.map(gun => (
                      <option key={gun.id} value={gun.id} className="bg-zinc-900">{gun.model} ({gun.caliber})</option>
                    ))}
                  </select>
                </div>

                {!sessionData.firearm_id && sessionData.firearm_model !== 'Arma do Clube' && (
                  <div className="grid grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Modelo</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={sessionData.firearm_model} onChange={e => setSessionData({ ...sessionData, firearm_model: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Calibre</label>
                      <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={sessionData.caliber} onChange={e => setSessionData({ ...sessionData, caliber: e.target.value })} />
                    </div>
                  </div>
                )}

                {sessionData.firearm_model === 'Arma do Clube' && (
                  <div className="space-y-2 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Calibre Utilizado</label>
                    <input type="text" placeholder="Ex: 9mm, .38, .40" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={sessionData.caliber} onChange={e => setSessionData({ ...sessionData, caliber: e.target.value })} />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Quantidade de Disparos</label>
                    <input type="number" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={sessionData.total_shots} onChange={e => setSessionData({ ...sessionData, total_shots: parseInt(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Número da Raia</label>
                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={sessionData.lane_number} onChange={e => setSessionData({ ...sessionData, lane_number: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 italic">Distância do Alvo (Metros)</label>
                  <input type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white outline-none focus:border-red-600 font-bold transition-all text-sm" value={sessionData.distance_meters} onChange={e => setSessionData({ ...sessionData, distance_meters: parseInt(e.target.value) })} />
                </div>

                <button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-3xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-red-600/30 transition-all mt-4 border-none outline-none cursor-pointer">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : 'Confirmar Registro de Treino'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShootersView;
