import html2canvas from "html2canvas";
import { toast } from "sonner";

const fmtNum = (n) => Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 });
const fmtDT = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("ar-YE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return String(iso).replace("T", " ").slice(0, 16); }
};

// Build an off-screen node styled as a receipt card, capture it, then trigger a download.
export async function saveOperationImage({
  kind = "transfer", // "transfer" | "quick-recharge"
  number,
  createdAt,
  senderName,
  recipientName,
  recipientPhone,
  recipientType, // "customer" | "pos"
  amount,
  commission = 0,
  senderDebit = 0,
  recipientCredit = 0,
  description = "",
  filenameHint = "",
}) {
  const isTransfer = kind === "transfer";
  const title = isTransfer ? "إشعار تحويل رصيد" : "إشعار شحن سريع";
  const rtypeLbl = recipientType === "pos" ? "نقطة بيع" : "عميل";

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;top:-10000px;left:-10000px;z-index:-1;";
  const width = 480;
  host.innerHTML = `
    <div dir="rtl" style="width:${width}px;font-family:'Tajawal','Cairo','Segoe UI',Arial,sans-serif;background:#fff;color:#221340;box-shadow:0 8px 32px rgba(0,0,0,.15);border-radius:20px;overflow:hidden;">
      <div style="background:linear-gradient(135deg,#452480,#221340);color:#fff;padding:20px 20px 14px 20px;text-align:center;">
        <div style="font-size:22px;font-weight:900;letter-spacing:.2px;">شبكة جواد نت اللاسلكية</div>
        <div style="margin-top:8px;display:inline-block;background:linear-gradient(90deg,#D4AF37,#F2D06B);color:#1A0F33;padding:4px 18px;border-radius:999px;font-weight:800;font-size:14px;">GAWAD NET</div>
        <div style="margin-top:10px;font-size:15px;font-weight:700;opacity:.9;">${title}</div>
      </div>
      <div style="padding:18px 22px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px dashed #e2e8f0;padding-bottom:10px;margin-bottom:10px;">
          <div>
            <div style="font-size:11px;color:#64748b;">رقم العملية</div>
            <div style="font-family:'Courier New',monospace;font-weight:900;color:#452480;font-size:18px;">${number || "—"}</div>
          </div>
          <div style="text-align:left;">
            <div style="font-size:11px;color:#64748b;">التاريخ</div>
            <div style="font-weight:700;font-size:13px;">${fmtDT(createdAt) || "—"}</div>
          </div>
        </div>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#64748b;">المرسل</td><td style="padding:6px 0;text-align:left;font-weight:700;">${senderName || "—"}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">اسم المستلم</td><td style="padding:6px 0;text-align:left;font-weight:700;">${recipientName || "—"}</td></tr>
          ${recipientPhone ? `<tr><td style="padding:6px 0;color:#64748b;">رقم المستلم</td><td style="padding:6px 0;text-align:left;font-family:'Courier New',monospace;font-weight:700;">${recipientPhone}</td></tr>` : ""}
          ${recipientType ? `<tr><td style="padding:6px 0;color:#64748b;">نوع الحساب</td><td style="padding:6px 0;text-align:left;font-weight:700;">${rtypeLbl}</td></tr>` : ""}
          <tr><td colspan="2"><div style="border-top:1px dashed #e2e8f0;margin:6px 0;"></div></td></tr>
          <tr><td style="padding:6px 0;color:#64748b;">مبلغ العملية</td><td style="padding:6px 0;text-align:left;font-weight:900;">${fmtNum(amount)}</td></tr>
          ${recipientCredit ? `<tr><td style="padding:6px 0;color:#059669;">المبلغ المستلم</td><td style="padding:6px 0;text-align:left;color:#059669;font-weight:900;">${fmtNum(recipientCredit)}</td></tr>` : ""}
          ${commission > 0 ? `<tr><td style="padding:6px 0;color:#b45309;">العمولة</td><td style="padding:6px 0;text-align:left;color:#b45309;font-weight:800;">${fmtNum(commission)}</td></tr>` : ""}
          ${senderDebit ? `<tr><td style="padding:6px 0;color:#b91c1c;">الخصم من الرصيد</td><td style="padding:6px 0;text-align:left;color:#b91c1c;font-weight:900;">${fmtNum(senderDebit)}</td></tr>` : ""}
        </table>
        ${description ? `<div style="margin-top:10px;padding:10px;background:#f8fafc;border-right:3px solid #D4AF37;border-radius:6px;font-size:12px;color:#475569;">${description}</div>` : ""}
        <div style="margin-top:16px;padding-top:10px;border-top:2px solid #D4AF37;text-align:center;font-size:11px;color:#64748b;">
          هذا الإشعار مُصدر إلكترونياً من نظام GAWAD NET · شبكة جواد نت اللاسلكية
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(host);
  try {
    const target = host.firstElementChild;
    const canvas = await html2canvas(target, { backgroundColor: "#ffffff", scale: 2, useCORS: true, logging: false });
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const safeName = (filenameHint || `${isTransfer ? "transfer" : "recharge"}-${number || Date.now()}`).replace(/[^\w\-]+/g, "_");
    a.href = dataUrl; a.download = `${safeName}.png`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    toast.success("تم حفظ الإشعار كصورة");
  } catch (e) {
    toast.error("تعذّر حفظ الصورة");
  } finally {
    document.body.removeChild(host);
  }
}
