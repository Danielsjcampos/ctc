
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Permission } from '../types';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data && !error) {
      setUser(data as User);
    }
  };

  const signIn = async (identifier: string, password: string) => {
    let email = identifier;

    // Se o identificador parecer um CPF (apenas números ou formato CPF)
    const isCpf = /^[0-9.-]+$/.test(identifier) && identifier.replace(/\D/g, '').length === 11;

    if (isCpf) {
      const cleanCpf = identifier.replace(/\D/g, '');
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('cpf', cleanCpf)
        .single();

      if (profile?.email) {
        email = profile.email;
      } else {
        return { error: 'CPF não encontrado no sistema.' };
      }
    }

    // DEMO LOGIN BYPASS
    // Admin Master
    if (identifier === 'admin.ctc@ctccruzeiro.com.br' && password === 'ctc-2024') {
      setUser({
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // Matches database_setup.sql
        name: 'Admin Master',
        email: 'admin.ctc@ctccruzeiro.com.br',
        role: 'ADMIN',
        cpf: '00000000000',
        status: 'active',
        created_at: new Date().toISOString(),
      } as User);
      return { error: null };
    }

    // Ricardo - Member
    if (identifier === 'ricardo.ctc@teste.com' && password === 'ctc123') {
      setUser({
        id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', // Matches database_setup.sql
        name: 'Ricardo Alencar',
        email: 'ricardo.ctc@teste.com',
        role: 'SHOOTER',
        cpf: '11122233344',
        status: 'active',
        created_at: new Date().toISOString(),
      } as User);
      return { error: null };
    }

    // Generic Admin Fallback
    if (identifier === 'admin@ctc.com' && password === 'admin123') {
      setUser({
        id: 'demo-admin-fallback',
        name: 'Admin Fallback',
        email: 'admin@ctc.com',
        role: 'ADMIN',
        cpf: '00000000000',
        status: 'active',
        created_at: new Date().toISOString(),
      } as User);
      return { error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return { error: 'Credenciais inválidas ou acesso não autorizado.' };

    await fetchProfile(data.user.id);
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetchProfile(session.user.id);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
