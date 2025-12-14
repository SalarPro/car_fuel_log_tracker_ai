import { useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Car, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useCars } from '@/hooks/useCars';
import { useToast } from '@/hooks/use-toast';

const carSchema = z.object({
  name: z.string().min(1, 'Car name is required').max(100, 'Name is too long'),
  plateNumber: z.string().max(20, 'Plate number is too long').optional(),
  initialOdometer: z.coerce.number().min(0, 'Odometer cannot be negative'),
});

type CarFormData = z.infer<typeof carSchema>;

export default function AddCar() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/car/:id/edit');
  const isEditing = !!params?.id;
  
  const { cars, addCar, updateCar, loading } = useCars();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingCar = isEditing ? cars.find(c => c.id === params.id) : null;

  const form = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      name: existingCar?.name || '',
      plateNumber: existingCar?.plateNumber || '',
      initialOdometer: existingCar?.initialOdometer || 0,
    },
  });

  const onSubmit = async (data: CarFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && params?.id) {
        await updateCar(params.id, {
          name: data.name,
          plateNumber: data.plateNumber || '',
          initialOdometer: data.initialOdometer,
        });
        toast({
          title: 'Car updated',
          description: `${data.name} has been updated successfully.`,
        });
        setLocation(`/car/${params.id}`);
      } else {
        await addCar({
          name: data.name,
          plateNumber: data.plateNumber || '',
          initialOdometer: data.initialOdometer,
          currentOdometer: data.initialOdometer,
        });
        toast({
          title: 'Car added',
          description: `${data.name} has been added to your garage.`,
        });
        setLocation('/');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong';
      toast({
        title: isEditing ? 'Failed to update car' : 'Failed to add car',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation(isEditing ? `/car/${params?.id}` : '/')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? 'Edit Car' : 'Add New Car'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update your vehicle details' : 'Add a new vehicle to your garage'}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center mb-4">
            <Car className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>{isEditing ? 'Vehicle Details' : 'Vehicle Information'}</CardTitle>
          <CardDescription>
            Enter the details of your vehicle to start tracking expenses.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Car Name / Model *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., Toyota Camry 2020"
                        data-testid="input-car-name"
                      />
                    </FormControl>
                    <FormDescription>
                      Give your car a recognizable name
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plateNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plate Number</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., ABC 1234"
                        data-testid="input-plate-number"
                      />
                    </FormControl>
                    <FormDescription>
                      Optional - helps identify the vehicle
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="initialOdometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Initial Odometer (km) *</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="number"
                        min="0"
                        placeholder="e.g., 50000"
                        data-testid="input-odometer"
                      />
                    </FormControl>
                    <FormDescription>
                      Current mileage of your vehicle in kilometers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setLocation(isEditing ? `/car/${params?.id}` : '/')}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isSubmitting}
                  data-testid="button-save-car"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    isEditing ? 'Update Car' : 'Add Car'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
