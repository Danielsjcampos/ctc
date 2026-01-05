# Mapeamento Completo do Sistema CTC (Clube de Tiro Cruzeiro)

Este documento detalha a estrutura atual do sistema, incluindo o banco de dados e a arquitetura do frontend.

---

## 1. Banco de Dados (PostgreSQL / Supabase)

### Autenticação & Perfis
| Tabela | Descrição | Colunas Principais |
| :--- | :--- | :--- |
| **`profiles`** | Dados principais de usuários (Atiradores, Admins, Instrutores). | `id`, `name`, `email`, `cpf`, `role` (ADMIN, SHOOTER), `membership_type`, `ranking_points`, `level`, `is_checked_in`, `last_check_in` |
| **`membership_requests`** | Solicitações de filiação pendentes (formulário do site). | `full_name`, `cpf`, `rg`, `address`, `status` (pending, approved) |

### Gestão Operacional e Tática
| Tabela | Descrição | Colunas Principais |
| :--- | :--- | :--- |
| **`lanes`** | Cadastro das pistas/raias de tiro. | `id`, `name`, `type`, `status` (available, occupied, maintenance), `max_distance` |
| **`reservations`** | Agendamentos de pistas. | `lane_id`, `shooter_id`, `start_time`, `end_time`, `status` (confirmed, pending) |
| **`club_sessions`** | Sessões de tiro ativas (Habitualidade). | `shooter_id`, `firearm_id`, `lane_number`, `total_shots`, `check_in_at`, `check_out_at`, `status` (active, completed) |
| **`access_logs`** | Histórico de entrada/saída do clube. | `profile_id`, `check_in_at`, `check_out_at`, `type` (MEMBER, VISITOR) |
| **`firearms`** | Acervo de armas (Clube e Sócios). | `owner_id` (NULL = Clube), `model`, `brand`, `caliber`, `sigma_number` |

### Comercial & CRM
| Tabela | Descrição | Colunas Principais |
| :--- | :--- | :--- |
| **`crm_leads`** | Leads capturados pelo site/contato. | `name`, `email`, `phone`, `message`, `source`, `status` (pending, contacted) |
| **`products`** | Produtos para venda (Insumos, Equipamentos). | `name`, `category`, `price`, `stock`, `business_unit` |
| **`sales`** | Registro de vendas balcão (PDV). | `shooter_id`, `total`, `items` (JSON), `payment_method`, `status` |

### Cursos & Eventos
| Tabela | Descrição | Colunas Principais |
| :--- | :--- | :--- |
| **`courses`** | Cadastro de cursos disponíveis. | `title`, `date`, `category`, `price`, `slots`, `enrolled` |
| **`event_leads`** | Inscrições em cursos. | `course_id`, `name`, `email`, `payment_status`, `certificate_issued` |

### Gamificação & Ranking
| Tabela | Descrição | Colunas Principais |
| :--- | :--- | :--- |
| **`ranking_seasons`** | Temporadas de competição. | `name`, `start_date`, `end_date`, `is_active` |
| **`ranking_history`** | Histórico de pontos ganhos. | `profile_id`, `points`, `reason`, `related_id` |
| **`ranking_archives`** | Resultados de temporadas passadas. | `season_id`, `profile_id`, `final_points`, `final_rank` |

### Configurações
| Tabela | Descrição | Colunas Principais |
| :--- | :--- | :--- |
| **`system_settings`** | Configurações globais do sistema. | `club_name`, `logo_url`, `ai_provider`, `ai_api_key`, `ai_avatar_url` |

---

## 2. Arquitetura Frontend (React / Vite)

O sistema é dividido em visões por "Role" (Papel do Usuário).

### **Visão Administrativa (`views/admin/`)**
*Painel de controle total para gestores e staff.*
- **Dashboard (`AdminDashboard.tsx`)**: KPIs gerais, ranking, alertas de estoque e munição.
- **Portaria (`CheckInView.tsx`)**: Controle de acesso, lista de presentes, abertura de habitualidade.
- **Agenda (`AgendaView.tsx`)**: Gestão visual das pistas, ocupação imediata e reservas futuras.
- **Atiradores (`ShootersView.tsx`)**: CRM de sócios, gestão de documentos e CR.
- **Mapa de Armas (`ArmoryMapView.tsx`)**: Inventário de armamento (clube e sócios), localização no cofre.
- **Estoque (`InventoryView.tsx`)**: Controle de insumos e produtos.
- **PDV (`POSView.tsx`)**: Ponto de venda para check-out de consumo.
- **Cursos (`CourseManagementView.tsx`)**: Criação de turmas e validação de alunos.
- **Financeiro (`FinanceView.tsx`)**: Fluxo de caixa e relatórios.
- **Compliance (`ComplianceView.tsx`)**: Relatórios para Exército/SFPC.
- **Configurações (`SettingsView.tsx`)**: Dados do clube, Staff e IA.
- **CRM (`CRMView.tsx`)**: Funil de vendas para novos leads.

### **Visão do Atirador (`views/shooter/`)**
*Portal de autoatendimento para o sócio.*
- **Dashboard (`ShooterDashboard.tsx`)**: Resumo do perfil, nível, pontos e próximos agendamentos.
- **Perfil (`ProfileView.tsx`)**: Dados pessoais e status da filiação.
- **Habitualidade (`HabitualView.tsx`)**: Histórico de tiros e emissão de declarações.
- **Acervo (`FirearmsView.tsx`)**: Minhas armas cadastradas e validade de GTs.
- **Cursos (`CoursesStoreView.tsx`)**: Loja de cursos e histórico de inscrições.
- **Agendamento (`BookingView.tsx`)**: Solicitação de horário de pista.
- **Carteirinha (`MembershipCardView.tsx`)**: Carteira digital de sócio.

### **Features Especiais & Componentes**
- **AI Assistant (`AiAssistant.tsx`)**: Assistente virtual 3D integrada (OpenAI/Gemini) para suporte e automação.
- **PDF Generator**: Geração de relatórios de compliance e habitualidade (jsPDF).
- **Gamification Engine**: Sistema automático de pontuação por presença e cursos.

---

## 3. Fluxos Críticos

### **Fluxo de Check-in (Portaria)**
1. Admin acessa **Portaria**.
2. Busca Atirador (CPF/Nome).
3. Seleciona Arma (Própria ou Clube).
4. Sistema cria `club_session` (Status: Active).
5. Sistema marca perfil como `is_checked_in = true`.

### **Fluxo de Ocupação de Pista**
1. Admin acessa **Agenda**.
2. Clica em "Ocupar" na pista livre.
3. **Filtro de Segurança**: Busca apenas atiradores com `is_checked_in = true`.
4. Define tempo e confirma.
5. Pista muda para `occupied`.

### **Fluxo de Check-out**
1. Admin vai em **Portaria** > "Atiradores no Clube".
2. Clica em "Dar Baixa".
3. Informa disparos realizados (conta para Habitualidade).
4. Sistema encerra sessão (`status: completed`).
5. Sistema marca perfil como `is_checked_in = false`.
6. Tabela de Ranking é atualizada automaticamente (Trigger).

