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
import type { Expense } from '@/lib/types';

export function useExpenses(carId: string | null) {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !carId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const expensesRef = collection(db, 'users', user.uid, 'cars', carId, 'expenses');
    const q = query(expensesRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const expensesData: Expense[] = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            carId,
            name: data.name || '',
            amount: data.amount || 0,
            date: data.date?.toDate() || new Date(),
            odometer: data.odometer || null,
            description: data.description || '',
            category: data.category || 'Other',
            createdAt: data.createdAt?.toDate() || new Date(),
          };
        });
        setExpenses(expensesData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching expenses:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, carId]);

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'carId' | 'createdAt'>) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const expensesRef = collection(db, 'users', user.uid, 'cars', carId, 'expenses');
    await addDoc(expensesRef, {
      ...expenseData,
      date: Timestamp.fromDate(expenseData.date),
      createdAt: Timestamp.now(),
    });

    // Update car's current odometer if odometer was provided
    if (expenseData.odometer) {
      const carRef = doc(db, 'users', user.uid, 'cars', carId);
      await updateDoc(carRef, {
        currentOdometer: expenseData.odometer,
        updatedAt: Timestamp.now(),
      });
    }
  };

  const updateExpense = async (expenseId: string, expenseData: Partial<Expense>) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const expenseRef = doc(db, 'users', user.uid, 'cars', carId, 'expenses', expenseId);
    const updateData: Record<string, unknown> = { ...expenseData };
    if (expenseData.date) {
      updateData.date = Timestamp.fromDate(expenseData.date);
    }
    await updateDoc(expenseRef, updateData);
  };

  const deleteExpense = async (expenseId: string) => {
    if (!user || !carId) throw new Error('Not authenticated or no car selected');
    
    const expenseRef = doc(db, 'users', user.uid, 'cars', carId, 'expenses', expenseId);
    await deleteDoc(expenseRef);
  };

  return { expenses, loading, error, addExpense, updateExpense, deleteExpense };
}
