import React, { useState, useEffect } from "react";
import { 
  Users, 
  CreditCard, 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  TrendingUp, 
  Search,
  Menu,
  X,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Loader2,
  ShieldCheck,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type Member = {
  id: number;
  name: string;
  member_id: string;
  phone: string;
  email: string;
  address: string;
  joined_date: string;
};

type Payment = {
  id: number;
  member_id: string;
  member_name: string;
  amount: number;
  payment_date: string;
  payment_type: string;
  remarks: string;
};

type Stats = {
  memberCount: number;
  totalAmount: number;
  recentPayments: Payment[];
};

type CommitteeMember = {
  id: number;
  name: string;
  designation: string;
  phone: string;
  order_index: number;
};

type AdminDashboardProps = {
  onLogout: () => void;
};

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "members" | "payments" | "committee" | "due">("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showCommitteeForm, setShowCommitteeForm] = useState(false);

  const [newMember, setNewMember] = useState({ name: "", member_id: "", phone: "", email: "", address: "" });
  const [newPayment, setNewPayment] = useState({ member_id: "", amount: "", payment_type: "মাসিক", remarks: "" });
  const [newCommittee, setNewCommittee] = useState({ name: "", designation: "", phone: "", order_index: "0" });

  useEffect(() => {
    fetchData();
    if (window.innerWidth > 1024) {
      setIsSidebarOpen(true);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, membersRes, paymentsRes, committeeRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/members"),
        fetch("/api/payments"),
        fetch("/api/committee")
      ]);
      setStats(await statsRes.json());
      setMembers(await membersRes.json());
      setPayments(await paymentsRes.json());
      setCommittee(await committeeRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMember)
      });
      if (res.ok) {
        setNewMember({ name: "", member_id: "", phone: "", email: "", address: "" });
        setShowMemberForm(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই সদস্যকে মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/members/${memberId}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting member:", error);
    }
  };

  const handleDeletePayment = async (id: number) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পেমেন্ট রেকর্ডটি মুছে ফেলতে চান?")) return;
    try {
      const res = await fetch(`/api/payments/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newPayment, amount: parseFloat(newPayment.amount) })
      });
      if (res.ok) {
        // WhatsApp notification logic from PHP
        const member = members.find(m => m.member_id === newPayment.member_id);
        if (member && member.phone && confirm("পেমেন্ট সফল। রিসিট পাঠাবেন?")) {
          const msg = `*স্বপ্নযাত্রা-২০১০*\nসদস্য: ${member.name}\nটাকা: ৳${newPayment.amount}\nধন্যবাদ।`;
          window.open(`https://wa.me/88${member.phone}?text=${encodeURIComponent(msg)}`, '_blank');
        }
        setNewPayment({ member_id: "", amount: "", payment_type: "মাসিক", remarks: "" });
        setShowPaymentForm(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error adding payment:", error);
    }
  };

  const getDueMembers = () => {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase();
    const currentYear = new Date().getFullYear().toString();
    const currentTag = `${currentMonth}-${currentYear}`;
    
    return members.filter(m => {
      const memberPayments = payments.filter(p => p.member_id === m.member_id);
      // Simple check: if no payment for current month/year
      // (Note: This is a simplified version of the PHP logic)
      return !memberPayments.some(p => p.remarks && p.remarks.includes(currentTag));
    });
  };

  const sendReminder = (member: Member) => {
    const currentMonth = new Date().toLocaleString('bn-BD', { month: 'long' });
    const msg = `স্বপ্নযাত্রা-২০১০\nপ্রিয় ${member.name},\n${currentMonth} মাসের চাঁদা এখনো বকেয়া রয়েছে। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ।`;
    window.open(`https://wa.me/88${member.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleAddCommittee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/committee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newCommittee, order_index: parseInt(newCommittee.order_index) })
      });
      if (res.ok) {
        setNewCommittee({ name: "", designation: "", phone: "", order_index: "0" });
        setShowCommitteeForm(false);
        fetchData();
      }
    } catch (error) {
      console.error("Error adding committee member:", error);
    }
  };

  if (loading && !stats) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const tabNames = {
    dashboard: "ড্যাশবোর্ড",
    members: "সদস্যবৃন্দ",
    payments: "পেমেন্ট রেকর্ড",
    committee: "কমিটি",
    due: "বকেয়া রিপোর্ট"
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex text-slate-900 font-sans">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside 
        initial={false}
        animate={{ 
          width: isSidebarOpen ? 280 : (window.innerWidth < 1024 ? 0 : 80),
          x: isSidebarOpen ? 0 : (window.innerWidth < 1024 ? -280 : 0)
        }}
        className="bg-white border-r border-slate-200 flex flex-col fixed lg:sticky top-0 h-screen z-40 overflow-hidden"
      >
        <div className="p-6 flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="text-white w-6 h-6" />
          </div>
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-xl tracking-tight whitespace-nowrap"
            >
              স্বপ্নযাত্রা
            </motion.div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarItem icon={<LayoutDashboard />} label="ড্যাশবোর্ড" active={activeTab === "dashboard"} onClick={() => { setActiveTab("dashboard"); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} isOpen={isSidebarOpen} />
          <SidebarItem icon={<Users />} label="সদস্যবৃন্দ" active={activeTab === "members"} onClick={() => { setActiveTab("members"); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} isOpen={isSidebarOpen} />
          <SidebarItem icon={<CreditCard />} label="পেমেন্ট" active={activeTab === "payments"} onClick={() => { setActiveTab("payments"); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} isOpen={isSidebarOpen} />
          <SidebarItem icon={<History />} label="বকেয়া রিপোর্ট" active={activeTab === "due"} onClick={() => { setActiveTab("due"); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} isOpen={isSidebarOpen} />
          <SidebarItem icon={<ShieldCheck />} label="কমিটি" active={activeTab === "committee"} onClick={() => { setActiveTab("committee"); if(window.innerWidth < 1024) setIsSidebarOpen(false); }} isOpen={isSidebarOpen} />
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button 
            onClick={onLogout}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-rose-500 hover:bg-rose-50`}
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-semibold">লগআউট</span>}
          </button>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full p-2 hover:bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 hidden lg:flex"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.aside>

      <main className="flex-1 overflow-x-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-20 px-4 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-600">
              <Menu size={24} />
            </button>
            <h1 className="text-xl lg:text-2xl font-semibold">{tabNames[activeTab]}</h1>
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <button 
              onClick={() => {
                if (activeTab === "members") setShowMemberForm(true);
                else if (activeTab === "payments") setShowPaymentForm(true);
                else if (activeTab === "committee") setShowCommitteeForm(true);
                else setShowPaymentForm(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-full text-xs lg:text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <PlusCircle size={18} />
              <span className="hidden sm:inline">নতুন {activeTab === "members" ? "সদস্য" : activeTab === "payments" ? "পেমেন্ট" : activeTab === "committee" ? "কমিটি সদস্য" : "পেমেন্ট"}</span>
              <span className="sm:hidden">যোগ করুন</span>
            </button>
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6 lg:space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <StatCard title="মোট সদস্য" value={stats?.memberCount || 0} icon={<Users className="text-emerald-600" />} trend="গত মাস থেকে +১২%" trendUp={true} />
                  <StatCard title="মোট সংগ্রহ" value={`৳${stats?.totalAmount.toLocaleString() || 0}`} icon={<TrendingUp className="text-blue-600" />} trend="গত মাস থেকে +৫.৪%" trendUp={true} />
                  <StatCard title="মাসিক লক্ষ্যমাত্রা" value="৳৫০,০০০" icon={<CreditCard className="text-purple-600" />} trend="৮৪% অর্জিত" trendUp={true} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                  <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg">সাম্প্রতিক পেমেন্ট</h3>
                      <button onClick={() => setActiveTab("payments")} className="text-emerald-600 text-sm font-medium hover:underline">সব দেখুন</button>
                    </div>
                    <div className="space-y-4">
                      {stats?.recentPayments.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 flex-shrink-0">
                              <CreditCard size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{p.member_name}</p>
                              <p className="text-xs text-slate-500">{new Date(p.payment_date).toLocaleDateString("bn-BD")}</p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-semibold text-emerald-600">৳{p.amount}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider">{p.payment_type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 lg:p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-semibold text-lg">নতুন সদস্য</h3>
                      <button onClick={() => setActiveTab("members")} className="text-emerald-600 text-sm font-medium hover:underline">সব দেখুন</button>
                    </div>
                    <div className="space-y-4">
                      {members.slice(0, 5).map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 flex-shrink-0">
                              <Users size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{m.name}</p>
                              <p className="text-xs text-slate-500">আইডি: {m.member_id}</p>
                            </div>
                          </div>
                          <ChevronRight size={16} className="text-slate-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "members" && (
              <motion.div key="members" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">সদস্য</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">আইডি</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">যোগাযোগ</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">যোগদান</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">অ্যাকশন</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 text-xs font-bold">{m.name.charAt(0)}</div>
                              <span className="font-medium text-sm">{m.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{m.member_id}</td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-xs text-slate-500"><Phone size={12} /> {m.phone}</div>
                              <div className="flex items-center gap-2 text-xs text-slate-500"><Mail size={12} /> {m.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">{new Date(m.joined_date).toLocaleDateString("bn-BD")}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setNewMember({
                                    name: m.name,
                                    member_id: m.member_id,
                                    phone: m.phone,
                                    email: m.email,
                                    address: m.address
                                  });
                                  setShowMemberForm(true);
                                }}
                                className="text-blue-500 hover:text-blue-700 transition-colors p-1"
                              >
                                <PlusCircle size={18} />
                              </button>
                              <button 
                                onClick={() => handleDeleteMember(m.member_id)}
                                className="text-rose-500 hover:text-rose-700 transition-colors p-1"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "payments" && (
              <motion.div key="payments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">তারিখ</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">সদস্য</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">ধরন</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">পরিমাণ</th>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">মন্তব্য</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-slate-600">{new Date(p.payment_date).toLocaleDateString("bn-BD")}</td>
                          <td className="px-6 py-4"><span className="font-medium text-sm">{p.member_name}</span></td>
                          <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md">{p.payment_type}</span></td>
                          <td className="px-6 py-4 font-semibold text-emerald-600 text-sm">৳{p.amount}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 italic">{p.remarks || "-"}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeletePayment(p.id)}
                              className="text-rose-500 hover:text-rose-700 transition-colors p-1"
                            >
                              <X size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === "committee" && (
              <motion.div key="committee" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                {committee.map((c) => (
                  <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 font-bold text-2xl flex-shrink-0">{c.name.charAt(0)}</div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-lg truncate">{c.name}</h4>
                      <p className="text-emerald-600 text-sm font-medium truncate">{c.designation}</p>
                      <p className="text-slate-500 text-sm mt-1 flex items-center gap-1"><Phone size={12} /> {c.phone}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
            {activeTab === "due" && (
              <motion.div key="due" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-700">বকেয়া সদস্যদের তালিকা ({new Date().toLocaleString('bn-BD', { month: 'long' })})</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  {getDueMembers().map((m) => (
                    <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 font-bold">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm">{m.name}</p>
                          <p className="text-xs text-slate-500">আইডি: {m.member_id}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => sendReminder(m)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors"
                      >
                        <Phone size={14} />
                        রিমাইন্ডার পাঠান
                      </button>
                    </div>
                  ))}
                  {getDueMembers().length === 0 && (
                    <div className="p-12 text-center text-slate-400">
                      সবাই পরিশোধ করেছেন!
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Modal isOpen={showMemberForm} onClose={() => setShowMemberForm(false)} title="নতুন সদস্য যোগ করুন">
        <form onSubmit={handleAddMember} className="space-y-4">
          <Input label="পুরো নাম" value={newMember.name} onChange={(v) => setNewMember({...newMember, name: v})} required />
          <Input label="সদস্য আইডি" value={newMember.member_id} onChange={(v) => setNewMember({...newMember, member_id: v})} required />
          <Input label="ফোন নম্বর" value={newMember.phone} onChange={(v) => setNewMember({...newMember, phone: v})} />
          <Input label="ইমেইল অ্যাড্রেস" type="email" value={newMember.email} onChange={(v) => setNewMember({...newMember, email: v})} />
          <Input label="ঠিকানা" value={newMember.address} onChange={(v) => setNewMember({...newMember, address: v})} />
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors mt-6">সদস্য হিসেবে নিবন্ধন করুন</button>
        </form>
      </Modal>

      <Modal isOpen={showPaymentForm} onClose={() => setShowPaymentForm(false)} title="পেমেন্ট রেকর্ড করুন">
        <form onSubmit={handleAddPayment} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">সদস্য নির্বাচন করুন</label>
            <select className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none" value={newPayment.member_id} onChange={(e) => {
                const mid = e.target.value;
                const idNum = parseInt(mid.replace(/\D/g, ''));
                let amount = "2000";
                if ((idNum >= 1 && idNum <= 23) || idNum === 43) {
                  amount = "4000";
                }
                setNewPayment({...newPayment, member_id: mid, amount});
              }} required>
              <option value="">সদস্য নির্বাচন করুন...</option>
              {members.map(m => (<option key={m.id} value={m.member_id}>{m.name} ({m.member_id})</option>))}
            </select>
          </div>
          <Input label="পরিমাণ (৳)" type="number" value={newPayment.amount} onChange={(v) => setNewPayment({...newPayment, amount: v})} required />
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">পেমেন্টের ধরন</label>
            <select className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none appearance-none" value={newPayment.payment_type} onChange={(e) => setNewPayment({...newPayment, payment_type: e.target.value})}>
              <option value="মাসিক">মাসিক চাঁদা</option>
              <option value="দান">দান</option>
              <option value="জরুরী">জরুরী তহবিল</option>
              <option value="অন্যান্য">অন্যান্য</option>
            </select>
          </div>
          <Input label="মন্তব্য" value={newPayment.remarks} onChange={(v) => setNewPayment({...newPayment, remarks: v})} />
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors mt-6">পেমেন্ট নিশ্চিত করুন</button>
        </form>
      </Modal>

      <Modal isOpen={showCommitteeForm} onClose={() => setShowCommitteeForm(false)} title="কমিটি সদস্য যোগ করুন">
        <form onSubmit={handleAddCommittee} className="space-y-4">
          <Input label="পুরো নাম" value={newCommittee.name} onChange={(v) => setNewCommittee({...newCommittee, name: v})} required />
          <Input label="পদবী" value={newCommittee.designation} onChange={(v) => setNewCommittee({...newCommittee, designation: v})} required />
          <Input label="ফোন নম্বর" value={newCommittee.phone} onChange={(v) => setNewCommittee({...newCommittee, phone: v})} />
          <Input label="ক্রমিক নম্বর" type="number" value={newCommittee.order_index} onChange={(v) => setNewCommittee({...newCommittee, order_index: v})} />
          <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors mt-6">কমিটিতে যোগ করুন</button>
        </form>
      </Modal>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick, isOpen }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, isOpen: boolean }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${active ? "bg-emerald-50 text-emerald-600 font-semibold" : "text-slate-500 hover:bg-slate-50"}`}>
      <span className={`${active ? "text-emerald-600" : "text-slate-400"}`}>{icon}</span>
      {isOpen && <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-sm">{label}</motion.span>}
    </button>
  );
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string, value: string | number, icon: React.ReactNode, trend: string, trendUp: boolean }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">{icon}</div>
        <div className={`flex items-center gap-1 text-xs font-medium ${trendUp ? "text-emerald-600" : "text-rose-600"}`}>
          {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h4 className="text-3xl font-bold tracking-tight">{value}</h4>
    </div>
  );
}

function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Input({ label, value, onChange, type = "text", required = false }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} className="w-full bg-slate-100 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all" />
    </div>
  );
}
