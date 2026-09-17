import { db } from '../prisma';
import { DateRange } from './date-utils';

export type LogisticsStats = {
  totalEquipments: number;
  availableQuantity: number;
  inUseQuantity: number;
  inMaintenanceQuantity: number;
  lostQuantity: number;
  criticalStockCount: number;
};

export type MissionStats = {
  totalMissions: number;
  planned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  incidents: number;
};

export async function getInventoryStats(): Promise<LogisticsStats> {
  const allEquipments = await db.orm.public.Equipment.all();
  const allInventories = await db.orm.public.Inventory.all();

  let totalEquipments = allEquipments.length;
  let availableQuantity = 0;
  let inUseQuantity = 0;
  let inMaintenanceQuantity = 0;
  let lostQuantity = 0;
  let criticalStockCount = 0;

  for (const eq of allEquipments) {
    let eqAvailable = 0;
    const inventoryItems = allInventories.filter((i: any) => i.equipmentId === eq.id);
    
    for (const item of inventoryItems) {
      if (item.status === 'AVAILABLE') {
        availableQuantity += item.quantity;
        eqAvailable += item.quantity;
      } else if (item.status === 'IN_USE') {
        inUseQuantity += item.quantity;
      } else if (item.status === 'IN_MAINTENANCE') {
        inMaintenanceQuantity += item.quantity;
      } else if (item.status === 'LOST') {
        lostQuantity += item.quantity;
      }
    }

    if (eqAvailable < eq.minStockThreshold) {
      criticalStockCount++;
    }
  }

  return {
    totalEquipments,
    availableQuantity,
    inUseQuantity,
    inMaintenanceQuantity,
    lostQuantity,
    criticalStockCount,
  };
}

export async function getMissionStats(range: DateRange): Promise<MissionStats> {
  const { startDate, endDate } = range;

  const allMissions = await db.orm.public.LogisticsMission.all();
  const missions = allMissions.filter((m: any) => {
    const d = new Date(m.createdAt.toString());
    return d >= startDate && d <= endDate;
  });

  return {
    totalMissions: missions.length,
    planned: missions.filter((m: any) => m.status === 'PLANIFIEE' || m.status === 'A_PLANIFIER').length,
    inProgress: missions.filter((m: any) => m.status === 'EN_PREPARATION' || m.status === 'EN_COURS').length,
    completed: missions.filter((m: any) => m.status === 'TERMINEE').length,
    cancelled: missions.filter((m: any) => m.status === 'ANNULEE').length,
    incidents: missions.filter((m: any) => m.status === 'INCIDENT').length,
  };
}
