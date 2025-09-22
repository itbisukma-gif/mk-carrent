
'use server';

import { createClient } from '@/utils/supabase/client';
import { updateDriverStatus } from '../dashboard/actions';
import { updateVehicleStatus } from '../armada/actions';
import type { OrderStatus } from '@/lib/types';
import { revalidatePath } from 'next/cache';

const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin';


export async function updateOrderStatusAction(orderId: string, status: OrderStatus, vehicleId: string, driverId?: string | null) {
    const supabase = createClient();
    
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
        await updateVehicleStatus(vehicleId, 'disewa');
    } else if (status === 'tidak disetujui' || status === 'selesai') {
        await updateVehicleStatus(vehicleId, 'tersedia');
        if (driverId) {
            await updateDriverStatus(driverId, 'Tersedia');
        }
    }
    
    revalidatePath(`${adminPath}/orders`);

    return { data, error };
}

export async function updateOrderDriverAction(orderId: string, driverName: string, driverId: string, oldDriverId?: string | null) {
    const supabase = createClient();

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
    
    revalidatePath(`${adminPath}/orders`);
    revalidatePath(`${adminPath}/dashboard`);

    return { data, error: null };
}
