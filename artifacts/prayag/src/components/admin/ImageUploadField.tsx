import { useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { requestUploadUrl } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export function toDisplayUrl(objectPath: string): string {
  if (objectPath.startsWith("/objects/")) return `/api/storage${objectPath}`;
  return objectPath;
}

export default function ImageUploadField({ value, onChange, label }: { value: string; onChange: (url: string) => void; label?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const { uploadURL, objectPath } = await requestUploadUrl({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" });
      const putRes = await fetch(uploadURL, { method: "PUT", body: file, headers: { "Content-Type": file.type || "application/octet-stream" } });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);
      onChange(toDisplayUrl(objectPath));
      toast({ title: "Image uploaded" });
    } catch (e) {
      toast({ title: "Upload failed", description: e instanceof Error ? e.message : "Try again", variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      {label && <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>}
      <div className="flex items-center gap-2">
        {value ? (
          <img src={value} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-200 bg-gray-50 flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-300 text-[10px] flex-shrink-0">No img</div>
        )}
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="Image URL or upload →"
          className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2.5 py-2 outline-none focus:border-[hsl(38,52%,40%)]" />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[hsl(24,10%,16%)] text-white px-3 py-2 rounded-lg hover:bg-[hsl(24,9%,26%)] disabled:opacity-50 flex-shrink-0"
          data-testid="button-upload-image">
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />} Upload
        </button>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </div>
    </div>
  );
}
