import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { fmt } from "@/lib/utils";
import { AlertTriangle, Landmark, Copy, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// ONE unified over-credit-limit notice, shared by the card-purchase screen and the
// transfer-to-subscriber screen. Slides down from the top of the screen; closes with
// the «حسنًا» button or by clicking outside.
export default function OverLimitDialog({ open, onClose, message, customer, opAmount = 0, banks = [] }) {
  const [copied, setCopied] = useState("");

  const balance = Number(customer?.balance || 0);      // > 0 = عليكم (owed by the subscriber)
  const limit = Number(customer?.credit_limit || 0);
  const amount = Number(opAmount || 0);
  const available = Math.max(0, limit - balance);
  // Mirrors the backend rule: over limit when (balance + operation debit) > limit.
  const required = Math.max(0, balance + amount - limit);

  const copy = async (value, key) => {
    try {
      await navigator.clipboard.writeText(String(value));
      setCopied(key);
      toast.success("تم نسخ رقم الحساب");
      setTimeout(() => setCopied(""), 1500);
    } catch {
      toast.error("تعذر النسخ");
    }
  };

  const Row = ({ label, value, tone = "" }) => (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-white/70 px-2.5 py-1.5">
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
      <span className={cn("num text-sm font-black", tone || "text-[#221340]")}>{value}</span>
    </div>
  );

  return (
    <DialogPrimitive.Root open={!!open} onOpenChange={(v) => { if (!v) onClose?.(); }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-[#1A0F33]/60 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          data-testid="over-limit-dialog"
          onOpenAutoFocus={(e) => e.preventDefault()}
          className={cn(
            // anchored to the TOP of the viewport, slides down smoothly
            "fixed left-1/2 top-0 z-50 w-[calc(100vw-1.5rem)] max-w-md -translate-x-1/2",
            "max-h-[92vh] overflow-y-auto rounded-b-3xl border-x border-b border-[#D4AF37]/60 bg-white shadow-2xl shadow-[#1A0F33]/30",
            "duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-top-full data-[state=closed]:slide-out-to-top-full",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
          dir="rtl"
        >
          {/* header */}
          <div className="relative bg-gradient-to-l from-[#221340] to-[#452480] px-4 pb-4 pt-5 text-white">
            <DialogPrimitive.Close
              className="absolute left-3 top-3 rounded-full bg-white/10 p-1.5 transition-colors hover:bg-white/20"
              aria-label="إغلاق"
              data-testid="over-limit-close-x"
            >
              <X size={15} />
            </DialogPrimitive.Close>
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37] text-[#1A0F33]">
                <AlertTriangle size={22} />
              </span>
              <div>
                <DialogPrimitive.Title className="text-base font-black" data-testid="over-limit-title">
                  تجاوز سقف الحساب
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="mt-0.5 text-[11px] text-[#E9DFFF]">
                  لا يمكن إتمام العملية قبل سداد المبلغ المطلوب
                </DialogPrimitive.Description>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4">
            {/* the notice itself */}
            <div
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-[13px] font-bold leading-relaxed whitespace-pre-line text-red-800"
              data-testid="over-limit-message"
            >
              {message}
            </div>

            {/* financial details */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5" data-testid="over-limit-figures">
              <div className="mb-1.5 text-[11px] font-black text-slate-600">تفاصيل الحساب</div>
              <div className="space-y-1.5">
                <Row
                  label="الرصيد الحالي"
                  value={`${fmt(Math.abs(balance))} ${balance > 0 ? "عليكم" : balance < 0 ? "لكم" : ""}`}
                  tone={balance > 0 ? "text-red-700" : balance < 0 ? "text-emerald-700" : "text-slate-600"}
                />
                <Row label="السقف المسموح" value={fmt(limit)} />
                {amount > 0 && <Row label="قيمة العملية" value={fmt(amount)} />}
                <Row label="المتاح للاستخدام" value={fmt(available)} tone="text-emerald-700" />
                <div className="flex items-center justify-between gap-2 rounded-lg border border-[#D4AF37] bg-[#FFFCF3] px-2.5 py-2">
                  <span className="text-[11px] font-black text-[#221340]">المبلغ المطلوب سداده</span>
                  <span className="num text-base font-black text-red-700" data-testid="over-limit-required">
                    {fmt(required)}
                  </span>
                </div>
              </div>
            </div>

            {/* designated payment accounts */}
            {banks.length > 0 && (
              <div data-testid="over-limit-banks">
                <div className="mb-1.5 flex items-center gap-1 text-[11px] font-black text-slate-600">
                  <Landmark size={12} /> حسابات السداد المحددة
                </div>
                <div className="space-y-2">
                  {banks.map((b) => (
                    <div
                      key={b.id}
                      className="rounded-xl border border-amber-200 border-r-4 border-r-[#D4AF37] bg-[#FFFCF3] p-2.5 text-xs"
                      data-testid={`over-limit-bank-${b.id}`}
                    >
                      <div className="font-black text-[#221340]">{b.bank_name}</div>
                      <div className="mt-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">اسم الحساب</span>
                          <span className="font-bold text-[#221340]">{b.holder_name || "-"}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-500">رقم الحساب</span>
                          <span className="flex items-center gap-1.5">
                            <span className="select-all font-mono font-bold text-[#221340]">{b.account_number || "-"}</span>
                            {b.account_number && (
                              <button
                                type="button"
                                onClick={() => copy(b.account_number, b.id)}
                                className="rounded-md bg-[#452480]/10 p-1 text-[#452480] transition-colors hover:bg-[#452480]/20"
                                aria-label="نسخ رقم الحساب"
                                data-testid={`over-limit-copy-${b.id}`}
                              >
                                {copied === b.id ? <Check size={12} /> : <Copy size={12} />}
                              </button>
                            )}
                          </span>
                        </div>
                      </div>
                      {b.details && (
                        <div className="mt-1 whitespace-pre-line text-[11px] text-slate-500">{b.details}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <DialogPrimitive.Close
              className="w-full rounded-xl bg-[#221340] py-3 text-sm font-black text-white transition-transform duration-100 active:scale-[0.99]"
              data-testid="over-limit-ok"
            >
              حسنًا
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
