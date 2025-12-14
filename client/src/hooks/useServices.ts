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
import type { Service, Car } from '@/lib/types';

export function useServices(carId: string | null, currentOdometer?: number) {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !carId) {
      setServices([]);
      setLoading(false);
      return;
    }

    const servicesRef = collection(db, 'users', user.uid, 'cars', carId, 'services');
    const q = query(servicesRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const servicesData: Service[] = snapshot.docs.map(doc => {
          const data = doc.data();
          const reminderOdometer = data.reminderOdometer || 0;
          const needsAttention = currentOdometer !== undefined && 
            reminderOdometer > 0 && 
            currentOdometer >= reminderOdometer;
          
          return {
            id: doc.id,
            carId,
            name: data.name || '',
            price: data.price || 0,
            odometer: data.odometer || 0,
            description: data.description || '',
            reminderOdometer: reminderOdometer,
            needsAttention,
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setServices(servicesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching services:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, carId, currentOdometer]);

  const addService = async (serviceData: Omit<Service, 'id' | 'carId' | 'createdAt' | 'needsAttention'>) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const servicesRef = collection(db, 'users', user.uid, 'cars', carId, 'services');
    await addDoc(servicesRef, {
      ...serviceData,
      createdAt: Timestamp.now(),
    });

    // Update car's current odometer (always update to latest reading)
    const carRef = doc(db, 'users', user.uid, 'cars', carId);
    await updateDoc(carRef, {
      currentOdometer: serviceData.odometer,
      updatedAt: Timestamp.now(),
    });
  };

  const updateService = async (serviceId: string, serviceData: Partial<Service>) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const serviceRef = doc(db, 'users', user.uid, 'cars', carId, 'services', serviceId);
    await updateDoc(serviceRef, serviceData);
  };

  const deleteService = async (serviceId: string) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const serviceRef = doc(db, 'users', user.uid, 'cars', carId, 'services', serviceId);
    await deleteDoc(serviceRef);
  };

  return { services, loading, error, addService, updateService, deleteService };
}
