import { authenticatedFetch } from "./authenticated-fetch";

export async function downloadInvoice(orderId: number, orderNumber: string): Promise<void> {
  const res = await authenticatedFetch(`/api/orders/${orderId}/invoice`);
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
