import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmt, fmtDate } from "@/lib/utils";
import { Printer } from "lucide-react";

export default function CustomerStatement() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/customers/${id}/statement`).then((r) => setData(r.data)); }, [id]);
  if (!data) return <div>جاري التحميل...</div>;
  const c = data.customer;
  return (
    <div className="space-y-4" data-testid="statement-page">
      <Card className="p-4 md:p-6">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold">{c.name}</h2>
            <div className="text-slate-500 text-sm">{c.phone}</div>
          </div>
          <Button onClick={() => window.print()} className="bg-[#221340]" data-testid="print-stmt"><Printer size={16} className="ml-1"/> طباعة</Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <div className="bg-slate-50 p-3 rounded-lg"><div className="text-xs text-slate-500">السقف</div><div className="num font-bold">{fmt(c.credit_limit)}</div></div>
          <div className="bg-slate-50 p-3 rounded-lg"><div className="text-xs text-slate-500">الرصيد</div><div className="num font-bold">{fmt(c.balance)}</div></div>
          <div className="bg-slate-50 p-3 rounded-lg"><div className="text-xs text-slate-500">المتاح</div><div className="num font-bold text-green-600">{fmt(Math.max(0, (c.credit_limit || 0) - (c.balance || 0)))}</div></div>
          <div className="bg-slate-50 p-3 rounded-lg"><div className="text-xs text-slate-500">الرصيد الافتتاحي</div><div className="num font-bold">{fmt(c.opening_balance)}</div></div>
        </div>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr className="text-right">
              <th className="p-3">التاريخ</th><th className="p-3">رقم العملية</th><th className="p-3">البيان</th>
              <th className="p-3">مدين</th><th className="p-3">دائن</th><th className="p-3">الرصيد</th>
            </tr>
          </thead>
          <tbody>
            {data.entries.map((e) => (
              <tr key={e.id} className="border-t border-slate-100">
                <td className="p-3">{fmtDate(e.created_at)}</td>
                <td className="p-3 font-mono text-[#452480]">{e.op_number || "-"}</td>
                <td className="p-3">{e.description}</td>
                <td className="p-3 num">{fmt(e.debit)}</td>
                <td className="p-3 num">{fmt(e.credit)}</td>
                <td className="p-3 num font-bold">{fmt(e.balance)}</td>
              </tr>
            ))}
            {data.entries.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">لا توجد حركات</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
