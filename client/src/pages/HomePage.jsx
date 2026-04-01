import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { notifyCartUpdated } from "../utils/cartNotify";
import MedicineProductCard from "../components/MedicineProductCard";

/* ── Category config with unique icons ── */
const CATEGORIES = [
  { name: "All",         icon: "🏥", color: "from-emerald-500 to-teal-500" },
  { name: "Pain Relief", icon: "💊", color: "from-red-400 to-orange-400" },
  { name: "Cold & Cough",icon: "🤧", color: "from-blue-400 to-cyan-400" },
  { name: "Vitamins",    icon: "🌿", color: "from-green-400 to-emerald-500" },
  { name: "Antibiotics", icon: "🧬", color: "from-purple-400 to-violet-500" },
];

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="card overflow-hidden">
    <div className="skeleton h-44 rounded-none" />
    <div className="p-5 space-y-3">
      <div className="skeleton h-5 w-3/4 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
      <div className="skeleton h-8 w-1/3 mt-2 rounded" />
      <div className="flex gap-2 mt-4">
        <div className="skeleton h-10 flex-1 rounded-full" />
        <div className="skeleton h-10 flex-1 rounded-full" />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const isFetchingMedicines = useRef(false);
  const shouldFetchMe = useRef(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const init = async () => {
      if (!shouldFetchMe.current) return;
      shouldFetchMe.current = false;
      setLoading(true);
      try {
        const res = await fetch("http://localhost:3000/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
          setIsAuthenticated(true);
          if (data.role === "admin") navigate("/admin");
          else if (data.role === "volunteer") navigate("/volunteer");
          else if (data.role === "user") {
            // user can stay on homepage
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [navigate]);

  const fetchMedicines = useCallback(async (cat = "All") => {
    if (isFetchingMedicines.current) return;
    isFetchingMedicines.current = true;
    if (!initialLoad) setIsRefetching(true);
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat !== "All") params.append("category", cat);
      const url = `http://localhost:3000/api/medicines${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();
      setMedicines(data.slice(0, 6));
      setInitialLoad(false);
    } catch {
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
      setIsRefetching(false);
      isFetchingMedicines.current = false;
    }
  }, [initialLoad]);

  useEffect(() => {
    fetchMedicines(selectedCategory);
  }, [selectedCategory, fetchMedicines]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
  };

  const addToCart = (medicine) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to cart");
      return;
    }

    if (medicine.quantity === 0) {
      toast.error("Out of stock");
      return;
    }

    const stock = Number(medicine.quantity);
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const ex = cart.find((i) => i._id === medicine._id);
    const nextQty = ex ? ex.quantity + 1 : 1;
    if (nextQty > stock) {
      toast.error(`Only ${stock} available for ${medicine.name}`);
      return;
    }
    if (ex) ex.quantity += 1;
    else cart.push({ ...medicine, quantity: 1 });
    localStorage.setItem("cart", JSON.stringify(cart));
    notifyCartUpdated();
    toast.success("Added to cart! 🛒");
  };

  const displayedMedicines = medicines;

  if (initialLoad && loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[40vh]">
        <div className="text-3xl">⏳ Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
      {isRefetching && (
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-xs px-3 py-1 rounded-lg z-50">
          Refreshing medicines...
        </div>
      )}
      {!isAuthenticated && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm text-center mb-4">
          You can browse products but must login to add to cart or checkout.
        </div>
      )}

      {/* ─────────── HERO ─────────── */}
      <section style={{ background: "linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 30%, #eff6ff 70%, #f8fafc 100%)", padding: "5rem 1rem 4rem", position: "relative", overflow: "hidden" }}>
        {/* BG blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
          <div className="animate-blob" style={{ position: "absolute", top: -60, right: "10%", width: 380, height: 380, background: "radial-gradient(circle, rgba(16,185,129,.18) 0%, transparent 70%)", borderRadius: "50%" }} />
          <div className="animate-blob animation-delay-2000" style={{ position: "absolute", bottom: -80, left: "5%", width: 300, height: 300, background: "radial-gradient(circle, rgba(14,165,233,.14) 0%, transparent 70%)", borderRadius: "50%" }} />
        </div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="animate-fadeInUp">
              <div className="inline-flex items-center gap-2 mb-5" style={{ background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.2)", borderRadius: 9999, padding: "6px 14px" }}>
                <span style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%", display: "inline-block", animation: "pulse-ring 2s infinite" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#059669" }}>30-Minute Delivery Available</span>
              </div>
              <h1 style={{ fontSize: "clamp(2.25rem, 5vw, 3.5rem)", fontWeight: 900, color: "#0f172a", lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.03em" }}>
                Your Health Deserves{" "}
                <span className="gradient-text-brand">the Best Care</span>
              </h1>
              <p style={{ fontSize: "1.125rem", color: "#64748b", lineHeight: 1.7, marginBottom: "2rem", maxWidth: "48ch" }}>
                Verified medicines delivered to your doorstep. Trusted by thousands across Nepal.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/products" className="btn btn-primary btn-lg">
                  Order Now
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </Link>
                {!user && (
                  <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
                )}
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-6 mt-10 stagger-children">
                {[["10K+", "Happy Customers"], ["30min", "Avg Delivery"], ["100%", "Genuine Meds"]].map(([val, lbl]) => (
                  <div key={lbl} className="animate-fadeInUp">
                    <p style={{ fontSize: "1.625rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{val}</p>
                    <p style={{ fontSize: "0.8125rem", color: "#64748b", marginTop: 3 }}>{lbl}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Illustration */}
            <div className="hidden md:flex justify-center items-center animate-slideInRight">
              <div style={{ position: "relative" }}>
                <div style={{ width: 280, height: 280, background: "linear-gradient(135deg,rgba(16,185,129,.12),rgba(14,165,233,.12))", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div className="animate-float" style={{ fontSize: 120 }}>💊</div>
                </div>
                {/* Floating badges */}
                <div className="animate-scaleIn card" style={{ position: "absolute", top: 10, right: -30, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, animationDelay: "0.3s" }}>
                  <span style={{ fontSize: 20 }}>🚚</span>
                  <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Fast Delivery</p>
                    <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>~30 minutes</p>
                  </div>
                </div>
                <div className="animate-scaleIn card" style={{ position: "absolute", bottom: 20, left: -30, padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, animationDelay: "0.5s" }}>
                  <span style={{ fontSize: 20 }}>✅</span>
                  <div>
                    <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0f172a", margin: 0 }}>Verified Meds</p>
                    <p style={{ fontSize: "0.6875rem", color: "#94a3b8", margin: 0 }}>100% genuine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── TRUST BADGES ─────────── */}
      <section style={{ background: "#fff", padding: "3rem 1rem" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {[
              { icon: "✅", title: "100% Genuine", desc: "All products certified", color: "#10b981", bg: "#f0fdf4" },
              { icon: "⚡", title: "Fast Delivery", desc: "30 mins average", color: "#f59e0b", bg: "#fffbeb" },
              { icon: "🔒", title: "Secure Payment", desc: "Encrypted & safe", color: "#3b82f6", bg: "#eff6ff" },
              { icon: "💬", title: "24/7 Support", desc: "Always here for you", color: "#8b5cf6", bg: "#f5f3ff" },
            ].map((b) => (
              <div key={b.title} className="card card-lift animate-fadeInUp" style={{ padding: "1.5rem", display: "flex", alignItems: "flex-start", gap: 14, borderTop: `3px solid ${b.color}` }}>
                <div style={{ width: 44, height: 44, background: b.bg, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>{b.icon}</div>
                <div>
                  <h3 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "#0f172a", marginBottom: 3 }}>{b.title}</h3>
                  <p style={{ fontSize: "0.8125rem", color: "#64748b", margin: 0 }}>{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── CATEGORIES ─────────── */}
      <section style={{ background: "linear-gradient(180deg,#f8fafc 0%,#fff 100%)", padding: "3.5rem 1rem" }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">Shop by Category</h2>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleCategoryChange(cat.name)}
                  style={{
                    flexShrink: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    padding: "1rem 1.25rem",
                    borderRadius: 16,
                    border: "none",
                    cursor: "pointer",
                    transition: "all .25s cubic-bezier(.16,1,.3,1)",
                    fontFamily: "inherit",
                    background: isActive ? `linear-gradient(135deg, ${cat.color.replace("from-", "").replace(" to-", ",")} )` : "#fff",
                    ...(isActive ? {} : { border: "2px solid #e2e8f0" }),
                    transform: isActive ? "translateY(-3px) scale(1.05)" : "none",
                    boxShadow: isActive ? "0 8px 24px rgba(0,0,0,.12)" : "0 2px 6px rgba(0,0,0,.05)",
                    minWidth: 90,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{cat.icon}</span>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: isActive ? "#fff" : "#374151", whiteSpace: "nowrap" }}>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─────────── PRODUCTS ─────────── */}
      <section id="products" style={{ padding: "3.5rem 1rem" }}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
              <h2 className="section-title">Featured Medicines</h2>
              <Link to="/products" className="btn btn-ghost btn-sm" style={{ border: "2px solid #e2e8f0" }}>
                View all products →
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayedMedicines.length === 0 ? (
              <div className="card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>🔍</div>
                <h3 className="section-title" style={{ marginBottom: 12 }}>No results found</h3>
                <p style={{ fontSize: "1.0625rem", color: "#64748b", marginBottom: 24, maxWidth: "28rem", marginLeft: "auto", marginRight: "auto" }}>
                  No featured medicines in this category yet. Try another category or browse the full catalog.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  <button type="button" onClick={() => setSelectedCategory("All")} className="btn btn-primary">
                    Show all categories
                  </button>
                  <Link to="/products" className="btn btn-secondary">
                    Browse catalog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
                {displayedMedicines.map((med, idx) => (
                  <MedicineProductCard
                    key={med._id}
                    medicine={med}
                    onAddToCart={() => addToCart(med)}
                    animationDelay={`${Math.min(idx, 5) * 60}ms`}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

      {/* ─────────── HOW IT WORKS ─────────── */}
      <section style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f2027 100%)", padding: "4rem 1rem", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 50%, rgba(16,185,129,.08) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(14,165,233,.06) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.25rem)", fontWeight: 800, color: "#fff", marginBottom: 12 }}>How It Works</h2>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: "1rem" }}>Get your medicines in 4 simple steps</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {[
              { num: "01", emoji: "🔍", title: "Search", desc: "Find your medicines easily" },
              { num: "02", emoji: "🛒", title: "Add to Cart", desc: "Select quantity & add" },
              { num: "03", emoji: "📋", title: "Checkout", desc: "Place your order securely" },
              { num: "04", emoji: "🚚", title: "Delivery", desc: "Delivered in ~30 minutes" },
            ].map((step, i) => (
              <div key={i} className="animate-fadeInUp" style={{ textAlign: "center" }}>
                <div style={{ position: "relative", display: "inline-flex", marginBottom: 16 }}>
                  <div style={{ width: 72, height: 72, background: "rgba(255,255,255,.06)", border: "2px solid rgba(255,255,255,.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, transition: "all .3s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,.2)"; e.currentTarget.style.borderColor = "#10b981"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,.1)"; }}>
                    {step.emoji}
                  </div>
                  <span style={{ position: "absolute", top: -6, right: -6, width: 22, height: 22, background: "linear-gradient(135deg,#10b981,#0d9488)", borderRadius: "50%", fontSize: "0.625rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {step.num.slice(-1)}
                  </span>
                </div>
                <h3 style={{ fontWeight: 700, color: "#fff", marginBottom: 6, fontSize: "1rem" }}>{step.title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "rgba(255,255,255,.55)", lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── TESTIMONIALS ─────────── */}
      <section style={{ background: "#fff", padding: "4rem 1rem" }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title" style={{ marginBottom: 12 }}>What Customers Say</h2>
            <p className="section-subtitle">Thousands of satisfied customers across Nepal</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger-children">
            {[
              { name: "Sagar Dhakal", role: "Kathmandu", review: "Got my medicines in 20 minutes! The service is exceptional and the app is so easy to use.", rating: 5, avatar: "S" },
              { name: "Bibek Thapa", role: "Pokhara", review: "Very reliable and all products are completely genuine. I've been using this for 6 months now.", rating: 5, avatar: "B" },
              { name: "Amit Poudel", role: "Lalitpur", review: "Best online pharmacy in Nepal. The delivery is always on time and the prices are very competitive.", rating: 5, avatar: "A" },
            ].map((t) => (
              <div key={t.name} className="card card-lift animate-fadeInUp" style={{ padding: "1.75rem" }}>
                <div className="flex mb-3">
                  {[...Array(t.rating)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                  ))}
                </div>
                <p style={{ fontSize: "0.9375rem", color: "#374151", lineHeight: 1.65, marginBottom: 20, fontStyle: "italic" }}>"{t.review}"</p>
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, background: "linear-gradient(135deg,#10b981,#0d9488)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "1rem" }}>{t.avatar}</div>
                  <div>
                    <p style={{ fontWeight: 700, color: "#0f172a", margin: 0, fontSize: "0.9375rem" }}>{t.name}</p>
                    <p style={{ fontSize: "0.75rem", color: "#94a3b8", margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── CTA SECTION ─────────── */}
      {!user && (
        <section style={{ background: "linear-gradient(135deg,#10b981,#0d9488,#0284c7)", padding: "4rem 1rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: "none" }} />
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 style={{ fontSize: "clamp(1.75rem,4vw,2.5rem)", fontWeight: 800, color: "#fff", marginBottom: 16, lineHeight: 1.15 }}>
              Ready to Get Your Medicines?
            </h2>
            <p style={{ color: "rgba(255,255,255,.8)", marginBottom: 32, fontSize: "1.0625rem" }}>
              Join thousands of customers who trust PharmaCare for fast, genuine medicine delivery.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup" className="btn btn-lg" style={{ background: "#fff", color: "#10b981", boxShadow: "0 8px 24px rgba(0,0,0,.15)" }}>
                Create Free Account →
              </Link>
              <Link to="/login" className="btn btn-lg" style={{ background: "rgba(255,255,255,.15)", color: "#fff", border: "2px solid rgba(255,255,255,.4)", backdropFilter: "blur(8px)" }}>
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─────────── FOOTER ─────────── */}
      <footer style={{ background: "#0f172a", color: "#94a3b8", padding: "3rem 1rem 1.5rem" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div style={{ width: 36, height: 36, background: "linear-gradient(135deg,#10b981,#0d9488)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💊</div>
                <span style={{ fontWeight: 800, color: "#fff", fontSize: "1.125rem" }}>PharmaCare</span>
              </div>
              <p style={{ fontSize: "0.875rem", lineHeight: 1.65, color: "#64748b" }}>
                Your trusted online pharmacy delivering health at your doorstep across Nepal.
              </p>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: "#fff", marginBottom: 14, fontSize: "0.9375rem" }}>Quick Links</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Home", "/"], ["Shop", "/products"], ["Cart", "/cart"]].map(([lbl, href]) => (
                  <li key={lbl}><Link to={href} style={{ fontSize: "0.875rem", color: "#64748b", textDecoration: "none", transition: "color .15s" }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#64748b"}>{lbl}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: "#fff", marginBottom: 14, fontSize: "0.9375rem" }}>Support</h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Contact Us", "#"], ["FAQs", "#"], ["Privacy Policy", "#"]].map(([lbl, href]) => (
                  <li key={lbl}><a href={href} style={{ fontSize: "0.875rem", color: "#64748b", textDecoration: "none", transition: "color .15s" }}
                    onMouseEnter={e => e.target.style.color = "#fff"}
                    onMouseLeave={e => e.target.style.color = "#64748b"}>{lbl}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 style={{ fontWeight: 700, color: "#fff", marginBottom: 14, fontSize: "0.9375rem" }}>Contact</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.875rem" }}>
                <p style={{ margin: 0, color: "#64748b" }}>📍 Kathmandu, Nepal</p>
                <p style={{ margin: 0, color: "#64748b" }}>📞 +977-1-234-5678</p>
                <p style={{ margin: 0, color: "#64748b" }}>✉️ hello@pharmacare.np</p>
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #1e293b", paddingTop: 20, textAlign: "center" }}>
            <p style={{ fontSize: "0.8125rem", color: "#475569", margin: 0 }}>
              © 2026 PharmaCare Nepal. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
