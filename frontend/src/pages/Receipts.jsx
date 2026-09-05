import { useEffect, useState } from "react";
import api, { errText } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { fmt, fmtDate, genUUID } from "@/lib/utils";
import { Plus } from "lucide-react";

export default function Receipts() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("receipt");
  const [partyType, setPartyType] = useState("customer");
  const [partyId, setPartyId] = useState("");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const load = async () => setItems((await api.get("/receipts")).data);
  useEffect(() => {
    load();
    api.get("/customers").then((r) => setCustomers(r.data));
    api.get("/suppliers").then((r) => setSuppliers(r.data));
  }, []);

  const parties = partyType === "customer" ? customers : suppliers;

  const submit = async () => {
    try {
      const party = parties.find((p) => p.id === partyId);
      await api.post("/receipts", { kind, party_type: partyType, party_id: partyId, party_name: party?.name || "", amount: Number(amount), description, idempotency_key: genUUID() });
      toast.success("تم الحفظ"); setOpen(false); setAmount(0); setDescription(""); setPartyId(""); load();
    } catch (e) { toast.error(errText(e)); }
  };

  return (
    <div className="space-y-4" data-testid="receipts-page">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="bg-[#221340]" data-testid="new-receipt-btn"><Plus size={16} className="ml-1"/> سند جديد</Button></DialogTrigger>
          <DialogContent><DialogHeader><DialogTitle>سند جديد</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>نوع السند</Label>
                <Select value={kind} onValueChange={setKind}>
                  <SelectTrigger data-testid="rec-kind"><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="receipt">سند قبض</SelectItem><SelectItem value="payment">سند صرف</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>نوع الطرف</Label>
                <Select value={partyType} onValueChange={setPartyType}>
                  <SelectTrigger><SelectValue/></SelectTrigger>
                  <SelectContent><SelectItem value="customer">عميل</SelectItem><SelectItem value="supplier">مورد</SelectItem></SelectContent>
                </Select>
              </div>
              <div>
                <Label>الطرف</Label>
                <Select value={partyId} onValueChange={setPartyId}>
                  <SelectTrigger data-testid="rec-party"><SelectValue placeholder="اختر"/></SelectTrigger>
                  <SelectContent>{parties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>المبلغ</Label><Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} data-testid="rec-amount"/></div>
              <div><Label>البيان</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)}/></div>
              <Button onClick={submit} className="w-full bg-[#221340]" data-testid="rec-save">حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr className="text-right"><th className="p-3">الرقم</th><th className="p-3">التاريخ</th><th className="p-3">النوع</th><th className="p-3">الطرف</th><th className="p-3">المبلغ</th><th className="p-3">الرصيد بعد</th></tr></thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="p-3 font-mono text-[#452480] font-bold">{r.number}</td>
                <td className="p-3">{fmtDate(r.created_at)}</td>
                <td className="p-3"><span className={`text-xs px-2 py-0.5 rounded-full ${r.kind==='receipt'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{r.kind==='receipt'?'قبض':'صرف'}</span></td>
                <td className="p-3">{r.party_name}</td>
                <td className="p-3 num">{fmt(r.amount)}</td>
                <td className="p-3 num">{fmt(r.balance_after)}</td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-slate-400">لا توجد سندات</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
