import { useEffect, useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { fmt, fmtDate } from "@/lib/utils";
import { Plus, Printer, Eye } from "lucide-react";
import { toast } from "sonner";
import { printPurchase } from "@/lib/print";
import { useAuth } from "@/lib/auth";

export default function Purchases() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = () => api.get("/purchases").then((r) => setItems(r.data));
  useEffect(() => { load(); api.get("/suppliers").then((r) => setSuppliers(r.data)); }, []);

  const doPrint = (p) => {
    const supplier = suppliers.find((s) => s.id === p.supplier_id);
    printPurchase({ purchase: p, supplier, username: user?.name || user?.username });
  };

  const saveEdit = async () => {
    try {
      await api.put(`/purchases/${editing.id}`, { discount: Number(editing.discount), paid: Number(editing.paid), notes: editing.notes });
      toast.success("تم التعديل"); setEditing(null); load();
    } catch (e) { toast.error(errText(e)); }
  };

  return (
    <div className="space-y-4" data-testid="purchases-page">
      <div className="flex justify-end no-print"><Link to="/purchases/new"><Button className="bg-[#221340]" data-testid="new-purchase-btn"><Plus size={16} className="ml-1"/> مشتريات جديدة</Button></Link></div>
      <Card className="overflow-x-auto hidden md:block">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr className="text-right"><th className="p-3">الرقم</th><th className="p-3">التاريخ</th><th className="p-3">المورد</th><th className="p-3">الإجمالي</th><th className="p-3">المدفوع</th><th className="p-3">المتبقي</th><th className="p-3 no-print"></th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-[#452480] font-bold">{p.number}</td>
                <td className="p-3">{fmtDate(p.created_at)}</td>
                <td className="p-3">{p.supplier_name}</td>
                <td className="p-3 num">{fmt(p.total)}</td>
                <td className="p-3 num">{fmt(p.paid)}</td>
                <td className="p-3 num text-amber-700">{fmt(p.remaining)}</td>
                <td className="p-3 no-print flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => setViewing(p)} data-testid={`purch-view-${p.id}`}><Eye size={12}/></Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing({ id: p.id, discount: p.discount, paid: p.paid, notes: p.notes || "" })} data-testid={`purch-edit-${p.id}`}>تعديل</Button>
                  <Button size="sm" variant="outline" onClick={() => doPrint(p)} data-testid={`purch-print-${p.id}`}><Printer size={12}/></Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-400">لا توجد فواتير مشتريات</td></tr>}
          </tbody>
        </table>
      </Card>
      <div className="md:hidden space-y-2 no-print">
        {items.map((p) => (
          <Card key={p.id} className="p-3">
            <div className="flex justify-between items-start gap-2">
              <div className="min-w-0">
                <div className="font-mono font-bold text-[#452480] truncate">{p.number}</div>
                <div className="text-xs text-slate-500 truncate">{p.supplier_name} • {fmtDate(p.created_at)}</div>
              </div>
              <div className="text-left text-xs shrink-0">
                <div>الإجمالي: <span className="num font-bold">{fmt(p.total)}</span></div>
                <div className="text-amber-700">المتبقي: <span className="num font-bold">{fmt(p.remaining)}</span></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Button size="sm" variant="outline" onClick={() => setViewing(p)}><Eye size={12} className="ml-1"/> عرض</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing({ id: p.id, discount: p.discount, paid: p.paid, notes: p.notes || "" })}>تعديل</Button>
              <Button size="sm" variant="outline" onClick={() => doPrint(p)}><Printer size={12} className="ml-1"/> طباعة</Button>
            </div>
          </Card>
        ))}
        {items.length === 0 && <div className="text-center text-slate-400 p-6">لا توجد فواتير مشتريات</div>}
      </div>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>فاتورة مشتريات {viewing?.number}</DialogTitle></DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>التاريخ</span><span>{fmtDate(viewing.created_at)}</span></div>
              <div className="flex justify-between"><span>المورد</span><span>{viewing.supplier_name}</span></div>
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
              <Button onClick={() => doPrint(viewing)} className="bg-[#221340] w-full mt-2"><Printer size={14} className="ml-1"/> طباعة</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>تعديل فاتورة المشتريات</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div><Label>الخصم</Label><Input type="number" value={editing.discount} onChange={(e) => setEditing({ ...editing, discount: e.target.value })} data-testid="edit-purch-discount"/></div>
              <div><Label>المدفوع</Label><Input type="number" value={editing.paid} onChange={(e) => setEditing({ ...editing, paid: e.target.value })} data-testid="edit-purch-paid"/></div>
              <div><Label>ملاحظات</Label><Input value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })}/></div>
              <Button onClick={saveEdit} className="w-full bg-[#221340]" data-testid="edit-purch-save">حفظ التعديل</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
