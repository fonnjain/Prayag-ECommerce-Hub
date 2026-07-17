import PDFDocument from "pdfkit";

export interface InvoiceOrder {
  id: number;
  orderNumber: string;
  status: string | null;
  items: {
    productName: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
  subtotal: number;
  gst: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string | null;
  createdAt?: string;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  } | null;
  customerName?: string;
  customerEmail?: string;
}

const CHARCOAL = "#2b2622";
const GOLD = "#c9a45c";
const GRAY = "#6b7280";
const LIGHT = "#f3f4f6";

function inr(n: number): string {
  return `Rs. ${n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function generateInvoicePdf(order: InvoiceOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100;

    // Header band
    doc.rect(0, 0, doc.page.width, 110).fill(CHARCOAL);
    doc.fillColor(GOLD).font("Helvetica-Bold").fontSize(26).text("PRAYAG", 50, 32);
    doc.fillColor("#ffffff").font("Helvetica").fontSize(9)
      .text("Strong · Beautiful · Prayag", 50, 62)
      .text("Prayag India | Customer Care: 1800 123 4567", 50, 76);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(18)
      .text("TAX INVOICE", 0, 40, { align: "right", width: doc.page.width - 50 });

    // Invoice meta
    let y = 135;
    doc.fillColor(CHARCOAL).font("Helvetica-Bold").fontSize(10).text("Invoice Details", 50, y);
    doc.font("Helvetica").fontSize(9).fillColor(GRAY);
    doc.text(`Invoice No: INV-${order.orderNumber}`, 50, y + 15);
    doc.text(`Order No: ${order.orderNumber}`, 50, y + 28);
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : new Date().toLocaleDateString("en-IN");
    doc.text(`Date: ${dateStr}`, 50, y + 41);
    doc.text(`Payment: ${(order.paymentMethod || "COD").toUpperCase()}`, 50, y + 54);

    // Bill to
    doc.fillColor(CHARCOAL).font("Helvetica-Bold").fontSize(10).text("Bill To / Ship To", 320, y);
    doc.font("Helvetica").fontSize(9).fillColor(GRAY);
    const addr = order.shippingAddress;
    if (addr) {
      doc.text(addr.name, 320, y + 15);
      doc.text(addr.street, 320, y + 28, { width: 220 });
      doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 320, doc.y + 2, { width: 220 });
      doc.text(`Phone: ${addr.phone}`, 320, doc.y + 2);
    } else {
      doc.text(order.customerName || "Customer", 320, y + 15);
      if (order.customerEmail) doc.text(order.customerEmail, 320, y + 28);
    }

    // Items table
    y = 235;
    doc.rect(50, y, pageWidth, 22).fill(CHARCOAL);
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9);
    doc.text("#", 58, y + 6);
    doc.text("Product", 80, y + 6);
    doc.text("Unit Price", 320, y + 6, { width: 70, align: "right" });
    doc.text("Qty", 400, y + 6, { width: 35, align: "right" });
    doc.text("Amount", 455, y + 6, { width: 85, align: "right" });
    y += 22;

    order.items.forEach((item, i) => {
      const rowH = 24;
      if (i % 2 === 0) doc.rect(50, y, pageWidth, rowH).fill(LIGHT);
      doc.fillColor(CHARCOAL).font("Helvetica").fontSize(9);
      doc.text(String(i + 1), 58, y + 7);
      doc.text(item.productName, 80, y + 7, { width: 230, ellipsis: true, height: 12 });
      doc.text(inr(item.price), 320, y + 7, { width: 70, align: "right" });
      doc.text(String(item.quantity), 400, y + 7, { width: 35, align: "right" });
      doc.text(inr(item.subtotal), 455, y + 7, { width: 85, align: "right" });
      y += rowH;
    });

    // Totals
    y += 12;
    const totals: [string, string][] = [
      ["Subtotal", inr(order.subtotal)],
      ["GST (18%)", inr(order.gst)],
      ["Shipping", order.shipping === 0 ? "FREE" : inr(order.shipping)],
    ];
    if (order.discount > 0) totals.push(["Discount", `- ${inr(order.discount)}`]);
    doc.font("Helvetica").fontSize(9).fillColor(GRAY);
    for (const [label, value] of totals) {
      doc.text(label, 350, y, { width: 100, align: "right" });
      doc.text(value, 455, y, { width: 85, align: "right" });
      y += 15;
    }
    y += 4;
    doc.moveTo(350, y).lineTo(540, y).strokeColor(GOLD).lineWidth(1).stroke();
    y += 8;
    doc.fillColor(CHARCOAL).font("Helvetica-Bold").fontSize(11);
    doc.text("Grand Total", 350, y, { width: 100, align: "right" });
    doc.text(inr(order.total), 455, y, { width: 85, align: "right" });

    // Footer
    doc.fillColor(GRAY).font("Helvetica").fontSize(8)
      .text("This is a computer-generated invoice and does not require a signature.", 50, 760, { align: "center", width: pageWidth })
      .text("Thank you for shopping with PRAYAG!", 50, 772, { align: "center", width: pageWidth });

    doc.end();
  });
}
