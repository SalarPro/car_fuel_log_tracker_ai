import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { useServices } from '@/hooks/useServices';
import { useCurrency } from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';

interface AddServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
  currentOdometer: number;
}

export function AddServiceDialog({ open, onOpenChange, carId, currentOdometer }: AddServiceDialogProps) {
  const { addService } = useServices(carId, currentOdometer);
  const { currency } = useCurrency();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceSchema = z.object({
    name: z.string().min(1, 'Service name is required').max(100, 'Name is too long'),
    price: z.coerce.number().min(0, 'Price cannot be negative'),
    odometer: z.coerce.number()
      .min(currentOdometer, `Odometer must be at least ${currentOdometer.toLocaleString()} km`),
    description: z.string().max(500, 'Description is too long').optional(),
    reminderOdometer: z.coerce.number().min(0, 'Reminder odometer cannot be negative').optional(),
  });

  type ServiceFormData = z.infer<typeof serviceSchema>;

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      price: 0,
      odometer: currentOdometer,
      description: '',
      reminderOdometer: 0,
    },
  });

  const onSubmit = async (data: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      await addService({
        name: data.name,
        price: data.price,
        odometer: data.odometer,
        description: data.description || '',
        reminderOdometer: data.reminderOdometer || 0,
      });
      toast({ title: 'Service added successfully' });
      form.reset({
        name: '',
        price: 0,
        odometer: data.odometer,
        description: '',
        reminderOdometer: 0,
      });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Failed to add service', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Service</DialogTitle>
          <DialogDescription>
            Record a maintenance or repair service
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., Oil Change, Brake Service"
                      data-testid="input-service-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ({currency.symbol}) *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        data-testid="input-service-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        data-testid="input-service-odometer"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reminderOdometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Service Reminder (km)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      min="0"
                      placeholder="e.g., 60000"
                      data-testid="input-service-reminder"
                    />
                  </FormControl>
                  <FormDescription>
                    You'll be alerted when the odometer reaches this value
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Service details, parts replaced, etc."
                      className="resize-none"
                      rows={3}
                      data-testid="input-service-description"
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
                data-testid="button-cancel-service"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-save-service">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Service'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
