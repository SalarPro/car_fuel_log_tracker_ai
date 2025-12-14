import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  where, 
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
import type { Car } from '@/lib/types';

export function useCars() {
  const { user } = useAuth();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setCars([]);
      setLoading(false);
      return;
    }

    const carsRef = collection(db, 'users', user.uid, 'cars');
    const q = query(carsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const carsData: Car[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: user.uid,
            name: data.name,
            plateNumber: data.plateNumber || '',
            initialOdometer: data.initialOdometer || 0,
            currentOdometer: data.currentOdometer || data.initialOdometer || 0,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          };
        });
        setCars(carsData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching cars:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addCar = async (carData: Omit<Car, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('Not authenticated');
    
    const carsRef = collection(db, 'users', user.uid, 'cars');
    await addDoc(carsRef, {
      ...carData,
      currentOdometer: carData.initialOdometer,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  };

  const updateCar = async (carId: string, carData: Partial<Car>) => {
    if (!user) throw new Error('Not authenticated');
    
    const carRef = doc(db, 'users', user.uid, 'cars', carId);
    await updateDoc(carRef, {
      ...carData,
      updatedAt: Timestamp.now(),
    });
  };

  const deleteCar = async (carId: string) => {
    if (!user) throw new Error('Not authenticated');
    
    const carRef = doc(db, 'users', user.uid, 'cars', carId);
    await deleteDoc(carRef);
  };

  return { cars, loading, error, addCar, updateCar, deleteCar };
}
