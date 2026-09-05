import { useEffect, useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { fmt, genUUID, deviceId } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

export default function PurchaseForm() {
  const nav = useNavigate();
  const [cats, setCats] = useState([]);
  const [sups, setSups] = useState([]);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([{ category_id: "", quantity: 1, price: 0, use_numbered: false, card_numbers_text: "" }]);
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { api.get("/categories").then((r) => setCats(r.data)); api.get("/suppliers").then((r) => setSups(r.data)); }, []);
  const update = (i, k, v) => {
    const c = [...items]; c[i] = { ...c[i], [k]: v };
    if (k === "category_id") { const cat = cats.find(x => x.id === v); if (cat) c[i].price = cat.purchase_price; }
    setItems(c);
  };
  const subtotal = items.reduce((s, i) => {
    const q = i.use_numbered ? (i.card_numbers_text || "").split(/\r?\n/).filter((x) => x.trim()).length : Number(i.quantity) || 0;
    return s + q * (Number(i.price) || 0);
  }, 0);
  const total = subtotal - (Number(discount) || 0);
  const submit = async () => {
    setLoading(true);
    try {
      const supplier = sups.find((s) => s.id === supplierId);
      const finalItems = items.map((i) => {
        const nums = (i.card_numbers_text || "").split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
        const q = i.use_numbered ? nums.length : Number(i.quantity);
        return {
          category_id: i.category_id, quantity: q, price: Number(i.price),
          category_name: cats.find((c) => c.id === i.category_id)?.name || "",
          use_numbered: i.use_numbered, card_numbers: i.use_numbered ? nums : [],
        };
      });
      await api.post("/purchases", {
        supplier_id: supplierId || null, supplier_name: supplier?.name || "",
        items: finalItems, discount: Number(discount) || 0, paid: Number(paid) || 0, notes,
        idempotency_key: genUUID(), device_id: deviceId(),
      });
      toast.success("تم الحفظ"); nav("/purchases");
    } catch (e) { toast.error(errText(e)); }
    setLoading(false);
  };
  return (
    <Card className="p-4 md:p-6 space-y-4 max-w-4xl" data-testid="purchase-form">
      <div>
        <Label>المورد</Label>
        <Select value={supplierId} onValueChange={setSupplierId}>
          <SelectTrigger data-testid="purch-supplier"><SelectValue placeholder="اختر المورد" /></SelectTrigger>
          <SelectContent>{sups.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between"><div className="font-bold">الأصناف</div><Button size="sm" onClick={() => setItems([...items, { category_id: "", quantity: 1, price: 0, use_numbered: false, card_numbers_text: "" }])}><Plus size={14}/></Button></div>
        {items.map((it, i) => (
          <Card key={i} className="p-3 bg-slate-50">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
              <Select value={it.category_id} onValueChange={(v) => update(i, "category_id", v)}>
                <SelectTrigger data-testid={`purch-item-cat-${i}`}><SelectValue placeholder="الفئة"/></SelectTrigger>
                <SelectContent>{cats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
              <Input type="number" placeholder="الكمية" value={it.use_numbered ? (it.card_numbers_text || "").split(/\r?\n/).filter((x) => x.trim()).length : it.quantity} onChange={(e) => update(i, "quantity", e.target.value)} disabled={it.use_numbered} data-testid={`purch-qty-${i}`}/>
              <Input type="number" placeholder="سعر الشراء" value={it.price} onChange={(e) => update(i, "price", e.target.value)}/>
              <div className="num font-bold px-2">{fmt((it.use_numbered ? (it.card_numbers_text || "").split(/\r?\n/).filter((x) => x.trim()).length : it.quantity) * it.price)}</div>
              <Button variant="ghost" onClick={() => setItems(items.filter((_, x) => x !== i))}><Trash2 size={14} className="text-red-500"/></Button>
            </div>
            <div className="mt-2 text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" checked={it.use_numbered} onChange={(e) => update(i, "use_numbered", e.target.checked)} data-testid={`purch-numbered-${i}`}/> شراء كروت مرقمة (ألصق الأرقام)</label>
              {it.use_numbered && <Textarea rows={4} value={it.card_numbers_text || ""} onChange={(e) => update(i, "card_numbers_text", e.target.value)} placeholder="7777665544&#10;5563737380" className="mt-2 font-mono text-xs" data-testid={`purch-numbers-${i}`}/>}
            </div>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div><Label>الخصم</Label><Input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)}/></div>
        <div><Label>المدفوع</Label><Input type="number" value={paid} onChange={(e) => setPaid(e.target.value)}/></div>
        <div><Label>الإجمالي</Label><div className="h-10 flex items-center px-3 bg-slate-100 rounded num font-bold">{fmt(total)}</div></div>
        <div><Label>المتبقي</Label><div className="h-10 flex items-center px-3 bg-slate-100 rounded num font-bold">{fmt(total - paid)}</div></div>
      </div>
      <Textarea placeholder="ملاحظات" value={notes} onChange={(e) => setNotes(e.target.value)}/>
      <Button onClick={submit} disabled={loading} className="bg-[#221340]" data-testid="purch-save">{loading?"جاري...":"حفظ"}</Button>
    </Card>
  );
}
