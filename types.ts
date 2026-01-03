
export type UserRole = 'ADMIN' | 'STAFF' | 'INSTRUCTOR' | 'SHOOTER';

export type Permission = 
  | 'VIEW_DASHBOARD'
  | 'MANAGE_CHECKIN'
  | 'MANAGE_SHOOTERS'
  | 'VIEW_AGENDA'
  | 'VIEW_FINANCE'
  | 'MANAGE_COURSES'
  | 'VIEW_COMPLIANCE'
  | 'MANAGE_STAFF'
  | 'MANAGE_INVENTORY'
  | 'MANAGE_ARMORY';

export type BusinessUnit = 'CLUB' | 'SHOP' | 'BAR';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'pending_review' | 'blocked';
  membershipType?: string;
  cpf?: string;
  permissions?: Permission[];
}

export interface Product {
  id: string;
  name: string;
  category: 'Municao' | 'Armamento' | 'Vestuario' | 'Acessorio' | 'Servico';
  price: number;
  stock: number;
  unit: string;
  business_unit: BusinessUnit;
}

export interface ArmoryItem {
  id: string;
  firearm_id: string;
  model: string;
  serial: string;
  location: 'Cofre' | 'Pista' | 'Manutenção' | 'Vitrine' | 'Expedição';
  owner_name: string;
  owner_id?: string;
  status: 'available' | 'reserved' | 'in_use' | 'sold';
}

export interface ClubDocument {
  id: string;
  shooter_id: string;
  type: 'CR' | 'CRAF' | 'GT' | 'HABITUALIDADE' | 'LAUDO_PSICOLOGICO';
  expiry_date: string;
  status: 'valid' | 'expiring' | 'expired';
  file_url?: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export interface Plan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  recommended?: boolean;
  features: string[];
}

export interface Course {
  id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  image: string;
  price: string;
  slots: number;
  enrolled: number;
}
