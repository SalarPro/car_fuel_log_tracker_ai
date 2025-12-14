import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useFuelLogs } from '@/hooks/useFuelLogs';
import { useCurrency } from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddFuelLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  currentOdometer: number;
}

export function AddFuelLogDialog({ open, onOpenChange, carId, currentOdometer }: AddFuelLogDialogProps) {
  const { addFuelLog } = useFuelLogs(carId);
  const { currency } = useCurrency();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fuelLogSchema = z.object({
    date: z.date({ required_error: 'Date is required' }),
    amountPaid: z.coerce.number().positive('Amount must be greater than 0'),
    quantity: z.coerce.number().positive('Quantity must be greater than 0'),
    odometer: z.coerce.number()
      .min(currentOdometer, `Odometer must be at least ${currentOdometer.toLocaleString()} km`),
    brand: z.string().max(50, 'Brand name is too long').optional(),
    notes: z.string().max(500, 'Notes are too long').optional(),
  });

  type FuelLogFormData = z.infer<typeof fuelLogSchema>;

  const form = useForm<FuelLogFormData>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      date: new Date(),
      amountPaid: 0,
      quantity: 0,
      odometer: currentOdometer,
      brand: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FuelLogFormData) => {
    setIsSubmitting(true);
    try {
      await addFuelLog({
        date: data.date,
        amountPaid: data.amountPaid,
        quantity: data.quantity,
        odometer: data.odometer,
        brand: data.brand || '',
        notes: data.notes || '',
      });
      toast({ title: 'Fuel log added successfully' });
      form.reset({
        date: new Date(),
        amountPaid: 0,
        quantity: 0,
        odometer: data.odometer,
        brand: '',
        notes: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Failed to add fuel log', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Fuel Log</DialogTitle>
          <DialogDescription>
            Record a fuel refill for this vehicle
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          data-testid="button-fuel-date"
                        >
                          {field.value ? format(field.value, 'PPP') : 'Pick a date'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amountPaid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount ({currency.symbol}) *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        data-testid="input-fuel-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity (L) *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        data-testid="input-fuel-quantity"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="odometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odometer (km) *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      min={currentOdometer}
                      placeholder={currentOdometer.toString()}
                      data-testid="input-fuel-odometer"
                    />
                  </FormControl>
                  <FormDescription>
                    Must be at least {currentOdometer.toLocaleString()} km
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fuel Brand</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., Shell, BP, Total"
                      data-testid="input-fuel-brand"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Any additional notes..."
                      className="resize-none"
                      rows={2}
                      data-testid="input-fuel-notes"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-fuel"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-save-fuel">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Fuel Log'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
