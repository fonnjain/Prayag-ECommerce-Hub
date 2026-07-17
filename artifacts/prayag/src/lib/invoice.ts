import { useAuthStore } from "./store";

export async function downloadInvoice(orderId: number, orderNumber: string): Promise<void> {
  const token = useAuthStore.getState().token;
  const res = await fetch(`/api/orders/${orderId}/invoice`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    alert("Could not download invoice. Please make sure you are signed in.");
    return;
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Invoice-${orderNumber}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
