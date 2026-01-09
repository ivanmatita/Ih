
import React, { useState, useMemo } from 'react';
import { 
  Employee, HrTransaction, HrVacation, SalarySlip, Profession, 
  Contract, AttendanceRecord, Company, ViewState, CashRegister, TransferOrder
} from '../types';
import { 
  generateId, formatCurrency, formatDate 
} from '../utils';
import { 
  Users, ClipboardList, Briefcase, Calculator, Calendar, 
  FileText, Printer, Search, Plus, Trash2, X, Table, User, 
  MoreVertical, RefreshCw, Loader2, CheckCircle, AlertTriangle, 
  Clock, Shield, LayoutDashboard, ChevronDown, ChevronUp, ListCheck, 
  Gavel, HeartHandshake, Eye, Ruler, Gift, Wallet, TrendingUp, CheckSquare, Square, Play, Trash, FileSpreadsheet, ChevronRight, FileCheck, Circle, Info,
  ArrowRight, Landmark, Banknote
} from 'lucide-react';
import { supabase } from '../services/supabaseClient';
import SalaryMap from './SalaryMap';
import ProfessionManager from './ProfessionManager';

// --- COMPONENTES AUXILIARES EXTRAÍDOS ---

interface AttendanceGridProps {
  emp: Employee;
  processingMonth: number;
  processingYear: number;
  months: string[];
  onCancel: () => void;
  onConfirm: (attData: Record<number, string>) => void;
}

