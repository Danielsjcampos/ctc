
import React, { useState } from 'react';
import { useAuth } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Mail, 
  Key, 
  Loader2, 
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  Info,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const LoginSelection: React.FC = () => {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [seedLogs, setSeedLogs] = useState<string[]>([]);

  const testUsers = [
    { name: 'Admin Master', email: 'admin.ctc@ctccruzeiro.com.br', pass: 'ctc-2024', role: 'ADMIN', cpf: '00000000000' },
    { name: 'Ricardo Alencar', email: 'ricardo.ctc@teste.com', pass: 'ctc123', role: 'Elite', cpf: '11122233344' },
    { name: 'Mariana Silva', email: 'mariana.ctc@teste.com', pass: 'ctc123', role: 'Operador', cpf: '55566677788' },
    { name: 'João Carlos', email: 'joao.ctc@teste.com', pass: 'ctc123', role: 'Recruta', cpf: '99900011122' },
  ];

  React.useEffect(() => {
    if (user) {
      const paths = { ADMIN: '/admin', STAFF: '/admin', INSTRUCTOR: '/instructor', SHOOTER: '/portal' };
      navigate(paths[user.role] || '/portal');
    }
  }, [user, navigate]);

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn(customEmail || identifier, customPass || password);
      if (result.error) {
        setError(customEmail ? `Falha no acesso rápido de ${customEmail}. Use o botão de Reset abaixo primeiro.` : result.error);
        setLoading(false);
      }
    } catch (err) {
      setError("Erro de conexão com o banco de dados.");
      setLoading(false);
    }
  };

  const addLog = (msg: string) => setSeedLogs(prev => [...prev.slice(-3), msg]);

  const seedDatabase = async () => {
    setIsInitializing(true);
    setSeedSuccess(false);
    setSeedLogs(["Iniciando reset forçado..."]);
    
    try {
      // Sincronizar produtos básicos
      await supabase.from('products').upsert([
        { name: 'Munição .9mm Magtech (50un)', category: 'Municao', price: 195.00, stock: 2500, business_unit: 'SHOP' }
      ], { onConflict: 'name' });

      for (const u of testUsers) {
        addLog(`Preparando: ${u.name}...`);
        
        // Criar ou Pegar usuário Auth
        const { data: authData } = await supabase.auth.signUp({
          email: u.email,
          password: u.pass,
          options: { data: { name: u.name, role: u.role === 'ADMIN' ? 'ADMIN' : 'SHOOTER' } }
        });

        let userId = authData?.user?.id;
        if (!userId) {
          const { data: loginData } = await supabase.auth.signInWithPassword({ email: u.email, password: u.pass });
          userId = loginData?.user?.id;
        }

        if (userId) {
          // Forçar Perfil
          await supabase.from('profiles').upsert({
            id: userId,
            name: u.name,
            email: u.email,
            cpf: u.cpf,
            role: u.role === 'ADMIN' ? 'ADMIN' : 'SHOOTER',
            status: 'active',
            membership_type: u.role
          });

          if (u.role !== 'ADMIN') {
            // Recriar arsenal padrão
            await supabase.from('firearms').delete().eq('owner_id', userId);
            await supabase.from('firearms').insert([
              { owner_id: userId, model: 'Glock G19 Gen5', brand: 'Glock', caliber: '.9mm', sigma_number: `SIGMA-${Math.floor(Math.random() * 99999)}`, status: 'active' }
            ]);
          }
        }
      }
      
      setSeedSuccess(true);
      setError(null);
      addLog("Sistema resetado com sucesso!");
      setTimeout(() => { setSeedSuccess(false); setSeedLogs([]); }, 5000);
    } catch (err) {
      addLog("Falha na sincronização.");
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 relative overflow-hidden text-white">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />

      <div className="w-full max-w-5xl z-10 grid lg:grid-cols-2 gap-12 items-center animate-fade-in">
        <div className="space-y-8">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
            <div className="w-20 h-20 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20 shadow-2xl shadow-blue-600/20">
              <ShieldCheck className="w-12 h-12 text-blue-500" />
            </div>
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tighter text-white uppercase">CTC-CRUZEIRO</h1>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-red-600">Portal Digital de Defesa</p>
            </div>
          </div>

          <div className="glass p-10 rounded-[40px] border-white/5 space-y-6">
            <form onSubmit={(e) => handleLogin(e)} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Acesso (E-mail ou CPF)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="text" required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="ex: ricardo.ctc@teste.com" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Senha</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white focus:border-blue-600 outline-none transition-all" />
                </div>
              </div>
              {error && (
                <div className="p-4 bg-red-600/10 border border-red-600/20 rounded-xl flex items-start space-x-3 text-red-500 text-[10px] font-bold uppercase leading-relaxed">
                  <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center space-x-3 shadow-xl shadow-blue-600/20">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Acessar Painel</span>}
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-500">Acessos Rápidos (Teste)</h3>
            <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">Senha padrão: <span className="text-white">ctc123</span></p>
          </div>
          <div className="grid gap-3">
            {testUsers.map((u) => (
              <button key={u.email} onClick={() => handleLogin(undefined, u.email, u.pass)} className="group flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-blue-600/40 transition-all">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black border border-white/10 ${u.role === 'ADMIN' ? 'bg-red-600/10 text-red-500' : 'bg-blue-600/10 text-blue-500'}`}>{u.name.charAt(0)}</div>
                  <div className="text-left">
                    <span className="block text-sm font-black text-white group-hover:text-blue-500 transition-colors">{u.name}</span>
                    <span className="text-[9px] uppercase font-black text-gray-600 tracking-widest">{u.role}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            ))}
            <div className="mt-6 space-y-4">
              <button onClick={seedDatabase} disabled={isInitializing} className={`w-full flex items-center justify-center space-x-3 py-4 border border-dashed rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${seedSuccess ? 'bg-green-600/10 border-green-600 text-green-500' : 'border-blue-600/30 text-blue-500 hover:bg-blue-600/10'}`}>
                {isInitializing ? <Loader2 className="w-4 h-4 animate-spin" /> : seedSuccess ? <CheckCircle className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isInitializing ? 'Sincronizando...' : 'Popular Todo o Sistema'}</span>
              </button>
              {seedLogs.length > 0 && (
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-1">
                   {seedLogs.map((log, i) => (
                     <div key={i} className="flex items-center space-x-2 text-[9px] font-bold text-gray-500 uppercase tracking-tighter">
                        <div className="w-1 h-1 bg-blue-500 rounded-full" />
                        <span>{log}</span>
                     </div>
                   ))}
                </div>
              )}
              <div className="flex items-start space-x-3 p-4 bg-blue-600/5 rounded-2xl border border-blue-600/10">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                  Caso já tenha testado o sistema antes, clique em <span className="text-white">Popular Todo o Sistema</span> para forçar a criação das novas contas <span className="text-white">.ctc</span> com a senha padrão.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
