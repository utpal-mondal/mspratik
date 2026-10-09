import { useEffect, useState } from "react";
import Head from "next/head";
import { toast } from "react-toastify";
import withAuth from "../../components/withAuth";
import apiService from "../../services/api";
import Pagination from "../../components/ui/Pagination";
import DeleteModal from "../../components/DeleteModal";
import { useDebounce } from "../../hook/useDebounce";
import PageHeader from "./(component)/PageHeader";
import FilterSection from "./(component)/FilterSection";
import ProductList, { ProductItem } from "./(component)/ProductList";
import CreateProductDrawer from "./(component)/CreateProductDrawer";
import EditProductDrawer from "./(component)/EditProductDrawer";

const ProductPage = () => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ProductItem | null>(null);

  const debouncedQuery = useDebounce(searchQuery, 400);

  const getProducts = async () => {
    try {
      setLoading(true);
      const res = await apiService.getAllProducts({
        page,
        limit,
        query: debouncedQuery || undefined,
      });
      setProducts(res?.data?.data || []);
      setTotal(res?.data?.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, [page, limit, debouncedQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setPage(1);
  };

  const handleProductCreated = () => {
    setCreateOpen(false);
    if (page === 1) {
      getProducts();
    } else {
      setPage(1);
    }
  };

  const handleProductUpdated = () => {
    setEditTarget(null);
    getProducts();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await apiService.deleteProduct(deleteTarget.id);
      setProducts(products.filter((p) => p.id !== deleteTarget.id));
      setTotal((prev) => Math.max(prev - 1, 0));
      toast.success("Product deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Products | Pratik Transport</title>
        <meta name="description" content="Product list" />
      </Head>

      <main className="flex-1 p-3 md:p-4">
        <PageHeader total={total} onAddProduct={() => setCreateOpen(true)} />

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <FilterSection
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            onReset={handleResetFilters}
          />

          <ProductList
            products={products}
            loading={loading}
            page={page}
            limit={limit}
            onEdit={setEditTarget}
            onDelete={setDeleteTarget}
          />

          <Pagination
            currentPage={page}
            total={total}
            perPage={limit}
            onPageChange={setPage}
          />
        </div>
      </main>

      <CreateProductDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleProductCreated}
      />

      <EditProductDrawer
        product={editTarget}
        onClose={() => setEditTarget(null)}
        onUpdated={handleProductUpdated}
      />

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </>
  );
};

export default withAuth(ProductPage);
