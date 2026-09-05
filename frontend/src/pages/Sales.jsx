import { useEffect, useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { fmt, fmtDate, openWhatsApp, buildInvoiceMessage } from "@/lib/utils";
import { printSaleInvoice } from "@/lib/print";
import { useAuth } from "@/lib/auth";
import { Plus, Search, Printer, MessageCircle, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Sales() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [q, setQ] = useState("");
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [settings, setSettings] = useState({ company_name: "شبكة جواد نت اللاسلكية" });

  const load = () => api.get("/sales", { params: { q } }).then((r) => setItems(r.data));
  useEffect(() => {
    load();
    api.get("/customers").then((r) => setCustomers(r.data));
    api.get("/settings").then((r) => setSettings(r.data));
  }, [q]);

  const doPrint = (s) => {
    const customer = customers.find((c) => c.id === s.customer_id);
    printSaleInvoice({ sale: s, customer, username: user?.name || user?.username });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/sales/${editing.id}`, { discount: Number(editing.discount), paid: Number(editing.paid), notes: editing.notes });
      toast.success("تم التعديل"); setEditing(null); load();
    } catch (e) { toast.error(errText(e)); }
  };

  const sendWA = (s) => {
    const cust = customers.find((c) => c.id === s.customer_id);
    if (!cust?.phone) { toast.error("لا يوجد رقم هاتف مسجل لهذا الحساب."); return; }
    const details = (s.items || []).map((i) => `${i.category_name} × ${i.quantity} = ${fmt(i.total)}`).join("\n");
    const msg = buildInvoiceMessage({
      company: settings.company_name, number: s.number, kind: "مبيعات",
      details, amount: s.subtotal, discount: s.discount, total: s.total,
      paid: s.paid, remaining: s.remaining, balance_after: cust.balance,
    });
    openWhatsApp(cust.phone, msg);
  };

  return (
    <div className="space-y-4" data-testid="sales-page">
      <div className="flex justify-between flex-wrap gap-2 no-print">
        <div className="relative w-full sm:max-w-xs flex-1"><Search className="absolute right-3 top-2.5 text-slate-400" size={18}/><Input placeholder="بحث برقم GWD..." value={q} onChange={(e) => setQ(e.target.value)} className="pr-10" /></div>
        <Link to="/sales/new" className="w-full sm:w-auto"><Button className="bg-[#221340] w-full sm:w-auto" data-testid="new-sale-btn"><Plus size={16} className="ml-1"/> فاتورة جديدة</Button></Link>
      </div>
      <Card className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr className="text-right"><th className="p-3">الرقم</th><th className="p-3">التاريخ</th><th className="p-3">العميل</th><th className="p-3">الإجمالي</th><th className="p-3">المدفوع</th><th className="p-3">المتبقي</th><th className="p-3 no-print"></th></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-[#452480] font-bold">{s.number}</td>
                <td className="p-3">{fmtDate(s.created_at)}</td>
                <td className="p-3">{s.customer_name || "نقدي"}</td>
                <td className="p-3 num">{fmt(s.total)}</td>
                <td className="p-3 num">{fmt(s.paid)}</td>
                <td className="p-3 num font-bold text-amber-700">{fmt(s.remaining)}</td>
                <td className="p-3 no-print flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setViewing(s)} data-testid={`sale-view-${s.id}`}><Eye size={12}/></Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing({ id: s.id, discount: s.discount, paid: s.paid, notes: s.notes || "" })} data-testid={`sale-edit-${s.id}`}>تعديل</Button>
                  <Button size="sm" variant="outline" onClick={() => doPrint(s)} data-testid={`sale-print-${s.id}`}><Printer size={12}/></Button>
                  <Button size="sm" variant="outline" onClick={() => sendWA(s)} data-testid={`sale-wa-${s.id}`}><MessageCircle size={12} className="text-green-600"/></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-400">لا توجد فواتير</td></tr>}
          </tbody>
        </table>
      </Card>
      <div className="md:hidden space-y-2 no-print">
        {items.map((s) => (
          <Card key={s.id} className="p-3">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <div className="font-mono font-bold text-[#452480] truncate">{s.number}</div>
                <div className="text-xs text-slate-500 truncate">{s.customer_name || "نقدي"} • {fmtDate(s.created_at)}</div>
              </div>
              <div className="text-left text-xs shrink-0">
                <div>الإجمالي: <span className="num font-bold">{fmt(s.total)}</span></div>
                <div className="text-amber-700">المتبقي: <span className="num font-bold">{fmt(s.remaining)}</span></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Button size="sm" variant="outline" onClick={() => setViewing(s)}><Eye size={12} className="ml-1"/> عرض</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing({ id: s.id, discount: s.discount, paid: s.paid, notes: s.notes || "" })}>تعديل</Button>
              <Button size="sm" variant="outline" onClick={() => doPrint(s)}><Printer size={12} className="ml-1"/> طباعة</Button>
              <Button size="sm" variant="outline" onClick={() => sendWA(s)}><MessageCircle size={12} className="ml-1 text-green-600"/> واتساب</Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-slate-400 p-6">لا توجد فواتير</div>}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>فاتورة {viewing?.number}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>التاريخ</span><span>{fmtDate(viewing.created_at)}</span></div>
              <div className="flex justify-between"><span>العميل</span><span>{viewing.customer_name || "نقدي"}</span></div>
              <div className="border-t pt-2">
                {(viewing.items || []).map((it, i) => (
                  <div key={i} className="flex justify-between py-1"><span>{it.category_name} × {it.quantity}</span><span className="num">{fmt(it.total)}</span></div>
                ))}
              </div>
              <div className="border-t pt-2 space-y-1">
                <div className="flex justify-between"><span>الإجمالي</span><span className="num font-bold">{fmt(viewing.total)}</span></div>
                {viewing.discount > 0 && <div className="flex justify-between"><span>الخصم</span><span className="num">{fmt(viewing.discount)}</span></div>}
                <div className="flex justify-between"><span>المدفوع</span><span className="num">{fmt(viewing.paid)}</span></div>
                <div className="flex justify-between"><span>المتبقي</span><span className="num font-bold text-amber-700">{fmt(viewing.remaining)}</span></div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => doPrint(viewing)} className="bg-[#221340] flex-1"><Printer size={14} className="ml-1"/> طباعة</Button>
                <Button onClick={() => sendWA(viewing)} variant="outline" className="border-green-600 text-green-700 flex-1"><MessageCircle size={14} className="ml-1"/> واتساب</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل الفاتورة</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>الخصم</Label><Input type="number" value={editing.discount} onChange={(e) => setEditing({ ...editing, discount: e.target.value })} data-testid="edit-sale-discount"/></div>
              <div><Label>المدفوع</Label><Input type="number" value={editing.paid} onChange={(e) => setEditing({ ...editing, paid: e.target.value })} data-testid="edit-sale-paid"/></div>
              <div><Label>ملاحظات</Label><Input value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })}/></div>
              <Button onClick={saveEdit} className="w-full bg-[#221340]" data-testid="edit-sale-save">حفظ التعديل</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
