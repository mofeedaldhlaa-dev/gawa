import { useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fmt, openWhatsApp } from "@/lib/utils";
import { Wifi, CheckCircle, Copy, KeyRound, Phone, Ban, AlertCircle } from "lucide-react";

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
  const [blocked, setBlocked] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [loginError, setLoginError] = useState("");

  const login = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError("");
    if (!phone || !password) { setLoginError("أدخل رقم الهاتف وكلمة المرور"); return; }
    setLoading(true);
    try {
      const r = await api.post("/public/card-order/login", { phone, password });
      setCustomer(r.data);
      const cr = await api.get("/public/card-order/categories");
      setCats(cr.data);
      toast.success(`مرحباً ${r.data.name}`);
    } catch (err) {
      // NEVER navigate/redirect on failure. Show error inline in the same page.
      const status = err.response?.status;
      const msg = errText(err);
      if (status === 429) { setBlocked(true); setLoginError(msg); }
      else if (status === 401) { setLoginError("كلمة المرور غير صحيحة"); }
      else if (status === 404) { setLoginError("رقم الهاتف أو كلمة المرور غير صحيحة"); }
      else if (status === 403) { setLoginError(msg || "الحساب معطل"); }
      else if (!err.response) { setLoginError("تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً."); }
      else { setLoginError(msg || "حدث خطأ"); }
    }
    setLoading(false);
  };

  const request = async () => {
    if (!category_id) { toast.error("اختر الفئة"); return; }
    setLoading(true);
    try {
      const r = await api.post("/public/card-order/request", { phone, password, category_id, quantity: Number(quantity) });
      setResult(r.data);
      setSelectedCat(cats.find((c) => c.id === category_id));
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

  const contactSupport = () => {
    const msg = `مرحباً، تم حظر حسابي بسبب تجاوز عدد المحاولات الفاشلة.\nرقم الهاتف: ${phone}\nأرجو رفع الحظر عن حسابي.`;
    openWhatsApp(ADMIN_WHATSAPP, msg);
  };

  if (blocked) {
    return (
      <div className="min-h-screen brand-gradient flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-6 bg-white text-center">
          <Ban className="mx-auto text-red-500 mb-3" size={48}/>
          <div className="font-bold text-lg">تم حظر الإدخال بسبب تجاوز عدد المحاولات الفاشلة.</div>
          <div className="text-sm text-slate-600 mt-2">مدة الحظر: 24 ساعة</div>
          <Button onClick={contactSupport} className="mt-4 bg-green-600 w-full" data-testid="contact-support"><Phone size={14} className="ml-1"/> التواصل مع خدمة العملاء</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen brand-gradient flex items-center justify-center p-4" data-testid="public-order">
      <Card className="w-full max-w-md p-6 bg-white">
        <div className="text-center mb-6">
          <div className="text-xl font-black text-[#221340]">شبكة جواد نت اللاسلكية</div>
          <div className="mt-4 inline-block bg-[#D4AF37] text-[#1A0F33] px-6 py-2 rounded-lg font-bold text-lg">طلب كرت</div>
        </div>

        {!customer && (
          <form onSubmit={login} className="space-y-3" data-testid="po-login-form" noValidate>
            <div><Label>رقم الهاتف</Label><Input value={phone} onChange={(e) => { setPhone(e.target.value); setLoginError(""); }} data-testid="po-phone" autoComplete="tel" inputMode="tel"/></div>
            <div><Label>كلمة المرور</Label><Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(""); }} data-testid="po-password" autoComplete="current-password"/></div>
            {loginError && (
              <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm" data-testid="po-login-error" role="alert">
                <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                <span>{loginError}</span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-[#221340]" data-testid="po-login">{loading?"جاري...":"دخول"}</Button>
            <div className="flex justify-between text-sm">
              <button type="button" onClick={() => setShowForgot(true)} className="text-[#452480] hover:underline" data-testid="po-forgot">نسيت كلمة المرور؟</button>
              <button type="button" onClick={() => setShowRegister(true)} className="text-[#452480] hover:underline" data-testid="po-register">إنشاء حساب</button>
            </div>
            <div className="text-center text-xs text-slate-500 pt-2 border-t">لاتمتلك حساب .. <button type="button" onClick={() => setShowRegister(true)} className="text-[#D4AF37] font-bold hover:underline">إنشاء حساب</button></div>
          </form>
        )}

        {customer && !result && (
          <div className="space-y-3">
            <Card className="p-3 bg-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{customer.name}</div>
                  <div className="text-xs text-slate-500">{customer.customer_type === "pos" ? "نقطة بيع" : "عميل"}</div>
                </div>
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
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {fmt(c.sale_price)} • متوفر {c.available_numbered ?? 0}</SelectItem>)}</SelectContent>
              </Select>
              {category_id && (() => {
                const c = cats.find((x) => x.id === category_id);
                const avail = c?.available_numbered ?? 0;
                return (
                  <div className={`text-xs mt-1 ${avail > 0 ? "text-slate-500" : "text-red-600"}`} data-testid="po-cat-availability">
                    الكروت المرقمة المتوفرة: <span className="num font-bold">{avail}</span>
                  </div>
                );
              })()}
            </div>
            <div><Label>الكمية</Label><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="po-qty"/></div>
            {(() => {
              const c = cats.find((x) => x.id === category_id);
              const avail = c?.available_numbered ?? 0;
              const insufficient = category_id && Number(quantity) > 0 && Number(quantity) > avail;
              return insufficient ? (
                <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm" data-testid="po-no-stock" role="alert">
                  <AlertCircle size={16} className="mt-0.5 shrink-0"/>
                  <span>لا تتوفر كمية الكروت المطلوبة</span>
                </div>
              ) : null;
            })()}
            <Button onClick={request} disabled={loading || (() => { const c = cats.find((x) => x.id === category_id); const avail = c?.available_numbered ?? 0; return !category_id || Number(quantity) < 1 || Number(quantity) > avail; })()} className="w-full bg-[#D4AF37] text-[#1A0F33] font-bold hover:bg-[#C5A028] text-lg py-6 disabled:opacity-50" data-testid="po-request">طلب</Button>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500" size={48}/>
              <div className="font-bold text-lg mt-2">تم تنفيذ طلبك بنجاح</div>
            </div>
            {selectedCat && <div className="text-center text-sm bg-slate-50 py-2 rounded">فئة الكرت: <span className="font-bold gold-text">{selectedCat.name}</span></div>}
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
            <div className="text-center text-sm">
              <div className="text-slate-500">المديونية بعد العملية</div>
              <div className="text-2xl font-bold num">{fmt(result.balance_after)}</div>
            </div>
            <Button onClick={() => { setResult(null); setCategoryId(""); setQuantity(1); setSelectedCat(null); }} variant="outline" className="w-full">طلب جديد</Button>
          </div>
        )}
      </Card>

      <Dialog open={showForgot} onOpenChange={setShowForgot}>
        <ForgotPasswordForm onClose={() => setShowForgot(false)}/>
      </Dialog>
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <RegisterForm onClose={() => setShowRegister(false)}/>
      </Dialog>
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
        <div><Label>العنوان (عنوان العمل أو اسم محلك)</Label><Input value={f.address} onChange={(e) => setF({...f, address: e.target.value})} data-testid="reg-address" placeholder="عنوان العمل أو اسم المحل"/></div>
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
