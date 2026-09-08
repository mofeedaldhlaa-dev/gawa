import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fmt, fmtDate } from "@/lib/utils";
import { printReport } from "@/lib/print";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, Users, Truck, Boxes, CreditCard, Receipt, FileBarChart, Ticket, PlusCircle, AlertTriangle, Wallet, Printer, Search } from "lucide-react";

const _iso = (d) => d.toISOString().slice(0, 10);
const _startOfToday = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };
const _startOfMonth = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); };
const _startOfYear = () => { const d = new Date(); return new Date(d.getFullYear(), 0, 1); };

function CashBox() {
  const [period, setPeriod] = useState("month");
  const [start, setStart] = useState(_iso(_startOfMonth()));
  const [end, setEnd] = useState(_iso(new Date()));
  const [data, setData] = useState(null);
  const load = () => api.get("/cash/summary", { params: { start, end } }).then((r) => setData(r.data)).catch(() => {});
  useEffect(() => { load(); }, [start, end]);
  const apply = (p) => {
    setPeriod(p); const today = new Date();
    if (p === "day") { setStart(_iso(_startOfToday())); setEnd(_iso(today)); }
    else if (p === "month") { setStart(_iso(_startOfMonth())); setEnd(_iso(today)); }
    else if (p === "year") { setStart(_iso(_startOfYear())); setEnd(_iso(today)); }
  };
  const doPrint = async () => {
    try {
      const r = await api.get("/cash/statement", { params: { start, end } });
      const entries = r.data.entries || [];
      if (!entries.length) { toast.error("لا توجد حركات ضمن الفترة"); return; }
      const labelP = { day: "يومي", month: "شهري", year: "سنوي", custom: "مخصص" }[period];
      printReport({
        title: `كشف صندوق النقدية ${labelP} — من ${start} إلى ${end}`,
        headers: ["التاريخ", "الرقم", "البيان", "قبض", "صرف", "الرصيد"],
        rows: entries.map((e) => [fmtDate(e.created_at), e.number || "-", e.description, fmt(e.in), fmt(e.out), fmt(e.balance)]),
        totals: [
          { label: "إجمالي القبض", value: fmt(r.data.total_in) },
          { label: "إجمالي الصرف", value: fmt(r.data.total_out) },
          { label: "صافي الحركة", value: fmt(r.data.total_in - r.data.total_out) },
        ],
      });
    } catch (e) { toast.error("فشل تحميل الكشف"); }
  };
  if (!data) return null;
  return (
    <Card className="p-4 border-r-4 border-emerald-500" data-testid="dash-cashbox">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2 font-bold text-[#221340]"><Wallet size={18} className="text-emerald-600"/> صندوق النقدية</div>
        <div className="flex gap-1 flex-wrap">
          {[["day","يومي"],["month","شهري"],["year","سنوي"]].map(([k,l]) => (
            <button key={k} onClick={() => apply(k)} className={`px-2.5 py-1 rounded-full text-xs border ${period===k?"bg-emerald-600 text-white border-emerald-600":"border-slate-300"}`} data-testid={`cash-period-${k}`}>{l}</button>
          ))}
          <Button onClick={doPrint} size="sm" variant="outline" className="text-xs h-7" data-testid="cash-print"><Printer size={12} className="ml-1"/>طباعة</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div><label className="text-xs text-slate-500">من</label><Input type="date" value={start} onChange={(e) => { setStart(e.target.value); setPeriod("custom"); }} className="h-8" data-testid="cash-start"/></div>
        <div><label className="text-xs text-slate-500">إلى</label><Input type="date" value={end} onChange={(e) => { setEnd(e.target.value); setPeriod("custom"); }} className="h-8" data-testid="cash-end"/></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div className="bg-emerald-50 p-2 rounded"><div className="text-xs text-slate-500">الرصيد الحالي</div><div className="text-lg font-bold text-emerald-700 num" data-testid="cash-balance">{fmt(data.balance)}</div></div>
        <div className="bg-green-50 p-2 rounded"><div className="text-xs text-slate-500">إجمالي المقبوضات</div><div className="text-lg font-bold text-green-700 num" data-testid="cash-in">{fmt(data.total_in)}</div></div>
        <div className="bg-red-50 p-2 rounded"><div className="text-xs text-slate-500">إجمالي المصروفات</div><div className="text-lg font-bold text-red-700 num" data-testid="cash-out">{fmt(data.total_out)}</div></div>
        <div className={`p-2 rounded ${data.net>=0?"bg-slate-50":"bg-red-50"}`}><div className="text-xs text-slate-500">صافي الحركة</div><div className={`text-lg font-bold num ${data.net>=0?"text-slate-700":"text-red-700"}`} data-testid="cash-net">{fmt(data.net)}</div></div>
      </div>
    </Card>
  );
}
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

function AccountsPanel() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [sortBy, setSortBy] = useState("name"); // name / balance
  useEffect(() => { api.get("/accounts").then((r) => setItems(r.data)).catch(() => {}); }, []);
  const TYPE_LABELS = { all: "الكل", cash: "الصندوق", customer: "عملاء", pos: "نقاط بيع", supplier: "موردون", expense: "مصروفات" };
  const TYPE_COLORS = {
    cash: "bg-emerald-50 border-emerald-300 text-emerald-800",
    customer: "bg-blue-50 border-blue-300 text-blue-800",
    pos: "bg-purple-50 border-purple-300 text-purple-800",
    supplier: "bg-amber-50 border-amber-300 text-amber-800",
    expense: "bg-red-50 border-red-300 text-red-800",
  };
  const counts = items.reduce((acc, it) => { acc[it.type] = (acc[it.type] || 0) + 1; return acc; }, { all: items.length });
  let filtered = items.filter((a) => {
    if (type !== "all" && a.type !== type) return false;
    const ql = q.trim().toLowerCase();
    if (ql && !((a.name || "").toLowerCase().includes(ql) || (a.phone || "").includes(ql))) return false;
    return true;
  });
  filtered.sort((a, b) => sortBy === "balance" ? (b.balance || 0) - (a.balance || 0) : (a.name || "").localeCompare(b.name || "", "ar"));
  const stateLabel = (b) => (b > 0 ? "له" : b < 0 ? "عليه" : "متعادل");
  const stateColor = (b) => (b > 0 ? "text-emerald-700" : b < 0 ? "text-red-700" : "text-slate-500");
  return (
    <Card className="p-4 border-r-4 border-[#452480]" data-testid="dash-accounts">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
        <div className="flex items-center gap-2 font-bold text-[#221340]"><Users size={18} className="text-[#452480]"/> الحسابات</div>
        <div className="flex flex-wrap gap-1 items-center">
          <div className="relative">
            <Search size={12} className="absolute right-2 top-2.5 text-slate-400"/>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث..." className="h-8 w-40 pr-7 text-xs" data-testid="dash-acc-search"/>
          </div>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-8 text-xs border rounded px-1" data-testid="dash-acc-sort">
            <option value="name">ترتيب: الاسم</option>
            <option value="balance">ترتيب: الرصيد</option>
          </select>
          <Link to="/accounts" className="text-xs text-[#452480] hover:underline" data-testid="dash-acc-viewall">عرض الكل</Link>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {["all","cash","customer","pos","supplier","expense"].map((k) => (
          <button key={k} onClick={() => setType(k)} className={`px-2.5 py-1 rounded-full text-xs border ${type===k?"bg-[#452480] text-white border-[#452480]":"border-slate-300 hover:bg-slate-50"}`} data-testid={`dash-acc-type-${k}`}>
            {TYPE_LABELS[k]} <span className="opacity-70">({counts[k] || 0})</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {filtered.slice(0, 24).map((a) => (
          <Link to={a.type === "cash" ? "/accounts" : `/accounts/${a.type}/${a.id}`} key={`${a.type}-${a.id}`} data-testid={`dash-acc-card-${a.id}`}
            className={`p-3 rounded-lg border transition hover:shadow ${TYPE_COLORS[a.type] || "bg-slate-50 border-slate-200"}`}>
            <div className="flex justify-between items-start gap-1">
              <div className="min-w-0">
                <div className="font-bold text-sm truncate">{a.name}</div>
                <div className="text-[10px] opacity-70">{TYPE_LABELS[a.type] || a.type} {a.phone ? `• ${a.phone}` : ""}</div>
              </div>
              <span className={`text-[10px] font-bold ${stateColor(a.balance || 0)}`}>{stateLabel(a.balance || 0)}</span>
            </div>
            <div className={`mt-1 num font-black text-lg ${stateColor(a.balance || 0)}`}>{fmt(a.balance || 0)}</div>
          </Link>
        ))}
        {filtered.length === 0 && <div className="col-span-full text-center text-slate-400 text-sm py-6">لا توجد حسابات</div>}
      </div>
      {filtered.length > 24 && (
        <div className="text-center mt-2 text-xs text-slate-500">تظهر أول 24 حساب — <Link to="/accounts" className="text-[#452480]">اعرض الكل</Link></div>
      )}
    </Card>
  );
}

export default function Dashboard() {
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/reports/dashboard").then((r) => setD(r.data)); }, []);
  if (!d) return <div className="p-8">جاري التحميل...</div>;

  return (
    <div className="space-y-6" data-testid="dashboard">
      <CashBox />
      <AccountsPanel />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          <Quick to="/sales/new" label="فاتورة مبيعات" icon={ShoppingCart} testid="quick-sale" />
          <Quick to="/purchases/new" label="فاتورة مشتريات" icon={Package} testid="quick-purchase" />
          <Quick to="/receipts" label="سند قبض/صرف" icon={Receipt} testid="quick-receipt" />
          <Quick to="/customers" label="إضافة عميل" icon={Users} testid="quick-customer" />
          <Quick to="/cards" label="إضافة كروت" icon={CreditCard} testid="quick-cards" />
          <Quick to="/reports" label="التقارير" icon={FileBarChart} testid="quick-reports" />
        </div>
      </div>

      {d.low_stock_alerts?.length > 0 && (() => {
        const numAlerts = d.low_stock_alerts.filter((a) => a.type === "numbered");
        const qtyAlerts = d.low_stock_alerts.filter((a) => a.type === "quantity");
        const AlertBlock = ({ title, dot, alerts, kind }) => (
          alerts.length ? (
            <Card className="p-4 border-2 border-amber-300 bg-amber-50" data-testid={`low-stock-${kind}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg leading-none" aria-hidden>{dot}</span>
                <AlertTriangle className="text-amber-600" size={18} />
                <div className="font-bold text-amber-900">{title}</div>
                <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded-full num">{alerts.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {alerts.map((a) => (
                  <Link
                    to={`/stock?category=${a.category_id}&type=${a.type}`}
                    key={`${a.type}-${a.category_id}`}
                    data-testid={`low-stock-${a.type}-${a.category_id}`}
                    className="flex items-center justify-between gap-2 p-3 bg-white border border-amber-200 rounded-lg hover:border-amber-500 hover:shadow transition"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[#221340] truncate">{a.category_name}</div>
                      <div className="text-xs text-slate-500">حد التنبيه: <span className="num">{a.threshold}</span></div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-xs text-slate-500">المتبقي</div>
                      <div className={`num font-black text-lg ${a.available === 0 ? "text-red-600" : "text-amber-700"}`}>{a.available}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          ) : null
        );
        return (
          <div className="space-y-3" data-testid="low-stock-alerts">
            <AlertBlock title="كروت مرقمة – مخزون منخفض" dot="🔴" alerts={numAlerts} kind="numbered" />
            <AlertBlock title="كروت كمية – مخزون منخفض" dot="🔴" alerts={qtyAlerts} kind="quantity" />
          </div>
        );
      })()}

      {d.chart?.length > 0 && (
        <Card className="p-4">
          <div className="text-sm font-bold text-[#221340] mb-3">المبيعات اليومية</div>
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
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
