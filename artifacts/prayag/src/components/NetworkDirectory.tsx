import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

async function fetchNetwork(apiBase: string, search: string, state: string, page: number) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (state) params.set("state", state);
  params.set("page", String(page));
  const res = await fetch(`${apiBase}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

async function fetchDetail(id: number) {
  const res = await fetch(`/api/distributor/network/${id}`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

interface NetworkDirectoryProps {
  apiBase: string;
  title: string;
  entityLabel: string; // e.g. "distributors", "direct dealers"
  testPrefix: string;  // e.g. "network", "dd-network"
}

export default function NetworkDirectory({ apiBase, title, entityLabel, testPrefix }: NetworkDirectoryProps) {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [state, setState] = useState("");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: network, isLoading } = useQuery({
    queryKey: [apiBase, search, state, page],
    queryFn: () => fetchNetwork(apiBase, search, state, page),
  });
  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["network-detail", selectedId],
    queryFn: () => fetchDetail(selectedId!),
    enabled: selectedId !== null,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {network && (
          <span className="text-xs bg-stone-200 text-stone-700 font-semibold px-3 py-1 rounded-full" data-testid={`text-${testPrefix}-total`}>
            {network.total.toLocaleString("en-IN")} {entityLabel}
          </span>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <form
          className="relative flex-1"
          onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
        >
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by company, contact, city, district or pincode..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[hsl(38,52%,40%)]"
            data-testid={`input-${testPrefix}-search`}
          />
        </form>
        <select
          value={state}
          onChange={(e) => { setState(e.target.value); setPage(1); }}
          className="bg-white border border-gray-200 rounded-xl text-sm px-3 py-2.5 focus:outline-none focus:border-[hsl(38,52%,40%)]"
          data-testid={`select-${testPrefix}-state`}
        >
          <option value="">All States</option>
          {(network?.states || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}</div>
      ) : network && network.distributors.length > 0 ? (
        <>
          <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm min-w-[2400px]">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>{["ID", "Date Created", "Created By", "Customer Type", "Company", "Contact Person 1", "Contact Number 1", "Alternate Contact 1", "DOB 1", "Contact Person 2", "Contact Number 2", "Alternate Contact 2", "DOB 2", "Anniversary", "Email", "Category", "Address", "State", "District", "City", "Pincode", "Area", "GST", "Status", "Authorised Date", "Segment", "Assign User", "Branding"].map(h => (
                  <th key={h} className="text-left px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {network.distributors.map((d: any) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors" data-testid={`row-${testPrefix}-${d.id}`}>
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">{d.distributorCode || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.dateCreated || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.createdBy || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.customerType || "—"}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedId(d.id)}
                        className="font-medium text-[hsl(38,52%,40%)] hover:underline text-left"
                        data-testid={`button-${testPrefix}-detail-${d.id}`}
                      >{d.businessName}</button>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{d.contactName || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.phone || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.alternateContact1 || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.contact1Dob || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.contactPerson2 || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.contactNumber2 || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.alternateContact2 || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.contact2Dob || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.anniversaryDate || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.email || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.category || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 max-w-[260px] truncate" title={d.address || ""}>{d.address || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.state || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.district || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.city || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.pincode || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 max-w-[180px] truncate" title={d.area || ""}>{d.area || "—"}</td>
                    <td className="px-3 py-3 text-gray-400 text-xs whitespace-nowrap">{d.gstNumber || "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${d.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{d.status}</span>
                    </td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.authorisedDate || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 max-w-[200px] truncate" title={d.assignedSegment || ""}>{d.assignedSegment || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 max-w-[180px] truncate" title={d.assignedUser || ""}>{d.assignedUser || "—"}</td>
                    <td className="px-3 py-3 text-gray-500 whitespace-nowrap">{d.customerBranding || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">Page {network.page} of {network.totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={network.page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                data-testid={`button-${testPrefix}-prev`}
              ><ChevronLeft className="w-3.5 h-3.5" /> Prev</button>
              <button
                onClick={() => setPage(p => Math.min(network.totalPages, p + 1))}
                disabled={network.page >= network.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg bg-white text-gray-700 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                data-testid={`button-${testPrefix}-next`}
              >Next <ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
          <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500">No {entityLabel} found</p>
        </div>
      )}

      <Dialog open={selectedId !== null} onOpenChange={(open) => { if (!open) setSelectedId(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" data-testid={`dialog-${testPrefix}-detail`}>
          {detailLoading || !detail ? (
            <div className="space-y-3 py-6">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}</div>
          ) : (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  {detail.profileImgUrl ? (
                    <img src={detail.profileImgUrl} alt={detail.businessName} className="w-14 h-14 rounded-full object-cover border border-gray-200"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[hsl(24,10%,16%)]/10 flex items-center justify-center">
                      <Users className="w-6 h-6 text-[hsl(38,52%,40%)]" />
                    </div>
                  )}
                  <div>
                    <DialogTitle className="text-lg font-bold text-gray-900">{detail.businessName}</DialogTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {detail.distributorCode && <span className="text-xs text-gray-400">{detail.distributorCode}</span>}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${detail.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{detail.status}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              {[
                { section: "Contact Details", fields: [
                  ["Contact Person 1", detail.contactName],
                  ["Contact Number 1", detail.phone],
                  ["Alternate Contact 1", detail.alternateContact1],
                  ["Contact Person 1 DOB", detail.contact1Dob],
                  ["Contact Person 2", detail.contactPerson2],
                  ["Contact Number 2", detail.contactNumber2],
                  ["Alternate Contact 2", detail.alternateContact2],
                  ["Contact Person 2 DOB", detail.contact2Dob],
                  ["Date of Anniversary", detail.anniversaryDate],
                  ["Email", detail.email],
                ]},
                { section: "Location", fields: [
                  ["Address", detail.address],
                  ["State", detail.state],
                  ["District", detail.district],
                  ["City", detail.city],
                  ["Pincode", detail.pincode],
                  ["Area", detail.area],
                ]},
                { section: "Business Details", fields: [
                  ["Customer Type", detail.customerType],
                  ["Category", detail.category],
                  ["GST", detail.gstNumber],
                  ["Assigned Segment", detail.assignedSegment],
                  ["Assign User", detail.assignedUser],
                  ["Assigned Distributor", detail.assignDistributor],
                  ["Customer Branding", detail.customerBranding],
                  ["Account Status", detail.accountStatus],
                ]},
                { section: "KYC & Bank Details", fields: [
                  ["Aadhar No.", detail.aadharNo],
                  ["PAN No.", detail.panNo],
                  ["Bank Name", detail.bankName],
                  ["Account Holder Name", detail.accountHolderName],
                  ["Account No.", detail.accountNo],
                  ["IFSC Code", detail.ifscCode],
                ]},
                { section: "Record Info", fields: [
                  ["Date Created", detail.dateCreated],
                  ["Created By", detail.createdBy],
                  ["Authorised Date", detail.authorisedDate],
                ]},
              ].map(({ section, fields }) => {
                const filled = fields.filter(([, v]) => v);
                if (filled.length === 0) return null;
                return (
                  <div key={section} className="mt-2">
                    <h3 className="text-xs font-semibold text-[hsl(38,52%,40%)] uppercase tracking-wide mb-2">{section}</h3>
                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2 bg-gray-50 rounded-xl p-4">
                      {filled.map(([label, value]) => (
                        <div key={label as string} className={label === "Address" ? "sm:col-span-2" : ""}>
                          <div className="text-[11px] text-gray-400">{label}</div>
                          <div className="text-sm font-medium text-gray-900 break-words">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {(detail.visitingCardUrl || detail.passbookImgUrl || detail.aadharFrontUrl || detail.aadharBackUrl || detail.panImageUrl || detail.bankPassbookUrl) && (
                <div className="mt-2">
                  <h3 className="text-xs font-semibold text-[hsl(38,52%,40%)] uppercase tracking-wide mb-2">Documents</h3>
                  <div className="flex gap-3">
                    {detail.visitingCardUrl && (
                      <a href={detail.visitingCardUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(38,52%,40%)] font-medium hover:underline">Visiting Card</a>
                    )}
                    {detail.passbookImgUrl && (
                      <a href={detail.passbookImgUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(38,52%,40%)] font-medium hover:underline">Passbook Image</a>
                    )}
                    {detail.aadharFrontUrl && (
                      <a href={detail.aadharFrontUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(38,52%,40%)] font-medium hover:underline">Aadhar Front</a>
                    )}
                    {detail.aadharBackUrl && (
                      <a href={detail.aadharBackUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(38,52%,40%)] font-medium hover:underline">Aadhar Back</a>
                    )}
                    {detail.panImageUrl && (
                      <a href={detail.panImageUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(38,52%,40%)] font-medium hover:underline">PAN Image</a>
                    )}
                    {detail.bankPassbookUrl && (
                      <a href={detail.bankPassbookUrl} target="_blank" rel="noreferrer" className="text-sm text-[hsl(38,52%,40%)] font-medium hover:underline">Bank Passbook</a>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
