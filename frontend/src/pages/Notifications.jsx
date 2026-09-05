import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { fmtDate } from "@/lib/utils";
import { Bell } from "lucide-react";

export default function Notifications() {
  const [items, setItems] = useState([]);
  useEffect(() => { api.get("/notifications").then((r) => setItems(r.data)); }, []);
  return (
    <div className="space-y-3" data-testid="notifications-page">
      {items.map((n) => (
        <Card key={n.id} className="p-4 flex items-start gap-3">
          <Bell className="text-[#D4AF37] mt-0.5" size={18}/>
          <div className="flex-1"><div className="font-bold">{n.title}</div><div className="text-sm text-slate-600">{n.message}</div><div className="text-xs text-slate-400 mt-1">{fmtDate(n.created_at)}</div></div>
        </Card>
      ))}
      {items.length === 0 && <div className="text-center text-slate-400 p-8">لا توجد إشعارات</div>}
    </div>
  );
}
