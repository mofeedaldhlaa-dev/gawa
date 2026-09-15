import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fmt, fmtDate, genUUID } from "@/lib/utils";
import { printReport } from "@/lib/print";
import { useAuth } from "@/lib/auth";
import { ArrowLeftRight, Printer, Filter, FileText } from "lucide-react";

const TYPE_LABELS = {
  all: "الكل",
  cash: "الصندوق",
  customer: "عملاء",
  pos: "نقاط بيع",
  supplier: "موردون",
  expense: "حسابات مصروفات",
};
const TYPE_COLORS = {
  cash: "bg-emerald-100 text-emerald-800 border-emerald-300",
  customer: "bg-blue-100 text-blue-800 border-blue-300",
  pos: "bg-purple-100 text-purple-800 border-purple-300",
  supplier: "bg-amber-100 text-amber-800 border-amber-300",
  expense: "bg-red-100 text-red-800 border-red-300",
};

export default function Accounts() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [type, setType] = useState("all");
  const [q, setQ] = useState("");
  const [openTransfer, setOpenTransfer] = useState(false);
  const [form, setForm] = useState({
    source_type: "cash", source_id: "", source_name: "",
    dest_type: "customer", dest_id: "", dest_name: "",
    amount: "", description: "", block_negative: false,
    date: new Date().toISOString().slice(0, 10),
  });

  const load = async () => {
    try {
      const a = await api.get("/accounts");
      setItems(a.data);
      const t = await api.get("/transfers");
      setTransfers(t.data);
    } catch (e) { toast.error(errText(e)); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return items.filter((a) => {
      if (type !== "all" && a.type !== type) return false;
      if (ql && !((a.name || "").toLowerCase().includes(ql) || (a.phone || "").includes(ql))) return false;
      return true;
    });
  }, [items, q, type]);

  const totalBalance = useMemo(() => filtered.reduce((s, a) => s + (a.balance || 0), 0), [filtered]);

  const counts = useMemo(() => {
    const c = { all: items.length };
    for (const it of items) c[it.type] = (c[it.type] || 0) + 1;
    return c;
  }, [items]);

  const printGrouped = () => {
    if (!filtered.length) { toast.error("لا توجد حسابات ضمن الفلترة"); return; }
    const label = TYPE_LABELS[type] || "الكل";
    printReport({
      title: `كشوف الحسابات — ${label}`,
      headers: ["النوع", "الاسم", "الهاتف", "الرصيد"],
      rows: filtered.map((a) => [TYPE_LABELS[a.type] || a.type, a.name, a.phone || "-", fmt(a.balance)]),
      totals: [
        { label: "عدد الحسابات", value: filtered.length },
        { label: "إجمالي الأرصدة", value: fmt(totalBalance) },
      ],
      username: user?.name || user?.username,
    });
  };

  const selectableParties = useMemo(() => ({
    customer: items.filter((a) => a.type === "customer" || a.type === "pos"),
    supplier: items.filter((a) => a.type === "supplier"),
  }), [items]);

  const submitTransfer = async () => {
    if (!form.amount || Number(form.amount) <= 0) { toast.error("أدخل مبلغاً صحيحاً"); return; }
    if (form.source_type !== "cash" && !form.source_id) { toast.error("اختر الحساب المصدر"); return; }
    if (form.dest_type !== "cash" && !form.dest_id) { toast.error("اختر الحساب المستلم"); return; }
    if (form.source_type === form.dest_type && form.source_id === form.dest_id) {
      toast.error("لا يمكن التحويل لنفس الحساب"); return;
    }
    try {
      const payload = {
        source_type: form.source_type,
        source_id: form.source_type === "cash" ? null : form.source_id,
        source_name: form.source_type === "cash" ? "الصندوق" : (items.find((x) => x.id === form.source_id)?.name || ""),
        dest_type: form.dest_type,
        dest_id: form.dest_type === "cash" ? null : form.dest_id,
        dest_name: form.dest_type === "cash" ? "الصندوق" : (items.find((x) => x.id === form.dest_id)?.name || ""),
        amount: Number(form.amount),
        description: form.description,
        block_negative: form.block_negative,
        date: form.date,
        idempotency_key: genUUID(),
      };
      await api.post("/transfers", payload);
      toast.success("تم تنفيذ التحويل");
      setOpenTransfer(false);
      setForm({ ...form, amount: "", description: "" });
      load();
    } catch (e) { toast.error(errText(e)); }
  };

  const partyLink = (a) => {
    if (a.type === "customer" || a.type === "pos") return `/customers/${a.id}`;
    return `/accounts/${a.type}/${a.id}`;
  };

  return (
    <div className="space-y-4" data-testid="accounts-page">
      <div className="flex justify-between flex-wrap gap-2 no-print">
        <Input placeholder="بحث بالاسم أو الهاتف..." value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" data-testid="acc-search"/>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={printGrouped} variant="outline" className="border-[#452480] text-[#452480]" data-testid="acc-print"><Printer size={14} className="ml-1"/> طباعة الكشوف</Button>
          <Button onClick={() => setOpenTransfer(true)} className="bg-[#221340]" data-testid="acc-transfer"><ArrowLeftRight size={14} className="ml-1"/> تحويل بين حسابات</Button>
        </div>
      </div>

      <Card className="p-3 no-print" data-testid="acc-filters">
        <div className="flex items-center gap-2 mb-2 text-sm text-slate-600"><Filter size={14}/> تصفية حسب النوع</div>
        <div className="flex flex-wrap gap-2">
          {["all", "cash", "customer", "pos", "supplier", "expense"].map((k) => (
            <button
              key={k}
              onClick={() => setType(k)}
              className={`px-3 py-1.5 rounded-full text-xs border ${type === k ? "bg-[#452480] text-white border-[#452480]" : "border-slate-300 hover:bg-slate-50"}`}
              data-testid={`acc-type-${k}`}
            >
              {TYPE_LABELS[k]} <span className="opacity-70">({counts[k] || 0})</span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 no-print">
        <Card className="p-3"><div className="text-xs text-slate-500">عدد الحسابات</div><div className="text-xl font-bold">{filtered.length}</div></Card>
        <Card className="p-3"><div className="text-xs text-slate-500">إجمالي الأرصدة</div><div className={`text-xl font-bold num ${totalBalance>=0?"text-emerald-700":"text-red-700"}`}>{fmt(totalBalance)}</div></Card>
        <Card className="p-3"><div className="text-xs text-slate-500">التحويلات الكلية</div><div className="text-xl font-bold">{transfers.length}</div></Card>
        <Card className="p-3"><div className="text-xs text-slate-500">مجموع التحويلات</div><div className="text-xl font-bold num">{fmt(transfers.reduce((s, t) => s + (t.amount || 0), 0))}</div></Card>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-right">
              <th className="p-3">النوع</th>
              <th className="p-3">الاسم</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">الرصيد</th>
              <th className="p-3 no-print">إجراء</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={`${a.type}-${a.id}`} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[a.type] || "bg-slate-100 border-slate-300"}`}>{TYPE_LABELS[a.type] || a.type}</span></td>
                <td className="p-3 font-medium">{a.name}</td>
                <td className="p-3 font-mono text-xs">{a.phone || "-"}</td>
                <td className={`p-3 num font-bold ${a.balance >= 0 ? (a.type === "supplier" ? "text-amber-700" : "text-slate-800") : "text-red-700"}`}>{fmt(a.balance)}</td>
                <td className="p-3 no-print">
                  <Link to={partyLink(a)} data-testid={`acc-open-${a.id}`}>
                    <Button size="sm" variant="outline" className="h-8 border-[#452480] text-[#452480]">
                      <FileText size={13} className="ml-1" /> كشف الحساب
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-slate-400">لا توجد حسابات</td></tr>}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 font-bold">
              <td colSpan={3} className="p-3">الإجمالي</td>
              <td className="p-3 num">{fmt(totalBalance)}</td>
              <td className="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </Card>

      {transfers.length > 0 && (
        <Card className="p-3 no-print" data-testid="acc-transfers-list">
          <div className="font-bold text-[#221340] mb-2">آخر التحويلات</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50"><tr className="text-right"><th className="p-2">الرقم</th><th className="p-2">التاريخ</th><th className="p-2">من</th><th className="p-2">إلى</th><th className="p-2">المبلغ</th><th className="p-2">البيان</th></tr></thead>
              <tbody>
                {transfers.slice(0, 20).map((t) => (
                  <tr key={t.id} className="border-t">
                    <td className="p-2 font-mono">{t.number}</td>
                    <td className="p-2">{fmtDate(t.created_at)}</td>
                    <td className="p-2">{t.source_name}</td>
                    <td className="p-2">{t.dest_name}</td>
                    <td className="p-2 num font-bold">{fmt(t.amount)}</td>
                    <td className="p-2 text-slate-600">{t.description || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Transfer Dialog */}
      <Dialog open={openTransfer} onOpenChange={setOpenTransfer}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>تحويل بين الحسابات</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>نوع المصدر</Label>
                <Select value={form.source_type} onValueChange={(v) => setForm({ ...form, source_type: v, source_id: "" })}>
                  <SelectTrigger data-testid="tr-source-type"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">الصندوق</SelectItem>
                    <SelectItem value="customer">عميل / نقطة بيع</SelectItem>
                    <SelectItem value="supplier">مورد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>نوع المستلم</Label>
                <Select value={form.dest_type} onValueChange={(v) => setForm({ ...form, dest_type: v, dest_id: "" })}>
                  <SelectTrigger data-testid="tr-dest-type"><SelectValue/></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">الصندوق</SelectItem>
                    <SelectItem value="customer">عميل / نقطة بيع</SelectItem>
                    <SelectItem value="supplier">مورد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.source_type !== "cash" && (
              <div>
                <Label>الحساب المصدر</Label>
                <Select value={form.source_id} onValueChange={(v) => setForm({ ...form, source_id: v })}>
                  <SelectTrigger data-testid="tr-source"><SelectValue placeholder="اختر"/></SelectTrigger>
                  <SelectContent>
                    {selectableParties[form.source_type].map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} — {fmt(p.balance)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {form.dest_type !== "cash" && (
              <div>
                <Label>الحساب المستلم</Label>
                <Select value={form.dest_id} onValueChange={(v) => setForm({ ...form, dest_id: v })}>
                  <SelectTrigger data-testid="tr-dest"><SelectValue placeholder="اختر"/></SelectTrigger>
                  <SelectContent>
                    {selectableParties[form.dest_type].map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name} — {fmt(p.balance)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <div><Label>المبلغ</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} data-testid="tr-amount"/></div>
              <div><Label>التاريخ</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} data-testid="tr-date"/></div>
            </div>
            <div><Label>البيان</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="tr-desc"/></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.block_negative} onChange={(e) => setForm({ ...form, block_negative: e.target.checked })} data-testid="tr-block-neg"/>
              منع الرصيد السالب في الحساب المصدر
            </label>
            <Button onClick={submitTransfer} className="w-full bg-[#221340]" data-testid="tr-save">تنفيذ التحويل</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
