import { useState, useEffect } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fmt, fmtDate, openWhatsApp, openSMS, phoneFingerprint } from "@/lib/utils";
import { printStatement } from "@/lib/print";
import { printPublicOrder } from "@/lib/print";
import { Wifi, CheckCircle, Copy, KeyRound, Phone, Ban, AlertCircle, Printer, History, Search, ContactRound, Send, MessageSquare, FileText, Gift, Landmark } from "lucide-react";

const ADMIN_WHATSAPP = "784225716";

const priceForCustomer = (cat, ctype) => {
  if (!cat) return 0;
  const p = ctype === "pos" ? cat.sale_price_pos : cat.sale_price_customer;
  return (p ?? cat.sale_price) || 0;
};

export default function PublicOrder() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [cats, setCats] = useState([]);
  const [category_id, setCategoryId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null);
  const [sendToOther, setSendToOther] = useState(false);
  const [recipientPhone, setRecipientPhone] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [pickingContact, setPickingContact] = useState(false);
  const [sendMethod, setSendMethod] = useState("sms"); // sms | whatsapp
  const [loginError, setLoginError] = useState("");
  const [deviceMismatch, setDeviceMismatch] = useState(false);
  const [accountDisabled, setAccountDisabled] = useState(false);

  // Load saved credentials on mount (if user opted in previously)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("jwd_portal_saved");
      if (raw) {
        const decoded = JSON.parse(atob(raw));
        if (decoded?.phone) {
          setPhone(decoded.phone);
          if (decoded.password) setPassword(decoded.password);
          setRememberMe(true);
        }
      }
    } catch { /* ignore corrupted storage */ }
  }, []);

  const saveCredentials = (p, pwd) => {
    try {
      const enc = btoa(JSON.stringify({ phone: p, password: pwd }));
      localStorage.setItem("jwd_portal_saved", enc);
    } catch { /* localStorage unavailable */ }
  };
  const clearSavedCredentials = () => {
    try { localStorage.removeItem("jwd_portal_saved"); } catch {}
  };
  const forgetAccount = () => {
    clearSavedCredentials();
    setRememberMe(false);
    setPhone("");
    setPassword("");
    toast.success("تم مسح بيانات الحساب المحفوظة من هذا الجهاز");
  };
  // Previous orders section
  const [showHistory, setShowHistory] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [printingStmt, setPrintingStmt] = useState(false);
  const [showStmtDialog, setShowStmtDialog] = useState(false);
  const [stmtStart, setStmtStart] = useState("");
  const [stmtEnd, setStmtEnd] = useState("");
  const [incentives, setIncentives] = useState({ enabled: false, categories: [], history: [] });
  const [showIncentives, setShowIncentives] = useState(false);
  const [overLimitBanks, setOverLimitBanks] = useState([]);

  const loadIncentives = async (ph, pw) => {
    try {
      const r = await api.post("/public/card-order/incentives", { phone: ph || phone, password: pw || password });
      setIncentives(r.data || { enabled: false, categories: [], history: [] });
    } catch { setIncentives({ enabled: false, categories: [], history: [] }); }
  };
  const loadOverLimitBanks = async () => {
    try { const r = await api.get("/public/card-order/banks?show_in=over_limit"); setOverLimitBanks(r.data || []); }
    catch { setOverLimitBanks([]); }
  };

  const redeemIncentive = async (row, mode) => {
    if (!row?.category_id || row?.pending_qty <= 0) return;
    if (!window.confirm(mode === "credit"
      ? `تقييد قيمة الحافز (${row.pending_qty} × ${fmt(row.unit_value)}) في حسابك؟`
      : `استلام ${row.pending_qty} كرت حافز من فئة ${row.category_name}؟`)) return;
    try {
      const r = await api.post(`/public/card-order/incentives/redeem`, { phone, password, mode, category_id: row.category_id });
      if (mode === "credit") toast.success(`تم تقييد ${fmt(r.data.value)} في حسابك بنجاح 🎁`);
      else {
        toast.success(`تم تسليم ${r.data.qty} كرت حافز 🎁`);
        if (r.data.cards?.length) setResult({ cards: r.data.cards, recipient_phone: null, balance_after: customer?.balance || 0 });
      }
      await loadIncentives();
      try {
        const rc = await api.post("/public/card-order/login", { phone, password, device_id: phoneFingerprint() });
        setCustomer(rc.data);
      } catch {}
    } catch (e) { toast.error(errText(e)); }
  };

  const runPrintStatement = async ({ start = "", end = "" } = {}) => {
    setPrintingStmt(true);
    try {
      const body = { phone, password };
      if (start) body.start = start;
      if (end) body.end = end;
      const r = await api.post("/public/card-order/statement", body);
      const rangeTitle = start || end
        ? `كشف حساب من ${start || "البداية"} إلى ${end || "اليوم"}`
        : null;
      printStatement({
        customer: r.data.customer,
        entries: r.data.entries,
        username: r.data.customer?.name || "",
        rangeTitle,
      });
      setShowStmtDialog(false);
    } catch (e) { toast.error(errText(e)); }
    setPrintingStmt(false);
  };

  const openStmtDialog = () => {
    // Default range: current month
    const now = new Date();
    const first = new Date(now.getFullYear(), now.getMonth(), 1);
    const iso = (d) => d.toISOString().slice(0, 10);
    setStmtStart(iso(first));
    setStmtEnd(iso(now));
    setShowStmtDialog(true);
  };

  const contactCSForDeviceChange = () => {
    const now = new Date();
    const msg = `طلب ربط هاتف جديد بحساب طلب الكرت\n\nرقم الهاتف / الحساب: ${phone}\nالتاريخ والوقت: ${now.toLocaleString("en-GB")}\n\nقمت باستبدال هاتفي القديم وأحتاج ربط حسابي بالهاتف الجديد.\nيرجى التواصل معي لإتمام العملية وإرسال كلمة المرور الجديدة.`;
    openWhatsApp(ADMIN_WHATSAPP, msg);
    toast.success("تم إرسال طلبك إلى خدمة العملاء، وسيتم التواصل معك لإكمال عملية ربط الهاتف.");
  };

  const contactCSForDisabledAccount = () => {
    const now = new Date();
    const msg = `استفسار عن حساب موقوف\n\nرقم الهاتف / الحساب: ${phone}\nالتاريخ والوقت: ${now.toLocaleString("en-GB")}\n\nحسابي موقوف حالياً ولا أستطيع تسجيل الدخول.\nيرجى التواصل معي لمعرفة السبب وإعادة تفعيل الحساب.`;
    openWhatsApp(ADMIN_WHATSAPP, msg);
    toast.success("تم إرسال طلبك إلى خدمة العملاء.");
  };

  const login = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError(""); setDeviceMismatch(false); setAccountDisabled(false);
    if (!phone || !password) { setLoginError("أدخل رقم الهاتف وكلمة المرور"); return; }
    setLoading(true);
    try {
      const fp = await phoneFingerprint();
      const r = await api.post("/public/card-order/login", { phone, password, device_id: fp });
      setCustomer(r.data);
      const cr = await api.get("/public/card-order/categories");
      setCats(cr.data);
      if (rememberMe) saveCredentials(phone, password);
      else clearSavedCredentials();
      toast.success(`مرحباً ${r.data.name}`);
      loadIncentives(phone, password);
      loadOverLimitBanks();
    } catch (err) {
      const status = err.response?.status;
      const msg = errText(err);
      if (status === 429) { setBlocked(true); setLoginError(msg); }
      else if (status === 401) { setLoginError("كلمة المرور غير صحيحة"); }
      else if (status === 404) { setLoginError("رقم الهاتف أو كلمة المرور غير صحيحة"); }
      else if (status === 403) {
        setLoginError(msg || "الحساب معطل");
        if ((msg || "").startsWith("الهاتف غير مرتبط")) setDeviceMismatch(true);
        else if ((msg || "").includes("معطل") || (msg || "").includes("موقوف")) setAccountDisabled(true);
      }
      else if (!err.response) { setLoginError("تعذر الاتصال بالخادم. تحقق من الإنترنت وحاول مجدداً."); }
      else { setLoginError(msg || "حدث خطأ"); }
    }
    setLoading(false);
  };

  const contactPickerSupported = typeof navigator !== "undefined" && "contacts" in navigator && typeof navigator.contacts?.select === "function";

  const pickContact = async () => {
    if (!contactPickerSupported) {
      toast.error("متصفحك لا يدعم اختيار جهات الاتصال. الرجاء استخدام Chrome على أندرويد أو إدخال الرقم يدوياً.");
      return;
    }
    setPickingContact(true);
    try {
      const contacts = await navigator.contacts.select(["tel", "name"], { multiple: false });
      if (contacts && contacts.length > 0) {
        const c = contacts[0];
        const tel = Array.isArray(c.tel) ? c.tel[0] : c.tel;
        const nm = Array.isArray(c.name) ? c.name[0] : c.name;
        if (tel) {
          const digits = String(tel).replace(/[^0-9+]/g, "");
          setRecipientPhone(digits);
          setRecipientName(nm || "");
          toast.success(`تم اختيار: ${nm || digits}`);
        } else {
          toast.error("جهة الاتصال المختارة لا تحتوي على رقم هاتف");
        }
      }
    } catch (e) {
      if (e?.name !== "AbortError" && e?.name !== "NotAllowedError") {
        toast.error("تعذر فتح جهات الاتصال");
      }
    }
    setPickingContact(false);
  };

  const buildCardSmsBody = (cards, catName, senderName) => {
    const lines = [];
    lines.push(`مرحباً،`);
    if (senderName) lines.push(`أرسل لك ${senderName} كرت شحن:`);
    else lines.push(`إليك تفاصيل كرت الشحن:`);
    if (catName) lines.push(`الفئة: ${catName}`);
    if (cards && cards.length) {
      lines.push(cards.length === 1 ? `رقم الكرت:` : `أرقام الكروت:`);
      cards.forEach((c) => lines.push(c));
    }
    lines.push(``);
    lines.push(`— شبكة جواد نت اللاسلكية`);
    return lines.join("\n");
  };

  const sendCardSms = (recipient, cards, catName) => {
    const body = buildCardSmsBody(cards, catName, customer?.name);
    if (sendMethod === "whatsapp") {
      openWhatsApp(recipient, body);
    } else {
      openSMS(recipient, body);
    }
  };

  const request = async () => {
    if (!category_id) { toast.error("اختر الفئة"); return; }
    if (sendToOther) {
      const digits = (recipientPhone || "").replace(/[^0-9+]/g, "");
      if (digits.length < 6) { toast.error("أدخل رقم هاتف صحيح للمستلم"); return; }
      setRecipientPhone(digits);
    }
    setLoading(true);
    setOrderError("");
    try {
      const payload = { phone, password, category_id, quantity: Number(quantity) };
      if (sendToOther && recipientPhone) payload.recipient_phone = recipientPhone.replace(/[^0-9+]/g, "");
      const r = await api.post("/public/card-order/request", payload);
      const dataWithName = { ...r.data, recipient_name: sendToOther ? recipientName : "" };
      setResult(dataWithName);
      const cat = cats.find((c) => c.id === category_id);
      setSelectedCat(cat);
      toast.success(payload.recipient_phone ? `تم تنفيذ الطلب — تحويل إلى ${recipientName || payload.recipient_phone}` : "تم تنفيذ طلبك بنجاح");
      if (payload.recipient_phone && r.data?.cards?.length) {
        setTimeout(() => sendCardSms(payload.recipient_phone, r.data.cards, cat?.name), 600);
      }
    } catch (e) {
      const msg = errText(e);
      if ((msg || "").includes("سقف") || (msg || "").includes("تجاوز")) {
        setOrderError(msg);
      } else {
        toast.error(msg);
      }
    }
    setLoading(false);
  };

  const loadHistory = async (s, e) => {
    setHistoryLoading(true);
    try {
      const r = await api.post("/public/card-order/my-orders", { phone, password, start: s || null, end: e || null });
      setHistory(r.data || []);
      if (!(r.data || []).length) toast.info("لا توجد طلبات في الفترة المحددة");
    } catch (e) { toast.error(errText(e)); }
    setHistoryLoading(false);
  };

  const doPrint = (order) => {
    printPublicOrder({ order, customer });
  };

  const copyCard = async (n) => {
    try { await navigator.clipboard.writeText(n); toast.success("تم نسخ رقم الكرت بنجاح"); }
    catch { toast.error("تعذر النسخ"); }
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

  const currentCat = cats.find((x) => x.id === category_id);
  const ctype = customer?.customer_type || "customer";
  const currentPrice = priceForCustomer(currentCat, ctype);
  const availNumbered = currentCat?.available_numbered ?? 0;
  const wantQty = Number(quantity) || 0;
  const insufficient = category_id && wantQty > 0 && wantQty > availNumbered;
  const totalPreview = currentPrice * wantQty;

  return (
    <div className="min-h-screen brand-gradient flex items-center justify-center p-4" data-testid="public-order">
      <Card className="w-full max-w-md p-6 bg-white shadow-2xl border-0 rounded-2xl">
        <div className="text-center mb-6">
          <div className="text-2xl font-black text-[#221340] tracking-tight">شبكة جواد نت اللاسلكية</div>
          {!customer && (
            <div className="mt-4 inline-block bg-gradient-to-l from-[#D4AF37] to-[#F2D06B] text-[#1A0F33] px-6 py-2 rounded-full font-bold text-lg shadow-md">طلب كرت</div>
          )}
          {customer && (
            <div className="mt-4 inline-block bg-gradient-to-l from-[#D4AF37] to-[#F2D06B] text-[#1A0F33] px-6 py-2 rounded-full font-bold text-lg shadow-md">طلب كرت</div>
          )}
        </div>

        {!customer && (
          <div className="mb-4 text-center bg-gradient-to-l from-[#452480]/10 to-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-xl p-3 shadow-sm" data-testid="po-header-welcome">
            <div className="text-sm text-slate-600">مرحباً بك</div>
            <div className="text-xl font-black text-[#221340] mt-1">قم بتسجيل الدخول</div>
          </div>
        )}

        {!customer && (
          <form onSubmit={login} className="space-y-3" data-testid="po-login-form" noValidate>
            <div><Label>رقم الهاتف</Label><Input value={phone} onChange={(e) => { setPhone(e.target.value); setLoginError(""); }} data-testid="po-phone" autoComplete="tel" inputMode="tel"/></div>
            <div><Label>كلمة المرور</Label><Input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setLoginError(""); }} data-testid="po-password" autoComplete="current-password"/></div>
            <div className="flex items-center justify-between gap-2 pt-1">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4" data-testid="po-remember"/>
                <span>حفظ رقم الهاتف وكلمة المرور</span>
              </label>
              {(phone || password) && (
                <button type="button" onClick={forgetAccount} className="text-xs text-red-600 hover:underline" data-testid="po-forget">مسح الحساب من هذا الجهاز</button>
              )}
            </div>
            {loginError && (
              <div className={`rounded-md border px-3 py-2 text-sm ${accountDisabled ? 'border-red-400 bg-red-100 text-red-800' : 'border-red-300 bg-red-50 text-red-700'}`} data-testid="po-login-error" role="alert">
                <div className="flex items-start gap-2">
                  {accountDisabled ? <Ban size={18} className="mt-0.5 shrink-0"/> : <AlertCircle size={16} className="mt-0.5 shrink-0"/>}
                  <div className="flex-1">
                    {accountDisabled ? (
                      <>
                        <div className="font-bold text-base mb-1">⛔ الحساب موقوف</div>
                        <div>حسابك موقوف حالياً. تواصل مع خدمة العملاء لإعادة تفعيل حسابك.</div>
                      </>
                    ) : (
                      <span>{loginError}</span>
                    )}
                  </div>
                </div>
                {deviceMismatch && (
                  <Button
                    type="button"
                    onClick={contactCSForDeviceChange}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                    data-testid="po-contact-cs-device"
                  >
                    <Phone size={14} className="ml-1"/> إرسال لخدمة العملاء
                  </Button>
                )}
                {accountDisabled && (
                  <Button
                    type="button"
                    onClick={contactCSForDisabledAccount}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white"
                    data-testid="po-contact-cs-disabled"
                  >
                    <Phone size={14} className="ml-1"/> تواصل مع خدمة العملاء
                  </Button>
                )}
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
            <div className="text-center bg-gradient-to-l from-[#452480]/10 to-[#D4AF37]/20 border border-[#D4AF37]/40 rounded-xl p-3 shadow-sm" data-testid="po-welcome">
              <div className="text-sm text-slate-600">مرحباً بك</div>
              <div className="text-xl font-black text-[#221340] mt-1" data-testid="po-welcome-name">{customer.name}</div>
            </div>

            {incentives.enabled && incentives.categories.some((c) => c.pending_qty > 0) && (
              <Card className="p-3 bg-gradient-to-l from-amber-50 to-yellow-50 border-2 border-amber-400" data-testid="po-incentives-alert">
                <div className="text-center mb-2">
                  <div className="text-2xl">🎁</div>
                  <div className="font-black text-amber-800">مبروك! لديك حوافز مستحقة</div>
                  <button onClick={() => setShowIncentives(true)} className="text-xs text-[#452480] hover:underline mt-1" data-testid="po-inc-open-alert">عرض التفاصيل</button>
                </div>
              </Card>
            )}
            <Card className="p-3 bg-slate-50">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-slate-500">نوع الحساب</div>
                  <div className="font-bold">{ctype === "pos" ? "نقطة بيع" : "عميل"}</div>
                </div>
                <button onClick={() => setShowChangePwd(true)} className="text-xs text-[#452480] hover:underline flex items-center gap-1" data-testid="po-change-pwd"><KeyRound size={12}/> تغيير كلمة المرور</button>
              </div>
              <div className="text-xs mt-2 grid grid-cols-3 gap-2">
                <div><div className="text-slate-500">السقف</div><div className="num font-bold">{fmt(customer.credit_limit)}</div></div>
                <div><div className="text-slate-500">المديونية</div><div className="num font-bold">{fmt(customer.balance)}</div></div>
                <div><div className="text-slate-500">المتاح</div><div className="num font-bold text-green-600">{fmt(customer.available)}</div></div>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  onClick={openStmtDialog}
                  disabled={printingStmt}
                  variant="outline"
                  size="sm"
                  className="border-[#452480] text-[#452480] hover:bg-[#452480]/10"
                  data-testid="po-print-statement"
                >
                  <FileText size={14} className="ml-1"/> كشف الحساب
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowIncentives(true)}
                  variant="outline"
                  size="sm"
                  className={`relative ${(incentives.enabled || incentives.history?.length) ? "border-amber-500 text-amber-700 hover:bg-amber-50" : "border-slate-300 text-slate-500 hover:bg-slate-50"}`}
                  data-testid="po-open-incentives"
                >
                  <Gift size={14} className="ml-1"/> حوافز
                  {(incentives.categories || []).some((c) => c.pending_qty > 0) && <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">!</span>}
                </Button>
              </div>
            </Card>
            {orderError && (
              <Card className="p-3 border-2 border-red-400 bg-red-50" data-testid="po-order-error">
                <div className="text-red-800 font-bold text-sm text-center">{orderError}</div>
                {overLimitBanks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-red-300">
                    <div className="text-[11px] text-slate-600 mb-1 font-bold">للسداد يمكنك التحويل إلى:</div>
                    <div className="space-y-2" data-testid="po-over-limit-banks">
                      {overLimitBanks.map((b) => (
                        <div key={b.id} className="bg-white rounded-lg border border-amber-300 border-r-4 border-r-[#D4AF37] p-2 text-xs">
                          <div className="font-bold text-[#221340] flex items-center gap-1"><Landmark size={12}/> {b.bank_name}</div>
                          <div className="grid grid-cols-2 gap-1 mt-1">
                            <div><span className="text-slate-500">اسم الحساب: </span><span className="font-bold">{b.holder_name}</span></div>
                            <div><span className="text-slate-500">رقم الحساب: </span><span className="font-mono font-bold select-all">{b.account_number}</span></div>
                          </div>
                          {b.details && <div className="text-slate-500 mt-1 whitespace-pre-line">{b.details}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-2 text-center"><button onClick={() => setOrderError("")} className="text-[11px] text-slate-500 underline">إغلاق</button></div>
              </Card>
            )}
            <div><Label>الفئة</Label>
              <Select value={category_id} onValueChange={setCategoryId}>
                <SelectTrigger data-testid="po-cat"><SelectValue placeholder="اختر"/></SelectTrigger>
                <SelectContent>
                  {cats.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name} - {fmt(priceForCustomer(c, ctype))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>الكمية</Label><Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} data-testid="po-qty"/></div>
            {category_id && (
              <Card className="p-3 bg-amber-50 border-amber-200 text-sm space-y-1" data-testid="po-price-preview">
                <div className="flex justify-between"><span className="text-slate-600">السعر ({ctype === "pos" ? "نقطة بيع" : "عميل"})</span><span className="num font-bold gold-text">{fmt(currentPrice)}</span></div>
                <div className="flex justify-between"><span className="text-slate-600">الإجمالي</span><span className="num font-bold text-lg">{fmt(totalPreview)}</span></div>
              </Card>
            )}
            {insufficient && (
              <div className="flex items-start gap-2 rounded-md border border-red-300 bg-red-50 text-red-700 px-3 py-2 text-sm" data-testid="po-no-stock" role="alert">
                <AlertCircle size={16} className="mt-0.5 shrink-0"/><span>لا تتوفر كمية الكروت المطلوبة</span>
              </div>
            )}

            {/* Send to another phone */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={sendToOther} onChange={(e) => { setSendToOther(e.target.checked); if (!e.target.checked) setRecipientPhone(""); }} data-testid="po-send-other-toggle" className="h-4 w-4"/>
                <Send size={14} className="text-[#452480]"/>
                <span className="text-sm font-medium">إرسال الكرت لرقم آخر</span>
              </label>
              {sendToOther && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-2">
                    <Input type="tel" inputMode="tel" placeholder="أدخل رقم الهاتف المستلم" value={recipientPhone} onChange={(e) => { setRecipientPhone(e.target.value); setRecipientName(""); }} data-testid="po-recipient-phone" className="flex-1"/>
                    <Button type="button" onClick={pickContact} disabled={pickingContact} variant="outline" className="shrink-0 border-[#452480] text-[#452480] hover:bg-[#452480]/10" data-testid="po-pick-contact">
                      <ContactRound size={16} className="ml-1"/> جهات الاتصال
                    </Button>
                  </div>
                  {recipientName && (
                    <div className="flex items-center gap-2 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded px-2 py-1" data-testid="po-recipient-name">
                      <ContactRound size={14}/>
                      <span>الاسم: <strong>{recipientName}</strong></span>
                    </div>
                  )}
                  <div>
                    <div className="text-xs text-slate-600 mb-1">طريقة الإرسال</div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`flex items-center gap-2 border rounded-lg p-2 cursor-pointer text-sm ${sendMethod === "sms" ? "border-[#452480] bg-[#452480]/10 font-bold" : "border-slate-200"}`}>
                        <input type="radio" name="send-method" checked={sendMethod === "sms"} onChange={() => setSendMethod("sms")} data-testid="po-send-sms"/>
                        <span>رسالة نصية SMS</span>
                      </label>
                      <label className={`flex items-center gap-2 border rounded-lg p-2 cursor-pointer text-sm ${sendMethod === "whatsapp" ? "border-emerald-600 bg-emerald-50 font-bold" : "border-slate-200"}`}>
                        <input type="radio" name="send-method" checked={sendMethod === "whatsapp"} onChange={() => setSendMethod("whatsapp")} data-testid="po-send-whatsapp"/>
                        <span>واتساب</span>
                      </label>
                    </div>
                  </div>
                  {!contactPickerSupported && (
                    <div className="text-[11px] text-slate-500">
                      اختيار جهات الاتصال متاح فقط في متصفح Chrome على أندرويد. يمكنك إدخال الرقم يدوياً.
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button onClick={request} disabled={loading || !category_id || wantQty < 1 || insufficient} className="w-full bg-[#D4AF37] text-[#1A0F33] font-bold hover:bg-[#C5A028] text-lg py-6 disabled:opacity-50" data-testid="po-request">طلب</Button>

            {/* Previous orders section */}
            <div className="pt-3 border-t">
              <button type="button" onClick={() => setShowHistory((v) => !v)} className="w-full flex items-center justify-between text-sm font-bold text-[#221340]" data-testid="po-history-toggle">
                <span className="flex items-center gap-2"><History size={16}/> الطلبات السابقة</span>
                <span className="text-[#452480]">{showHistory ? "إخفاء" : "عرض"}</span>
              </button>
              {showHistory && (
                <div className="mt-3 space-y-3" data-testid="po-history">
                  <StatementPeriodPicker
                    onCancel={() => setShowHistory(false)}
                    onPrint={(s, e) => loadHistory(s, e)}
                    loading={historyLoading}
                    submitLabel="بحث"
                    submitIcon={<Search size={14} className="ml-1"/>}
                    hideCancel
                  />

                  <div className="space-y-2">
                    {history.map((o) => (
                      <Card key={o.id} className="p-3 text-sm border-slate-200" data-testid={`po-order-${o.id}`}>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0">
                            <div className="font-mono font-bold text-[#452480]" data-testid={`po-order-number-${o.id}`}>{o.number}</div>
                            <div className="text-xs text-slate-500">{fmtDate(o.created_at)}</div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => doPrint(o)} className="shrink-0" data-testid={`po-order-print-${o.id}`}><Printer size={12} className="ml-1"/> طباعة</Button>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                          <div><div className="text-slate-500">الحساب</div><div className="font-bold truncate">{o.customer_name}</div></div>
                          <div><div className="text-slate-500">الفئة</div><div className="font-bold truncate">{o.category_name || "-"}</div></div>
                          <div><div className="text-slate-500">الكمية</div><div className="num font-bold">{o.quantity}</div></div>
                          <div><div className="text-slate-500">الإجمالي</div><div className="num font-bold">{fmt(o.total)}</div></div>
                        </div>
                        {o.recipient_phone && (
                          <div className="mt-2 flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1 text-amber-900" data-testid={`po-order-recipient-${o.id}`}>
                            <Send size={12} className="text-amber-700"/>
                            <span>📤 المرسل إلى: <span className="font-mono font-bold">{o.recipient_phone}</span></span>
                          </div>
                        )}
                        {o.cards?.length > 0 && (
                          <div className="mt-2 pt-2 border-t">
                            <div className="text-slate-500 text-xs mb-1">الكروت:</div>
                            <div className="space-y-1">
                              {o.cards.map((c) => (
                                <div key={c} className="flex items-center justify-between bg-slate-50 p-1.5 rounded text-xs">
                                  <span className="font-mono tracking-wider">{c}</span>
                                  <Button size="sm" variant="outline" onClick={() => copyCard(c)} className="h-6 px-2 text-xs"><Copy size={10}/> نسخ</Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                    {history.length === 0 && !historyLoading && <div className="text-center text-xs text-slate-400 py-4">لا توجد طلبات لعرضها. اختر فترة واضغط بحث.</div>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="text-center">
              <CheckCircle className="mx-auto text-green-500" size={48}/>
              <div className="font-bold text-lg mt-2">تم تنفيذ طلبك بنجاح</div>
            </div>
            {selectedCat && <div className="text-center text-sm bg-slate-50 py-2 rounded">فئة الكرت: <span className="font-bold gold-text">{selectedCat.name}</span></div>}
            {result.recipient_phone && (
              <div className="text-center text-sm bg-amber-50 border border-amber-200 py-2 rounded flex flex-col items-center gap-1" data-testid="po-result-recipient">
                <div className="flex items-center gap-2">
                  <Send size={14} className="text-amber-700"/>
                  <span>تم التحويل إلى: <span className="font-mono font-bold text-amber-800">{result.recipient_phone}</span></span>
                </div>
                {result.recipient_name && (
                  <div className="text-xs text-amber-900 flex items-center gap-1" data-testid="po-result-recipient-name">
                    <ContactRound size={12}/> {result.recipient_name}
                  </div>
                )}
              </div>
            )}
            {result.recipient_phone && result.cards?.length > 0 && (
              <Button
                onClick={() => sendCardSms(result.recipient_phone, result.cards, selectedCat?.name)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="po-send-sms"
              >
                <MessageSquare size={16} className="ml-1"/> إرسال الكرت رسالة نصية إلى {result.recipient_phone}
              </Button>
            )}
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
            <Button onClick={() => { setResult(null); setCategoryId(""); setQuantity(1); setSelectedCat(null); setSendToOther(false); setRecipientPhone(""); setRecipientName(""); }} variant="outline" className="w-full">طلب جديد</Button>
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
      <Dialog open={showStmtDialog} onOpenChange={setShowStmtDialog}>
        <DialogContent className="max-w-md" data-testid="po-stmt-dialog">
          <DialogHeader><DialogTitle className="text-right">تحديد فترة كشف الحساب</DialogTitle></DialogHeader>
          <StatementPeriodPicker
            onCancel={() => setShowStmtDialog(false)}
            onPrint={(start, end) => runPrintStatement({ start, end })}
            loading={printingStmt}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatementPeriodPicker({ onCancel, onPrint, loading, submitLabel, submitIcon, hideCancel }) {
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const [mode, setMode] = useState("day"); // day | month | year | custom
  const [day, setDay] = useState(iso(today));
  const [month, setMonth] = useState(String(today.getMonth() + 1).padStart(2, "0"));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [cStart, setCStart] = useState(iso(new Date(today.getFullYear(), today.getMonth(), 1)));
  const [cEnd, setCEnd] = useState(iso(today));
  const monthNames = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
  const yearOptions = Array.from({ length: 10 }, (_, i) => String(today.getFullYear() - i));

  const submit = () => {
    if (mode === "day") {
      onPrint(day, day);
    } else if (mode === "month") {
      const y = parseInt(year, 10);
      const m = parseInt(month, 10);
      const start = `${y}-${String(m).padStart(2, "0")}-01`;
      const lastDay = new Date(y, m, 0).getDate();
      const end = `${y}-${String(m).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
      onPrint(start, end);
    } else if (mode === "year") {
      onPrint(`${year}-01-01`, `${year}-12-31`);
    } else {
      onPrint(cStart, cEnd);
    }
  };

  return (
    <div className="space-y-3 pt-2">
      <div className="grid grid-cols-4 gap-2" data-testid="po-stmt-mode">
        {[["day","يومي"],["month","شهري"],["year","سنوي"],["custom","مخصص"]].map(([k,l]) => (
          <button key={k} type="button" onClick={() => setMode(k)}
            className={`py-2 rounded-lg border text-xs font-bold ${mode===k?"bg-[#452480] text-white border-[#452480]":"border-slate-300 hover:bg-slate-50"}`}
            data-testid={`po-stmt-mode-${k}`}>
            {l}
          </button>
        ))}
      </div>

      {mode === "day" && (
        <div>
          <Label>التاريخ</Label>
          <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} data-testid="po-stmt-day"/>
          <div className="text-[11px] text-slate-500 mt-1">
            من: {day || "—"} &nbsp;·&nbsp; إلى: {day || "—"}
          </div>
        </div>
      )}
      {mode === "month" && (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>الشهر</Label>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full h-10 border rounded-md px-2 text-sm" data-testid="po-stmt-month">
              {monthNames.map((n, i) => <option key={i+1} value={String(i+1).padStart(2,"0")}>{n}</option>)}
            </select>
          </div>
          <div>
            <Label>السنة</Label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full h-10 border rounded-md px-2 text-sm" data-testid="po-stmt-month-year">
              {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      )}
      {mode === "year" && (
        <div>
          <Label>السنة</Label>
          <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full h-10 border rounded-md px-2 text-sm" data-testid="po-stmt-year">
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}
      {mode === "custom" && (
        <div className="grid grid-cols-2 gap-2">
          <div><Label>من تاريخ</Label><Input type="date" value={cStart} onChange={(e) => setCStart(e.target.value)} data-testid="po-stmt-custom-start"/></div>
          <div><Label>إلى تاريخ</Label><Input type="date" value={cEnd} onChange={(e) => setCEnd(e.target.value)} data-testid="po-stmt-custom-end"/></div>
        </div>
      )}

      <div className="flex gap-2 pt-3 border-t">
        <Button onClick={submit} disabled={loading} className="flex-1 bg-[#452480] hover:bg-[#5A2FA0]" data-testid="po-stmt-print">
          {submitIcon || <FileText size={14} className="ml-1"/>} {loading ? "جاري..." : (submitLabel || "طباعة")}
        </Button>
        {!hideCancel && <Button variant="outline" onClick={onCancel}>إلغاء</Button>}
      </div>
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
    const name = (f.full_name || "").trim();
    const phone = (f.phone || "").trim();
    const address = (f.address || "").trim();
    if (!name) { toast.error("الاسم الرباعي مطلوب"); return; }
    if (name.split(/\s+/).length < 2) { toast.error("الرجاء إدخال الاسم الرباعي كاملاً"); return; }
    if (!phone) { toast.error("رقم الهاتف مطلوب"); return; }
    if (!/^\+?\d{7,15}$/.test(phone.replace(/\s/g, ""))) { toast.error("رقم الهاتف غير صحيح"); return; }
    if (!address) { toast.error("العنوان مطلوب"); return; }
    setLoading(true);
    try {
      await api.post("/public/customer/register-request", { full_name: name, phone, address });
      const now = new Date();
      const msg = `طلب إنشاء حساب جديد\n\nاسم العميل: ${name}\nرقم الهاتف: ${phone}\nالعنوان: ${address}\n\nيرجى الموافقة على الطلب.\n\n${now.toLocaleString("en-GB")}`;
      openWhatsApp(ADMIN_WHATSAPP, msg);
      toast.success("تم إرسال الطلب، سيتم التواصل معك قريباً");
      onClose();
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>إنشاء حساب جديد</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label>الاسم الرباعي <span className="text-red-500">*</span></Label>
          <Input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} required placeholder="مثال: محمد أحمد علي سالم" data-testid="reg-name"/>
        </div>
        <div>
          <Label>رقم الهاتف <span className="text-red-500">*</span></Label>
          <Input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} required inputMode="tel" data-testid="reg-phone"/>
        </div>
        <div>
          <Label>العنوان <span className="text-red-500">*</span></Label>
          <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} required placeholder="المدينة، الحي، أقرب معلم" data-testid="reg-address"/>
        </div>
        <div className="text-[11px] text-slate-500">جميع الحقول إجبارية (*)</div>
        <Button type="submit" disabled={loading} className="w-full bg-[#221340]" data-testid="reg-submit">{loading?"جاري...":"تسجيل"}</Button>
      </form>
    </DialogContent>
  );
}

function ChangePasswordForm({ phone, currentPassword, onClose, onDone }) {
  const [current, setCurrent] = useState(currentPassword || "");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    if (next !== confirm) { toast.error("كلمة المرور وتأكيدها غير متطابقين"); return; }
    if ((next || "").length < 4) { toast.error("كلمة المرور قصيرة"); return; }
    setLoading(true);
    try {
      await api.post("/public/customer/change-password", { phone, current_password: current, new_password: next });
      toast.success("تم تغيير كلمة المرور");
      onDone && onDone(next);
      onClose();
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };
  return (
    <DialogContent>
      <DialogHeader><DialogTitle>تغيير كلمة المرور</DialogTitle></DialogHeader>
      <form onSubmit={submit} className="space-y-3">
        <div><Label>كلمة المرور الحالية</Label><Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required data-testid="cp-current"/></div>
        <div><Label>كلمة المرور الجديدة</Label><Input type="password" value={next} onChange={(e) => setNext(e.target.value)} required data-testid="cp-new"/></div>
        <div><Label>تأكيد كلمة المرور</Label><Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required data-testid="cp-confirm"/></div>
        <Button type="submit" disabled={loading} className="w-full bg-[#221340]" data-testid="cp-submit">{loading?"جاري...":"حفظ"}</Button>
      </form>
    </DialogContent>
  );
}
