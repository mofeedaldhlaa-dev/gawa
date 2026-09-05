import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { fmt, fmtDate } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function Purchases() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/purchases").then((r) => setItems(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="purchases-page">
      <div className="flex justify-end"><Link to="/purchases/new"><Button className="bg-[#221340]" data-testid="new-purchase-btn"><Plus size={16} className="ml-1"/> مشتريات جديدة</Button></Link></div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr className="text-right"><th className="p-3">الرقم</th><th className="p-3">التاريخ</th><th className="p-3">المورد</th><th className="p-3">الإجمالي</th><th className="p-3">المدفوع</th><th className="p-3">المتبقي</th></tr></thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.id} className="border-t border-slate-100"><td className="p-3 font-mono text-[#452480] font-bold">{p.number}</td><td className="p-3">{fmtDate(p.created_at)}</td><td className="p-3">{p.supplier_name}</td><td className="p-3 num">{fmt(p.total)}</td><td className="p-3 num">{fmt(p.paid)}</td><td className="p-3 num text-amber-700">{fmt(p.remaining)}</td></tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">لا يوجد فواتير مشتريات</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
