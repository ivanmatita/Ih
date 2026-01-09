import React, { useState, useMemo, useEffect } from 'react';
import { Employee, WorkLocation, Profession } from '../types';
import { generateId, formatCurrency, calculateINSS, calculateIRT, formatDate } from '../utils';
import { supabase } from '../services/supabaseClient';
import { 
  Users, UserPlus, Search, Filter, Printer, FileText, Trash2, Edit2, Eye, Ban, CheckCircle, 
  MapPin, Phone, Mail, Calendar, CreditCard, Building2, ChevronDown, ChevronUp, X, Save, Upload, User, 
  RefreshCw, Database, AlertCircle, Info, Settings, Ruler, Gavel, Wallet, Gift, FileSignature, 
  UserCheck, UserMinus, MoreVertical, Calculator, ChevronRight, List, Briefcase, Plus, PlusCircle,
  ArrowLeft, Loader2, Home, Hash, ClipboardList, Clock, Sparkles, Coffee
} from 'lucide-react';

interface EmployeesProps {
  employees: Employee[];
  onSaveEmployee: (emp: Employee) => void;
  workLocations: WorkLocation[];
  professions: Profession[];
  onIssueContract?: (emp: Employee) => void; 
}

const INSS_INDEXED_PROFESSIONS = [
    { code: '1', name: 'Químico' },
    { code: '2', name: 'Químico - Especialista em Química Orgânica' },
    { code: '3', name: 'Químico - Especialista em Química Inorgânica' },
    { code: '4', name: 'Químico - Especialista em Química-Física' },
    { code: '5', name: 'Químico - Especialista em Química Analítica' },
    { code: '6', name: 'Outros Químicos' },
    { code: '7', name: 'Físico' },
    { code: '8', name: 'Físico - Especialista em Mecânica' },
    { code: '9', name: 'Físico - Especialista em Termodinâmica' },
    { code: '10', name: 'Físico - Especialista em Óptica' },
    { code: '11', name: 'Físico - Especialista em Acústica' },
    { code: '12', name: 'Físico - Especialista em Electricidade e Magnetismo' },
    { code: '13', name: 'Físico - Especialista em Electrónica' },
    { code: '14', name: 'Físico - Especialista em Energia Nuclear' },
    { code: '15', name: 'Físico - Especialista do Estado Sólido' },
    { code: '16', name: 'Físico - Especialista em Física Atómica e Molecular' },
    { code: '17', name: 'Outros Físicos' },
    { code: '18', name: 'Geofísico' },
    { code: '19', name: 'Geólogo' },
    { code: '20', name: 'Hidro-Geólogo' },
    { code: '21', name: 'Oceanógrafo' },
    { code: '22', name: 'Meteorologista' },
    { code: '23', name: 'Astrónomo' },
    { code: '31', name: 'Arquitecto' },
    { code: '34', name: 'Engenheiro Civil' },
    { code: '45', name: 'Engenheiro Electrotécnico' },
    { code: '51', name: 'Engenheiro Mecânico' },
    { code: '74', name: 'Desenhador em Geral' },
    { code: '102', name: 'Piloto de Avião' },
    { code: '160', name: 'Médico - Clínica Geral' },
    { code: '176', name: 'Médico Legista' }
];

const LOCAL_STORAGE_PROFS_KEY = 'imatec_profissoes_locais';

const Employees: React.FC<EmployeesProps> = ({ employees, onSaveEmployee, workLocations, professions, onIssueContract }) => {
  const [view, setView] = useState<'LIST' | 'FORM' | 'CLASSIFIER_LIST' | 'CLASSIFIER_FORM'>('LIST');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [isLoadingCloud, setIsLoadingCloud] = useState(false);
  const [syncWarning, setSyncWarning] = useState<string | null>(null);
  
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // New States for Dismissal/Readmission
  const [showDismissForm, setShowDismissForm] = useState(false);
  const [showReadmitForm, setShowReadmitForm] = useState(false);
  const [dismissForm, setDismissForm] = useState({ date: new Date().toISOString().split('T')[0], orderer: '', reason: '' });
  const [readmitForm, setReadmitForm] = useState({ date: new Date().toISOString().split('T')[0], orderer: '', reason: '' });

  const [internalProfessions, setInternalProfessions] = useState<Profession[]>([]);
  const [editingInternalProf, setEditingInternalProf] = useState<Profession | null>(null);
  const [profFormData, setProfFormData] = useState<Partial<Profession>>({
    baseSalary: 0,
    complement: 0,
    indexedProfessionName: 'NA - Aguarda Profissão'
  });

  const [formData, setFormData] = useState<Partial<Employee>>({
    status: 'Active',
    contractType: 'Determinado',
    gender: 'M',
    maritalStatus: 'Solteiro'
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: true,
    fiscal: false,
    professional: false,
    subsidies: false,
    others: false
  });

  const [showInssModal, setShowInssModal] = useState(false);
  const [inssSearch, setInssSearch] = useState('');

  const departments = useMemo(() => {
    const depts = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(depts);
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const name = emp.name.toLowerCase();
      const sTerm = searchTerm.toLowerCase();
      const matchesSearch = name.includes(sTerm) || 
                           (emp.employeeNumber && emp.employeeNumber.toLowerCase().includes(sTerm)) ||
                           (emp.biNumber && emp.biNumber.toLowerCase().includes(sTerm));
      
      const matchesStatus = statusFilter === 'ALL' || 
                           (statusFilter === 'ACTIVE' && emp.