
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './store/authStore';

// Landing Page Components
import { Header as Navbar } from './components/ui/header-2';
import Hero from './components/Hero';
import Features from './components/Features';
import Timeline from './components/Timeline';
import Pricing from './components/Pricing';
import Footer from './components/Footer';

// System Layout
import DashboardLayout from './components/dashboard/DashboardLayout';

// Admin Views
import AdminDashboard from './views/admin/AdminDashboard';
import ShootersView from './views/admin/ShootersView';
import AgendaView from './views/admin/AgendaView';
import FinanceView from './views/admin/FinanceView';
import ComplianceView from './views/admin/ComplianceView';
import CourseManagementView from './views/admin/CourseManagementView';
import CheckInView from './views/admin/CheckInView';
import StaffManagementView from './views/admin/StaffManagementView';
import InventoryView from './views/admin/InventoryView';
import POSView from './views/admin/POSView';
import ArmoryMapView from './views/admin/ArmoryMapView';
import SettingsView from './views/admin/SettingsView';
import CRMView from './views/admin/CRMView';
import RankingManagementView from './views/admin/RankingManagementView';

// Public Views
import EventsView from './views/EventsView';
import CourseDetailView from './views/public/CourseDetailView';
import { CoursesSection } from './components/CoursesSection';
import { RankingSection } from './components/RankingSection';
import Testimonials from './components/ui/testimonial-v2';
import { ContactCTA } from './components/ContactCTA';

// Instructor Views
import InstructorDashboard from './views/instructor/InstructorDashboard';

// Shooter Views
import ShooterDashboard from './views/shooter/ShooterDashboard';
import BookingView from './views/shooter/BookingView';
import MembershipCardView from './views/shooter/MembershipCardView';
import HabitualView from './views/shooter/HabitualView';
import FirearmsView from './views/shooter/FirearmsView';
import ShooterDocumentsView from './views/shooter/ShooterDocumentsView';
import ShooterFinanceView from './views/shooter/ShooterFinanceView';
import CoursesStoreView from './views/shooter/CoursesStoreView';
import ProfileView from './views/shooter/ProfileView';

import LoginSelection from './views/LoginSelection';
import MembershipForm from './views/MembershipForm';

const LandingPage = () => (
  <div className="bg-[#0a0a0a] min-h-screen">
    <Navbar />
    <main>
      <Hero />
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto"><Features /></section>
      <CoursesSection />
      <RankingSection />
      <section id="membership" className="py-24 bg-[#111111]">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 uppercase tracking-tighter">
            Como Funciona o <span className="text-red-600">Ingresso</span>
          </h2>
          <Timeline />
        </div>
      </section>
      <section id="pricing" className="py-24 px-6"><Pricing /></section>
      <Testimonials />
      <ContactCTA />
      <Footer />
    </main>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode, roles?: string[] }> = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/eventos" element={<EventsView />} />
          <Route path="/courses/:id" element={<CourseDetailView />} />
          <Route path="/login" element={<LoginSelection />} />
          <Route path="/join" element={<MembershipForm />} />

          <Route path="/admin" element={<ProtectedRoute roles={['ADMIN', 'STAFF', 'INSTRUCTOR']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="checkin" element={<CheckInView />} />
            <Route path="pos" element={<POSView />} />
            <Route path="shooters" element={<ShootersView />} />
            <Route path="inventory" element={<InventoryView />} />
            <Route path="armory-map" element={<ArmoryMapView />} />
            <Route path="agenda" element={<AgendaView />} />
            <Route path="finance" element={<FinanceView />} />
            <Route path="courses" element={<CourseManagementView />} />
            <Route path="staff" element={<StaffManagementView />} />
            <Route path="logs" element={<ComplianceView />} />
            <Route path="crm" element={<CRMView />} />
            <Route path="ranking" element={<RankingManagementView />} />
            <Route path="settings" element={<SettingsView />} />
          </Route>

          <Route path="/instructor" element={<ProtectedRoute roles={['INSTRUCTOR']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<InstructorDashboard />} />
          </Route>

          <Route path="/portal" element={<ProtectedRoute roles={['SHOOTER']}><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<ShooterDashboard />} />
            <Route path="book" element={<BookingView />} />
            <Route path="membership" element={<MembershipCardView />} />
            <Route path="habitual" element={<HabitualView />} />
            <Route path="guns" element={<FirearmsView />} />
            <Route path="docs" element={<ShooterDocumentsView />} />
            <Route path="finance" element={<ShooterFinanceView />} />
            <Route path="courses" element={<CoursesStoreView />} />
            <Route path="profile" element={<ProfileView />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
