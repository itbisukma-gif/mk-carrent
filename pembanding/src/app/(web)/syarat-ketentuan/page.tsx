"use client"

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Terms {
  general: string;
  payment: string;
}

export default function SyaratKetentuanPage() {
  const [terms, setTerms] = useState<Terms | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, "settings", "termsAndConditions");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setTerms(docSnap.data() as Terms);
        } else {
          setError("Syarat dan ketentuan tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal memuat data. Silakan coba lagi nanti.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Syarat dan Ketentuan</h1>
      
      {loading && <p>Memuat...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {terms && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-2">Ketentuan Umum</h2>
            <div className="prose max-w-none">
              <p>{terms.general.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-2">Ketentuan Pembayaran</h2>
            <div className="prose max-w-none">
              <p>{terms.payment.split('\n').map((line, i) => <span key={i}>{line}<br/></span>)}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
