
import React from 'react';
import { 
  Shield, 
  Target, 
  Award, 
  Users, 
  Zap, 
  Lock, 
  CheckCircle2, 
  FileText, 
  Crosshair, 
  Calendar,
  Phone,
  Mail,
  Instagram,
  Facebook,
  MapPin
} from 'lucide-react';
import { Benefit, Plan, Course } from './types';

export const BENEFITS: Benefit[] = [
  {
    title: 'Estandes Automatizados',
    description: 'Pistas indoor de 25m e outdoor até 100m com alvos eletrônicos.',
    icon: 'target'
  },
  {
    title: 'Arsenal para Locação',
    description: 'Mais de 40 modelos de armas curtas e longas à disposição dos sócios.',
    icon: 'shield'
  },
  {
    title: 'Ambiente Familiar',
    description: 'Espaço social, bar gourmet e área kids com total segurança.',
    icon: 'users'
  },
  {
    title: 'Assessoria em CR',
    description: 'Despachante especializado para toda a documentação legal.',
    icon: 'zap'
  }
];

export const PLANS: Plan[] = [
  {
    id: 'base',
    name: 'Recruta',
    price: 'R$ 159',
    period: 'por mês',
    description: 'A porta de entrada para o esporte.',
    features: [
      'Acesso aos estandes (horário comercial)',
      'Desconto em munição do clube',
      'Certificado de habitualidade digital',
      'Uso de 1 raia (60 min)'
    ]
  },
  {
    id: 'pro',
    name: 'Operador',
    price: 'R$ 320',
    period: 'por mês',
    description: 'Para o atirador assíduo.',
    recommended: true,
    features: [
      'Acesso ilimitado (terça a domingo)',
      '25% OFF em todos os cursos CTC',
      'Guia de Tráfego inclusa na anuidade',
      'Armário individual no cofre (opcional)',
      'Acesso a armas premium do clube'
    ]
  },
  {
    id: 'elite',
    name: 'Elite CTC',
    price: 'R$ 540',
    period: 'por mês',
    description: 'O nível máximo de exclusividade.',
    features: [
      'Vaga exclusiva no estacionamento',
      'Consultoria tática personalizada',
      'Isenção total de taxas de despachante',
      '4 Convidados gratuitos por mês',
      'Acesso antecipado a eventos de caça'
    ]
  }
];

export const COURSES: Course[] = [
  {
    id: '1',
    title: 'Fundamentos do Tiro (Nível I)',
    date: '20 Out - 21 Out',
    category: 'Iniciante',
    description: 'Focado em segurança, empunhadura e visada básica.',
    image: 'https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?q=80&w=2072&auto=format&fit=crop',
    price: 'R$ 920',
    slots: 12,
    enrolled: 5
  },
  {
    id: '2',
    title: 'Combate com Pistola (Nível II)',
    date: '28 Out - 30 Out',
    category: 'Avançado',
    description: 'Técnicas de recarga tática, panes e tiro em movimento.',
    image: 'https://images.unsplash.com/photo-1584285418504-010df06c0782?q=80&w=2072&auto=format&fit=crop',
    price: 'R$ 1.450',
    slots: 10,
    enrolled: 8
  },
  {
    id: '3',
    title: 'Operação de Fuzil (AR-15)',
    date: '05 Nov - 07 Nov',
    category: 'Especialista',
    description: 'Conhecimento profundo da plataforma AR e precisão a 100m.',
    image: 'https://images.unsplash.com/photo-1510214690324-43403f0b240b?q=80&w=2062&auto=format&fit=crop',
    price: 'R$ 1.800',
    slots: 8,
    enrolled: 3
  }
];

export const STEPS = [
  {
    title: 'Cadastro',
    desc: 'Preencha seus dados táticos no portal.',
    icon: <FileText className="w-6 h-6" />
  },
  {
    title: 'Exame',
    desc: 'Avaliação técnica com instrutores CTC.',
    icon: <Crosshair className="w-6 h-6" />
  },
  {
    title: 'Filiação',
    desc: 'Ativação do seu CR no sistema oficial.',
    icon: <CheckCircle2 className="w-6 h-6" />
  },
  {
    title: 'Pista',
    desc: 'Comece seu treinamento de elite.',
    icon: <Target className="w-6 h-6" />
  }
];

export const renderIcon = (name: string) => {
  switch (name) {
    case 'target': return <Target className="w-8 h-8 text-blue-500" />;
    case 'shield': return <Shield className="w-8 h-8 text-red-500" />;
    case 'users': return <Users className="w-8 h-8 text-red-500" />;
    case 'zap': return <Zap className="w-8 h-8 text-blue-500" />;
    default: return <Target className="w-8 h-8" />;
  }
};
