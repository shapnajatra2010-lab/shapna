import React, { useState } from "react";
import { ShieldCheck, Users, Lock, Loader2, Phone } from "lucide-react";
import { motion } from "motion/react";

type LoginProps = {
  onLogin: (data: { role: string; member?: any }) => void;
  onShowContact: () => void;
};

export default function Login({ onLogin, onShowContact }: LoginProps) {
  const [loginType, setLoginType] = useState<"admin" | "member">("member");
  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: loginType, id, pin })
      });
      const data = await res.json();
      if (res.ok) {
        onLogin(data);
      } else {
        setError(data.error || "লগইন ব্যর্থ হয়েছে");
      }
    } catch (err) {
      setError("সার্ভারের সাথে যোগাযোগ করা যাচ্ছে না");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200"
      >
        <div className="bg-emerald-600 p-8 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
            <Users className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold">স্বপ্নযাত্রা-২০১০</h1>
          <p className="text-emerald-100 mt-1">একতা ও বন্ধুত্বের এক অনন্য ঠিকানা</p>
        </div>

        <div className="p-8">
          <div className="flex p-1 bg-slate-100 rounded-xl mb-8">
            <button 
              onClick={() => setLoginType("member")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginType === "member" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}
            >
              সদস্য লগইন
            </button>
            <button 
              onClick={() => setLoginType("admin")}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${loginType === "admin" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500"}`}
            >
              এডমিন লগইন
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {loginType === "member" ? (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">সদস্য আইডি</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="আপনার আইডি লিখুন"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">এডমিন পিন</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="password" 
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="পিন কোড লিখুন"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>
            )}

            {error && <p className="text-rose-500 text-xs font-medium text-center">{error}</p>}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "প্রবেশ করুন"}
            </button>
          </form>

          <button 
            onClick={onShowContact}
            className="w-full mt-6 py-3 text-emerald-600 font-semibold border-2 border-emerald-600 rounded-xl hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
          >
            <Phone size={18} />
            জরুরী যোগাযোগ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
