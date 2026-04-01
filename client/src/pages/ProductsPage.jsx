import { Link } from 'react-router-dom';
import MedicineList from '../components/MedicineList';

const ProductsPage = () => {
  return (
    <div className="pb-12">
      <section
        className="relative overflow-hidden mb-10 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-12 sm:py-14"
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 35%, #eff6ff 70%, #f8fafc 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div
            className="animate-blob absolute -top-20 right-[10%] w-80 h-80 rounded-full opacity-60"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,.2) 0%, transparent 70%)' }}
          />
          <div
            className="animate-blob animation-delay-2000 absolute -bottom-24 left-[5%] w-72 h-72 rounded-full opacity-50"
            style={{ background: 'radial-gradient(circle, rgba(14,165,233,.15) 0%, transparent 70%)' }}
          />
        </div>
        <div className="max-w-7xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live inventory · Verified suppliers
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Shop <span className="gradient-text-brand">medicines</span>
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mb-6">
            Browse the full catalog with search and categories. Stock counts and prices match what you see at checkout—orders reduce inventory automatically.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/cart" className="btn btn-primary btn-lg">
              View cart
            </Link>
            <Link to="/prescriptions" className="btn btn-secondary btn-lg">
              Upload prescription
            </Link>
            <Link to="/" className="btn btn-secondary btn-lg">
              ← Back to home
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MedicineList />
      </div>
    </div>
  );
};

export default ProductsPage;
