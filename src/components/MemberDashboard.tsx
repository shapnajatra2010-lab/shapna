import React, { useState, useEffect } from "react";
import { 
  Users, 
  CreditCard, 
  History, 
  TrendingUp, 
  Phone, 
  Mail, 
  MapPin, 
  LogOut,
  Loader2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
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
  amount: number;
  payment_date: string;
  payment_type: string;
  remarks: string;
};

type MemberDashboardProps = {
  member: Member;
  onLogout: () => void;
};

export default function MemberDashboard({ member, onLogout }: MemberDashboardProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await fetch(`/api/member/payments/${member.member_id}`);
      const data = await res.json();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  const isPaidThisMonth = () => {
    const currentMonth = new Date().toLocaleString('en-US', { month: 'long' }).toUpperCase();
    const currentYear = new Date().getFullYear().toString();
    const currentTag = `${currentMonth}-${currentYear}`;
    return payments.some(p => p.remarks && p.remarks.includes(currentTag));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 font-sans pb-12">
      <header className="bg-emerald-600 text-white p-6 lg:p-8 rounded-b-[40px] shadow-xl shadow-emerald-600/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-white font-bold text-2xl backdrop-blur-md">
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{member.name}</h1>
              <p className="text-emerald-100 text-sm opacity-80">সদস্য আইডি: {member.member_id}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all backdrop-blur-md"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-8 space-y-6">
        {/* Payment Notice */}
        <AnimatePresence>
          {isPaidThisMonth() ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-emerald-700 text-center font-bold text-sm shadow-sm"
            >
              ধন্যবাদ! আপনার চলতি মাসের টাকা পরিশোধ করা হয়েছে।
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-rose-700 text-center font-bold text-sm shadow-sm"
            >
              নোটিশ! আপনার চলতি মাসের টাকা দ্রুত পরিশোধ করুন।
            </motion.div>
          )}
        </AnimatePresence>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">মোট জমা</p>
              <h4 className="text-3xl font-bold tracking-tight">৳{totalPaid.toLocaleString()}</h4>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between"
          >
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">মোট পেমেন্ট</p>
              <h4 className="text-3xl font-bold tracking-tight">{payments.length}টি</h4>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <CreditCard size={24} />
            </div>
          </motion.div>
        </div>

        {/* Profile Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-sm"
        >
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Users size={20} className="text-emerald-600" />
            সদস্য তথ্য
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem icon={<Phone />} label="ফোন নম্বর" value={member.phone || "দেওয়া হয়নি"} />
            <InfoItem icon={<Mail />} label="ইমেইল" value={member.email || "দেওয়া হয়নি"} />
            <InfoItem icon={<MapPin />} label="ঠিকানা" value={member.address || "দেওয়া হয়নি"} />
            <InfoItem icon={<Calendar />} label="যোগদানের তারিখ" value={new Date(member.joined_date).toLocaleDateString("bn-BD")} />
          </div>
        </motion.div>

        {/* Payment History */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 lg:p-8 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <History size={20} className="text-emerald-600" />
              পেমেন্ট হিস্ট্রি
            </h3>
          </div>
          
          {loading ? (
            <div className="p-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : payments.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {payments.map((p) => (
                <div key={p.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <ArrowUpRight size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{p.payment_type}</p>
                      <p className="text-xs text-slate-500">{new Date(p.payment_date).toLocaleDateString("bn-BD")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">৳{p.amount}</p>
                    <p className="text-[10px] text-slate-400 italic">{p.remarks || "কোনো মন্তব্য নেই"}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <p>এখনো কোনো পেমেন্ট রেকর্ড করা হয়নি</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}
