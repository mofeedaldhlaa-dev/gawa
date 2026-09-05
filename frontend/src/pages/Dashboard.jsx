import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { fmt, fmtDate } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, Users, Truck, Boxes, CreditCard, Receipt, FileBarChart, Ticket, PlusCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const Stat = ({ label, value, sub, tone = "purple", testid }) => {
  const bg = { purple: "bg-[#221340]", gold: "bg-[#D4AF37]", light: "bg-white" }[tone];
  const fg = tone === "light" ? "text-[#221340]" : tone === "gold" ? "text-[#1A0F33]" : "text-white";
  const border = tone === "light" ? "border border-slate-200" : "";
  return (
    <Card className={`${bg} ${fg} ${border} p-4 md:p-5`} data-testid={testid}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-2xl md:text-3xl font-black num mt-1">{value}</div>
      {sub && <div className="text-xs opacity-70 mt-1">{sub}</div>}
    </Card>
  );
};

const Quick = ({ to, label, icon: Icon, testid }) => (
  <Link to={to} data-testid={testid}
    className="flex flex-col items-center justify-center gap-2 p-4 bg-white border border-slate-200 rounded-xl hover:border-[#D4AF37] hover:shadow-md transition min-h-[80px]">
    <Icon size={22} className="text-[#452480]" />
    <span className="text-sm font-medium text-[#221340] text-center">{label}</span>
  </Link>
);

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/reports/dashboard").then((r) => setD(r.data)); }, []);
  if (!d) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="space-y-6" data-testid="dashboard">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat testid="stat-sales-today" label="مبيعات اليوم" value={fmt(d.sales_today)} tone="purple" />
        <Stat testid="stat-sales-month" label="مبيعات الشهر" value={fmt(d.sales_month)} tone="gold" />
        <Stat testid="stat-purchases" label="المشتريات" value={fmt(d.purchases_total)} tone="light" />
        <Stat testid="stat-inventory" label="قيمة المخزون" value={fmt(d.inventory_value)} tone="light" />
        <Stat testid="stat-cust-debts" label="ديون العملاء" value={fmt(d.customer_debts)} tone="light" />
        <Stat testid="stat-sup-debts" label="ديون الموردين" value={fmt(d.supplier_debts)} tone="light" />
        <Stat testid="stat-cards-avail" label="الكروت المتوفرة" value={fmt(d.cards_available)} tone="light" />
        <Stat testid="stat-cards-sold" label="الكروت المباعة" value={fmt(d.cards_sold)} tone="light" />
      </div>

      <div>
        <div className="text-sm font-bold text-[#221340] mb-3">اختصارات سريعة</div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          <Quick to="/sales/new" label="فاتورة مبيعات" icon={ShoppingCart} testid="quick-sale" />
          <Quick to="/purchases/new" label="فاتورة مشتريات" icon={Package} testid="quick-purchase" />
          <Quick to="/receipts" label="سند قبض/صرف" icon={Receipt} testid="quick-receipt" />
          <Quick to="/customers" label="إضافة عميل" icon={Users} testid="quick-customer" />
          <Quick to="/cards" label="إضافة كروت" icon={CreditCard} testid="quick-cards" />
          <Quick to="/reports" label="التقارير" icon={FileBarChart} testid="quick-reports" />
        </div>
      </div>

      {d.chart?.length > 0 && (
        <Card className="p-4">
          <div className="text-sm font-bold text-[#221340] mb-3">المبيعات اليومية</div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#452480" strokeWidth={2} dot={{ fill: "#D4AF37" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="text-sm font-bold text-[#221340] mb-3">آخر الفواتير</div>
          <div className="space-y-2">
            {d.recent_sales.map((s) => (
              <div key={s.id} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span className="font-mono text-[#452480]">{s.number}</span>
                <span className="num">{fmt(s.total)}</span>
              </div>
            ))}
            {d.recent_sales.length === 0 && <div className="text-slate-400 text-sm">لا توجد بيانات</div>}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-bold text-[#221340] mb-3">آخر السندات</div>
          <div className="space-y-2">
            {d.recent_receipts.map((r) => (
              <div key={r.id} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span className="font-mono text-[#452480]">{r.number}</span>
                <span className="num">{fmt(r.amount)}</span>
              </div>
            ))}
            {d.recent_receipts.length === 0 && <div className="text-slate-400 text-sm">لا توجد بيانات</div>}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm font-bold text-[#221340] mb-3">آخر الطلبات</div>
          <div className="space-y-2">
            {d.recent_orders.map((o) => (
              <div key={o.id} className="flex justify-between text-sm border-b border-slate-100 pb-2">
                <span className="font-mono text-[#452480]">{o.number}</span>
                <span>{o.customer_name}</span>
              </div>
            ))}
            {d.recent_orders.length === 0 && <div className="text-slate-400 text-sm">لا توجد بيانات</div>}
          </div>
        </Card>
      </div>
    </div>
  );
}
