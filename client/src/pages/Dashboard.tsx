import { Link, useLocation } from 'wouter';
import { 
  Car as CarIcon, 
  Plus, 
  Fuel, 
  Wrench, 
  Receipt, 
  AlertTriangle,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCars } from '@/hooks/useCars';
import { useFuelLogs } from '@/hooks/useFuelLogs';
import { useServices } from '@/hooks/useServices';
import { useExpenses } from '@/hooks/useExpenses';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import type { Car } from '@/lib/types';

function CarSummaryCard({ car }: { car: Car }) {
  const [, setLocation] = useLocation();
  const { fuelLogs } = useFuelLogs(car.id);
  const { services } = useServices(car.id, car.currentOdometer);
  const { expenses } = useExpenses(car.id);

  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.amountPaid, 0);
  const totalServiceCost = services.reduce((sum, service) => sum + service.price, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const needsAttention = services.some(s => s.needsAttention);
  const lastService = services[0];

  return (
    <Card className="relative hover-elevate" data-testid={`card-car-${car.id}`}>
      {needsAttention && (
        <div className="absolute top-3 right-3">
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Needs Attention
          </Badge>
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center">
            <CarIcon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{car.name}</CardTitle>
            {car.plateNumber && (
              <CardDescription className="truncate">{car.plateNumber}</CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="h-3.5 w-3.5" />
              <span className="text-xs">Odometer</span>
            </div>
            <p className="text-lg font-semibold tabular-nums">
              {car.currentOdometer.toLocaleString()} km
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Fuel className="h-3.5 w-3.5" />
              <span className="text-xs">Fuel Cost</span>
            </div>
            <p className="text-lg font-semibold">
              <CurrencyDisplay amount={totalFuelCost} />
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Wrench className="h-3.5 w-3.5" />
              <span className="text-xs">Service Cost</span>
            </div>
            <p className="text-lg font-semibold">
              <CurrencyDisplay amount={totalServiceCost} />
            </p>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Receipt className="h-3.5 w-3.5" />
              <span className="text-xs">Other Expenses</span>
            </div>
            <p className="text-lg font-semibold">
              <CurrencyDisplay amount={totalExpenses} />
            </p>
          </div>
        </div>

        {lastService && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Last service: <span className="font-medium text-foreground">{lastService.name}</span>
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => setLocation(`/car/${car.id}`)}
          data-testid={`button-view-car-${car.id}`}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

function EmptyState() {
  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
        <CarIcon className="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No cars yet</h2>
      <p className="text-muted-foreground text-center max-w-sm mb-6">
        Add your first vehicle to start tracking fuel, maintenance, and expenses.
      </p>
      <Button onClick={() => setLocation('/car/new')} data-testid="button-add-first-car">
        <Plus className="h-4 w-4 mr-2" />
        Add Your First Car
      </Button>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <Skeleton className="h-10 w-10 rounded-md" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { cars, loading } = useCars();

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your vehicles and track expenses
          </p>
        </div>
        {cars.length > 0 && (
          <Button onClick={() => setLocation('/car/new')} data-testid="button-add-car">
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : cars.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <CarSummaryCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </div>
  );
}
