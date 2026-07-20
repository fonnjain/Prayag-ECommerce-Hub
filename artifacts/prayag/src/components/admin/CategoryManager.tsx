import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useListCategoriesWithCounts, getListCategoriesWithCountsQueryKey, getListCategoriesQueryKey, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import ImageUploadField from "./ImageUploadField";

const inputCls = "w-full text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-[hsl(38,52%,40%)]";

interface CatForm { name: string; slug: string; description: string; imageUrl: string }
const emptyForm: CatForm = { name: "", slug: "", description: "", imageUrl: "" };

export default function CategoryManager() {
  const { data: categories, isLoading } = useListCategoriesWithCounts();
  const createCat = useCreateCategory();
  const updateCat = useUpdateCategory();
  const deleteCat = useDeleteCategory();
  const qc = useQueryClient();
  const { toast } = useToast();

  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [form, setForm] = useState<CatForm>(emptyForm);

  function invalidate() {
    qc.invalidateQueries({ queryKey: getListCategoriesWithCountsQueryKey() });
    qc.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
  }

  function startEdit(cat?: { id: number; name: string; slug: string; description?: string | null; imageUrl?: string | null }) {
    if (cat) {
      setEditing(cat.id);
      setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", imageUrl: cat.imageUrl || "" });
    } else {
      setEditing("new");
      setForm(emptyForm);
    }
  }

  function handleSave() {
    if (!form.name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
    const payload = { name: form.name.trim(), slug: form.slug.trim() || undefined, description: form.description.trim() || null, imageUrl: form.imageUrl.trim() || null };
    const opts = {
      onSuccess: () => { invalidate(); setEditing(null); toast({ title: editing === "new" ? "Category created" : "Category updated" }); },
      onError: (e: unknown) => toast({ title: "Failed", description: e instanceof Error ? e.message : undefined, variant: "destructive" }),
    };
    if (editing === "new") createCat.mutate({ data: payload }, opts);
    else if (typeof editing === "number") updateCat.mutate({ id: editing, data: payload }, opts);
  }

  function handleDelete(id: number, name: string) {
    if (!window.confirm(`Delete category "${name}"? Iske products hone par delete nahi hoga.`)) return;
    deleteCat.mutate({ id }, {
      onSuccess: () => { invalidate(); toast({ title: "Category deleted" }); },
      onError: () => toast({ title: "Delete failed", description: "Category may still have products assigned.", variant: "destructive" }),
    });
  }

  const saving = createCat.isPending || updateCat.isPending;

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-5">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Categories ({categories?.length || 0})</h2>
          <button onClick={() => startEdit()} className="flex items-center gap-1.5 text-xs font-bold bg-[hsl(38,52%,40%)] text-white px-3 py-2 rounded-lg hover:bg-[hsl(38,52%,35%)]" data-testid="button-add-category">
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
        </div>
        {isLoading ? <div className="p-5 text-sm text-gray-400">Loading…</div> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>{["", "Name", "Slug", "Products", "Actions"].map(h => <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 uppercase">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-50">
              {(categories || []).map(c => (
                <tr key={c.id} className="hover:bg-gray-50" data-testid={`row-category-${c.id}`}>
                  <td className="px-4 py-2.5 w-12">{c.imageUrl ? <img src={c.imageUrl} alt="" className="w-9 h-9 object-cover rounded-lg" /> : <div className="w-9 h-9 rounded-lg bg-gray-100" />}</td>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-2.5 text-gray-400 text-xs font-mono">{c.slug}</td>
                  <td className="px-4 py-2.5">{c.productCount ?? 0}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-[hsl(38,52%,40%)]" data-testid={`button-edit-category-${c.id}`}><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c.id, c.name)} className="text-gray-400 hover:text-red-500" data-testid={`button-delete-category-${c.id}`}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{editing === "new" ? "New Category" : "Edit Category"}</h3>
              <button onClick={() => setEditing(null)}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputCls} data-testid="input-category-name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Slug (blank = auto)</label>
                <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} />
              </div>
              <ImageUploadField label="Image" value={form.imageUrl} onChange={v => setForm({ ...form, imageUrl: v })} />
              <button onClick={handleSave} disabled={saving}
                className="w-full flex items-center justify-center gap-2 bg-[hsl(24,10%,16%)] text-white text-sm font-bold py-2.5 rounded-xl hover:bg-[hsl(24,9%,26%)] disabled:opacity-50"
                data-testid="button-save-category">
                {saving && <Loader2 className="w-4 h-4 animate-spin" />} Save Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
