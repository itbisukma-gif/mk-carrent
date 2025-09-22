

'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  Car,
  ClipboardList,
  DollarSign,
  MoreHorizontal,
  Calendar as CalendarIcon,
  PlusCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { revenueData } from '@/lib/data' // Keep dummy chart data
import type { Driver, Vehicle, Order } from '@/lib/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const chartConfig = {
  revenue: {
    label: 'Pendapatan',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

function DriverForm({ driver, onSave, onCancel }: { driver?: Driver | null; onSave: () => void; onCancel: () => void; }) {
    const { toast } = useToast();

    const handleSave = () => {
        // API call to save driver data would go here
        toast({
            title: driver ? "Driver Diperbarui" : "Driver Ditambahkan",
            description: `Data driver telah berhasil ${driver ? 'diperbarui' : 'disimpan'}.`,
        });
        onSave();
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="name">Nama Driver</Label>
                    <Input id="name" placeholder="cth. Budi Santoso" defaultValue={driver?.name} />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="address">Alamat</Label>
                    <Input id="address" placeholder="cth. Jl. Merdeka No. 10, Jakarta" defaultValue={driver?.address} />
                </div>
                <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="phone">Nomor WhatsApp</Label>
                    <Input id="phone" type="tel" placeholder="cth. 081234567890" defaultValue={driver?.phone} />
                </div>
            </div>
             <DialogFooter>
                <Button variant="outline" onClick={onCancel}>Batal</Button>
                <Button type="submit" onClick={handleSave}>{driver ? 'Simpan Perubahan' : 'Simpan Driver'}</Button>
            </DialogFooter>
        </>
    )
}


export default function DashboardPage() {
  // Data is now managed by state, ready for API integration
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const { toast } = useToast();

  // Fetch data from API on component mount
  useEffect(() => {
    // Example: fetch('/api/drivers').then(res => res.json()).then(data => setDrivers(data));
    // Example: fetch('/api/fleet').then(res => res.json()).then(data => setFleet(data));
    // Example: fetch('/api/orders').then(res => res.json()).then(data => setOrders(data));
  }, []);

  const handleEditClick = (driver: Driver) => {
    setSelectedDriver(driver);
    setEditDialogOpen(true);
  };
  
  const handleDeleteDriver = (driver: Driver) => {
    // API call to delete driver would go here
    setDrivers(prev => prev.filter(d => d.id !== driver.id));
     toast({
        title: "Driver Dihapus",
        description: `Driver ${driver.name} telah dihapus dari sistem.`,
    });
  }

  const handleStatusChange = (driverId: string, newStatus: 'Tersedia' | 'Bertugas') => {
     // API call to update driver status would go here
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, status: newStatus } : d));
     toast({
        title: "Status Diperbarui",
        description: `Status driver telah berhasil diperbarui.`,
    });
  };
  
  const handleFormSave = () => {
    // Refetch data from API or optimistically update state
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedDriver(null);
  };
  
  const handleFormCancel = () => {
    setAddDialogOpen(false);
    setEditDialogOpen(false);
    setSelectedDriver(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value)
  }
  
  const weeklyRevenue = revenueData.reduce((acc, cur) => acc + cur.revenue, 0);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Orderan</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
            <p className="text-xs text-muted-foreground">Total order yang masuk</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jumlah Unit Mobil</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fleet.length}</div>
            <p className="text-xs text-muted-foreground">Total unit yang terdaftar</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendapatan Minggu Ini</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(weeklyRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">Berdasarkan data minggu ini</p>
          </CardContent>
        </Card>
      </div>

    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <Card className="xl:col-span-1">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <CardTitle>Grafik Pendapatan</CardTitle>
                <CardDescription>Pendapatan selama 7 hari terakhir</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                         !startDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'd LLL yyyy', { locale: id }) : <span>Dari Tanggal</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        initialFocus
                        locale={id}
                    />
                    </PopoverContent>
                </Popover>
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                        "w-full justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'd LLL yyyy', { locale: id }) : <span>Sampai Tanggal</span>}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        disabled={startDate ? { before: startDate } : undefined}
                        initialFocus
                        locale={id}
                    />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart data={revenueData} accessibilityLayer>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => `${value / 1000}k`}
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent
                  formatter={(value) => formatCurrency(value as number)}
                />}
              />
              <Bar dataKey="revenue" fill="var(--color-revenue)" radius={8} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="xl:col-span-1">
        <CardHeader className="flex items-center justify-between flex-row">
            <div>
              <CardTitle>Manajemen Driver</CardTitle>
              <CardDescription>
                Kelola data dan ketersediaan driver.
              </CardDescription>
            </div>
             <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogTrigger asChild>
                    <Button size="sm">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Driver Baru
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Tambahkan Driver Baru</DialogTitle>
                        <DialogDescription>Isi detail driver baru di bawah ini.</DialogDescription>
                    </DialogHeader>
                    <DriverForm onSave={handleFormSave} onCancel={handleFormCancel} />
                </DialogContent>
            </Dialog>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Nomor WhatsApp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.length > 0 ? (
                    drivers.map((driver) => (
                    <TableRow key={driver.id}>
                        <TableCell className="font-medium">{driver.name}</TableCell>
                        <TableCell>{driver.phone}</TableCell>
                        <TableCell>
                        <Select value={driver.status} onValueChange={(value: 'Tersedia' | 'Bertugas') => handleStatusChange(driver.id, value)}>
                            <SelectTrigger className={cn("w-[130px] capitalize", 
                                driver.status === 'Tersedia' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                            )}>
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Tersedia">Tersedia</SelectItem>
                                <SelectItem value="Bertugas">Bertugas</SelectItem>
                            </SelectContent>
                        </Select>
                        </TableCell>
                        <TableCell className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onSelect={() => handleEditClick(driver)}>Edit</DropdownMenuItem>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem className='text-destructive' onSelect={(e) => e.preventDefault()}>Hapus</DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Anda Yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Tindakan ini akan menghapus data driver <span className="font-bold">{driver.name}</span> secara permanen.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteDriver(driver)} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            Belum ada driver yang ditambahkan.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
         <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>Edit Driver</DialogTitle>
                <DialogDescription>Perbarui detail driver di bawah ini.</DialogDescription>
            </DialogHeader>
            <DriverForm driver={selectedDriver} onSave={handleFormSave} onCancel={handleFormCancel} />
        </DialogContent>
       </Dialog>
      
    </div>
  )
}
