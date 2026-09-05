import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { fmt, fmtDate } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

export default function Sales() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  useEffect(() => { api.get("/sales", { params: { q } }).then((r) => setItems(r.data)); }, [q]);
  return (
    <div className="space-y-4" data-testid="sales-page">
      <div className="flex justify-between flex-wrap gap-2">
        <div className="relative max-w-xs flex-1"><Search className="absolute right-3 top-2.5 text-slate-400" size={18}/><Input placeholder="بحث برقم GWD..." value={q} onChange={(e) => setQ(e.target.value)} className="pr-10" /></div>
        <Link to="/sales/new"><Button className="bg-[#221340]" data-testid="new-sale-btn"><Plus size={16} className="ml-1"/> فاتورة جديدة</Button></Link>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr className="text-right"><th className="p-3">الرقم</th><th className="p-3">التاريخ</th><th className="p-3">العميل</th><th className="p-3">الإجمالي</th><th className="p-3">المدفوع</th><th className="p-3">المتبقي</th></tr></thead>
          <tbody>
            {items.map((s) => (
              <tr key={s.id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-[#452480] font-bold">{s.number}</td>
                <td className="p-3">{fmtDate(s.created_at)}</td>
                <td className="p-3">{s.customer_name || "نقدي"}</td>
                <td className="p-3 num">{fmt(s.total)}</td>
                <td className="p-3 num">{fmt(s.paid)}</td>
                <td className="p-3 num font-bold text-amber-700">{fmt(s.remaining)}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">لا توجد فواتير</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
