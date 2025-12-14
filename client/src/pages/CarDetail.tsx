import { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { format } from 'date-fns';
import { 
  ArrowLeft,
  Fuel, 
  Wrench, 
  Receipt, 
  Plus,
  Gauge,
  Trash2,
  Pencil,
  AlertTriangle,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCars } from '@/hooks/useCars';
import { useFuelLogs } from '@/hooks/useFuelLogs';
import { useServices } from '@/hooks/useServices';
import { useExpenses } from '@/hooks/useExpenses';
import { useFuelStats } from '@/hooks/useFuelStats';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { AddFuelLogDialog } from '@/components/AddFuelLogDialog';
import { AddServiceDialog } from '@/components/AddServiceDialog';
import { AddExpenseDialog } from '@/components/AddExpenseDialog';

export default function CarDetail() {
  const [, params] = useRoute('/car/:id');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const carId = params?.id;

  const { cars, loading: carsLoading, deleteCar } = useCars();
  const car = cars.find(c => c.id === carId);
  
  const { fuelLogs, loading: fuelLoading, deleteFuelLog } = useFuelLogs(carId || null);
  const { services, loading: servicesLoading, deleteService } = useServices(carId || null, car?.currentOdometer);
  const { expenses, loading: expensesLoading, deleteExpense } = useExpenses(carId || null);
  const fuelStats = useFuelStats(fuelLogs);

  const [showFuelDialog, setShowFuelDialog] = useState(false);
  const [showServiceDialog, setShowServiceDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; name: string } | null>(null);
  const [showDeleteCar, setShowDeleteCar] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      if (deleteTarget.type === 'fuel') {
        await deleteFuelLog(deleteTarget.id);
      } else if (deleteTarget.type === 'service') {
        await deleteService(deleteTarget.id);
      } else if (deleteTarget.type === 'expense') {
        await deleteExpense(deleteTarget.id);
      }
      toast({ title: 'Deleted successfully' });
    } catch (error) {
      toast({ title: 'Failed to delete', variant: 'destructive' });
    }
    setDeleteTarget(null);
  };

  const handleDeleteCar = async () => {
    if (!carId) return;
    try {
      await deleteCar(carId);
      toast({ title: 'Car deleted successfully' });
      setLocation('/');
    } catch (error) {
      toast({ title: 'Failed to delete car', variant: 'destructive' });
    }
    setShowDeleteCar(false);
  };

  if (carsLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="p-6 lg:p-8 max-w-6xl mx-auto">
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold mb-2">Car not found</h2>
          <p className="text-muted-foreground mb-4">This car doesn't exist or has been deleted.</p>
          <Button onClick={() => setLocation('/')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + log.amountPaid, 0);
  const totalServiceCost = services.reduce((sum, service) => sum + service.price, 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const needsAttentionCount = services.filter(s => s.needsAttention).length;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation('/')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-bold">{car.name}</h1>
            {needsAttentionCount > 0 && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                {needsAttentionCount} service{needsAttentionCount > 1 ? 's' : ''} needed
              </Badge>
            )}
          </div>
          {car.plateNumber && (
            <p className="text-muted-foreground">{car.plateNumber}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" data-testid="button-car-menu">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setLocation(`/car/${carId}/edit`)}
              data-testid="menu-edit-car"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Car
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowDeleteCar(true)}
              className="text-destructive"
              data-testid="menu-delete-car"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Car
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Gauge className="h-4 w-4" />
              <span className="text-sm">Current Odometer</span>
            </div>
            <p className="text-2xl font-bold tabular-nums" data-testid="text-odometer">
              {car.currentOdometer.toLocaleString()} km
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Fuel className="h-4 w-4" />
              <span className="text-sm">Total Fuel Cost</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-fuel-cost">
              <CurrencyDisplay amount={totalFuelCost} />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Wrench className="h-4 w-4" />
              <span className="text-sm">Total Service Cost</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-service-cost">
              <CurrencyDisplay amount={totalServiceCost} />
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Receipt className="h-4 w-4" />
              <span className="text-sm">Other Expenses</span>
            </div>
            <p className="text-2xl font-bold" data-testid="text-expenses">
              <CurrencyDisplay amount={totalExpenses} />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fuel Statistics */}
      {fuelLogs.length >= 2 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fuel className="h-5 w-5" />
              Fuel Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {/* Average Consumption - L/100km */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Avg Consumption</div>
                <div className="text-2xl font-bold tabular-nums">
                  {fuelStats.avgLitersPer100Km !== null 
                    ? fuelStats.avgLitersPer100Km.toFixed(2)
                    : '-'
                  }
                </div>
                <div className="text-xs text-muted-foreground">L/100km</div>
              </div>

              {/* Fuel Economy - km/L */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Fuel Economy</div>
                <div className="text-2xl font-bold tabular-nums">
                  {fuelStats.avgKmPerLiter !== null 
                    ? fuelStats.avgKmPerLiter.toFixed(2)
                    : '-'
                  }
                </div>
                <div className="text-xs text-muted-foreground">km/L</div>
              </div>

              {/* Cost per 100km */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Cost per 100km</div>
                <div className="text-2xl font-bold">
                  {fuelStats.avgCostPer100Km !== null 
                    ? <CurrencyDisplay amount={fuelStats.avgCostPer100Km} />
                    : '-'
                  }
                </div>
                <div className="text-xs text-muted-foreground invisible">-</div>
              </div>

              {/* Cost per Liter */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Avg Price/Liter</div>
                <div className="text-2xl font-bold">
                  {fuelStats.avgCostPerLiter !== null 
                    ? <CurrencyDisplay amount={fuelStats.avgCostPerLiter} />
                    : '-'
                  }
                </div>
                <div className="text-xs text-muted-foreground invisible">-</div>
              </div>

              {/* Cost per km */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Cost per km</div>
                <div className="text-2xl font-bold">
                  {fuelStats.avgCostPerKm !== null 
                    ? <CurrencyDisplay amount={fuelStats.avgCostPerKm} />
                    : '-'
                  }
                </div>
                <div className="text-xs text-muted-foreground invisible">-</div>
              </div>

              {/* Total Distance Tracked */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Distance Tracked</div>
                <div className="text-2xl font-bold tabular-nums">
                  {fuelStats.totalDistance.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">km</div>
              </div>

              {/* Total Liters */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Fuel</div>
                <div className="text-2xl font-bold tabular-nums">
                  {fuelStats.totalLiters.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">liters</div>
              </div>

              {/* Best Fuel Economy */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Best Economy</div>
                <div className="text-2xl font-bold tabular-nums text-green-600 dark:text-green-400">
                  {fuelStats.bestFuelEconomy !== null 
                    ? fuelStats.bestFuelEconomy.toFixed(2)
                    : '-'
                  }
                </div>
                <div className="text-xs text-muted-foreground">km/L</div>
              </div>

              {/* Worst Fuel Economy */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Worst Economy</div>
                <div className="text-2xl font-bold tabular-nums text-orange-600 dark:text-orange-400">
                  {fuelStats.worstFuelEconomy !== null 
                    ? fuelStats.worstFuelEconomy.toFixed(2)
                    : '-'
                  }
                </div>
                <div className="text-xs text-muted-foreground">km/L</div>
              </div>

              {/* Total Fill-ups */}
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Fill-ups</div>
                <div className="text-2xl font-bold tabular-nums">
                  {fuelStats.totalFillUps}
                </div>
                <div className="text-xs text-muted-foreground">records</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="fuel" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="fuel" data-testid="tab-fuel">
              <Fuel className="h-4 w-4 mr-2" />
              Fuel Logs
            </TabsTrigger>
            <TabsTrigger value="services" data-testid="tab-services">
              <Wrench className="h-4 w-4 mr-2" />
              Services
              {needsAttentionCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5">
                  {needsAttentionCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="expenses" data-testid="tab-expenses">
              <Receipt className="h-4 w-4 mr-2" />
              Expenses
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="fuel">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Fuel Logs</CardTitle>
              <Button onClick={() => setShowFuelDialog(true)} data-testid="button-add-fuel">
                <Plus className="h-4 w-4 mr-2" />
                Add Fuel Log
              </Button>
            </CardHeader>
            <CardContent>
              {fuelLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : fuelLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Fuel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">No fuel logs yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start tracking your fuel expenses
                  </p>
                  <Button variant="outline" onClick={() => setShowFuelDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Fuel Log
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Odometer</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fuelLogs.map((log) => (
                      <TableRow key={log.id} data-testid={`row-fuel-${log.id}`}>
                        <TableCell>{format(log.date, 'MMM d, yyyy')}</TableCell>
                        <TableCell>{log.brand || '-'}</TableCell>
                        <TableCell className="text-right tabular-nums">{log.quantity} L</TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={log.amountPaid} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {log.odometer.toLocaleString()} km
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget({ type: 'fuel', id: log.id, name: 'this fuel log' })}
                            data-testid={`button-delete-fuel-${log.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Services</CardTitle>
              <Button onClick={() => setShowServiceDialog(true)} data-testid="button-add-service">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : services.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">No services yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Track your maintenance and repairs
                  </p>
                  <Button variant="outline" onClick={() => setShowServiceDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Service
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                      <TableHead className="text-right">Odometer</TableHead>
                      <TableHead className="text-right">Next Service</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id} data-testid={`row-service-${service.id}`}>
                        <TableCell>
                          <div>
                            <span className="font-medium">{service.name}</span>
                            {service.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-48">
                                {service.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={service.price} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {service.odometer.toLocaleString()} km
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {service.reminderOdometer > 0 
                            ? `${service.reminderOdometer.toLocaleString()} km`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>
                          {service.needsAttention ? (
                            <Badge variant="destructive" className="gap-1">
                              <AlertTriangle className="h-3 w-3" />
                              Due
                            </Badge>
                          ) : (
                            <Badge variant="secondary">OK</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget({ type: 'service', id: service.id, name: service.name })}
                            data-testid={`button-delete-service-${service.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <CardTitle>Expenses</CardTitle>
              <Button onClick={() => setShowExpenseDialog(true)} data-testid="button-add-expense">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-12" />)}
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-12">
                  <Receipt className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-1">No expenses yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Track insurance, parking, and other costs
                  </p>
                  <Button variant="outline" onClick={() => setShowExpenseDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Expense
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id} data-testid={`row-expense-${expense.id}`}>
                        <TableCell>{format(expense.date, 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">{expense.name}</span>
                            {expense.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-48">
                                {expense.description}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{expense.category}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={expense.amount} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget({ type: 'expense', id: expense.id, name: expense.name })}
                            data-testid={`button-delete-expense-${expense.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {carId && (
        <>
          <AddFuelLogDialog 
            open={showFuelDialog} 
            onOpenChange={setShowFuelDialog}
            carId={carId}
            currentOdometer={car.currentOdometer}
          />
          <AddServiceDialog 
            open={showServiceDialog} 
            onOpenChange={setShowServiceDialog}
            carId={carId}
            currentOdometer={car.currentOdometer}
          />
          <AddExpenseDialog 
            open={showExpenseDialog} 
            onOpenChange={setShowExpenseDialog}
            carId={carId}
          />
        </>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deleteTarget?.name}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Car Confirmation */}
      <AlertDialog open={showDeleteCar} onOpenChange={setShowDeleteCar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {car.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this car and all its fuel logs, services, and expenses.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCar} className="bg-destructive text-destructive-foreground">
              Delete Car
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
