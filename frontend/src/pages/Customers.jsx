import { useEffect, useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { fmt } from "@/lib/utils";
import { Link } from "react-router-dom";
import { Search, Plus, FileText, Edit, KeyRound } from "lucide-react";

function CustomerForm({ initial, onSaved, onClose }) {
  const [f, setF] = useState(initial || { name: "", phone: "", password: "", credit_limit: 0, opening_balance: 0, address: "", notes: "", status: "active" });
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...f, credit_limit: Number(f.credit_limit) || 0, opening_balance: Number(f.opening_balance) || 0 };
      if (initial?.id) await api.put(`/customers/${initial.id}`, body);
      else await api.post("/customers", body);
      toast.success("تم الحفظ بنجاح");
      onSaved(); onClose();
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };
  return (
    <form onSubmit={submit} className="space-y-3" data-testid="customer-form">
      <div><Label>الاسم *</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required data-testid="cust-name" /></div>
      <div><Label>رقم الهاتف</Label><Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} data-testid="cust-phone" /></div>
      {!initial?.id && <div><Label>كلمة السر (اتركها فارغة للتوليد)</Label><Input value={f.password || ""} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="JWDXXXXX" data-testid="cust-password" /></div>}
      <div className="grid grid-cols-2 gap-3">
        <div><Label>سقف الحساب</Label><Input type="number" value={f.credit_limit} onChange={(e) => setF({ ...f, credit_limit: e.target.value })} data-testid="cust-limit" /></div>
        <div><Label>الرصيد الافتتاحي</Label><Input type="number" value={f.opening_balance} onChange={(e) => setF({ ...f, opening_balance: e.target.value })} data-testid="cust-opening" /></div>
      </div>
      <div><Label>العنوان</Label><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
      <div><Label>ملاحظات</Label><Textarea value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      <Button type="submit" disabled={loading} className="w-full bg-[#221340]" data-testid="cust-save">{loading ? "جاري..." : "حفظ"}</Button>
    </form>
  );
}

function PasswordDialog({ customer, onClose, onSaved }) {
  const [pwd, setPwd] = useState("");
  const [confirm, setConfirm] = useState("");
  const save = async () => {
    if (pwd !== confirm) { toast.error("كلمة المرور وتأكيدها غير متطابقين"); return; }
    if (pwd.length < 4) { toast.error("كلمة المرور قصيرة"); return; }
    try {
      await api.post(`/customers/${customer.id}/password`, { password: pwd });
      toast.success("تم تغيير كلمة المرور");
      onSaved(); onClose();
    } catch (e) { toast.error(errText(e)); }
  };
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>تغيير كلمة مرور {customer?.name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>كلمة المرور الجديدة</Label><Input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} data-testid="admin-cust-pwd"/></div>
          <div><Label>تأكيد كلمة المرور</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} data-testid="admin-cust-pwd-confirm"/></div>
          <Button onClick={save} className="w-full bg-[#221340]" data-testid="admin-cust-pwd-save">حفظ</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Customers() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [pwdCustomer, setPwdCustomer] = useState(null);

  const load = async () => {
    const r = await api.get("/customers");
    setItems(r.data);
  };
  useEffect(() => { load(); }, []);

  const filtered = items.filter((c) => !q || c.name.includes(q) || (c.phone || "").includes(q));

  return (
    <div className="space-y-4" data-testid="customers-page">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-2.5 text-slate-400" size={18} />
          <Input placeholder="بحث بالاسم أو الهاتف..." value={q} onChange={(e) => setQ(e.target.value)} className="pr-10" data-testid="cust-search" />
        </div>
        <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEdit(null); }}>
          <DialogTrigger asChild>
            <Button className="bg-[#221340]" data-testid="add-customer-btn"><Plus size={16} className="ml-1" /> إضافة عميل</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{edit ? "تعديل عميل" : "إضافة عميل جديد"}</DialogTitle></DialogHeader>
            <CustomerForm initial={edit} onSaved={load} onClose={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr className="text-right">
                <th className="p-3">الاسم</th><th className="p-3">الهاتف</th><th className="p-3">السقف</th>
                <th className="p-3">المديونية</th><th className="p-3">المتاح</th><th className="p-3">كلمة السر</th><th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-slate-100" data-testid={`cust-row-${c.id}`}>
                  <td className="p-3 font-medium">{c.name}</td>
                  <td className="p-3">{c.phone}</td>
                  <td className="p-3 num">{fmt(c.credit_limit)}</td>
                  <td className="p-3 num">{fmt(c.balance)}</td>
                  <td className="p-3 num text-green-700">{fmt(Math.max(0, (c.credit_limit || 0) - (c.balance || 0)))}</td>
                  <td className="p-3 font-mono text-xs">••••••</td>
                  <td className="p-3 flex gap-2">
                    <Link to={`/customers/${c.id}`}><Button size="sm" variant="outline" data-testid={`cust-stmt-${c.id}`}><FileText size={14} /></Button></Link>
                    <Button size="sm" variant="outline" onClick={() => { setEdit(c); setOpen(true); }} data-testid={`cust-edit-${c.id}`}><Edit size={14} /></Button>
                    <Button size="sm" variant="outline" onClick={() => setPwdCustomer(c)} data-testid={`cust-pwd-${c.id}`}><KeyRound size={14} /></Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-400">لا يوجد عملاء</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="md:hidden divide-y">
          {filtered.map((c) => (
            <div key={c.id} className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.phone}</div>
                </div>
                <div className="flex gap-1">
                  <Link to={`/customers/${c.id}`}><Button size="sm" variant="outline"><FileText size={14} /></Button></Link>
                  <Button size="sm" variant="outline" onClick={() => { setEdit(c); setOpen(true); }}><Edit size={14} /></Button>
                  <Button size="sm" variant="outline" onClick={() => setPwdCustomer(c)}><KeyRound size={14} /></Button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                <div><div className="text-slate-500">السقف</div><div className="num font-bold">{fmt(c.credit_limit)}</div></div>
                <div><div className="text-slate-500">المديونية</div><div className="num font-bold">{fmt(c.balance)}</div></div>
                <div><div className="text-slate-500">المتاح</div><div className="num font-bold text-green-700">{fmt(Math.max(0, (c.credit_limit || 0) - (c.balance || 0)))}</div></div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {pwdCustomer && <PasswordDialog customer={pwdCustomer} onClose={() => setPwdCustomer(null)} onSaved={load}/>}
    </div>
  );
}
