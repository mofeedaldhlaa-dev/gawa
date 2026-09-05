import { useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fmt, openWhatsApp, fmtDate } from "@/lib/utils";
import { Wifi, CheckCircle, Copy, KeyRound, UserPlus, ArrowRight } from "lucide-react";

const ADMIN_WHATSAPP = "784225716";

export default function PublicOrder() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [customer, setCustomer] = useState(null);
  const [cats, setCats] = useState([]);
  const [category_id, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);

  const login = async () => {
    setLoading(true);
    try {
      const r = await api.post("/public/card-order/login", { phone, password });
      setCustomer(r.data);
      const cr = await api.get("/public/card-order/categories");
      setCats(cr.data);
      toast.success(`مرحباً ${r.data.name}`);
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };

  const request = async () => {
    if (!category_id) { toast.error("اختر الفئة"); return; }
    setLoading(true);
    try {
      const r = await api.post("/public/card-order/request", { phone, password, category_id, quantity: Number(quantity) });
      setResult(r.data);
      toast.success("تم تنفيذ طلبك بنجاح");
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };

  const copyCard = async (n) => {
    try {
      await navigator.clipboard.writeText(n);
      toast.success("تم نسخ رقم الكرت بنجاح");
    } catch { toast.error("تعذر النسخ"); }
  };

  return (
    <div className="min-h-screen brand-gradient flex items-center justify-center p-4" data-testid="public-order">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="text-center mb-6">
          <Wifi className="mx-auto mb-2 text-[#D4AF37]" size={40}/>
          <div className="text-xl font-black text-[#221340]">شبكة جواد نت اللاسلكية</div>
          <div className="text-xs text-slate-500">طلب كرت • 784225716</div>
        </div>

        {!customer && (
          <div className="space-y-3">
            <div><Label>رقم الهاتف</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} data-testid="po-phone"/></div>
            <div><Label>كلمة السر</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="po-password"/></div>
            <Button onClick={login} disabled={loading} className="w-full bg-[#221340]" data-testid="po-login">{loading?"جاري...":"دخول"}</Button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setShowForgot(true)} className="text-[#452480] hover:underline" data-testid="po-forgot">نسيت كلمة المرور؟</button>
              <button type="button" onClick={() => setShowRegister(true)} className="text-[#452480] hover:underline" data-testid="po-register">إنشاء حساب</button>
            </div>
            <div className="text-center text-xs text-slate-500 pt-2 border-t">لاتمتلك حساب .. <button onClick={() => setShowRegister(true)} className="text-[#D4AF37] font-bold hover:underline">إنشاء حساب</button></div>
          </div>
        )}

        {customer && !result && (
          <div className="space-y-3">
            <Card className="p-3 bg-slate-50">
              <div className="flex justify-between items-start">
                <div className="font-bold">{customer.name}</div>
                <button onClick={() => setShowChangePwd(true)} className="text-xs text-[#452480] hover:underline flex items-center gap-1" data-testid="po-change-pwd"><KeyRound size={12}/> تغيير كلمة المرور</button>
              </div>
              <div className="text-xs mt-2 grid grid-cols-3 gap-2">
                <div><div className="text-slate-500">السقف</div><div className="num font-bold">{fmt(customer.credit_limit)}</div></div>
                <div><div className="text-slate-500">المديونية</div><div className="num font-bold">{fmt(customer.balance)}</div></div>
                <div><div className="text-slate-500">المتاح</div><div className="num font-bold text-green-600">{fmt(customer.available)}</div></div>
              </div>
            </Card>
            <div><Label>الفئة</Label>
              <Select value={category_id} onValueChange={setCategoryId}>
                <SelectTrigger data-testid="po-cat"><SelectValue placeholder="اختر"/></SelectTrigger>
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {fmt(c.sale_price)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>الكمية</Label><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="po-qty"/></div>
            <Button onClick={request} disabled={loading} className="w-full bg-[#D4AF37] text-[#1A0F33] font-bold hover:bg-[#C5A028] text-lg py-6" data-testid="po-request">طلب</Button>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500" size={48}/>
              <div className="font-bold text-lg mt-2">تم تنفيذ طلبك بنجاح</div>
            </div>
            {result.cards?.length > 0 && (
              <Card className="p-3 bg-green-50">
                <div className="text-sm font-bold mb-2">الكروت المطلوبة:</div>
                <div className="space-y-2">
                  {result.cards.map((c) => (
                    <div key={c} className="flex items-center justify-between bg-white p-2 rounded border">
                      <span className="text-lg tracking-wider font-mono" data-testid={`card-${c}`}>{c}</span>
                      <Button size="sm" variant="outline" onClick={() => copyCard(c)} data-testid={`copy-${c}`}><Copy size={14}/> نسخ</Button>
                    </div>
                  ))}
                </div>
              </Card>
            )}
            {result.quantity_from_stock > 0 && <div className="text-center text-sm text-slate-600">تم تجهيز <span className="font-bold">{result.quantity_from_stock}</span> كرت من المخزون</div>}
            <div className="text-center text-sm">
              <div className="text-slate-500">المديونية بعد العملية</div>
              <div className="text-2xl font-bold num">{fmt(result.balance_after)}</div>
            </div>
            <Button onClick={() => { setResult(null); setCategoryId(""); setQuantity(1); }} variant="outline" className="w-full">طلب جديد</Button>
          </div>
        )}
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <ForgotPasswordForm onClose={() => setShowForgot(false)}/>
      </Dialog>

      {/* Register Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <RegisterForm onClose={() => setShowRegister(false)}/>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePwd} onOpenChange={setShowChangePwd}>
        <ChangePasswordForm phone={phone} currentPassword={password} onClose={() => setShowChangePwd(false)} onDone={(np) => setPassword(np)}/>
      </Dialog>
    </div>
  );
}

function ForgotPasswordForm({ onClose }) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/public/customer/forgot-password", { phone });
      const now = new Date();
      const msg = `طلب استعادة كلمة المرور\n\nاسم العميل: ${r.data.name}\nالرقم: ${r.data.phone}\nالهاتف: ${r.data.phone}\nالعنوان: ${r.data.address || "-"}\n\nأرجو من الإدارة مساعدتي في استعادة كلمة المرور.\n\n${now.toLocaleString("en-GB")}`;
      openWhatsApp(ADMIN_WHATSAPP, msg);
      toast.success("جاري فتح واتساب");
      onClose();
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>نسيت كلمة المرور؟</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div className="text-sm text-slate-600">سيتم إرسال طلب استعادة كلمة المرور إلى الإدارة عبر واتساب.</div>
        <div><Label>رقم الهاتف</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} required data-testid="fp-phone"/></div>
        <Button type="submit" disabled={loading} className="w-full bg-[#221340]" data-testid="fp-submit">{loading?"جاري...":"إرسال الطلب للإدارة"}</Button>
      </form>
    </DialogContent>
  );
}

function RegisterForm({ onClose }) {
  const [f, setF] = useState({ full_name: "", phone: "", address: "" });
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/public/customer/register-request", f);
      const now = new Date();
      const msg = `طلب إنشاء حساب جديد\n\nالاسم الرباعي: ${f.full_name}\nرقم الهاتف: ${f.phone}\nالعنوان: ${f.address || "-"}\n\nأرجو من الإدارة إنشاء حساب لي في شبكة جواد نت.\n\n${now.toLocaleString("en-GB")}`;
      openWhatsApp(ADMIN_WHATSAPP, msg);
      toast.success("تم إرسال الطلب");
      onClose();
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>إنشاء حساب جديد</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>الاسم الرباعي</Label><Input value={f.full_name} onChange={(e) => setF({...f, full_name: e.target.value})} required data-testid="reg-name"/></div>
        <div><Label>رقم الهاتف</Label><Input value={f.phone} onChange={(e) => setF({...f, phone: e.target.value})} required data-testid="reg-phone"/></div>
        <div><Label>العنوان</Label><Input value={f.address} onChange={(e) => setF({...f, address: e.target.value})} data-testid="reg-address"/></div>
        <Button type="submit" disabled={loading} className="w-full bg-[#D4AF37] text-[#1A0F33] font-bold" data-testid="reg-submit">{loading?"جاري...":"إرسال الطلب للإدارة"}</Button>
      </form>
    </DialogContent>
  );
}

function ChangePasswordForm({ phone, currentPassword, onClose, onDone }) {
  const [cur, setCur] = useState(currentPassword || "");
  const [np, setNp] = useState("");
  const [cf, setCf] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (np !== cf) { toast.error("كلمة المرور الجديدة والتأكيد غير متطابقين"); return; }
    if (np.length < 4) { toast.error("كلمة المرور قصيرة جداً"); return; }
    setLoading(true);
    try {
      await api.post("/public/customer/change-password", { phone, current_password: cur, new_password: np });
      toast.success("تم تغيير كلمة المرور");
      onDone && onDone(np);
      onClose();
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>تغيير كلمة المرور</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>كلمة المرور الحالية</Label><Input type="password" value={cur} onChange={(e) => setCur(e.target.value)} required data-testid="cp-cur"/></div>
        <div><Label>كلمة المرور الجديدة</Label><Input type="password" value={np} onChange={(e) => setNp(e.target.value)} required data-testid="cp-new"/></div>
        <div><Label>تأكيد كلمة المرور</Label><Input type="password" value={cf} onChange={(e) => setCf(e.target.value)} required data-testid="cp-confirm"/></div>
        <Button type="submit" disabled={loading} className="w-full bg-[#221340]" data-testid="cp-submit">{loading?"جاري...":"حفظ"}</Button>
      </form>
    </DialogContent>
  );
}
