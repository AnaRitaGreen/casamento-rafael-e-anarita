import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminGuests,
  deleteGuest as deleteGuestApi,
  getAdminGroups,
  getAdminMessages,
  exportGuestsCSV,
  adminLogout,
  deletePresente as deletePresenteApi,
  liberarReservaPresente,
  getAdminPresentes
} from '../services/adminService';

import type {
  AdminGuest,
  AdminGroup,
  AdminMessage,
  AdminPresente,
  AdminPresentePayload
} from '../services/adminService';
import { PresenteModal } from '../components/modal/PresenteModal';
import { GuestModal } from '../components/modal/GuestModal';
import { PresentesTab } from '../components/tabs/PresentesTab';
import { ExportTab } from '../components/tabs/ExportTab';
import { MessagesTab } from '../components/tabs/MessagesTab';
import { GuestsTab } from '../components/tabs/GuestsTab';
import { OverviewTab } from '../components/tabs/OverviewTab';
import { Sidebar } from '../components/Sidebar';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Overview Data
  const [metrics, setMetrics] = useState({ total: 0, confirmed: 0, declined: 0, pending: 0, pct: 0 });

  // Guests Data
  const [allGuests, setAllGuests] = useState<AdminGuest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<AdminGuest[]>([]);
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [guestSearch, setGuestSearch] = useState('');
  const [guestFilterStatus, setGuestFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 15;

  // Messages Data
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  // Presentes Data
  const [presentes, setPresentes] = useState<AdminPresente[]>([]);
  const [presentesMetrics, setPresentesMetrics] = useState({ total: 0, reservados: 0, disponiveis: 0 });
  const [presentesLoading, setPresentesLoading] = useState(false);

  const redirectToLogin = () => navigate('/login');

  // --- OVERVIEW ---
  const loadOverview = async () => {
    setLoading(true);
    try {
      const guestsData = await getAdminGuests();
      const total = guestsData.length;
      const confirmed = guestsData.filter((g) => g.confirmado === true).length;
      const declined = guestsData.filter((g) => g.confirmado === false).length;
      const pending = guestsData.filter((g) => g.confirmado === null).length;
      const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;
      setMetrics({ total, confirmed, declined, pending, pct });
    } catch (err: any) {
      if (err?.response?.status === 401) redirectToLogin();
    } finally {
      setLoading(false);
    }
  };

  // --- GUESTS ---
  const loadGuests = async () => {
    try {
      const data = await getAdminGuests();
      setAllGuests(data);
      setFilteredGuests(data);
      const groupsData = await getAdminGroups();
      setGroups(groupsData);
    } catch (err: any) {
      if (err?.response?.status === 401) redirectToLogin();
    }
  };

  // --- MESSAGES ---
  const loadMessages = async () => {
    setMessagesLoading(true);
    try {
      const msgs = await getAdminMessages();
      setMessages(msgs);
    } catch (err: any) {
      if (err?.response?.status === 401) redirectToLogin();
    } finally {
      setMessagesLoading(false);
    }
  };

  // --- PRESENTES ---
  const loadPresentes = async () => {
    setPresentesLoading(true);
    try {
      const data = await getAdminPresentes();
      setPresentes(data);
      const reservados = data.filter((p) => p.reservado).length;
      setPresentesMetrics({ total: data.length, reservados, disponiveis: data.length - reservados });
    } catch (err: any) {
      if (err?.response?.status === 401) redirectToLogin();
    } finally {
      setPresentesLoading(false);
    }
  };

  // Pagination Helper
  const startIdx = (currentPage - 1) * PER_PAGE;
  const pageGuests = filteredGuests.slice(startIdx, startIdx + PER_PAGE);
  const totalPages = Math.ceil(filteredGuests.length / PER_PAGE);

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (activeTab === 'guests') loadGuests();
    if (activeTab === 'messages') loadMessages();
    if (activeTab === 'presentes') loadPresentes();
  }, [activeTab]);

  useEffect(() => {
    const search = guestSearch.toLowerCase();
    const filtered = allGuests.filter((g) => {
      const matchName = g.nome_completo.toLowerCase().includes(search);
      const matchStatus = guestFilterStatus === ""
        ? true
        : guestFilterStatus === "null"
          ? g.confirmado === null
          : g.confirmado === (guestFilterStatus === "true");
      return matchName && matchStatus;
    });
    setFilteredGuests(filtered);
    setCurrentPage(1);
  }, [guestSearch, guestFilterStatus, allGuests]);

  return (
    <div id="dashboard-app" style={{ display: 'flex', minHeight: '100vh', background: 'var(--creme)' }}>
      {/* SIDEBAR */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, padding: '2.5rem', overflowX: 'hidden' }}>
        {activeTab === 'overview' && (
          <OverviewTab />
        )}

        {activeTab === 'guests' && (
          <GuestsTab />
        )}

        {activeTab === 'messages' && (
          <MessagesTab />
        )}

        {activeTab === 'export' && (
          <ExportTab />
        )}

        {activeTab === 'presentes' && (
          <PresentesTab />
        )}
      </main>
    </div>
  );
}
