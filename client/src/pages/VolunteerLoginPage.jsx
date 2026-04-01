import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const VolunteerLoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:3000/api/auth/me', { credentials: 'include' });
        if (!res.ok) return;
        const user = await res.json();
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'volunteer') navigate('/volunteer');
        else if (user.role === 'user') navigate('/orders');
      } catch {
        // not authenticated
      }
    })();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok) {
        toast.error(result.message || "Login failed");
      } else if (result.role !== "volunteer") {
        toast.error("This account is not a volunteer.");
        navigate(result.role === "admin" ? "/admin" : result.role === "user" ? "/orders" : "/");
      } else {
        toast.success("Welcome, volunteer! 🚚");
        navigate("/volunteer");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg,#064e3b 0%,#065f46 40%,#0f172a 100%)", padding: "2rem 1rem", position: "relative", overflow: "hidden" }}>
      {/* BG */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div className="animate-blob" style={{ position: "absolute", top: "5%", right: "5%", width: 300, height: 300, background: "radial-gradient(circle, rgba(16,185,129,.14) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div className="animate-blob animation-delay-4000" style={{ position: "absolute", bottom: "10%", left: "5%", width: 250, height: 250, background: "radial-gradient(circle, rgba(5,150,105,.12) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </div>

      <div className="animate-scaleIn" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ width: 64, height: 64, background: "linear-gradient(135deg,#10b981,#059669)", borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 16px", boxShadow: "0 8px 24px rgba(16,185,129,.35)" }}>
            🚚
          </div>
          <h1 style={{ fontWeight: 900, fontSize: "1.75rem", color: "#fff", margin: "0 0 6px", letterSpacing: "-0.02em" }}>Volunteer Portal</h1>
          <p style={{ color: "rgba(255,255,255,.55)", fontSize: "0.9375rem", margin: 0 }}>Pickup & delivery operations</p>
        </div>

        {/* Feature hints */}
        <div style={{ display: "flex", gap: 10, marginBottom: "1.5rem", flexWrap: "wrap" }}>
          {[["⚡", "Claim orders fast"], ["📍", "Track deliveries"], ["💰", "Earn rewards"]].map(([icon, text]) => (
            <div key={text} style={{ flex: 1, minWidth: 80, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 10, padding: "8px 12px", textAlign: "center" }}>
              <div style={{ fontSize: 18, marginBottom: 3 }}>{icon}</div>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,.6)", margin: 0, fontWeight: 600, lineHeight: 1.3 }}>{text}</p>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,.08)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 20, padding: "2rem" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,.8)", marginBottom: 8 }}>Email Address</label>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.4)", width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <input name="email" type="email" placeholder="volunteer@pharmacare.np" value={formData.email} onChange={handleChange} required
                  style={{ width: "100%", padding: "0.75rem 1rem 0.75rem 2.5rem", background: "rgba(255,255,255,.08)", border: "2px solid rgba(255,255,255,.12)", borderRadius: 12, color: "#fff", fontFamily: "inherit", fontSize: "0.9375rem", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,.15)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.12)"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.875rem", fontWeight: 600, color: "rgba(255,255,255,.8)", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <svg style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.4)", width: 18, height: 18 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={formData.password} onChange={handleChange} required
                  style={{ width: "100%", padding: "0.75rem 2.75rem 0.75rem 2.5rem", background: "rgba(255,255,255,.08)", border: "2px solid rgba(255,255,255,.12)", borderRadius: 12, color: "#fff", fontFamily: "inherit", fontSize: "0.9375rem", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => { e.target.style.borderColor = "#10b981"; e.target.style.boxShadow = "0 0 0 4px rgba(16,185,129,.15)"; }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,.12)"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,.4)", padding: 0, display: "flex" }}>
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "0.875rem", background: loading ? "rgba(16,185,129,.4)" : "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none", borderRadius: 12, fontFamily: "inherit", fontSize: "1rem", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, transition: "all .2s" }}>
              {loading ? (
                <>
                  <svg className="animate-spin-smooth" width="18" height="18" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,.3)" strokeWidth="3" /><path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round" /></svg>
                  Signing in…
                </>
              ) : "🚚 Sign In"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem", display: "flex", gap: 16, justifyContent: "center" }}>
          <Link to="/" style={{ color: "rgba(255,255,255,.45)", fontSize: "0.875rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to Home
          </Link>
          <span style={{ color: "rgba(255,255,255,.15)" }}>|</span>
          <Link to="/admin/login" style={{ color: "rgba(255,255,255,.45)", fontSize: "0.875rem", textDecoration: "none" }}>
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VolunteerLoginPage;
