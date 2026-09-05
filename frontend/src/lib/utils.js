import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const fmt = (n) => {
  if (n === null || n === undefined || isNaN(n)) return "0";
  return Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 });
};

export const fmtDate = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB") + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
};

export const fmtDateOnly = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB");
  } catch { return iso; }
};

export const genUUID = () => {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const deviceId = () => {
  let id = localStorage.getItem("jwd_device");
  if (!id) {
    id = "dev-" + genUUID();
    localStorage.setItem("jwd_device", id);
  }
  return id;
};

export const openWhatsApp = (phone, text) => {
  if (!phone) {
    alert("لا يوجد رقم هاتف مسجل لهذا الحساب.");
    return;
  }
  let n = phone.replace(/\D/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (!n.startsWith("967") && n.length <= 9) n = "967" + n;
  window.open(`https://wa.me/${n}?text=${encodeURIComponent(text)}`, "_blank");
};

export const buildInvoiceMessage = ({ company, number, kind, details, amount, discount, total, paid, remaining, balance_after }) => {
  const parts = [
    `من ${company}`,
    `المخاء`,
    `784225716`,
    ``,
    `عليكم فاتورة رقم: ${number}`,
    `تفاصيل الفاتورة:`,
    details || "",
    ``,
    `مبلغ الفاتورة: ${fmt(total)}`,
  ];
  if (discount > 0) parts.push(`الخصم: ${fmt(discount)}`);
  if (paid !== undefined) parts.push(`المدفوع: ${fmt(paid)}`, `المتبقي: ${fmt(remaining)}`);
  if (balance_after !== null && balance_after !== undefined) {
    parts.push(``, `الرصيد الإجمالي عليكم: ${fmt(balance_after)}`);
  }
  return parts.join("\n");
};

export const buildReceiptMessage = ({ company, kind, number, amount, description }) => {
  // kind: "receipt" (قبض من العميل → لكم) OR "payment" (صرف للمورد → عليكم)
  const dir = kind === "receipt" ? "لكم" : "عليكم";
  return [
    `من ${company}`,
    `المخاء`,
    `784225716`,
    ``,
    `${dir} سند رقم: ${number}`,
    `مبلغ السند: ${fmt(amount)}`,
    `تفاصيل السند:`,
    description || "-",
  ].join("\n");
};
