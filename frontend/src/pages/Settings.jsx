import { useEffect, useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function SettingsPage() {
  const [s, setS] = useState({ currency: "ريال", logo_url: "", low_stock_default: 20 });
  useEffect(() => { api.get("/settings").then((r) => setS(r.data)); }, []);
  const save = async () => {
    try { await api.post("/settings", s); toast.success("تم الحفظ"); } catch (e) { toast.error(errText(e)); }
  };
  return (
    <Card className="p-6 max-w-lg space-y-4" data-testid="settings-page">
      <div><Label>اسم الشبكة</Label><Input value={s.company_name || ""} disabled/></div>
      <div><Label>الهاتف</Label><Input value={s.company_phone || ""} disabled/></div>
      <div><Label>العملة</Label><Input value={s.currency || ""} onChange={(e) => setS({ ...s, currency: e.target.value })} data-testid="set-currency"/></div>
      <div><Label>حد التنبيه للمخزون المنخفض</Label><Input type="number" value={s.low_stock_default || 20} onChange={(e) => setS({ ...s, low_stock_default: Number(e.target.value) })}/></div>
      <div><Label>رابط الشعار</Label><Input value={s.logo_url || ""} onChange={(e) => setS({ ...s, logo_url: e.target.value })}/></div>
      <Button onClick={save} className="bg-[#221340]" data-testid="set-save">حفظ الإعدادات</Button>
    </Card>
  );
}
