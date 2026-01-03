
import React, { useState } from 'react';
import { UserPlus, Shield, Settings, Trash2, Mail, BadgeCheck, CheckSquare, Square } from 'lucide-react';
import { Permission, UserRole } from '../../types';

interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  permissions: Permission[];
}

const StaffManagementView: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [staff, setStaff] = useState<StaffMember[]>([
    { 
      id: '1', name: 'Cap. Nascimento', role: 'INSTRUCTOR', email: 'nascimento@elite.com', 
      permissions: ['VIEW_DASHBOARD', 'VIEW_AGENDA', 'MANAGE_CHECKIN'] 
    },
    { 
      id: '2', name: 'Ana Souza', role: 'STAFF', email: 'ana@elite.com', 
      permissions: ['VIEW_DASHBOARD', 'MANAGE_CHECKIN', 'VIEW_AGENDA', 'MANAGE_SHOOTERS'] 
    }
  ]);

  const availablePermissions: { key: Permission, label: string }[] = [
    { key: 'VIEW_DASHBOARD', label: 'Ver Dashboard' },
    { key: 'MANAGE_CHECKIN', label: 'Gerenciar Check-in' },
    { key: 'MANAGE_SHOOTERS', label: 'Gerenciar Atiradores' },
    { key: 'VIEW_AGENDA', label: 'Ver Agenda/Pistas' },
    { key: 'VIEW_FINANCE', label: 'Ver Financeiro' },
    { key: 'MANAGE_COURSES', label: 'Gerenciar Cursos' },
    { key: 'VIEW_COMPLIANCE', label: 'Ver Auditoria' },
    { key: 'MANAGE_STAFF', label: 'Gerenciar Equipe' },
  ];

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const togglePermission = (perm: Permission) => {
    if (!editingStaff) return;
    const newPerms = editingStaff.permissions.includes(perm)
      ? editingStaff.permissions.filter(p => p !== perm)
      : [...editingStaff.permissions, perm];
    setEditingStaff({ ...editingStaff, permissions: newPerms });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter">Gestão de <span className="text-red-600">Equipe</span></h1>
          <p className="text-gray-500 text-sm">Controle quem acessa cada módulo do sistema.</p>
        </div>
        <button 
          onClick={() => { setEditingStaff({ id: '', name: '', role: 'INSTRUCTOR', email: '', permissions: [] }); setIsModalOpen(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Contratar Staff/Instrutor</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((member) => (
          <div key={member.id} className="glass p-8 rounded-[40px] border-white/5 space-y-6 group hover:border-blue-600/30 transition-all">
            <div className="flex justify-between items-start">
               <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                 <Shield className="w-8 h-8" />
               </div>
               <div className="flex space-x-2">
                 <button onClick={() => { setEditingStaff(member); setIsModalOpen(true); }} className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all"><Settings className="w-4 h-4" /></button>
                 <button className="p-3 bg-white/5 rounded-xl text-gray-500 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
               </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-black uppercase text-white">{member.name}</h3>
              <div className="flex items-center space-x-2">
                <BadgeCheck className="w-3 h-3 text-blue-500" />
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{member.role}</span>
              </div>
              <p className="text-xs text-gray-500">{member.email}</p>
            </div>

            <div className="pt-6 border-t border-white/5">
               <span className="block text-[8px] font-black uppercase tracking-widest text-gray-500 mb-3">Módulos Liberados</span>
               <div className="flex flex-wrap gap-2">
                 {member.permissions.map(p => (
                   <span key={p} className="px-2 py-1 bg-white/5 rounded text-[8px] font-bold text-gray-300 uppercase">
                     {p.replace('VIEW_', '').replace('MANAGE_', '').replace('_', ' ')}
                   </span>
                 ))}
                 {member.permissions.length === 0 && <span className="text-[8px] text-gray-600 uppercase font-black">Nenhum Acesso</span>}
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição de Permissões (Simulado) */}
      {isModalOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass w-full max-w-2xl rounded-[40px] p-10 border-white/10 space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Configurar <span className="text-blue-500">Acessos</span></h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white">Fechar</button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
               <div className="space-y-4">
                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Nome do Profissional</label>
                 <input 
                  type="text" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 transition-all" 
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                 />
               </div>
               <div className="space-y-4">
                 <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Cargo</label>
                 <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-600 transition-all"
                  value={editingStaff.role}
                  onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value as UserRole})}
                 >
                   <option value="INSTRUCTOR">Instrutor</option>
                   <option value="STAFF">Staff / Recepção</option>
                 </select>
               </div>
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500">Módulos e Ações Permitidas</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availablePermissions.map(p => (
                  <button 
                    key={p.key}
                    onClick={() => togglePermission(p.key)}
                    className={`flex items-center space-x-3 p-4 rounded-2xl border transition-all text-left ${
                      editingStaff.permissions.includes(p.key) 
                      ? 'bg-blue-600/10 border-blue-600 text-white' 
                      : 'bg-white/5 border-white/5 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    {editingStaff.permissions.includes(p.key) ? <CheckSquare className="w-5 h-5 text-blue-500" /> : <Square className="w-5 h-5" />}
                    <span className="text-xs font-bold uppercase tracking-tight">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex gap-4">
               <button onClick={() => setIsModalOpen(false)} className="flex-grow bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">Salvar Alterações</button>
               <button onClick={() => setIsModalOpen(false)} className="px-8 border border-white/10 rounded-2xl text-xs font-black uppercase text-gray-500 hover:text-white">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementView;
