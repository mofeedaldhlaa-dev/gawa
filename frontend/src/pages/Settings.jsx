import { useState, useEffect } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { fmt } from "@/lib/utils";
import { Database, RotateCcw, Trash2, Download, Upload, Send, CloudDownload } from "lucide-react";

export default function SettingsPage() {
  const [s, setS] = useState({ currency: "ريال", logo_url: "", low_stock_default: 20, backup_email: "" });
  const [backupEmail, setBackupEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [backupSettings, setBackupSettings] = useState({ time: "02:00", auto: false });
  const [savingAuto, setSavingAuto] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [latestBackup, setLatestBackup] = useState(null);
  const [restoringCloud, setRestoringCloud] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetForm, setResetForm] = useState({ username: "", password: "" });

  useEffect(() => {
    api.get("/settings").then((r) => {
      setS(r.data);
      setBackupEmail(r.data.backup_email || "");
      setBackupSettings({
        time: r.data.backup_time || "02:00",
        auto: !!r.data.backup_auto,
      });
    });
    api.get("/backup/latest").then((r) => {
      if (r.data?.exists) setLatestBackup(r.data);
    }).catch(() => {});
  }, []);

  const save = async () => {
    try { await api.post("/settings", s); toast.success("تم الحفظ"); } catch (e) { toast.error(errText(e)); }
  };

  const saveBackupEmail = async () => {
    const v = (backupEmail || "").trim();
    if (!v || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.error("البريد الإلكتروني غير صحيح. يرجى إدخال بريد إلكتروني صالح.");
      return;
    }
    setSavingEmail(true);
    try {
      await api.post("/settings", { backup_email: v });
      setS((prev) => ({ ...prev, backup_email: v }));
      toast.success("تم حفظ البريد الإلكتروني بنجاح.");
    } catch (e) { toast.error(errText(e)); }
    setSavingEmail(false);
  };

  const saveBackupAuto = async () => {
    const time = backupSettings.time || "02:00";
    if (!/^\d{2}:\d{2}$/.test(time)) {
      toast.error("الرجاء إدخال وقت صحيح بصيغة HH:MM.");
      return;
    }
    if (backupSettings.auto && !((backupEmail || "").trim())) {
      toast.error("يرجى حفظ البريد الإلكتروني للنسخ أولاً قبل تفعيل النسخ التلقائي.");
      return;
    }
    setSavingAuto(true);
    try {
      await api.post("/settings", { backup_time: time, backup_auto: !!backupSettings.auto });
      toast.success(backupSettings.auto ? "تم تفعيل النسخ الاحتياطي التلقائي." : "تم حفظ إعدادات النسخ التلقائي.");
    } catch (e) { toast.error(errText(e)); }
    setSavingAuto(false);
  };

  const runBackupNow = async () => {
    const v = (backupEmail || "").trim();
    if (!v) {
      toast.error("يرجى حفظ البريد الإلكتروني للنسخ أولاً.");
      return;
    }
    setRunningNow(true);
    try {
      const r = await api.post("/backup/run-now");
      if (r.data?.email_sent) {
        toast.success(`تم رفع النسخة (${(r.data.size/1024).toFixed(1)} KB) وإرسال الرابط إلى ${r.data.email_to}`);
      } else if (r.data?.email_error) {
        toast.error(`تم الرفع لكن فشل الإرسال: ${r.data.email_error}`);
      } else {
        toast.success(`تم رفع النسخة إلى السحابة (${(r.data.size/1024).toFixed(1)} KB)`);
      }
      // refresh latest
      const l = await api.get("/backup/latest");
      if (l.data?.exists) setLatestBackup(l.data);
    } catch (e) { toast.error(errText(e)); }
    setRunningNow(false);
  };

  const restoreLatestCloud = async () => {
    if (!latestBackup) {
      toast.error("لا توجد نسخة سحابية للاستعادة.");
      return;
    }
    const when = (latestBackup.created_at || "").replace("T", " ").slice(0, 16);
    if (!window.confirm(
      `سيتم استعادة آخر نسخة سحابية (${when}). سيتم استبدال كل البيانات (باستثناء المستخدمين) بمحتوى النسخة، مع إنشاء نسخة أمان تلقائية أولاً. تأكيد؟`
    )) return;
    setRestoringCloud(true);
    try {
      const r = await api.post("/backup/restore-latest", { confirm: true });
      toast.success(`تمت الاستعادة بنجاح — ${r.data?.total_docs || 0} وثيقة من ${Object.keys(r.data?.restored || {}).length} مجموعة.`);
      setTimeout(() => window.location.reload(), 1500);
    } catch (e) { toast.error(errText(e)); }
    setRestoringCloud(false);
  };

  const exportBackup = async () => {
    try {
      const r = await api.get("/backup/export");
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jawad-backup-${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("تم إنشاء النسخة الاحتياطية");
    } catch (e) { toast.error(errText(e)); }
  };

  const uploadBackup = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!window.confirm("سيتم استبدال البيانات الحالية. سيتم إنشاء نسخة أمان تلقائية أولاً. تأكيد؟")) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await api.post("/backup/restore", { data });
      toast.success("تمت الاستعادة");
    } catch (e) { toast.error(errText(e)); }
  };

  const performReset = async () => {
    try {
      await api.post("/settings/reset-data", { username: resetForm.username, password: resetForm.password, confirm: true });
      toast.success("تم مسح جميع البيانات");
      setResetOpen(false);
      setResetForm({ username: "", password: "" });
    } catch (e) { toast.error(errText(e)); }
  };

  return (
    <div className="space-y-6 max-w-2xl" data-testid="settings-page">
      <Card className="p-6 space-y-4">
        <div className="text-lg font-bold text-[#221340]">إعدادات عامة</div>
        <div><Label>اسم الشبكة</Label><Input value={s.company_name || ""} disabled/></div>
        <div><Label>الهاتف</Label><Input value={s.company_phone || ""} disabled/></div>
        <div>
          <Label>العملة</Label>
          <Select value={s.currency || "ريال"} onValueChange={(v) => setS({ ...s, currency: v })}>
            <SelectTrigger data-testid="set-currency"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="ريال">ريال يمني (ريال)</SelectItem>
              <SelectItem value="ر.س">ريال سعودي (ر.س)</SelectItem>
              <SelectItem value="د.إ">درهم إماراتي (د.إ)</SelectItem>
              <SelectItem value="ج.م">جنيه مصري (ج.م)</SelectItem>
              <SelectItem value="د.ك">دينار كويتي (د.ك)</SelectItem>
              <SelectItem value="د.ب">دينار بحريني (د.ب)</SelectItem>
              <SelectItem value="ر.ع">ريال عماني (ر.ع)</SelectItem>
              <SelectItem value="ر.ق">ريال قطري (ر.ق)</SelectItem>
              <SelectItem value="د.ع">دينار عراقي (د.ع)</SelectItem>
              <SelectItem value="د.أ">دينار أردني (د.أ)</SelectItem>
              <SelectItem value="ل.س">ليرة سورية (ل.س)</SelectItem>
              <SelectItem value="USD">دولار أمريكي (USD)</SelectItem>
              <SelectItem value="EUR">يورو (EUR)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div><Label>حد التنبيه الافتراضي للمخزون</Label><Input type="number" value={s.low_stock_default || 20} onChange={(e) => setS({ ...s, low_stock_default: Number(e.target.value) })}/></div>
        <div><Label>رابط الشعار</Label><Input value={s.logo_url || ""} onChange={(e) => setS({ ...s, logo_url: e.target.value })}/></div>
        <Button onClick={save} className="bg-[#221340]" data-testid="set-save">حفظ</Button>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="text-lg font-bold text-[#221340] flex items-center gap-2"><Database size={20}/> النسخ الاحتياطي والمزامنة</div>
        <div>
          <Label>البريد الإلكتروني للنسخ الاحتياطية</Label>
          <Input
            type="email"
            value={backupEmail}
            onChange={(e) => setBackupEmail(e.target.value)}
            data-testid="backup-email"
            placeholder="admin@example.com"
            autoComplete="email"
            inputMode="email"
          />
          <div className="text-xs text-slate-500 mt-1">سيتم استخدام هذا البريد تلقائياً عند إرسال النسخ الاحتياطية.</div>
          <Button
            onClick={saveBackupEmail}
            disabled={savingEmail}
            className="mt-2 bg-[#452480] hover:bg-[#5A2FA0]"
            data-testid="backup-email-save"
          >
            {savingEmail ? "جاري..." : "حفظ البريد الإلكتروني"}
          </Button>
        </div>
        <div className="pt-3 border-t space-y-3">
          <div><Label>وقت النسخ اليومي</Label><Input type="time" value={backupSettings.time} onChange={(e) => setBackupSettings({ ...backupSettings, time: e.target.value })} data-testid="backup-time"/></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={backupSettings.auto} onChange={(e) => setBackupSettings({ ...backupSettings, auto: e.target.checked })} data-testid="backup-auto-toggle"/> تفعيل النسخ الاحتياطي التلقائي</label>
          <Button
            onClick={saveBackupAuto}
            disabled={savingAuto}
            className="bg-[#452480] hover:bg-[#5A2FA0] w-full sm:w-auto"
            data-testid="backup-auto-save"
          >
            {savingAuto ? "جاري..." : "حفظ إعدادات النسخ التلقائي"}
          </Button>
          <div className="flex gap-2 flex-wrap pt-3 border-t">
            <Button onClick={runBackupNow} disabled={runningNow} className="bg-emerald-700 hover:bg-emerald-800" data-testid="backup-run-now"><Send size={14} className="ml-1"/> {runningNow ? "جاري الرفع والإرسال..." : "رفع للسحابة وإرسال بالبريد الآن"}</Button>
            <Button onClick={restoreLatestCloud} disabled={restoringCloud || !latestBackup} className="bg-amber-600 hover:bg-amber-700 disabled:opacity-50" data-testid="backup-restore-latest"><CloudDownload size={14} className="ml-1"/> {restoringCloud ? "جاري الاستعادة..." : "استعادة آخر نسخة سحابية"}</Button>
            <Button onClick={exportBackup} className="bg-[#221340]" data-testid="backup-export"><Download size={14} className="ml-1"/> تنزيل نسخة محلية</Button>
            <label className="inline-flex">
              <input type="file" accept=".json" onChange={uploadBackup} className="hidden" data-testid="backup-upload"/>
              <span className="bg-[#452480] text-white px-4 py-2 rounded cursor-pointer flex items-center gap-1 text-sm hover:bg-[#5A2FA0]"><Upload size={14}/> استعادة نسخة</span>
            </label>
          </div>
          {latestBackup ? (
            <div className="text-xs text-slate-600 bg-slate-50 rounded p-2 mt-2" data-testid="latest-backup-info">
              آخر نسخة سحابية: <strong>{(latestBackup.created_at || "").replace("T"," ").slice(0,16)}</strong>
              — الحجم: {(latestBackup.size/1024).toFixed(1)} KB — المصدر: {latestBackup.trigger || "—"}
            </div>
          ) : (
            <div className="text-xs text-slate-500 mt-2">لا توجد نسخة سحابية بعد. اضغط "رفع للسحابة" لإنشاء أول نسخة.</div>
          )}
          <div className="text-xs text-slate-500 pt-2">
            الرفع للسحابة يستخدم تخزين Emergent Object Storage ويُرسل رابط تحميل صالح لمدة 14 يوماً إلى بريدك.
            التشغيل التلقائي يعمل يومياً الساعة 02:00 (توقيت عدن) عبر جدولة النظام.
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-3 border-red-200 bg-red-50/40">
        <div className="text-lg font-bold text-red-700 flex items-center gap-2"><Trash2 size={20}/> منطقة الخطر</div>
        <div className="text-sm text-slate-700">مسح جميع البيانات السابقة يحذف: العملاء، الموردون، الكروت، المخزون، الفواتير، السندات، الطلبات، الإشعارات. المستخدمون والإعدادات محفوظة.</div>
        <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
          <AlertDialogTrigger asChild><Button variant="destructive" data-testid="reset-btn"><Trash2 size={14} className="ml-1"/> مسح جميع البيانات السابقة</Button></AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-700">⚠️ عملية غير قابلة للتراجع</AlertDialogTitle>
              <AlertDialogDescription>هذا الإجراء سيحذف جميع بيانات العمليات نهائياً. أدخل بيانات المدير للتأكيد.</AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-3">
              <div><Label>اسم المستخدم</Label><Input value={resetForm.username} onChange={(e) => setResetForm({ ...resetForm, username: e.target.value })} data-testid="reset-username"/></div>
              <div><Label>كلمة المرور</Label><Input type="password" value={resetForm.password} onChange={(e) => setResetForm({ ...resetForm, password: e.target.value })} data-testid="reset-password"/></div>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={performReset} className="bg-red-600 hover:bg-red-700" data-testid="reset-confirm">تأكيد المسح</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
}