const AttendanceGrid: React.FC<AttendanceGridProps> = ({ emp, processingMonth, processingYear, months, onCancel, onConfirm }) => {
    const [attData, setAttData] = useState<Record<number, string>>({});
    const daysInMonth = new Date(processingYear, processingMonth, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayNames = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];

    const handleSelectDayType = (day: number, type: string) => {
        setAttData(prev => ({ ...prev, [day]: type }));
    };

    return (
        <div className="fixed inset-0 z-[120] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-[#f8f9fa] rounded-none shadow-2xl w-[98vw] max-h-[95vh] overflow-auto border-2 border-slate-400 p-8 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-12">
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase">IDNF</p>
                            <p className="text-2xl font-black text-slate-800">{emp.idnf || emp.id.substring(0,4).toUpperCase()}</p>
                        </div>
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase">Nome</p>
                            <p className="text-2xl font-black text-slate-800 uppercase italic">{emp.name}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-red-600 font-bold text-sm">[ Admitido em {formatDate(emp.admissionDate)} ]</p>
                        <p className="text-xl font-black text-slate-700 mt-2">{months[processingMonth - 1]} {processingYear}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-[10px]">
                        <thead>
                            <tr className="bg-white">
                                <th className="border border-slate-300 w-48"></th>
                                {days.map(d => {
                                    const dateObj = new Date(processingYear, processingMonth - 1, d);
                                    return (
                                        <th key={d} className="border border-slate-300 p-1 text-center min-w-[30px]">
                                            <div className="font-bold text-slate-500">{dayNames[dateObj.getDay()]}</div>
                                            <div className="font-black text-blue-800 text-sm">{d}</div>
                                        </th>
                                    );
                                })}
                                <th className="border border-slate-300 p-1 text-center w-12 font-bold text-slate-500 bg-slate-100 uppercase tracking-tighter">Full</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'Admissão/Demissão', key: 'adm', color: 'bg-white' },
                                { label: 'Folga', key: 'folga', color: 'bg-green-500', isRadio: true },
                                { label: 'Serviço', key: 'servico', color: 'bg-green-500', isRadio: true },
                                { label: 'Justificadas', key: 'just', color: 'bg-white', isRadio: true },
                                { label: 'Injustificadas', key: 'injust', color: 'bg-white', isRadio: true },
                                { label: 'Férias', key: 'ferias', color: 'bg-white', isRadio: true },
                                { label: 'Horas Extra', key: 'extra', color: 'bg-white', isManual: true },
                                { label: 'Horas Perdidas', key: 'perdidas', color: 'bg-white', isManual: true, textRed: true },
                                { label: 'Local de Serviço', key: 'local', color: 'bg-white', isManual: true },
                                { label: 'Alimentação', key: 'alim', color: 'bg-green-100', isManual: true, empty: true },
                                { label: 'Transporte', key: 'transp', color: 'bg-green-100', isManual: true, empty: true },
                            ].map((row, rIdx) => (
                                <tr key={rIdx} className={`${row.color} hover:opacity-90`}>
                                    <td className={`border border-slate-300 p-1 font-bold ${row.textRed ? 'text-red-600' : 'text-slate-700'} ${rIdx > 8 ? 'pl-4' : ''}`}>
                                        {rIdx === 9 ? <span className="text-[8px] font-bold block mb-[-4px]">Subsídios</span> : null}
                                        {rIdx === 3 ? <span className="text-[8px] font-bold block mb-[-4px]">Faltas</span> : null}
                                        {row.label}
                                    </td>
                                    {days.map(d => (
                                        <td key={d} className="border border-slate-300 p-0 text-center align-middle h-8">
                                            {row.isRadio ? (
                                                <div className="flex items-center justify-center">
                                                    <div 
                                                        className={`w-4 h-4 rounded-full border-2 border-slate-400 flex items-center justify-center cursor-pointer bg-white`}
                                                        onClick={() => handleSelectDayType(d, row.key)}
                                                    >
                                                        {attData[d] === row.key && (
                                                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : row.isManual ? (
                                                <input className="w-full h-full bg-transparent text-center border-none focus:ring-0 font-bold" defaultValue={row.empty ? '' : (row.key === 'local' ? '1' : '00')} placeholder={row.empty ? '...' : ''} />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full border-2 border-slate-200 mx-auto bg-slate-50"></div>
                                            )}
                                        </td>
                                    ))}
                                    <td 
                                        className="border border-slate-300 p-0 text-center bg-slate-100 cursor-pointer hover:bg-slate-200" 
                                        onClick={() => {
                                            const newAtt = { ...attData };
                                            days.forEach(d => { newAtt[d] = row.key; });
                                            setAttData(newAtt);
                                        }}
                                    >
                                        <div className="w-4 h-4 rounded-full border-2 border-slate-400 mx-auto bg-white flex items-center justify-center">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="mt-auto pt-8 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-6 py-2 bg-slate-400 text-white font-bold uppercase rounded-lg border-b-4 border-slate-600 hover:bg-slate-500 transition">Cancelar</button>
                    <button className="px-16 py-2 bg-gradient-to-b from-slate-200 to-slate-400 border-2 border-slate-500 rounded-full text-slate-800 font-bold text-lg hover:shadow-lg transition">Autofill</button>
                    <button 
                        onClick={() => onConfirm(attData)} 
                        className="px-16 py-2 bg-gradient-to-b from-slate-200 to-slate-400 border-2 border-slate-500 rounded-full text-slate-800 font-bold text-lg hover:shadow-lg transition"
                    >
                        Processar
                    </button>
                </div>
            </div>
        </div>
    );
};

interface SalaryReceiptProps {
    data: any;
    months: string[];
    onClose: () => void;
    onProcess: (processedData: any) => void;
}

const SalaryReceipt: React.FC<SalaryReceiptProps> = ({ data, months, onClose, onProcess }) => {
    const [localData, setLocalData] = useState({
        baseSalary: data.baseSalary || 0,
        complement: data.complement || 0,
        abatimento: data.abatimento || 0,
        subFerias: 0,
        subNatal: 0,
        subAlim: 0,
        subTransp: 0,
        abonoFam: 0,
        inssRate: 0.03,
        irtRate: 0,
    });

    const [isProcessed, setIsProcessed] = useState(false);

    const totalBaseIliquido = localData.baseSalary + localData.complement + localData.abatimento;
    const totalSubsidios = localData.subFerias + localData.subNatal + localData.subAlim + localData.subTransp + localData.abonoFam;
    const totalAntesImp = totalBaseIliquido + totalSubsidios;
    
    const inssVal = totalAntesImp * localData.inssRate;
    
    const taxableIRT = totalAntesImp - inssVal;
    let irtVal = 0;
    if (taxableIRT > 70000) {
        if (taxableIRT <= 100000) irtVal = (taxableIRT - 70000) * 0.10 + 3000;
        else if (taxableIRT <= 150000) irtVal = (taxableIRT - 100000) * 0.13 + 6000;
        else if (taxableIRT <= 200000) irtVal = (taxableIRT - 150000) * 0.16 + 12500;
        else irtVal = (taxableIRT - 200000) * 0.18 + 31250;
    }

    const netTotal = totalAntesImp - inssVal - irtVal;
    const { emp } = data;

    const handleProcessClick = () => {
        setIsProcessed(true);
        onProcess({ ...data, ...localData, netTotal, inssVal, irtVal });
    };

    // --- RENDERIZAR UMA ÚNICA CÓPIA DO RECIBO ---
    const ReceiptCard = ({ label }: { label: string }) => (
        <div className="bg-white p-8 border-2 border-slate-900 flex flex-col font-serif text-black h-[260mm]">
            <div className="flex justify-between items-start mb-6 border-b-2 border-black pb-4">
                <div className="w-1/2">
                   <h2 className="text-xl font-black uppercase">Recibo de Salário</h2>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
                </div>
                <div className="text-right w-1/2">
                   <div className="h-10 w-24 border border-black flex items-center justify-center text-[10px] font-black uppercase mb-1 ml-auto">Logotipo</div>
                </div>
            </div>

            <div className="flex justify-between mb-6">
                <div className="w-2/3 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Beneficiário:</p>
                    <h3 className="text-lg font-black uppercase border-b-2 border-black pb-1 mb-2">{emp.name}</h3>
                    <div className="grid grid-cols-2 text-[10px] gap-2">
                        <p><b>NIF:</b> {emp.nif}</p>
                        <p><b>BI:</b> {emp.biNumber}</p>
                        <p><b>Profissão:</b> {emp.role}</p>
                        <p><b>Admissão:</b> {formatDate(emp.admissionDate)}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black">{months[data.month - 1]} de {data.year}</p>
                </div>
            </div>

            <div className="flex-1">
                <table className="w-full text-[10px] border-collapse">
                    <thead className="bg-slate-50 border-y-2 border-black">
                        <tr>
                            <th className="p-2 text-left w-12">COD</th>
                            <th className="p-2 text-left">DESCRIÇÃO RENDIMENTO / ABONO</th>
                            <th className="p-2 text-center w-16">QTD/DIAS</th>
                            <th className="p-2 text-right w-32">VALOR</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-2">01</td><td className="p-2 uppercase">Vencimento Base Categoria</td><td className="p-2 text-center">30</td><td className="p-2 text-right">{localData.baseSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
                        {localData.complement > 0 && <tr><td className="p-2">02</td><td className="p-2 uppercase">Complemento Salarial</td><td className="p-2 text-center">1</td><td className="p-2 text-right">{localData.complement.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>}
                        {localData.abatimento < 0 && <tr><td className="p-2">03</td><td className="p-2 uppercase">Abatimento de Faltas</td><td className="p-2 text-center">{data.attendanceDetails?.faltasInjust || 0}</td><td className="p-2 text-right">-{Math.abs(localData.abatimento).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>}
                        <tr className="bg-slate-50 font-bold"><td colSpan={3} className="p-2 text-right uppercase">Total de Vencimento Base Líquido</td><td className="p-2 text-right">{totalBaseIliquido.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
                        
                        {localData.subAlim > 0 && <tr><td className="p-2">09</td><td className="p-2 uppercase">Subsidio Alimentação</td><td className="p-2 text-center">22</td><td className="p-2 text-right">{localData.subAlim.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>}
                        {localData.subTransp > 0 && <tr><td className="p-2">08</td><td className="p-2 uppercase">Subsidio Transporte</td><td className="p-2 text-center">30</td><td className="p-2 text-right">{localData.subTransp.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>}
                        {localData.abonoFam > 0 && <tr><td className="p-2">10</td><td className="p-2 uppercase">Abono Família</td><td className="p-2 text-center">1</td><td className="p-2 text-right">{localData.abonoFam.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>}
                    </tbody>
                </table>
            </div>

            <div className="border-t-2 border-black pt-4">
                <div className="grid grid-cols-2 gap-8 text-[11px]">
                    <div className="space-y-1">
                        <div className="flex justify-between"><span>Dedução INSS (3%)</span><span className="font-bold">-{inssVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                        <div className="flex justify-between"><span>Dedução IRT</span><span className="font-bold">-{irtVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                    </div>
                    <div className="text-right">
                        <div className="bg-slate-100 p-4 rounded border-2 border-black inline-block min-w-[200px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Valor Líquido</p>
                            <h4 className="text-2xl font-black">{netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} <small className="text-xs">AKZ</small></h4>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex justify-between gap-12 text-[10px] text-center">
                <div className="flex-1 border-t border-black pt-2 uppercase">Assinatura do Trabalhador</div>
                <div className="flex-1 border-t border-black pt-2 uppercase">Carimbo do Empregador</div>
            </div>

            <div className="mt-auto pt-4 flex justify-between items-end text-[7px] text-slate-400 font-mono italic">
                 <span>Software Certificado nº 25/AGT/2019 • Imatec Software V.2.0</span>
                 <span>Página 1 de 1</span>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[130] bg-slate-900/95 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in zoom-in-95">
            <div className="max-w-[1600px] w-full flex flex-col gap-6">
                <div className="bg-white p-4 flex justify-between items-center rounded-xl shadow-lg border-b-4 border-blue-600 print:hidden">
                    <h2 className="font-black uppercase tracking-widest flex items-center gap-2"><FileText/> Pré-visualização do Recibo</h2>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50 transition">Voltar</button>
                        {!isProcessed ? (
                            <button onClick={handleProcessClick} className="bg-[#a7f3d0] hover:bg-[#86efac] text-slate-700 font-black px-12 py-2 rounded-xl shadow-xl transition transform active:scale-95">Processar Recibo</button>
                        ) : (
                            <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-12 py-2 rounded-xl shadow-xl transition transform active:scale-95 flex items-center gap-2"><Printer/> Imprimir em A4 (Duplicado)</button>
                        )}
                    </div>
                </div>

                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 items-start justify-center ${!isProcessed ? 'opacity-50 pointer-events-none' : ''}`}>
                    <ReceiptCard label="Original: Contabilidade" />
                    <ReceiptCard label="Duplicado: Trabalhador" />
                </div>
            </div>
        </div>
    );
}

// --- FIM DOS COMPONENTES AUXILIARES ---

interface HumanResourcesProps {
  employees: Employee[];
  onSaveEmployee: (emp: Employee) => void;
  transactions: HrTransaction[];
  onSaveTransaction: (t: HrTransaction) => void;
  vacations: HrVacation[];
  onSaveVacation: (v: HrVacation) => void;
  payroll: SalarySlip[]; 
  onProcessPayroll: (slips: SalarySlip[]) => void;
  transferOrders: TransferOrder[];
  onTransferSalaries: (slips: SalarySlip[], registerId: string) => void;
  professions: Profession[];
  onSaveProfession: (p: Profession) => void;
  onDeleteProfession: (id: string) => void;
  contracts: Contract[];
  onSaveContract: (c: Contract[]) => void;
  attendance: AttendanceRecord[];
  onSaveAttendance: (a: AttendanceRecord) => void;
  company: Company;
  cashRegisters: CashRegister[];
  currentView?: ViewState;
}

const HumanResources: React.FC<HumanResourcesProps> = ({ 
    employees, onSaveEmployee, transactions, onSaveTransaction, 
    vacations, onSaveVacation, payroll, onProcessPayroll,
    transferOrders, onTransferSalaries,
    professions, onSaveProfession, onDeleteProfession,
    contracts, onSaveContract, attendance, onSaveAttendance,
    company, cashRegisters, currentView
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'GESTÃO' | 'ASSIDUIDADE' | 'PROFISSÕES' | 'MAPAS' | 'CONTRATOS' | 'PROCESSAMENTO' | 'ORDEM_TRANSFERENCIA'>(
    currentView === 'HR_TRANSFER_ORDER' ? 'ORDEM_TRANSFERENCIA' : 'DASHBOARD'
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [processingMonth, setProcessingMonth] = useState(new Date().getMonth() + 1);
  const [processingYear, setProcessingYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState<string | null>(null);
  const [showBulkActionsMenu, setShowBulkActionsMenu] = useState(false);
  
  const [selectedEmpIds, setSelectedEmpIds] = useState<Set<string>>(new Set());
  const [isProcessingEffectiveness, setIsProcessingEffectiveness] = useState(false);
  const [activeProcessingEmp, setActiveProcessingEmp] = useState<Employee | null>(null);
  const [showSalaryReceipt, setShowSalaryReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  // Transfer Context
  const [selectedTransferRegisterId, setSelectedTransferRegisterId] = useState('');
  const [viewTransferOrder, setViewTransferOrder] = useState<TransferOrder | null>(null);

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  const handleUpdateEmployeeField = async (empId: string, field: keyof Employee, value: any) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const updatedEmp = { ...emp, [field]: value };
    onSaveEmployee(updatedEmp);

    try {
        const { error } = await supabase
            .from('funcionarios')
            .update({ [field]: value })
            .eq('id', empId);
        if (error) throw error;
    } catch (err) {
        console.warn("Sincronização cloud pendente: ", err);
    }
  };

  const isProcessComplete = (emp: Employee) => {
      return !!(emp.baseSalary && emp.nif && emp.admissionDate && emp.role);
  };

  const isSalaryProcessed = (empId: string) => {
    return payroll.some(p => p.employeeId === empId);
  };

  const isSalaryTransferred = (empId: string) => {
    return payroll.some(p => p.employeeId === empId && p.isTransferred);
  };

  const getProcessedNet = (empId: string) => {
    const slip = payroll.find(p => p.employeeId === empId);
    return slip ? formatCurrency(slip.netTotal) : null;
  };

  const toggleSelectAll = () => {
    if (selectedEmpIds.size === employees.length) {
        setSelectedEmpIds(new Set());
    } else {
        setSelectedEmpIds(new Set(employees.map(e => e.id)));
    }
  };

  const toggleSelectEmp = (id: string) => {
    const newSet = new Set(selectedEmpIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedEmpIds(newSet);
  };

  const handleBulkAction = (action: string) => {
    if (selectedEmpIds.size === 0 && action !== 'PROCESS_SALARIO' && action !== 'PROCESS_EFECTIVIDADE') {
        return alert("Selecione pelo menos um funcionário.");
    }
    
    if (action === 'PROCESS_EFECTIVIDADE') {
        const firstId = selectedEmpIds.size > 0 ? Array.from(selectedEmpIds)[0] : employees[0]?.id;
        const emp = employees.find(e => e.id === firstId);
        if (emp) {
            setActiveProcessingEmp(emp);
            setIsProcessingEffectiveness(true);
        }
    } else if (action === 'PROCESS_SALARIO') {
        if (selectedEmpIds.size === 0) {
            alert("Por favor, selecione funcionários na lista para processar.");
            return;
        }
        const slips = Array.from(selectedEmpIds).map(id => {
            const emp = employees.find(e => e.id === id);
            return {
                employeeId: id,
                employeeName: emp?.name || '',
                employeeRole: emp?.role || '',
                baseSalary: emp?.baseSalary || 0,
                allowances: 0,
                bonuses: 0,
                subsidies: 0,
                subsidyTransport: 0,
                subsidyFood: 0,
                subsidyFamily: 0,
                subsidyHousing: 0,
                absences: 0,
                advances: 0,
                grossTotal: emp?.baseSalary || 0,
                inss: (emp?.baseSalary || 0) * 0.03,
                irt: 0,
                netTotal: (emp?.baseSalary || 0) * 0.97,
                month: processingMonth,
                year: processingYear
            } as SalarySlip;
        });
        onProcessPayroll(slips);
        alert("Salários processados com sucesso!");
    } else if (action === 'TRANSFERIR') {
        if (!selectedTransferRegisterId) {
            alert("Selecione um Caixa de Pagamento no topo da lista.");
            return;
        }
        const slipsToTransfer = payroll.filter(p => selectedEmpIds.has(p.employeeId) && !p.isTransferred);
        if (slipsToTransfer.length === 0) {
            alert("Apenas salários processados e ainda não transferidos podem ser transferidos.");
            return;
        }
        onTransferSalaries(slipsToTransfer, selectedTransferRegisterId);
    }
    setShowBulkActionsMenu(false);
  };

  const handleAttendanceConfirm = (attData: Record<number, string>) => {
    setIsProcessingEffectiveness(false); 
    if (!activeProcessingEmp) return;

    const folgas = Object.values(attData).filter(v => v === 'folga').length;
    const servicos = Object.values(attData).filter(v => v === 'servico').length;
    const faltasJust = Object.values(attData).filter(v => v === 'just').length;
    const faltasInjust = Object.values(attData).filter(v => v === 'injust').length;
    const ferias = Object.values(attData).filter(v => v === 'ferias').length;
    
    setReceiptData({
        emp: activeProcessingEmp,
        month: processingMonth,
        year: processingYear,
        baseSalary: activeProcessingEmp.baseSalary,
        complement: activeProcessingEmp.complementSalary || 0,
        abatimento: -(activeProcessingEmp.baseSalary / 30) * (faltasInjust),
        hoursAbsence: faltasInjust,
        totalHours: (30 - faltasInjust) * 8,
        attendanceDetails: {
            folgas,
            servicos,
            faltasJust,
            faltasInjust,
            ferias
        }
    });
    setShowSalaryReceipt(true); 
  };

  const handleConfirmSalaryProcess = (processedData: any) => {
    const slip: SalarySlip = {
        employeeId: processedData.emp.id,
        employeeName: processedData.emp.name,
        employeeRole: processedData.emp.role,
        baseSalary: processedData.baseSalary,
        allowances: processedData.ajudasCusto || 0,
        bonuses: 0,
        subsidies: (processedData.subAlim || 0) + (processedData.subTransp || 0),
        subsidyTransport: processedData.subTransp || 0,
        subsidyFood: processedData.subAlim || 0,
        subsidyFamily: processedData.abonoFam || 0,
        subsidyHousing: processedData.subAlojamento || 0,
        absences: Math.abs(processedData.abatimento),
        advances: 0,
        grossTotal: processedData.baseSalary + processedData.complement + processedData.abatimento,
        inss: processedData.inssVal,
        irt: processedData.irtVal,
        netTotal: processedData.netTotal,
        month: processedData.month,
        year: processedData.year,
        attendanceDetails: processedData.attendanceDetails
    };

    onProcessPayroll([slip]);
    alert(`Salário de ${processedData.emp.name} processado!`);
  };

  const renderOrdemTransferencia = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
        {viewTransferOrder && (
            <div className="fixed inset-0 z-[150] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-white rounded-none shadow-2xl w-full max-w-4xl p-10 h-[90vh] overflow-y-auto flex flex-col" id="transfer-order-print">
                    <div className="flex justify-between items-center mb-8 border-b-4 border-slate-900 pb-4">
                        <div>
                             <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Ordem Transferência</h1>
                             <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">A Direcção</p>
                        </div>
                        <div className="text-right space-y-1">
                             <p className="text-sm font-bold text-slate-800">N/ Ref Nº : <span className="font-mono">{viewTransferOrder.ref}</span></p>
                             <p className="text-sm font-bold text-slate-800">Data : {viewTransferOrder.date}</p>
                             <p className="text-sm font-bold text-slate-800">Nº Total Transferências : {viewTransferOrder.totalTransfers}</p>
                             <p className="text-lg font-black text-slate-900">Montante Total : {viewTransferOrder.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} akz</p>
                        </div>
                    </div>

                    <div className="flex-1 mt-12 border-t border-slate-200">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b-2 border-black font-black uppercase text-[10px]">
                                    <th className="py-2">Beneficiário</th>
                                    <th className="py-2">Banco</th>
                                    <th className="py-2">Conta / IBAN</th>
                                    <th className="py-2 text-right">Montante</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {viewTransferOrder.slips.map((s, idx) => {
                                    const emp = employees.find(e => e.id === s.employeeId);
                                    return (
                                        <tr key={idx}>
                                            <td className="py-4">
                                                <p className="font-bold text-slate-800 uppercase">{s.employeeName}</p>
                                                <p className="text-[9px] text-slate-400">Transferência Salário {months[s.month! - 1]} {s.year}</p>
                                            </td>
                                            <td className="py-4 font-bold text-slate-600">{emp?.bankName || 'Pagamento em Mão'}</td>
                                            <td className="py-4">
                                                <p className="text-xs font-mono font-bold text-slate-700">{emp?.bankAccount || '---'}</p>
                                                <p className="text-[9px] font-mono text-slate-400">{emp?.iban || '---'}</p>
                                            </td>
                                            <td className="py-4 text-right">
                                                <div className="inline-block bg-slate-100 p-2 rounded-lg text-right min-w-[150px]">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase">Montante a Transferir</p>
                                                    <p className="text-lg font-black text-slate-900">{s.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} akz</p>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-20 pt-8 border-t-2 border-slate-900 flex justify-between items-end print:hidden">
                        <button onClick={() => setViewTransferOrder(null)} className="px-8 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl transition hover:bg-slate-200">Voltar</button>
                        <button onClick={() => window.print()} className="px-12 py-3 bg-blue-600 text-white font-black rounded-xl shadow-xl transition hover:bg-blue-700 flex items-center gap-2">
                             <Printer/> Imprimir Ordem
                        </button>
                    </div>
                    <div className="mt-auto text-center hidden print:block pt-20">
                         <div className="w-[80mm] mx-auto border-t-2 border-black pt-2 font-black uppercase text-xs">O Responsável Financeiro</div>
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ArrowRight className="text-blue-600"/> Histórico de Ordens de Transferência</h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-800 text-white font-bold uppercase text-[10px]">
                        <tr>
                            <th className="p-4">N/ Ref Nº</th>
                            <th className="p-4">Data</th>
                            <th className="p-4">Nº Total Transferências</th>
                            <th className="p-4 text-right">Montante Total</th>
                            <th className="p-4 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {transferOrders.map(order => (
                            <tr key={order.id} className="hover:bg-blue-50 transition-colors">
                                <td className="p-4 font-mono font-bold text-blue-600">{order.ref}</td>
                                <td className="p-4">{formatDate(order.date)}</td>
                                <td className="p-4 text-center">{order.totalTransfers}</td>
                                <td className="p-4 text-right font-black">{order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} akz</td>
                                <td className="p-4 text-center">
                                    <div className="flex justify-center gap-2">
                                        <button className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition shadow-sm" onClick={() => setViewTransferOrder(order)}>
                                            <Eye size={16}/>
                                        </button>
                                        <button className="p-1.5 bg-slate-50 text-slate-600 rounded hover:bg-slate-200 transition shadow-sm" onClick={() => { setViewTransferOrder(order); setTimeout(() => window.print(), 500); }}>
                                            <Printer size={16}/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {transferOrders.length === 0 && (
                            <tr><td colSpan={5} className="p-20 text-center text-slate-300 font-bold uppercase tracking-widest italic opacity-40">Sem ordens registadas</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  const renderAssiduidade = () => (
    <div className="space-y-4 animate-in fade-in duration-500 overflow-x-auto pb-20">
        {isProcessingEffectiveness && activeProcessingEmp && (
            <AttendanceGrid 
                emp={activeProcessingEmp}
                processingMonth={processingMonth}
                processingYear={processingYear}
                months={months}
                onCancel={() => setIsProcessingEffectiveness(false)}
                onConfirm={handleAttendanceConfirm}
            />
        )}
        
        {showSalaryReceipt && receiptData && (
            <SalaryReceipt 
                data={receiptData}
                months={months}
                onClose={() => setShowSalaryReceipt(false)}
                onProcess={handleConfirmSalaryProcess}
            />
        )}

        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center mb-2 gap-4">
             <div className="flex items-center gap-3">
                 <Landmark className="text-blue-600"/>
                 <label className="text-xs font-black uppercase text-slate-500 tracking-tighter">Caixa de Pagamento:</label>
                 <select 
                    className="border-2 border-slate-100 p-2 rounded-xl text-xs font-bold bg-slate-50 outline-none focus:border-blue-600 transition min-w-[250px]"
                    value={selectedTransferRegisterId}
                    onChange={e => setSelectedTransferRegisterId(e.target.value)}
                 >
                     <option value="">-- Seleccionar Caixa --</option>
                     {cashRegisters.map(c => <option key={c.id} value={c.id}>{c.name} (Saldo: {formatCurrency(c.balance)})</option>)}
                 </select>
             </div>
             <div className="flex gap-2">
                 <button onClick={() => handleBulkAction('TRANSFERIR')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg flex items-center gap-2">
                    <Banknote size={16}/> Transferir Seleccionados
                 </button>
             </div>
        </div>

        <div className="bg-white border-2 border-slate-300 shadow-2xl rounded-none overflow-hidden min-w-[1600px]">
            <table className="w-full text-left border-collapse">
                <thead className="bg-white text-slate-700 font-bold text-[9px] uppercase tracking-tighter text-center">
                    <tr className="border-b-2 border-slate-400">
                        <th className="p-2 border-r w-10 text-center relative group">
                            <div className="inline-block relative">
                                <div className="flex items-center gap-1">
                                    <button onClick={toggleSelectAll} className="p-1 hover:bg-slate-100 rounded">
                                        {selectedEmpIds.size === employees.length && employees.length > 0 ? <CheckSquare size={16} className="text-blue-600"/> : <Square size={16} className="text-slate-300"/>}
                                    </button>
                                    <ChevronDown 
                                        size={14} 
                                        className="text-slate-400 cursor-pointer hover:text-blue-600 transition-colors" 
                                        onClick={() => setShowBulkActionsMenu(!showBulkActionsMenu)}
                                    />
                                </div>
                                
                                {showBulkActionsMenu && (
                                    <div className="absolute left-0 top-full mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-2 z-[60]">
                                        <div className="p-2 space-y-1">
                                            <div className="p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 mb-1 flex items-center justify-between">
                                                Selecionar Ação <span>({selectedEmpIds.size})</span>
                                            </div>
                                            <button onClick={() => handleBulkAction('PROCESS_EFECTIVIDADE')} className="w-full text-left p-3 hover:bg-blue-600 text-white rounded-xl flex items-center gap-3 transition group">
                                                <div className="bg-blue-50/20 p-2 rounded-lg text-blue-400 group-hover:text-white"><Play size={18}/></div>
                                                <span className="font-bold text-xs uppercase tracking-tighter">Processar efetividade</span>
                                            </button>
                                            <button onClick={() => handleBulkAction('PROCESS_SALARIO')} className="w-full text-left p-3 hover:bg-emerald-600 text-white rounded-xl flex items-center gap-3 transition group">
                                                <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 group-hover:text-white"><Calculator size={18}/></div>
                                                <span className="font-bold text-xs uppercase tracking-tighter">Processar salário</span>
                                            </button>
                                            <button onClick={() => handleBulkAction('TRANSFERIR')} className="w-full text-left p-3 hover:bg-indigo-600 text-white rounded-xl flex items-center gap-3 transition group">
                                                <div className="bg-indigo-500/20 p-2 rounded-lg text-indigo-400 group-hover:text-white"><Banknote size={18}/></div>
                                                <span className="font-bold text-xs uppercase tracking-tighter">Transferir para Ordem</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </th>
                        <th className="p-2 border-r w-8" rowSpan={2}>Nº</th>
                        <th className="p-2 border-r w-40" rowSpan={2}>IDNF<br/>POSTO</th>
                        <th className="p-2 border-r w-64" rowSpan={2}>Nome<br/>Profissão</th>
                        <th className="p-2 border-r w-32">Datas</th>
                        <th className="p-2 border-r w-24">Pagamentos</th>
                        <th className="p-2 border-r" colSpan={3}>Subsidios Pontuais Manuais</th>
                        <th className="p-2 border-r w-24" rowSpan={2}>Abono<br/>Familia</th>
                        <th className="p-2 border-r" colSpan={2}>Sub Isentos</th>
                        <th className="p-2 border-r" colSpan={4}>Outros Acertos Salariais</th>
                        <th className="p-2" colSpan={4}>Processamento</th>
                    </tr>
                    <tr className="bg-slate-50 border-b-2 border-slate-400">
                        <th className="p-1 border-r text-[8px]">Admissão<br/>Demissão</th>
                        <th className="p-1 border-r text-[8px]">Titular<br/>Caixa</th>
                        <th className="p-1 border-r text-[8px]">S. base<br/>Compl.Sal</th>
                        <th className="p-1 border-r text-[8px]">Natal</th>
                        <th className="p-1 border-r text-[8px]">Férias</th>
                        <th className="p-1 border-r text-[8px]">Alojamento</th>
                        <th className="p-1 border-r text-[8px]">SUB<br/>ALIM</th>
                        <th className="p-1 border-r text-[8px]">SUB<br/>TRANS</th>
                        <th className="p-1 border-r text-[8px]">Outros<br/>Subsidios</th>
                        <th className="p-1 border-r text-[8px]">Acertos<br/>Salariais</th>
                        <th className="p-1 border-r text-[8px]">Multas<br/>Penaliza</th>
                        <th className="p-1 border-r text-[8px] text-red-600">Magic</th>
                        <th className="p-1 border-r text-[8px]">Efetividade</th>
                        <th className="p-1 border-r text-[8px]">Horas<br/>Faltas</th>
                        <th className="p-1 border-r text-[8px] text-red-600 font-black">Item</th>
                        <th className="p-1 text-[8px] text-blue-600 font-black">Print</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {employees.map((emp, idx) => {
                        const complete = isProcessComplete(emp);
                        const isSelected = selectedEmpIds.has(emp.id);
                        const processedValue = getProcessedNet(emp.id);
                        const isTransferred = isSalaryTransferred(emp.id);
                        
                        return (
                            <tr key={emp.id} className={`${isSelected ? 'bg-blue-50/50' : 'hover:bg-blue-50/30'} transition-colors group`}>
                                <td className="p-2 border-r text-center">
                                    <button onClick={() => toggleSelectEmp(emp.id)} className="p-1 hover:bg-white rounded transition-colors">
                                        {isSelected ? <CheckSquare size={14} className="text-blue-600"/> : <Square size={14} className="text-slate-300"/>}
                                    </button>
                                </td>
                                <td className="p-2 border-r text-center font-bold text-slate-400">{idx + 1}</td>
                                <td className="p-2 border-r">
                                    <div className="font-bold text-slate-800">{emp.idnf || emp.id.substring(0,4).toUpperCase()}</div>
                                    <div className="text-[8px] text-slate-500 uppercase truncate">Obra Generica</div>
                                </td>
                                <td className="p-2 border-r relative">
                                    <div className="font-black text-slate-900 uppercase leading-none">{emp.name}</div>
                                    <div className="text-[8px] text-slate-400 mt-1 uppercase font-bold">{emp.role}</div>
                                </td>
                                <td className="p-2 border-r text-center font-mono font-bold text-slate-700">{formatDate(emp.admissionDate)}</td>
                                <td className="p-2 border-r text-center">
                                    <input type="checkbox" checked={emp.isCashier} onChange={e => handleUpdateEmployeeField(emp.id, 'isCashier', e.target.checked)} className="w-3 h-3 rounded"/>
                                </td>
                                <td className="p-2 border-r text-right font-mono font-bold">
                                    <input 
                                        type="number" 
                                        className="w-full bg-transparent text-right outline-none font-black text-blue-900 focus:bg-white" 
                                        value={emp.baseSalary} 
                                        onChange={e => handleUpdateEmployeeField(emp.id, 'baseSalary', Number(e.target.value))}
                                    />
                                </td>
                                <td className="p-1 border-r bg-slate-100/50 text-center">
                                     <input type="number" className="w-full bg-transparent text-center outline-none text-[8px]" value={emp.subsidyChristmas || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyChristmas', Number(e.target.value))}/>
                                </td>
                                <td className="p-1 border-r bg-slate-100/50 text-center">
                                     <input type="number" className="w-full bg-transparent text-center outline-none text-[8px]" value={emp.subsidyVacation || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyVacation', Number(e.target.value))}/>
                                </td>
                                <td className="p-1 border-r bg-slate-100/50 text-center">
                                     <input type="number" className="w-full bg-transparent text-center outline-none text-[8px]" value={emp.subsidyHousing || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyHousing', Number(e.target.value))}/>
                                </td>
                                <td className="p-2 border-r text-right bg-slate-100/30 font-mono font-bold text-slate-700">
                                     <input type="number" className="w-full bg-transparent text-right outline-none" value={emp.subsidyFamily || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyFamily', Number(e.target.value))}/>
                                </td>
                                <td className="p-2 border-r text-center text-[8px] text-slate-400 font-bold uppercase">
                                     <input type="number" className="w-full bg-transparent text-center outline-none" value={emp.subsidyFood || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyFood', Number(e.target.value))}/>
                                </td>
                                <td className="p-2 border-r text-center text-[8px] text-slate-400 font-bold uppercase">
                                     <input type="number" className="w-full bg-transparent text-center outline-none" value={emp.subsidyTransport || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'subsidyTransport', Number(e.target.value))}/>
                                </td>
                                <td className="p-2 border-r text-right font-mono text-[9px] text-slate-400">
                                     <input type="number" className="w-full bg-transparent text-right outline-none" value={emp.allowances || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'allowances', Number(e.target.value))}/>
                                </td>
                                <td className="p-2 border-r text-right font-mono text-[9px] text-slate-400">
                                     <input type="number" className="w-full bg-transparent text-right outline-none" value={emp.salaryAdjustments || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'salaryAdjustments', Number(e.target.value))}/>
                                </td>
                                <td className="p-2 border-r text-right font-mono text-[9px] text-slate-400">
                                     <input type="number" className="w-full bg-transparent text-right outline-none" value={emp.penalties || 0} onChange={e => handleUpdateEmployeeField(emp.id, 'penalties', Number(e.target.value))}/>
                                </td>
                                <td className="p-2 border-r text-center">
                                    <input type="checkbox" checked={emp.isMagic} onChange={e => handleUpdateEmployeeField(emp.id, 'isMagic', e.target.checked)} className="w-3 h-3 rounded accent-blue-600"/>
                                </td>
                                <td className="p-2 border-r text-center">
                                    {processedValue ? (
                                        <div className="flex flex-col items-center">
                                            <div className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100">{processedValue}</div>
                                            {isTransferred && <span className="text-[7px] font-black text-blue-600 uppercase mt-0.5">Transferido</span>}
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => { setActiveProcessingEmp(emp); setIsProcessingEffectiveness(true); }}
                                            className={`text-[9px] font-black uppercase underline hover:text-blue-600 ${complete ? 'text-emerald-600' : 'text-red-600'}`}
                                        >
                                            {complete ? 'Processar' : 'Pendente'}
                                        </button>
                                    )}
                                </td>
                                <td className="p-2 border-r text-center font-black text-slate-400">.</td>
                                <td className="p-2 border-r text-center">
                                    <input type="checkbox" checked={emp.isItemChecked} onChange={e => handleUpdateEmployeeField(emp.id, 'isItemChecked', e.target.checked)} className="w-4 h-4 rounded accent-red-600"/>
                                </td>
                                <td className="p-2 text-center">
                                    <button 
                                        onClick={() => {
                                            setReceiptData({ emp, month: processingMonth, year: processingYear, baseSalary: emp.baseSalary, complement: 0, abatimento: 0, hoursAbsence: 0, totalHours: 160 });
                                            setShowSalaryReceipt(true);
                                        }}
                                        className={`p-1 rounded transition-colors ${processedValue ? 'text-blue-600 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-50'}`}
                                        disabled={!processedValue}
                                    >
                                        <Printer size={14}/>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    </div>
  );

  const renderDashboard = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Total Colaboradores</p>
                      <h2 className="text-3xl font-black text-blue-900">{employees.filter(e => e.status === 'Active').length}</h2>
                  </div>
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Users size={24}/></div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Custo Mensal Estimado</p>
                      <h2 className="text-2xl font-bold text-slate-800">{formatCurrency(employees.reduce((acc, e) => acc + e.baseSalary, 0))}</h2>
                  </div>
                  <div className="p-3 bg-green-50 text-green-600 rounded-lg"><Calculator size={24}/></div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Processamentos do Mês</p>
                      <h2 className="text-3xl font-black text-orange-500">{payroll.length}</h2>
                  </div>
                  <div className="p-3 bg-orange-50 text-orange-600 rounded-lg"><RefreshCw size={24}/></div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                      <p className="text-slate-500 text-xs font-bold uppercase">Turnover (Risco)</p>
                      <h2 className="text-3xl font-black text-red-500">{employees.filter(e => e.turnoverRisk === 'High').length}</h2>
                  </div>
                  <div className="p-3 bg-red-50 text-red-600 rounded-lg"><TrendingUp size={24}/></div>
              </div>
          </div>
          
          <div className="bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl border-b-8 border-blue-600">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Shield size={120}/></div>
              <div className="relative z-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Gestão Estratégica de Capital Humano</h3>
                  <p className="text-slate-400 max-w-2xl leading-relaxed mb-8">
                      O ecossistema IMATEC automatiza o cálculo de IRT e INSS seguindo a legislação angolana atualizada de 2024. Gerencie assiduidade e remunerações com auditoria cloud completa.
                  </p>
                  <button onClick={() => setActiveTab('ASSIDUIDADE')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition transform active:scale-95">Aceder Grelha de Assiduidade</button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen animate-in fade-in pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="text-blue-600"/> Recursos Humanos & Processamento</h1>
                <div className="mt-2 space-y-2">
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Conformidade Legal AGT/MAPTSS</p>
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm w-fit">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selecionar Ação:</span>
                        <select 
                            className="bg-transparent text-[11px] font-black text-blue-600 uppercase outline-none cursor-pointer border-none p-0 focus:ring-0"
                            onChange={(e) => handleBulkAction(e.target.value)}
                            value=""
                        >
                            <option value="">Selecionar</option>
                            <option value="PROCESS_EFECTIVIDADE">Processar efetividade</option>
                            <option value="PROCESS_SALARIO">Processar salário</option>
                            <option value="TRANSFERIR">Transferir para Ordem</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-lg border shadow-sm overflow-x-auto w-full md:w-auto custom-scrollbar">
                {[
                  {id:'DASHBOARD', label: 'Painel Geral'},
                  {id:'GESTÃO', label: 'Funcionários'},
                  {id:'ASSIDUIDADE', label: 'Assiduidade Técnica'},
                  {id:'PROFISSÕES', label: 'Profissões'},
                  {id:'MAPAS', label: 'Mapas de Salários'},
                  {id:'CONTRATOS', label: 'Contratos'},
                  {id:'PROCESSAMENTO', label: 'Processamento'},
                  {id:'ORDEM_TRANSFERENCIA', label: 'Ordem Transferência'}
                ].map(t => (
                    <button 
                        key={t.id}
                        onClick={() => setActiveTab(t.id as any)}
                        className={`px-4 py-2 rounded-md font-bold text-[10px] uppercase transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-slate-800 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
        </div>

        {activeTab === 'DASHBOARD' && renderDashboard()}
        {activeTab === 'ASSIDUIDADE' && renderAssiduidade()}
        {activeTab === 'PROFISSÕES' && <div className="h-[calc(100vh-200px)]"><ProfessionManager professions={professions} onSave={onSaveProfession} onDelete={onDeleteProfession}/></div>}
        {activeTab === 'MAPAS' && <SalaryMap payroll={payroll} employees={employees} />}
        {activeTab === 'ORDEM_TRANSFERENCIA' && renderOrdemTransferencia()}
    </div>
  );
};

export default HumanResources;
