
import React, { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  Star,
  Clock,
  ChevronRight,
  TrendingUp,
  Target,
  ArrowRight,
  X,
  Printer,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Image as ImageIcon,
  Search,
  UserCheck
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCourses, Course } from '../../hooks/useCourses';
import { useSystemSettings } from '../../hooks/useSystemSettings';
import { Button } from '../../components/ui/button';

const CourseManagementView: React.FC = () => {
  const { settings } = useSystemSettings();
  const {
    courses, loading, saveCourse, deleteCourse, fetchLeads,
    toggleCheckIn, registerLead, issueCertificate, addPayment,
    updateLead, confirmLead, deleteLead
  } = useCourses();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  // Profile Search State
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [profileSearch, setProfileSearch] = useState('');
  const [showProfileResults, setShowProfileResults] = useState(false);

  // Participant Editing State
  const [editingParticipant, setEditingParticipant] = useState<any>(null);

  // Payment Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentData, setPaymentData] = useState({ amount: 0, method: 'PIX', lead: null as any });

  const [showManualAdd, setShowManualAdd] = useState(false);
  const [manualData, setManualData] = useState({
    name: '',
    email: '',
    phone: '',
    total_amount: 0,
    amount_paid: 0,
    payment_method: 'PIX'
  });

  const [formData, setFormData] = useState<Partial<Course>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '08:00',
    end_time: '18:00',
    category: '',
    description: '',
    image_url: '',
    price: '',
    slots: 0
  });

  useEffect(() => {
    const fetchProfiles = async () => {
      // Assuming 'supabase' is available in the context or imported
      // For this example, I'll mock it or assume it's globally available as per typical Supabase setups.
      // If supabase is not globally available, it needs to be imported or passed.
      // For the purpose of this edit, I'll assume `supabase` is accessible.
      // If not, the user would need to provide the import for `supabase`.
      // Example: import { supabase } from '../../lib/supabaseClient';
      const { data } = await supabase.from('profiles').select('name, email, phone, membership_type').order('name');
      if (data) setAllProfiles(data);
    };
    fetchProfiles();
  }, []);

  const handleSelectProfile = (profile: any) => {
    setManualData({
      ...manualData,
      name: profile.name,
      email: profile.email,
      phone: profile.phone || '',
    });
    setProfileSearch(profile.name);
    setShowProfileResults(false);
  };

  const handleEditClick = (course: Course) => {
    setFormData(course);
    setSelectedCourse(course);
    setIsEditModalOpen(true);
  };

  const handleNewClick = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      start_time: '08:00',
      end_time: '18:00',
      category: '',
      description: '',
      image_url: '',
      price: '',
      slots: 20
    });
    setSelectedCourse(null);
    setIsEditModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData, id: selectedCourse?.id || undefined };
    const result = await saveCourse(payload);
    if (result.success) {
      setIsEditModalOpen(false);
      setSelectedCourse(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deseja realmente excluir este treinamento?')) {
      const result = await deleteCourse(id);
      if (result.success) setIsEditModalOpen(false);
    }
  };

  const handleViewParticipants = async (course: Course) => {
    setSelectedCourse(course);
    setIsParticipantsModalOpen(true);
    setLoadingParticipants(true);
    const basePrice = course.price ? parseFloat(course.price.replace(/[^\d.,]/g, '').replace(',', '.')) : 0;
    setManualData(prev => ({ ...prev, total_amount: basePrice }));
    const data = await fetchLeads(course.id);
    setParticipants(data);
    setLoadingParticipants(false);
  };

  const handleToggleCheckIn = async (leadId: string, currentStatus: boolean) => {
    const result = await toggleCheckIn(leadId, !currentStatus);
    if (result.success) {
      setParticipants(prev => prev.map(p => p.id === leadId ? { ...p, checked_in: !currentStatus } : p));
    }
  };

  const handleIssueCertificate = async (leadId: string, currentStatus: boolean) => {
    const result = await issueCertificate(leadId, !currentStatus);
    if (result.success) {
      setParticipants(prev => prev.map(p => p.id === leadId ? { ...p, certificate_issued: !currentStatus, certificate_code: result.code } : p));
    }
  };

  const handleOpenPayment = (lead: any) => {
    const remaining = lead.total_amount - lead.amount_paid;
    setPaymentData({ amount: remaining, method: 'PIX', lead });
    setIsPaymentModalOpen(true);
  };

  const processPayment = async () => {
    if (paymentData.amount <= 0) return;
    const result = await addPayment(paymentData.lead.id, paymentData.amount, paymentData.method);
    if (result.success) {
      const data = await fetchLeads(selectedCourse!.id);
      setParticipants(data);
      setIsPaymentModalOpen(false);
    }
  };

  const handleConfirmLead = async (leadId: string) => {
    const result = await confirmLead(leadId);
    if (result.success) {
      setParticipants(prev => prev.map(p => p.id === leadId ? { ...p, status: 'confirmed' } : p));
    }
  };

  const handleUpdateParticipant = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await updateLead(editingParticipant.id, editingParticipant);
    if (result.success) {
      const data = await fetchLeads(selectedCourse!.id);
      setParticipants(data);
      setEditingParticipant(null);
    }
  };

  const handleDeleteParticipant = async (leadId: string) => {
    if (confirm('Deseja remover este inscrito? Isso também estornará a vaga.')) {
      const result = await deleteLead(leadId, selectedCourse!.id);
      if (result.success) {
        setParticipants(prev => prev.filter(p => p.id !== leadId));
      }
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    const result = await registerLead(selectedCourse.id, manualData);
    if (result.success) {
      setShowManualAdd(false);
      setProfileSearch('');
      setManualData({
        name: '', email: '', phone: '',
        total_amount: selectedCourse.price ? parseFloat(selectedCourse.price.replace(/[^\d.,]/g, '').replace(',', '.')) : 0,
        amount_paid: 0, payment_method: 'PIX'
      });
      const data = await fetchLeads(selectedCourse.id);
      setParticipants(data);
    }
  };

  const handlePrintCertificate = (p: any) => {
    const win = window.open('', '', 'height=800,width=1100');
    win?.document.write(`
      <html>
        <head>
          <title>Certificado - ${p.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;900&display=swap');
            body { 
              font-family: 'Outfit', sans-serif; 
              margin: 0; padding: 0; background: #000; color: #fff;
              display: flex; align-items: center; justify-content: center; height: 100vh;
            }
            .cert-body {
              width: 1000px; height: 700px; border: 15px solid #dc2626; padding: 60px;
              position: relative; text-align: center; background: #0a0a0a;
              box-sizing: border-box; overflow: hidden;
            }
            .logo-bg {
              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
              width: 600px; height: 600px; opacity: 0.03; filter: grayscale(1);
              z-index: 0; pointer-events: none;
            }
            .cert-corner { position: absolute; width: 100px; height: 100px; border: 2px solid #dc2626; z-index: 2; }
            .top-left { top: 20px; left: 20px; border-right: 0; border-bottom: 0; }
            .bottom-right { bottom: 20px; right: 20px; border-left: 0; border-top: 0; }
            
            .header-info { position: absolute; top: 40px; left: 0; right: 0; display: flex; flex-direction: column; align-items: center; gap: 5px; z-index: 2; }
            .header-info img { height: 40px; margin-bottom: 5px; }
            .club-title { font-size: 10px; font-weight: 900; letter-spacing: 5px; color: #dc2626; text-transform: uppercase; }

            h1 { font-size: 85px; font-weight: 900; margin: 60px 0 0 0; letter-spacing: -5px; color: #dc2626; position: relative; z-index: 2; }
            h2 { font-size: 24px; font-weight: 400; text-transform: uppercase; letter-spacing: 12px; margin-top: -10px; opacity: 0.5; position: relative; z-index: 2; }
            
            .content { margin-top: 60px; font-size: 24px; line-height: 1.6; position: relative; z-index: 2; }
            .name { font-size: 52px; font-weight: 900; color: #fff; margin: 25px 0; border-bottom: 3px solid #dc2626; display: inline-block; padding: 0 50px; text-transform: uppercase; }
            .course { font-weight: 900; color: #dc2626; package: uppercase; }
            
            .footer { position: absolute; bottom: 85px; left: 0; right: 0; display: flex; justify-content: space-around; align-items: flex-end; z-index: 2; }
            .signature { border-top: 1px solid #333; width: 260px; font-size: 14px; padding-top: 15px; text-transform: uppercase; font-weight: 900; }
            .code { position: absolute; bottom: 35px; left: 60px; font-size: 10px; color: #444; letter-spacing: 3px; z-index: 2; }
            .verify { position: absolute; bottom: 35px; right: 60px; font-size: 9px; color: #444; font-weight: bold; text-transform: uppercase; z-index: 2; }
          </style>
        </head>
        <body>
          <div class="cert-body">
            <img src="${settings?.logo_url || ''}" class="logo-bg" />
            <div class="cert-corner top-left"></div>
            <div class="cert-corner bottom-right"></div>
            
            <div class="header-info">
               ${settings?.logo_url ? `<img src="${settings.logo_url}" />` : ''}
               <div class="club-title">${settings?.club_name || 'ELITE SHIELD CLUB'}</div>
            </div>

            <h1>CERTIFICADO</h1>
            <h2>Elite Academy</h2>
            
            <div class="content">
              Certificamos para os devidos fins que o atirador(a)<br/>
              <div class="name">${p.name}</div><br/>
              concluiu o treinamento avançado de qualificação técnica em<br/>
              <span class="course">${selectedCourse?.title}</span><br/>
              realizado em ${selectedCourse ? new Date(selectedCourse.date).toLocaleDateString('pt-BR') : ''} na unidade ${settings?.club_name || ''}.
            </div>
            
            <div class="footer">
              <div class="signature">Instrutor em Campo<br/>Elite Shield</div>
              <div class="signature">Diretor Técnico<br/>Arsenal & Logística</div>
            </div>
            
            <div class="code">AUTENTICIDADE: ${p.certificate_code}</div>
            <div class="verify">Validado em: ${settings?.address || 'Área de Treinamento'}</div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => { window.print(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    win?.document.close();
  };

  const handlePrint = () => {
    const printContent = document.getElementById('participants-table');
    if (!printContent) return;

    const win = window.open('', '', 'height=700,width=900');
    win?.document.write('<html><head><title>Lista de Presença</title>');
    win?.document.write(`
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;900&display=swap');
        body { font-family: 'Outfit', sans-serif; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 4px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        .club-info h1 { margin: 0; font-size: 32px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; }
        .club-info p { margin: 2px 0; font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase; }
        .event-title { background: #000; color: #fff; display: inline-block; padding: 10px 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #eee; padding: 15px; text-align: left; font-size: 12px; }
        th { background-color: #f8f8f8; font-weight: 900; text-transform: uppercase; }
        .check-box { width: 20px; height: 20px; border: 2px solid #ddd; margin: 0 auto; }
        .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; pt-10; }
        @media print { .no-print { display: none; } }
      </style>
    `);
    win?.document.write('</head><body>');

    win?.document.write(`
      <div class="header">
        <div class="club-info">
          <h1>${settings?.club_name || 'ELITE SHIELD CLUB'}</h1>
          <p>${settings?.address || 'Área de Instrução Tática'}</p>
          <p>WhatsApp: ${settings?.whatsapp || ''} | E-mail: ${settings?.email_contact || ''}</p>
        </div>
        <div style="text-align: right">
          <div style="font-size: 10px; font-weight: 900; color: #666; text-transform: uppercase;">Folha de Registro</div>
          <div style="font-size: 18px; font-weight: 900;">LISTA DE PRESENÇA</div>
        </div>
      </div>
      
      <div class="event-title">${selectedCourse?.title} - ${selectedCourse ? new Date(selectedCourse.date).toLocaleDateString('pt-BR') : ''}</div>
      
      <table>
        <thead>
          <tr>
            <th style="width: 40px">Nº</th>
            <th>Nome do Atirador</th>
            <th style="width: 150px">Check-in / Assinatura</th>
          </tr>
        </thead>
        <tbody>
          ${participants.map((p, i) => `
            <tr>
              <td style="text-align: center; font-weight: bold;">${String(i + 1).padStart(2, '0')}</td>
              <td style="font-weight: 900; text-transform: uppercase;">${p.name}</td>
              <td><div class="check-box"></div></td>
            </tr>
          `).join('')}
          ${Array.from({ length: Math.max(0, 5) }).map(() => `
            <tr>
              <td style="color: #eee; text-align: center;">--</td>
              <td style="border-bottom: 1px dashed #eee;">&nbsp;</td>
              <td><div class="check-box"></div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">Documento gerado em ${new Date().toLocaleString()} para uso interno e controle de certificação.</div>
    `);

    win?.document.write('</body></html>');
    win?.document.close();
    win?.print();
  };

  return (
    <div className="space-y-10 animate-fade-in max-w-[1600px] mx-auto pb-20">
      {/* Header com Ações Estratégicas */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter leading-none">ELITE <span className="text-red-600">ACADEMY</span></h1>
          <p className="text-gray-500 text-sm mt-2">Gestão de currículo tático, instrutores e turmas.</p>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <button className="bg-white/5 hover:bg-white/10 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Calendário</span>
          </button>
          <button
            onClick={handleNewClick}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Treinamento</span>
          </button>
        </div>
      </div>

      {/* Overview de Academy */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Inscritos', value: courses.reduce((acc, c) => acc + (c.enrolled || 0), 0), icon: <Users size={14} />, color: 'blue' },
          { label: 'Cursos Ativos', value: courses.length, icon: <Target size={14} />, color: 'red' },
          { label: 'Ticket Médio', value: 'R$ 850', icon: <TrendingUp size={14} />, color: 'green' },
          { label: 'Média de Vagas', value: Math.round(courses.reduce((acc, c) => acc + (c.slots || 0), 0) / (courses.length || 1)), icon: <Star size={14} />, color: 'yellow' },
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

      {/* Lista de Cursos Detalhada */}
      <div className="space-y-6">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Currículo Ativo</h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="glass p-6 rounded-[32px] border-white/5 flex flex-col lg:flex-row items-center gap-8 group hover:border-red-600/30 transition-all">
              <div className="w-full lg:w-48 h-32 rounded-2xl overflow-hidden shrink-0 relative">
                <img src={course.image_url || 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2072'} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-white">{course.category}</span>
                </div>
              </div>

              <div className="flex-grow space-y-3 text-center lg:text-left">
                <h3 className="text-xl font-black uppercase tracking-tight text-white group-hover:text-red-500 transition-colors uppercase leading-none">{course.title}</h3>
                <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-gray-500">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-1">
                      {new Date(course.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none pt-1">
                      {course.start_time || '08:00'} {(course.start_time && course.end_time) ? '-' : ''} {course.end_time || ''}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:border-l lg:border-white/5 lg:pl-8 shrink-0 w-full lg:w-auto">
                <div className="text-center">
                  <span className="block text-[8px] uppercase text-gray-500 font-black mb-1">Inscritos</span>
                  <div className="flex items-center justify-center space-x-1 text-white font-black">
                    <span className={`${course.enrolled >= course.slots ? 'text-red-500' : 'text-blue-500'}`}>{course.enrolled || 0}</span>
                    <span className="text-gray-700">/</span>
                    <span>{course.slots}</span>
                  </div>
                  <div className="h-1 w-12 bg-white/5 rounded-full mx-auto mt-2 overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${((course.enrolled || 0) / course.slots) * 100}%` }} />
                  </div>
                </div>
                <div className="text-center">
                  <span className="block text-[8px] uppercase text-gray-500 font-black mb-1">Investimento</span>
                  <div className="flex items-center justify-center space-x-1 text-white font-black">
                    <span className="text-green-500 uppercase">{course.price}</span>
                  </div>
                </div>
                <div className="text-center hidden lg:block">
                  <span className="block text-[8px] uppercase text-gray-500 font-black mb-1">Status</span>
                  <span className={`text-[9px] font-black uppercase ${course.enrolled >= course.slots ? 'text-red-500' : 'text-green-500'}`}>
                    {course.enrolled >= course.slots ? 'Esgotado' : 'Vendas ON'}
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleEditClick(course)}
                    className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewParticipants(course)}
                    className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-gray-400 hover:text-white group/btn flex items-center space-x-2"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Inscritos</span>
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/98 backdrop-blur-2xl">
          <div className="flex min-h-full items-center justify-center p-4 md:p-6">
            <form
              onSubmit={handleSave}
              className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-2xl rounded-[32px] md:rounded-[40px] overflow-hidden shadow-3xl animate-in zoom-in-95 duration-300"
            >
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1 block italic">Gestão de Treinamento</span>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none">{selectedCourse ? 'Editar Curso' : 'Novo Curso'}</h3>
                </div>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-red-600 transition-all"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Título do Evento</label>
                    <input
                      required type="text"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600/50 outline-none transition-all font-bold"
                      value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Categoria (ex: Avançado)</label>
                    <input
                      required type="text"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600/50 outline-none transition-all font-bold text-xs"
                      value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Data do Curso</label>
                    <input required type="date" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600/50 outline-none transition-all font-bold text-xs" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Início</label>
                    <input type="time" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600/50 outline-none transition-all font-bold text-xs" value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Término</label>
                    <input type="time" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600/50 outline-none transition-all font-bold text-xs" value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Valor (ex: R$ 850)</label>
                    <input required type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600/50 outline-none transition-all font-bold text-xs uppercase" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Vagas Totais</label>
                    <input required type="number" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600/50 outline-none transition-all font-bold text-xs" value={formData.slots} onChange={e => setFormData({ ...formData, slots: parseInt(e.target.value) })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Link da Imagem de Fundo (Unsplash)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white focus:border-red-600/50 outline-none transition-all font-bold text-[10px]" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-1">Descrição do Curso</label>
                  <textarea rows={3} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-4 px-5 text-white focus:border-red-600/50 outline-none transition-all font-medium text-sm" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/5">
                  {selectedCourse && (
                    <Button type="button" variant="outline" onClick={() => handleDelete(selectedCourse.id)} className="flex-1 bg-transparent text-red-600 border-red-600/20 hover:bg-red-600 hover:text-white rounded-2xl h-14 font-black uppercase tracking-[0.2em] text-[10px]">Excluir</Button>
                  )}
                  <Button type="submit" className="flex-[2] bg-red-600 text-white rounded-2xl h-14 font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-red-600/20">Salvar Treinamento</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Modal */}
      {isParticipantsModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black/98 backdrop-blur-2xl">
          <div className="flex min-h-full items-center justify-center p-4 md:p-6">
            <div className="relative bg-[#0d0d0d] border border-white/10 w-full max-w-4xl rounded-[32px] md:rounded-[40px] overflow-hidden shadow-3xl animate-in fade-in duration-300">
              <div className="p-6 md:p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1 block italic">Lista de Presença & Certificados</span>
                  <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter leading-none italic">{selectedCourse?.title}</h3>
                </div>
                <div className="flex items-center gap-2 md:gap-4">
                  <button
                    onClick={() => setShowManualAdd(!showManualAdd)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${showManualAdd ? 'bg-red-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white border border-white/5'}`}
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden md:inline">Incluir Aluno</span>
                    <span className="md:hidden">Add</span>
                  </button>
                  <div className="w-px h-8 bg-white/5" />
                  <button
                    onClick={handlePrint}
                    className="bg-white/5 hover:bg-white/10 text-white p-3 rounded-2xl transition-all"
                    title="Imprimir Lista"
                  >
                    <Printer className="w-5 h-5 text-blue-500" />
                  </button>
                  <button onClick={() => setIsParticipantsModalOpen(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white hover:bg-red-600 transition-all"><X className="w-6 h-6" /></button>
                </div>
              </div>

              <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
                {showManualAdd && (
                  <form onSubmit={handleManualAdd} className="mb-12 p-8 bg-white/[0.02] border border-white/5 rounded-[32px] animate-in slide-in-from-top-4 duration-300">
                    <div className="flex justify-between items-center mb-8">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600 italic">Preencher Inscrição</h4>
                      <button type="button" onClick={() => setShowManualAdd(false)} className="text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all underline underline-offset-4">Cancelar</button>
                    </div>

                    {/* Busca de Filiados */}
                    <div className="mb-8 relative">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2 mb-2 block">Buscar Filiado/Atirador Existente</label>
                      <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-600 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Digite o nome para buscar no banco de dados..."
                          className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-bold outline-none focus:border-red-600"
                          value={profileSearch}
                          onChange={(e) => {
                            setProfileSearch(e.target.value);
                            setShowProfileResults(true);
                          }}
                          onFocus={() => setShowProfileResults(true)}
                        />
                      </div>

                      {showProfileResults && profileSearch.length >= 2 && (
                        <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                          {allProfiles.filter(p => p.name.toLowerCase().includes(profileSearch.toLowerCase())).map((p, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleSelectProfile(p)}
                              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 border-b border-white/5 last:border-0 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600 font-black text-xs uppercase italic">{p.name.charAt(0)}</div>
                                <div className="text-left">
                                  <span className="block text-sm font-black text-white uppercase tracking-tight">{p.name}</span>
                                  <span className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">{p.email}</span>
                                </div>
                              </div>
                              <div className="bg-white/5 px-3 py-1 rounded-md text-[8px] font-black text-gray-500 uppercase tracking-widest border border-white/5">{p.membership_type}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Nome Completo</label>
                        <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-red-600" value={manualData.name} onChange={e => setManualData({ ...manualData, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">E-mail</label>
                        <input required type="email" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-red-600" value={manualData.email} onChange={e => setManualData({ ...manualData, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">WhatsApp</label>
                        <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-red-600" value={manualData.phone} onChange={e => setManualData({ ...manualData, phone: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6 mt-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Valor Total (R$)</label>
                        <input required type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-red-600" value={manualData.total_amount || 0} onChange={e => setManualData({ ...manualData, total_amount: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Valor Pago / Sinal (R$)</label>
                        <input required type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-red-600" value={manualData.amount_paid || 0} onChange={e => setManualData({ ...manualData, amount_paid: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Metodo Pagamento</label>
                        <select className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-bold outline-none focus:border-red-600 appearance-none" value={manualData.payment_method} onChange={e => setManualData({ ...manualData, payment_method: e.target.value })}>
                          <option value="PIX">PIX</option>
                          <option value="CARTAO">CARTÃO</option>
                          <option value="DINHEIRO">DINHEIRO</option>
                          <option value="BOLETO">BOLETO</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button type="submit" className="bg-red-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20">Finalizar Inscrição</button>
                    </div>
                  </form>
                )}

                {loadingParticipants ? (
                  <div className="text-center py-20 grayscale opacity-20"><div className="w-12 h-12 border-2 border-red-600 border-t-transparent rounded-full mx-auto animate-spin" /></div>
                ) : participants.length === 0 ? (
                  <div className="text-center py-20 bg-white/[0.02] rounded-[32px] border border-white/5">
                    <BookOpen className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 font-black uppercase tracking-widest text-[10px]">Nenhum inscrito até o momento.</p>
                  </div>
                ) : (
                  <div id="participants-table">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 pb-4">
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 px-4">Nome do Atirador</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 text-center">Financeiro</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 px-4">Check-in</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 text-center">Certificado</th>
                          <th className="py-4 text-[10px] font-black uppercase tracking-widest text-gray-500 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {participants.map((p) => (
                          <tr key={p.id} className="border-b border-white/[0.02] hover:bg-white/[0.01] transition-all group">
                            <td className="py-5 px-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-black text-white uppercase tracking-tight">{p.name}</span>
                                  {p.source === 'frontend' && (
                                    <span className="text-[7px] font-black bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-md uppercase tracking-widest border border-blue-500/20">Site</span>
                                  )}
                                </div>
                                <span className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">{p.phone} • {p.email}</span>
                              </div>
                            </td>
                            <td className="py-5 px-4 text-center min-w-[150px]">
                              <div className="flex flex-col items-center">
                                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${p.payment_status === 'paid' ? 'bg-green-600/20 text-green-500' :
                                  p.payment_status === 'partial' ? 'bg-yellow-600/20 text-yellow-500' :
                                    'bg-red-600/20 text-red-500'
                                  }`}>
                                  {p.payment_status === 'paid' ? 'Pago' : p.payment_status === 'partial' ? 'Sinal Pago' : 'Pendente'}
                                </span>
                                <span className="text-[9px] font-bold text-gray-500 mt-1">
                                  {p.payment_status === 'paid' ? `Total R$ ${p.total_amount}` : `Falta R$ ${p.total_amount - (p.amount_paid || 0)}`}
                                </span>
                                {p.payment_status !== 'paid' && (
                                  <button
                                    onClick={() => handleOpenPayment(p)}
                                    className="mt-2 text-[8px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md transition-all"
                                  >
                                    Lançar Pagamento
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="py-5 px-4 w-40">
                              {p.status === 'pending' ? (
                                <button
                                  onClick={() => handleConfirmLead(p.id)}
                                  className="w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-yellow-600 text-white shadow-lg shadow-yellow-600/20 animate-pulse"
                                >
                                  Validar Inscrição
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleCheckIn(p.id, p.checked_in)}
                                  className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${p.checked_in ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-500 border border-white/5'}`}
                                >
                                  {p.checked_in && <CheckCircle2 className="w-3.5 h-3.5" />}
                                  <span>{p.checked_in ? 'Presente' : 'Check-in'}</span>
                                </button>
                              )}
                            </td>
                            <td className="py-5 px-4 text-center w-40">
                              <button
                                onClick={() => handleIssueCertificate(p.id, p.certificate_issued)}
                                disabled={!p.checked_in}
                                className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${!p.checked_in ? 'opacity-20 cursor-not-allowed' : (p.certificate_issued ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-500 border border-white/5')}`}
                              >
                                {p.certificate_issued && <CheckCircle2 className="w-3.5 h-3.5" />}
                                <span>{p.certificate_issued ? 'Emitido' : 'Emitir'}</span>
                              </button>
                            </td>
                            <td className="py-5 px-4 text-right">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => setEditingParticipant(p)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-gray-400 border border-white/5">
                                  <Edit className="w-4 h-4" />
                                </button>
                                {p.certificate_issued && (
                                  <button onClick={() => handlePrintCertificate(p)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-blue-500 border border-white/5" title="Ver Certificado">
                                    <Printer className="w-4 h-4" />
                                  </button>
                                )}
                                <button onClick={() => handleDeleteParticipant(p.id)} className="p-2.5 bg-white/5 rounded-xl hover:bg-red-600/20 text-red-600 border border-white/5" title="Remover Inscrição">
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
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPaymentModalOpen(false)} />
          <div className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Lançar Recebimento</h3>
              <button onClick={() => setIsPaymentModalOpen(false)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Quanto deseja lançar? (R$)</label>
                <input type="number" className="w-full bg-black border border-white/10 rounded-2xl p-4 text-xl font-black text-white focus:border-red-600 outline-none" value={paymentData.amount} onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Método</label>
                <div className="grid grid-cols-2 gap-2">
                  {['PIX', 'CARTÃO', 'DINHEIRO', 'BOLETO'].map(m => (
                    <button key={m} onClick={() => setPaymentData({ ...paymentData, method: m })} className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${paymentData.method === m ? 'bg-red-600 border-red-600 text-white' : 'border-white/5 text-gray-500 hover:bg-white/5'}`}>{m}</button>
                  ))}
                </div>
              </div>
              <button onClick={processPayment} className="w-full bg-red-600 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-red-600/20">Confirmar e Lançar no Financeiro</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Participant Modal */}
      {editingParticipant && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setEditingParticipant(null)} />
          <form onSubmit={handleUpdateParticipant} className="relative bg-[#1a1a1a] border border-white/10 w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-white italic">Editar Atirador</h3>
              <button type="button" onClick={() => setEditingParticipant(null)}><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Nome Completo</label>
                <input required type="text" className="w-full bg-black border border-white/10 rounded-2xl py-3 px-5 text-white font-bold outline-none focus:border-red-600" value={editingParticipant.name} onChange={e => setEditingParticipant({ ...editingParticipant, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">E-mail</label>
                <input required type="email" className="w-full bg-black border border-white/10 rounded-2xl py-3 px-5 text-white font-bold outline-none focus:border-red-600" value={editingParticipant.email} onChange={e => setEditingParticipant({ ...editingParticipant, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">WhatsApp</label>
                <input required type="text" className="w-full bg-black border border-white/10 rounded-2xl py-3 px-5 text-white font-bold outline-none focus:border-red-600" value={editingParticipant.phone} onChange={e => setEditingParticipant({ ...editingParticipant, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Valor Total (R$)</label>
                  <input required type="number" className="w-full bg-black border border-white/10 rounded-2xl py-3 px-5 text-white font-bold outline-none focus:border-red-600" value={editingParticipant.total_amount} onChange={e => setEditingParticipant({ ...editingParticipant, total_amount: parseFloat(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Valor Pago (R$)</label>
                  <input required type="number" className="w-full bg-black border border-white/10 rounded-2xl py-3 px-5 text-white font-bold outline-none focus:border-red-600" value={editingParticipant.amount_paid} onChange={e => setEditingParticipant({ ...editingParticipant, amount_paid: parseFloat(e.target.value) })} />
                </div>
              </div>
              <button type="submit" className="w-full bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CourseManagementView;
