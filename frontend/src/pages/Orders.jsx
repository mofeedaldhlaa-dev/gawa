import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { fmt, fmtDate } from "@/lib/utils";

export default function Orders() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/orders").then((r) => setItems(r.data)); }, []);
  return (
    <div className="space-y-4" data-testid="orders-page">
      <Card className="p-4">
        <div className="text-sm text-slate-600 mb-2">رابط طلب الكرت للعميل:</div>
        <div className="font-mono text-xs bg-slate-100 p-2 rounded" data-testid="public-order-link">{window.location.origin}/order</div>
      </Card>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr className="text-right"><th className="p-3">الرقم</th><th className="p-3">التاريخ</th><th className="p-3">العميل</th><th className="p-3">الفئة</th><th className="p-3">الكمية</th><th className="p-3">الإجمالي</th><th className="p-3">الكروت</th></tr></thead>
          <tbody>
            {items.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-[#452480] font-bold">{o.number}</td>
                <td className="p-3">{fmtDate(o.created_at)}</td>
                <td className="p-3">{o.customer_name}</td>
                <td className="p-3">{o.category_name}</td>
                <td className="p-3 num">{o.quantity}</td>
                <td className="p-3 num">{fmt(o.total)}</td>
                <td className="p-3 font-mono text-xs">{(o.cards || []).join(", ") || `${o.quantity_stock_taken || 0} من المخزون`}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={7} className="p-6 text-center text-slate-400">لا توجد طلبات</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
