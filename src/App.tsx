/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import MemberDashboard from "./components/MemberDashboard";
import Contact from "./components/Contact";

type AuthState = {
  role: "admin" | "member" | "contact" | null;
  member?: any;
};

export default function App() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem("shapnajatra_auth");
    return saved ? JSON.parse(saved) : { role: null };
  });

  useEffect(() => {
    localStorage.setItem("shapnajatra_auth", JSON.stringify(auth));
  }, [auth]);

  const handleLogin = (data: { role: string; member?: any }) => {
    setAuth({ role: data.role as any, member: data.member });
  };

  const handleLogout = () => {
    setAuth({ role: null });
    localStorage.removeItem("shapnajatra_auth");
  };

  if (auth.role === "contact") {
    return <Contact onBack={() => setAuth({ role: null })} />;
  }

  if (!auth.role) {
    return <Login onLogin={handleLogin} onShowContact={() => setAuth({ role: "contact" })} />;
  }

  if (auth.role === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  return <MemberDashboard member={auth.member} onLogout={handleLogout} />;
}

