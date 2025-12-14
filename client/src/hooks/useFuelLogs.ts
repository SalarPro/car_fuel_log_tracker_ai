import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import type { FuelLog } from '@/lib/types';

export function useFuelLogs(carId: string | null) {
  const { user } = useAuth();
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !carId) {
      setFuelLogs([]);
      setLoading(false);
      return;
    }

    const logsRef = collection(db, 'users', user.uid, 'cars', carId, 'fuel_logs');
    const q = query(logsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const logsData: FuelLog[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            carId,
            date: data.date?.toDate() || new Date(),
            amountPaid: data.amountPaid || 0,
            quantity: data.quantity || 0,
            odometer: data.odometer || 0,
            brand: data.brand || '',
            notes: data.notes || '',
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setFuelLogs(logsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching fuel logs:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, carId]);

  const addFuelLog = async (logData: Omit<FuelLog, 'id' | 'carId' | 'createdAt'>) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const logsRef = collection(db, 'users', user.uid, 'cars', carId, 'fuel_logs');
    await addDoc(logsRef, {
      ...logData,
      date: Timestamp.fromDate(logData.date),
      createdAt: Timestamp.now(),
    });

    // Update car's current odometer (always update to latest reading)
    const carRef = doc(db, 'users', user.uid, 'cars', carId);
    await updateDoc(carRef, {
      currentOdometer: logData.odometer,
      updatedAt: Timestamp.now(),
    });
  };

  const updateFuelLog = async (logId: string, logData: Partial<FuelLog>) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const logRef = doc(db, 'users', user.uid, 'cars', carId, 'fuel_logs', logId);
    const updateData: Record<string, unknown> = { ...logData };
    if (logData.date) {
      updateData.date = Timestamp.fromDate(logData.date);
    }
    await updateDoc(logRef, updateData);
  };

  const deleteFuelLog = async (logId: string) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const logRef = doc(db, 'users', user.uid, 'cars', carId, 'fuel_logs', logId);
    await deleteDoc(logRef);
  };

  return { fuelLogs, loading, error, addFuelLog, updateFuelLog, deleteFuelLog };
}
