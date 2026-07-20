import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { getProduct, useUpdateProduct, useListCategories, getListAdminProductsQueryKey } from "@workspace/api-client-react";
import type { Product, ProductDetail } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ImageUploadField from "./ImageUploadField";

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[hsl(38,52%,40%)]";
const labelCls = "block text-xs font-medium text-gray-500 mb-1";

interface Form {
  name: string; sku: string; price: number; mrp: number; categoryId: number;
  description: string; specifications: string; warranty: string; gstPercent: number;
  imageUrl: string; images: string[]; isFeatured: boolean; isNew: boolean; inStock: boolean;
}

export default function ProductEditModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { data: detail, isLoading } = useQuery<ProductDetail>({ queryKey: ["admin-product-detail", product.slug], queryFn: () => getProduct(product.slug) });
  const { data: categories } = useListCategories();
  const updateProduct = useUpdateProduct();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    if (!detail) return;
    setForm({
      name: detail.name, sku: detail.sku, price: detail.price, mrp: detail.mrp,
      categoryId: detail.categoryId, description: detail.description || "",
      specifications: detail.specifications || "", warranty: detail.warranty || "",
      gstPercent: detail.gstPercent ?? 18, imageUrl: detail.imageUrl || "",
      images: detail.images || [], isFeatured: !!detail.isFeatured, isNew: !!detail.isNew, inStock: detail.inStock,
    });
  }, [detail]);

  function handleSave() {
    if (!form) return;
    updateProduct.mutate({
      id: product.id,
      data: {
        name: form.name, sku: form.sku, price: form.price, mrp: form.mrp,
        categoryId: form.categoryId, description: form.description,
        specifications: form.specifications || null, warranty: form.warranty || null,
        gstPercent: form.gstPercent, imageUrl: form.imageUrl || null,
        images: form.images.filter(Boolean), isFeatured: form.isFeatured, isNew: form.isNew, inStock: form.inStock,
      },
    }, {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAdminProductsQueryKey({}) });
        qc.invalidateQueries({ queryKey: ["admin-product-detail", product.slug] });
        toast({ title: "Product updated" });
        onClose();
      },
      onError: (e) => toast({ title: "Update failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" }),
    });
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Edit Product</h3>
          <button onClick={onClose} data-testid="button-close-product-modal"><X className="w-4 h-4 text-gray-400" /></button>
        </div>
        {isLoading || !form ? (
          <div className="py-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} data-testid="input-product-name" /></div>
              <div><label className={labelCls}>SKU</label><input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div><label className={labelCls}>Price (₹)</label><input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className={inputCls} data-testid="input-product-price" /></div>
              <div><label className={labelCls}>MRP (₹)</label><input type="number" value={form.mrp} onChange={e => setForm({ ...form, mrp: Number(e.target.value) })} className={inputCls} /></div>
              <div><label className={labelCls}>GST %</label><input type="number" value={form.gstPercent} onChange={e => setForm({ ...form, gstPercent: Number(e.target.value) })} className={inputCls} /></div>
              <div>
                <label className={labelCls}>Category</label>
                <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: Number(e.target.value) })} className={inputCls} data-testid="select-product-category">
                  {(categories || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div><label className={labelCls}>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Specifications</label><textarea value={form.specifications} onChange={e => setForm({ ...form, specifications: e.target.value })} rows={2} className={inputCls} /></div>
              <div><label className={labelCls}>Warranty</label><textarea value={form.warranty} onChange={e => setForm({ ...form, warranty: e.target.value })} rows={2} className={inputCls} /></div>
            </div>
            <ImageUploadField label="Main image" value={form.imageUrl} onChange={v => setForm({ ...form, imageUrl: v })} />
            <div>
              <label className={labelCls}>Gallery images</label>
              <div className="space-y-2">
                {form.images.map((img, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex-1"><ImageUploadField value={img} onChange={v => setForm({ ...form, images: form.images.map((x, j) => j === i ? v : x) })} /></div>
                    <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="text-red-400 hover:text-red-600 flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                <button onClick={() => setForm({ ...form, images: [...form.images, ""] })}
                  className="flex items-center gap-1 text-xs font-semibold text-[hsl(38,52%,40%)]"><Plus className="w-3.5 h-3.5" /> Add image</button>
              </div>
            </div>
            <div className="flex gap-5 pt-1">
              {([["isFeatured", "Featured"], ["isNew", "New Arrival"], ["inStock", "In Stock"]] as const).map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 text-sm text-gray-700">
                  <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} className="accent-[hsl(38,52%,40%)]" data-testid={`checkbox-product-${key}`} />
                  {label}
                </label>
              ))}
            </div>
            <button onClick={handleSave} disabled={updateProduct.isPending}
              className="w-full flex items-center justify-center gap-2 bg-[hsl(24,10%,16%)] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[hsl(24,9%,26%)] disabled:opacity-50"
              data-testid="button-save-product">
              {updateProduct.isPending && <Loader2 className="w-4 h-4 animate-spin" />} Save Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
