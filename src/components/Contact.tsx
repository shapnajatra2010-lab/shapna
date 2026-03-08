import React, { useState, useEffect } from "react";
import { Phone, ArrowLeft, Loader2, Users } from "lucide-react";
import { motion } from "motion/react";

type CommitteeMember = {
  id: number;
  name: string;
  designation: string;
  phone: string;
};

type ContactProps = {
  onBack: () => void;
};

export default function Contact({ onBack }: ContactProps) {
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/committee")
      .then(res => res.json())
      .then(data => {
        setCommittee(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className="bg-emerald-600 p-6 text-white flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-xl transition-all">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-bold">জরুরী যোগাযোগ</h2>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : committee.length > 0 ? (
            <div className="space-y-4">
              {committee.map((c) => (
                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{c.name}</p>
                      <p className="text-xs text-emerald-600 font-medium">{c.designation}</p>
                    </div>
                  </div>
                  <a 
                    href={`https://wa.me/88${c.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <Phone size={18} />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-400 py-12">কোনো তথ্য পাওয়া যায়নি</p>
          )}

          <button 
            onClick={onBack}
            className="w-full mt-6 py-3 text-slate-500 font-semibold hover:bg-slate-50 rounded-xl transition-all"
          >
            ফিরে যান
          </button>
        </div>
      </motion.div>
    </div>
  );
}
