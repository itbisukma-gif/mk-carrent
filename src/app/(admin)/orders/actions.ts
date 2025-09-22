'use server';

import { createServiceRoleClient } from '@/utils/supabase/server';
import { updateDriverStatus } from '../dashboard/actions';
import { updateVehicleStatus } from '../armada/actions';
import type { OrderStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';


export async function updateOrderStatusAction(orderId: string, status: OrderStatus, vehicleId: string, driverId?: string | null) {
    const supabase = createServiceRoleClient();
    
    const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

    if (error) {
        console.error("Error updating order status:", error);
        return { error };
    }
    
    // Update related statuses
    if (status === 'disetujui') {
        await updateVehicleStatus(vehicleId, 'dipesan'); // Change to 'dipesan' (booked) when approved
    } else if (status === 'selesai' || status === 'tidak disetujui') {
        await updateVehicleStatus(vehicleId, 'tersedia');
        if (driverId) {
            await updateDriverStatus(driverId, 'Tersedia');
        }
    }
    
    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin/armada`);
    revalidatePath(`/admin/dashboard`);

    return { data, error };
}

export async function updateOrderDriverAction(orderId: string, driverName: string, driverId: string, oldDriverId?: string | null) {
    const supabase = createServiceRoleClient();

    if (oldDriverId) {
        await updateDriverStatus(oldDriverId, 'Tersedia');
    }

    const { data, error: orderError } = await supabase
        .from('orders')
        .update({ driver: driverName, driverId: driverId })
        .eq('id', orderId);

    if (orderError) {
        console.error("Error updating order driver:", orderError);
        return { error: orderError };
    }

    const { error: driverError } = await updateDriverStatus(driverId, 'Bertugas');
    if (driverError) {
        console.error("Error updating driver status:", driverError);
        // Optionally handle this case, maybe revert the order driver update.
        // For now, we'll let it pass but the admin might see an inconsistency.
    }
    
    revalidatePath(`/admin/orders`);
    revalidatePath(`/admin/dashboard`);

    return { data, error: null };
}