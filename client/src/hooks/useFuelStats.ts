import { useMemo } from 'react';
import type { FuelLog } from '@/lib/types';

export interface FuelStatistics {
  // Consumption metrics
  avgLitersPer100Km: number | null;
  avgKmPerLiter: number | null;
  
  // Cost metrics
  avgCostPer100Km: number | null;
  avgCostPerLiter: number | null;
  avgCostPerKm: number | null;
  
  // Additional stats
  totalDistance: number;
  totalLiters: number;
  totalCost: number;
  totalFillUps: number;
  
  // Best/worst
  bestFuelEconomy: number | null; // km/L
  worstFuelEconomy: number | null; // km/L
}

export function useFuelStats(fuelLogs: FuelLog[]): FuelStatistics {
  return useMemo(() => {
    if (!fuelLogs || fuelLogs.length === 0) {
      return {
        avgLitersPer100Km: null,
        avgKmPerLiter: null,
        avgCostPer100Km: null,
        avgCostPerLiter: null,
        avgCostPerKm: null,
        totalDistance: 0,
        totalLiters: 0,
        totalCost: 0,
        totalFillUps: 0,
        bestFuelEconomy: null,
        worstFuelEconomy: null,
      };
    }

    // Sort by odometer to calculate distances between fill-ups
    const sortedLogs = [...fuelLogs].sort((a, b) => a.odometer - b.odometer);
    
    const totalCost = sortedLogs.reduce((sum, log) => sum + log.amountPaid, 0);
    const totalLiters = sortedLogs.reduce((sum, log) => sum + log.quantity, 0);
    const totalFillUps = sortedLogs.length;

    // Calculate distances and fuel economy for each segment
    const segments: { distance: number; liters: number; cost: number; kmPerLiter: number }[] = [];
    
    for (let i = 1; i < sortedLogs.length; i++) {
      const distance = sortedLogs[i].odometer - sortedLogs[i - 1].odometer;
      const liters = sortedLogs[i].quantity;
      const cost = sortedLogs[i].amountPaid;
      
      // Only include valid segments (positive distance and fuel)
      if (distance > 0 && liters > 0) {
        const kmPerLiter = distance / liters;
        segments.push({ distance, liters, cost, kmPerLiter });
      }
    }

    const totalDistance = segments.reduce((sum, seg) => sum + seg.distance, 0);
    const totalSegmentLiters = segments.reduce((sum, seg) => sum + seg.liters, 0);
    const totalSegmentCost = segments.reduce((sum, seg) => sum + seg.cost, 0);

    // Calculate averages based on segments
    let avgLitersPer100Km: number | null = null;
    let avgKmPerLiter: number | null = null;
    let avgCostPer100Km: number | null = null;
    let avgCostPerLiter: number | null = null;
    let avgCostPerKm: number | null = null;

    if (totalDistance > 0 && totalSegmentLiters > 0) {
      avgKmPerLiter = totalDistance / totalSegmentLiters;
      avgLitersPer100Km = (totalSegmentLiters / totalDistance) * 100;
      
      if (totalSegmentCost > 0) {
        avgCostPer100Km = (totalSegmentCost / totalDistance) * 100;
        avgCostPerKm = totalSegmentCost / totalDistance;
      }
    }

    if (totalLiters > 0) {
      avgCostPerLiter = totalCost / totalLiters;
    }

    // Find best and worst fuel economy
    let bestFuelEconomy: number | null = null;
    let worstFuelEconomy: number | null = null;

    if (segments.length > 0) {
      const economies = segments.map(seg => seg.kmPerLiter);
      bestFuelEconomy = Math.max(...economies);
      worstFuelEconomy = Math.min(...economies);
    }

    return {
      avgLitersPer100Km,
      avgKmPerLiter,
      avgCostPer100Km,
      avgCostPerLiter,
      avgCostPerKm,
      totalDistance,
      totalLiters,
      totalCost,
      totalFillUps,
      bestFuelEconomy,
      worstFuelEconomy,
    };
  }, [fuelLogs]);
}
