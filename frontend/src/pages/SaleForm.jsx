import { useEffect, useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { fmt, openWhatsApp, buildInvoiceMessage, genUUID, deviceId } from "@/lib/utils";
import { Plus, Trash2, Save, MessageCircle } from "lucide-react";
import { queueOperation, isOnline } from "@/lib/offline";

export default function SaleForm() {
  const nav = useNavigate();
  const [cats, setCats] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [customerId, setCustomerId] = useState("");
  const [saleType, setSaleType] = useState("cash");
  const [items, setItems] = useState([{ category_id: "", quantity: 1, price: 0, use_numbered: false, card_numbers: [] }]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(null);
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ company_name: "شبكة جواد نت اللاسلكية" });

  useEffect(() => {
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/customers").then((r) => setCustomers(r.data));
    api.get("/settings").then((r) => setSettings(r.data));
  }, []);

  const updateItem = (i, key, val) => {
    const copy = [...items];
    copy[i] = { ...copy[i], [key]: val };
    if (key === "category_id") {
      const cat = cats.find((c) => c.id === val);
      if (cat) copy[i].price = cat.sale_price;
    }
    setItems(copy);
  };
  const addItem = () => setItems([...items, { category_id: "", quantity: 1, price: 0, use_numbered: false, card_numbers: [] }]);
  const removeItem = (i) => setItems(items.filter((_, x) => x !== i));

  const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.price) || 0), 0);
  const total = subtotal - (Number(discount) || 0);
  const remaining = total - (Number(paid) || 0);
  const customer = customers.find((c) => c.id === customerId);

  const submit = async () => {
    if (items.some((i) => !i.category_id || !i.quantity)) { toast.error("أكمل بيانات الأصناف"); return; }
    setLoading(true);
    try {
      const payload = {
        customer_id: customerId || null,
        customer_name: customer?.name || "",
        sale_type: saleType,
        items: items.map((i) => ({
          category_id: i.category_id, quantity: Number(i.quantity), price: Number(i.price),
          category_name: cats.find(c => c.id === i.category_id)?.name || "",
          use_numbered: i.use_numbered,
          card_numbers: i.use_numbered ? (i.card_numbers_text || "").split(/\s+/).filter(Boolean) : [],
        })),
        discount: Number(discount) || 0, paid: Number(paid) || 0, notes,
        idempotency_key: genUUID(), device_id: deviceId(),
      };
      if (!isOnline()) {
        await queueOperation({ endpoint: "/sales", payload });
        toast.success("تم حفظ الفاتورة محلياً - ستتم المزامنة عند الاتصال");
        nav("/sales"); return;
      }
      const r = await api.post("/sales", payload);
      setSaved(r.data);
      toast.success(`تم حفظ الفاتورة ${r.data.number}`);
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };

  const sendWhatsApp = () => {
    if (!saved || !customer?.phone) { toast.error("لا يوجد رقم هاتف"); return; }
    const details = saved.items.map((i) => `${i.category_name} × ${i.quantity} = ${fmt(i.total)}`).join("\n");
    const msg = buildInvoiceMessage({
      company: settings.company_name, number: saved.number, kind: "مبيعات",
      details, amount: saved.subtotal, discount: saved.discount,
      total: saved.total, paid: saved.paid, remaining: saved.remaining,
      balance_after: saved.balance_after,
    });
    openWhatsApp(customer.phone, msg);
  };

  return (
    <div className="space-y-4 max-w-4xl" data-testid="sale-form">
      <Card className="p-4 md:p-6 space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>العميل</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger data-testid="sale-customer"><SelectValue placeholder="نقدي (بدون عميل)" /></SelectTrigger>
              <SelectContent>{customers.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} - {c.phone}</SelectItem>)}</SelectContent>
            </Select>
            {customer && <div className="text-xs text-slate-500 mt-1">الرصيد: <span className="num">{fmt(customer.balance)}</span> | المتاح: <span className="num">{fmt(Math.max(0, (customer.credit_limit || 0) - (customer.balance || 0)))}</span></div>}
          </div>
          <div>
            <Label>نوع البيع</Label>
            <RadioGroup value={saleType} onValueChange={setSaleType} className="flex gap-4 mt-2">
              <label className="flex items-center gap-2"><RadioGroupItem value="cash" data-testid="sale-cash" /> نقدي</label>
              <label className="flex items-center gap-2"><RadioGroupItem value="credit" data-testid="sale-credit" /> آجل</label>
            </RadioGroup>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center"><div className="font-bold">الأصناف</div><Button size="sm" onClick={addItem} data-testid="add-item"><Plus size={14}/> صنف</Button></div>
          {items.map((it, i) => (
            <Card key={i} className="p-3 bg-slate-50">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <Select value={it.category_id} onValueChange={(v) => updateItem(i, "category_id", v)}>
                  <SelectTrigger data-testid={`item-cat-${i}`}><SelectValue placeholder="الفئة" /></SelectTrigger>
                  <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
                <Input type="number" placeholder="الكمية" value={it.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} data-testid={`item-qty-${i}`} />
                <Input type="number" placeholder="السعر" value={it.price} onChange={(e) => updateItem(i, "price", e.target.value)} data-testid={`item-price-${i}`} />
                <div className="text-sm num flex items-center px-2 bg-white rounded border">{fmt(it.quantity * it.price)}</div>
                <Button variant="ghost" size="sm" onClick={() => removeItem(i)}><Trash2 size={16} className="text-red-500" /></Button>
              </div>
              <div className="mt-2 text-xs">
                <label className="flex items-center gap-2"><input type="checkbox" checked={it.use_numbered} onChange={(e) => updateItem(i, "use_numbered", e.target.checked)} /> استخدام كروت مرقمة (ألصق الأرقام)</label>
                {it.use_numbered && <Textarea rows={3} value={it.card_numbers_text || ""} onChange={(e) => updateItem(i, "card_numbers_text", e.target.value)} placeholder="أرقام الكروت (كل رقم سطر)" className="mt-2 font-mono text-xs" />}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div><Label>الخصم</Label><Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} data-testid="sale-discount" /></div>
          <div><Label>المدفوع</Label><Input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} data-testid="sale-paid" /></div>
          <div><Label>الإجمالي</Label><div className="h-10 flex items-center px-3 bg-slate-100 rounded num font-bold">{fmt(total)}</div></div>
          <div><Label>المتبقي</Label><div className="h-10 flex items-center px-3 bg-slate-100 rounded num font-bold">{fmt(remaining)}</div></div>
        </div>
        <Textarea placeholder="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          <Button onClick={submit} disabled={loading} className="bg-[#221340]" data-testid="sale-save"><Save size={16} className="ml-1"/> {loading ? "جاري..." : "حفظ الفاتورة"}</Button>
          {saved && <Button onClick={sendWhatsApp} variant="outline" className="border-green-600 text-green-700" data-testid="sale-wa"><MessageCircle size={16} className="ml-1"/> إرسال واتساب</Button>}
          {saved && <Button onClick={() => window.print()} variant="outline">طباعة</Button>}
        </div>
        {saved && <div className="p-3 bg-green-50 border border-green-200 rounded" data-testid="sale-success">تم إنشاء الفاتورة <span className="font-mono font-bold">{saved.number}</span></div>}
      </Card>
    </div>
  );
}
