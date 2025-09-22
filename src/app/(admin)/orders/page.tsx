
'use client'

import { useState, useEffect, useMemo } from "react"
import { MoreHorizontal, Loader2, UserPlus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { createClient } from '@/utils/supabase/client'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Order, OrderStatus, Driver } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { updateOrderStatusAction, updateOrderDriverAction } from "@/app/admin/orders/actions"
import Link from "next/link"


export const dynamic = 'force-dynamic';


function AssignDriverDialog({ order, drivers, onAssign }: { order: Order; drivers: Driver[]; onAssign: (driverId: string, driverName: string) => void }) {
    const [open, setOpen] = useState(false);
    const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>(order.driverId || undefined);

    const handleAssign = () => {
        if (selectedDriverId) {
            const driver = drivers.find(d => d.id === selectedDriverId);
            if (driver) {
                onAssign(driver.id, driver.name);
                setOpen(false);
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {order.driver ? 'Ganti' : 'Tugaskan'} Supir
                </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tugaskan Supir untuk Order #{order.id.substring(0, 8)}</DialogTitle>
                    <DialogDescription>
                        Pilih supir yang akan bertugas untuk pesanan ini. Status supir akan otomatis berubah menjadi "Bertugas".
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="driver">Pilih Supir Tersedia</Label>
                    <Select onValueChange={setSelectedDriverId} defaultValue={selectedDriverId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Pilih supir..." />
                        </SelectTrigger>
                        <SelectContent>
                            {drivers.map(driver => (
                                <SelectItem key={driver.id} value={driver.id}>{driver.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
                    <Button onClick={handleAssign} disabled={!selectedDriverId}>Tugaskan</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
    const { toast } = useToast();

    const fetchOrders = async () => {
        if (!supabase) return;
        setIsLoading(true);
        const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (ordersError) {
            toast({ variant: 'destructive', title: 'Gagal mengambil data pesanan', description: ordersError.message });
        } else {
            setOrders(ordersData || []);
        }

        const { data: driversData, error: driversError } = await supabase
            .from('drivers')
            .select('*')
            .eq('status', 'Tersedia');
        
        if (driversError) {
            toast({ variant: 'destructive', title: 'Gagal mengambil data driver', description: driversError.message });
        } else {
            setDrivers(driversData || []);
        }
        
        setIsLoading(false);
    }
    
    useEffect(() => {
        const client = createClient();
        setSupabase(client);
    }, []);

    useEffect(() => {
        if (supabase) {
            fetchOrders();
        }
    }, [supabase]);

    const filteredOrders = useMemo(() => ({
        pending: orders.filter(o => o.status === 'pending'),
        approved: orders.filter(o => o.status === 'disetujui'),
        completed: orders.filter(o => o.status === 'selesai' || o.status === 'tidak disetujui'),
    }), [orders]);

    const handleUpdateStatus = async (orderId: string, status: OrderStatus, vehicleId: string, driverId?: string | null) => {
        const result = await updateOrderStatusAction(orderId, status, vehicleId, driverId);
        if (result.error) {
            toast({ variant: 'destructive', title: 'Gagal memperbarui status', description: result.error.message });
        } else {
            toast({ title: 'Status Pesanan Diperbarui' });
            fetchOrders();
        }
    }

    const handleAssignDriver = async (order: Order, driverId: string, driverName: string) => {
        const result = await updateOrderDriverAction(order.id, driverName, driverId, order.driverId);
        if (result.error) {
             toast({ variant: 'destructive', title: 'Gagal menugaskan supir', description: result.error.message });
        } else {
            toast({ title: 'Supir Berhasil Ditugaskan' });
            fetchOrders();
        }
    }

    const renderOrderTable = (orderList: Order[], tabName: string) => (
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Pesanan {tabName}</CardTitle>
            <CardDescription>
              Daftar pesanan dengan status {tabName.toLowerCase()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pelanggan</TableHead>
                  <TableHead>Kendaraan</TableHead>
                  <TableHead>Layanan</TableHead>
                  <TableHead>Supir</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Bukti Bayar</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                            <div className="flex justify-center items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Memuat pesanan...</span>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : orderList.length > 0 ? (
                    orderList.map(order => (
                        <TableRow key={order.id}>
                            <TableCell>
                                <div className="font-medium">{order.customerName}</div>
                                <div className="text-sm text-muted-foreground">
                                {order.customerPhone}
                                </div>
                            </TableCell>
                            <TableCell>{order.carName}</TableCell>
                            <TableCell>{order.service}</TableCell>
                            <TableCell>{order.driver || "-"}</TableCell>
                            <TableCell>
                                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(order.total || 0)}
                            </TableCell>
                            <TableCell>
                                {order.paymentProof ? (
                                    <Button asChild variant="outline" size="sm">
                                        <Link href={order.paymentProof} target="_blank">Lihat</Link>
                                    </Button>
                                ) : (
                                    <Badge variant="secondary">Belum ada</Badge>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                               <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="ghost">
                                        <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                                        {order.status === 'pending' && (
                                            <>
                                            <DropdownMenuItem onSelect={() => handleUpdateStatus(order.id, 'disetujui', order.vehicleId, order.driverId)}>
                                                Setujui Pesanan
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onSelect={() => handleUpdateStatus(order.id, 'tidak disetujui', order.vehicleId, order.driverId)}>
                                                Tolak Pesanan
                                            </DropdownMenuItem>
                                            </>
                                        )}
                                        {order.status === 'disetujui' && (
                                            <DropdownMenuItem onSelect={() => handleUpdateStatus(order.id, 'selesai', order.vehicleId, order.driverId)}>
                                                Tandai Selesai
                                            </DropdownMenuItem>
                                        )}
                                         {(order.service === 'dengan-supir' || order.service === 'all-include') && order.status !== 'selesai' && order.status !== 'tidak disetujui' && (
                                            <>
                                            <DropdownMenuSeparator />
                                            <AssignDriverDialog order={order} drivers={drivers} onAssign={(driverId, driverName) => handleAssignDriver(order, driverId, driverName)} />
                                            </>
                                         )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                        Tidak ada pesanan dengan status ini.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )

    return (
        <div className="flex flex-col gap-8">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">List Order</h1>
                    <p className="text-muted-foreground">
                        Kelola semua pesanan yang masuk.
                    </p>
                </div>
            </div>

            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pending">
                        Pending <Badge variant={filteredOrders.pending.length > 0 ? 'default' : 'secondary'} className="ml-2">{filteredOrders.pending.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="approved">
                        Disetujui <Badge variant={filteredOrders.approved.length > 0 ? 'default' : 'secondary'} className="ml-2">{filteredOrders.approved.length}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                        Selesai/Ditolak <Badge variant={filteredOrders.completed.length > 0 ? 'default' : 'secondary'} className="ml-2">{filteredOrders.completed.length}</Badge>
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="mt-6">
                    {renderOrderTable(filteredOrders.pending, "Pending")}
                </TabsContent>
                <TabsContent value="approved" className="mt-6">
                    {renderOrderTable(filteredOrders.approved, "Disetujui")}
                </TabsContent>
                <TabsContent value="completed" className="mt-6">
                     {renderOrderTable(filteredOrders.completed, "Selesai/Ditolak")}
                </TabsContent>
            </Tabs>
        </div>
    )
}
