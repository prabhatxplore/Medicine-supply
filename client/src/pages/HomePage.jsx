import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const categories = [
    "All",
    "Pain Relief",
    "Cold & Cough",
    "Vitamins",
    "Antibiotics",
  ];

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data);
          // Redirect admin to admin dashboard
          if (data.role === "admin") {
            navigate("/admin");
          }
        }
      } catch (err) {
        // Not logged in
      }
    };
    fetchUser();
    fetchMedicines();
  }, [navigate]);

  const fetchMedicines = async (searchQuery = "", categoryFilter = "All") => {
    setLoading(true);
    try {
      let url = "http://localhost:3000/api/medicines";
      const params = new URLSearchParams();

      if (searchQuery.trim()) {
        params.append("search", searchQuery);
      }
      if (categoryFilter !== "All") {
        params.append("category", categoryFilter);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setAllMedicines(data);
      setMedicines(data.slice(0, 6)); // Featured medicines
    } catch (err) {
      console.error("Failed to load medicines");
      toast.error("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  // Handle search from URL params
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearch(searchQuery);
      fetchMedicines(searchQuery, selectedCategory);
    } else {
      fetchMedicines("", selectedCategory);
    }
  }, [searchParams, selectedCategory]);

  // Handle category changes
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    fetchMedicines(search, category);
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      toast.success("Logged out successfully");
      setUser(null);
      setMobileMenuOpen(false);
      // Redirect to home
      window.location.href = "/";
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchTerm = search.trim();
    if (searchTerm) {
      fetchMedicines(searchTerm, selectedCategory);
      window.history.replaceState(
        {},
        "",
        `/?search=${encodeURIComponent(searchTerm)}`,
      );
    } else {
      fetchMedicines("", selectedCategory);
      window.history.replaceState({}, "", "/");
    }
  };

  const addToCart = (medicine) => {
    if (medicine.quantity === 0) {
      toast.error("Out of stock");
      return;
    }
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existing = cart.find((item) => item._id === medicine._id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ ...medicine, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart!");
  };

  // Medicines are now filtered on backend, so we just use the fetched data
  const displayedMedicines = search ? allMedicines : medicines;

  return (
    <div className="min-h-screen bg-white">
      {/* Modern Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-xl bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">💊</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent hidden sm:inline">
                  PharmaCare
                </span>
                <p className="text-xs text-gray-500 hidden sm:block">
                  Your Health, Our Priority
                </p>
              </div>
            </Link>

            {/* Search Bar - Hidden on mobile */}
            <div className="hidden md:flex flex-1 max-w-sm mx-6">
              <form onSubmit={handleSearch} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search medicines, symptoms..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-5 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm transition"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-emerald-600 transition"
                >
                  🔍
                </button>
              </form>
            </div>

            {/* Right Nav - Desktop */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link
                to="/cart"
                className="relative p-2 text-gray-600 hover:text-emerald-600 transition text-2xl"
              >
                🛒
              </Link>
              {user ? (
                <div className="flex items-center space-x-4 pl-6 border-l border-gray-200">
                  <Link
                    to="/orders"
                    className="text-sm text-gray-700 hover:text-emerald-600 font-medium transition"
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-700 font-medium transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-sm text-gray-700 hover:text-emerald-600 font-medium transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-sm bg-emerald-600 text-white px-4 py-2 rounded-full hover:bg-emerald-700 font-medium transition shadow-md"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-emerald-600 transition"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4 space-y-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-2 pl-5 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-emerald-600"
                >
                  🔍
                </button>
              </form>
              <nav className="flex items-center justify-between">
                <Link
                  to="/cart"
                  className="p-2 text-gray-600 hover:text-emerald-600 text-2xl"
                >
                  🛒
                </Link>
                {user ? (
                  <div className="flex items-center space-x-2">
                    <Link
                      to="/orders"
                      className="text-sm text-gray-700 hover:text-emerald-600"
                    >
                      Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="space-x-2">
                    <Link
                      to="/login"
                      className="text-sm text-gray-700 hover:text-emerald-600"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="text-sm bg-emerald-600 text-white px-3 py-1 rounded-full hover:bg-emerald-700"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 via-blue-50 to-teal-50 py-12 md:py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 left-20 w-72 h-72 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                Your Health Deserves the{" "}
                <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Best Care
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                Verified medicines delivered to your doorstep in 30 minutes.
                Trusted by thousands of happy customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={user ? "/#products" : "/signup"}
                  className="bg-emerald-600 text-white px-8 py-3 rounded-full hover:bg-emerald-700 text-center font-semibold transition shadow-lg hover:shadow-xl"
                >
                  Order Now
                </Link>
                {user && user.role === "admin" && (
                  <Link
                    to="/admin/login"
                    className="border-2 border-emerald-600 text-emerald-600 px-8 py-3 rounded-full hover:bg-emerald-50 text-center font-semibold transition"
                  >
                    Admin Portal
                  </Link>
                )}
              </div>
            </div>
            <div className="hidden md:flex justify-center items-center">
              <div className="text-8xl animate-bounce">💊</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {[
              {
                icon: "✓",
                title: "100% Genuine",
                desc: "All products verified",
              },
              { icon: "⚡", title: "Fast Delivery", desc: "30 mins average" },
              { icon: "🔒", title: "Secure Payment", desc: "Encrypted & safe" },
              {
                icon: "💬",
                title: "24/7 Support",
                desc: "Always here to help",
              },
            ].map((badge, i) => (
              <div
                key={i}
                className="p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:shadow-md transition"
              >
                <div className="text-3xl md:text-4xl mb-3">{badge.icon}</div>
                <h3 className="font-bold text-gray-900 text-sm md:text-base mb-1">
                  {badge.title}
                </h3>
                <p className="text-xs md:text-sm text-gray-600">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 md:mb-10">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
            {categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => handleCategoryChange(cat)}
                className={`p-4 md:p-5 rounded-xl text-center transition duration-300 transform hover:scale-105 ${
                  selectedCategory === cat
                    ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg scale-105"
                    : "bg-white shadow-md hover:shadow-lg text-gray-900 border border-gray-100"
                }`}
              >
                <div className="text-3xl md:text-4xl mb-2">💊</div>
                <span className="block text-xs md:text-sm font-semibold truncate">
                  {cat}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      {(loading || displayedMedicines.length > 0) && (
        <section id="products" className="py-12 md:py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 md:mb-10">
              {search ? `Search Results for "${search}"` : "Featured Medicines"}
            </h2>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="text-center">
                  <div className="animate-spin inline-flex text-5xl mb-4">
                    ⏳
                  </div>
                  <p className="text-gray-600">Loading medicines...</p>
                </div>
              </div>
            ) : displayedMedicines.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-600 text-lg mb-6">
                  {search
                    ? `No medicines found for "${search}"`
                    : "No medicines available"}
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    handleCategoryChange("All");
                    window.history.replaceState({}, "", "/");
                  }}
                  className="bg-emerald-600 text-white px-6 py-2 rounded-full hover:bg-emerald-700 font-semibold transition"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {displayedMedicines.map((medicine) => (
                  <div
                    key={medicine._id}
                    className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden flex flex-col group hover:translate-y-[-4px]"
                  >
                    <div className="relative overflow-hidden bg-gray-100 h-40 md:h-48">
                      {medicine.image ? (
                        <img
                          src={`http://localhost:3000/${medicine.image}`}
                          alt={medicine.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-emerald-100 to-teal-100">
                          💊
                        </div>
                      )}
                      {medicine.quantity >= 0 &&
                        medicine.quantity <= 5 &&
                        medicine.quantity > 0 && (
                          <div className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                            Low Stock
                          </div>
                        )}
                    </div>
                    <div className="p-4 md:p-5 flex flex-col flex-1">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                        {medicine.name}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                        {medicine.description || "Quality medicine"}
                      </p>
                      {medicine.requiresPrescription && (
                        <div className="mb-3 text-xs bg-red-50 text-red-700 px-3 py-1 rounded-full font-semibold inline-block">
                          ⚠️ Requires Prescription
                        </div>
                      )}
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-2xl md:text-3xl font-bold text-emerald-600">
                          ${medicine.price}
                        </span>
                        {medicine.quantity === 0 && (
                          <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-semibold">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <Link
                          to={`/medicine/${medicine._id}`}
                          className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 text-center text-xs md:text-sm font-bold transition"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => addToCart(medicine)}
                          className={`flex-1 text-white py-2 px-3 rounded-lg text-xs md:text-sm font-bold transition ${
                            medicine.quantity === 0
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-emerald-600 hover:bg-emerald-700"
                          }`}
                          disabled={medicine.quantity === 0}
                        >
                          🛒 Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-12 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              {
                num: "1",
                emoji: "🔍",
                title: "Search",
                desc: "Find your medicines",
              },
              { num: "2", emoji: "🛒", title: "Add", desc: "Add to cart" },
              {
                num: "3",
                emoji: "📋",
                title: "Checkout",
                desc: "Complete order",
              },
              {
                num: "4",
                emoji: "🚚",
                title: "Deliver",
                desc: "30 mins delivery",
              },
            ].map((step, i) => (
              <div key={i} className="text-center text-white">
                <div className="w-14 h-14 mx-auto bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-2xl mb-4 border border-white/40">
                  {step.emoji}
                </div>
                <h3 className="font-bold mb-2 text-sm md:text-base">
                  {step.title}
                </h3>
                <p className="text-xs md:text-sm text-white/80">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
            What Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                name: "Raj Kumar",
                review: "Got my medicines in 20 mins! Excellent service.",
                rating: 5,
              },
              {
                name: "Priya Singh",
                review:
                  "Very reliable and genuine products. Highly recommended!",
                rating: 5,
              },
              {
                name: "Amit Patel",
                review: "Best online pharmacy. Love the fast delivery!",
                rating: 5,
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-2xl hover:shadow-lg transition"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">
                  "{testimonial.review}"
                </p>
                <p className="font-bold text-gray-900">— {testimonial.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gradient-to-r from-emerald-600 to-teal-600 py-10 md:py-14 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Ready to Order?
          </h2>
          <p className="text-white/80 mb-6 text-sm md:text-base">
            Get your medicines delivered fast with PharmaCare
          </p>
          <Link
            to={user ? "/#products" : "/signup"}
            className="bg-white text-emerald-600 px-8 py-3 rounded-full hover:bg-gray-100 text-center font-bold transition shadow-lg inline-block"
          >
            Start Shopping Now →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 md:py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-white mb-4">PharmaCare</h3>
              <p className="text-sm text-gray-400">
                Your trusted online pharmacy delivering health at your doorstep.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/" className="hover:text-white transition">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to={user ? "/#products" : "/signup"}
                    className="hover:text-white transition"
                  >
                    Shop
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    FAQs
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Follow Us</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
            <p>
              &copy; 2026 PharmaCare. All rights reserved. | Privacy Policy |
              Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  );

  {
    /* Footer */
  }
  <div className="bg-gray-900 text-gray-300 py-8 md:py-12 px-4">
    <footer className="bg-gray-900 text-white py-8 md:py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-8">
        <div>
          <h3 className="font-semibold mb-4 text-sm md:text-base">
            About PharmaCare
          </h3>
          <p className="text-gray-400 text-xs md:text-sm">
            Your trusted online pharmacy with fast delivery and genuine
            medicines.
          </p>
        </div>
        <div>
          <h3 className="font-semibold mb-4 text-sm md:text-base">
            Quick Links
          </h3>
          <ul className="text-gray-400 text-xs md:text-sm space-y-2">
            <li>
              <Link to="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link
                to={user ? "/orders" : "/login"}
                className="hover:text-white"
              >
                Orders
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 text-sm md:text-base">Support</h3>
          <ul className="text-gray-400 text-xs md:text-sm space-y-2">
            <li>
              <a href="#" className="hover:text-white">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                FAQ
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Terms
              </a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-4 text-sm md:text-base">Connect</h3>
          <ul className="text-gray-400 text-xs md:text-sm space-y-2">
            <li>
              <a href="#" className="hover:text-white">
                Facebook
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Instagram
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-white">
                Twitter
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-700 pt-6 md:pt-8 text-center text-gray-400 text-xs md:text-sm">
        <p>&copy; 2026 PharmaCare. All rights reserved.</p>
      </div>
    </footer>
  </div>;
};

export default HomePage;
