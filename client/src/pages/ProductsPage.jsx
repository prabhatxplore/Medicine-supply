import MedicineList from '../components/MedicineList';

const ProductsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Products</h1>
        <p className="text-slate-500 mb-8">Browse all medicines with live search and category filter.</p>
        <MedicineList />
      </div>
    </div>
  );
};

export default ProductsPage;
