// Core data types for the car management application

export interface UserSettings {
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Car {
  id: string;
  userId: string;
  name: string;
  plateNumber: string;
  initialOdometer: number;
  currentOdometer: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FuelLog {
  id: string;
  carId: string;
  date: Date;
  amountPaid: number;
  quantity: number;
  odometer: number;
  brand: string;
  notes: string;
  createdAt: Date;
}

export interface Service {
  id: string;
  carId: string;
  name: string;
  price: number;
  odometer: number;
  description: string;
  reminderOdometer: number;
  needsAttention: boolean;
  createdAt: Date;
}

export interface Expense {
  id: string;
  carId: string;
  name: string;
  amount: number;
  date: Date;
  odometer: number | null;
  description: string;
  category: string;
  createdAt: Date;
}

export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export const CURRENCIES: Currency[] = [
  { code: 'IQD', symbol: 'د.ع', name: 'Iraqi Dinar' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
  { code: 'JOD', symbol: 'د.ا', name: 'Jordanian Dinar' },
];

export const EXPENSE_CATEGORIES = [
  'Insurance',
  'Registration',
  'Parking',
  'Tolls',
  'Car Wash',
  'Accessories',
  'Fines',
  'Other',
];
