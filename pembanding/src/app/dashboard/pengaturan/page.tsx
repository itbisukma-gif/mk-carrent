"use client"

import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function PengaturanPage() {
  const [general, setGeneral] = useState("");
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "settings", "termsAndConditions");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setGeneral(data.general || "");
          setPayment(data.payment || "");
        }
      } catch (err) {
        toast({ variant: "destructive", title: "Gagal memuat data!" });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, [toast]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const docRef = doc(db, "settings", "termsAndConditions");
      await updateDoc(docRef, {
        general: general,
        payment: payment,
      });
      toast({ title: "Sukses!", description: "Syarat dan ketentuan berhasil diperbarui." });
    } catch (err) {
      toast({ variant: "destructive", title: "Gagal menyimpan!", description: "Terjadi kesalahan saat menyimpan data." });
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Memuat pengaturan...</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Pengaturan Syarat & Ketentuan</h1>
      <div className="space-y-2">
        <label htmlFor="general" className="font-semibold">Ketentuan Umum</label>
        <Textarea 
          id="general" 
          value={general} 
          onChange={(e) => setGeneral(e.target.value)}
          rows={10}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="payment" className="font-semibold">Ketentuan Pembayaran</label>
        <Textarea 
          id="payment" 
          value={payment} 
          onChange={(e) => setPayment(e.target.value)}
          rows={5}
        />
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </div>
  );
}
