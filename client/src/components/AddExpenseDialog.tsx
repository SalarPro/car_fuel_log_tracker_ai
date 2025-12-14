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
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useExpenses } from '@/hooks/useExpenses';
import { useCurrency } from '@/components/CurrencyDisplay';
import { useToast } from '@/hooks/use-toast';
import { EXPENSE_CATEGORIES } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AddExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  carId: string;
}

export function AddExpenseDialog({ open, onOpenChange, carId }: AddExpenseDialogProps) {
  const { addExpense } = useExpenses(carId);
  const { currency } = useCurrency();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const expenseSchema = z.object({
    name: z.string().min(1, 'Expense name is required').max(100, 'Name is too long'),
    amount: z.coerce.number().positive('Amount must be greater than 0'),
    date: z.date({ required_error: 'Date is required' }),
    category: z.string().min(1, 'Category is required'),
    odometer: z.coerce.number().min(0, 'Odometer cannot be negative').optional().nullable(),
    description: z.string().max(500, 'Description is too long').optional(),
  });

  type ExpenseFormData = z.infer<typeof expenseSchema>;

  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      amount: 0,
      date: new Date(),
      category: 'Other',
      odometer: null,
      description: '',
    },
  });

  const onSubmit = async (data: ExpenseFormData) => {
    setIsSubmitting(true);
    try {
      await addExpense({
        name: data.name,
        amount: data.amount,
        date: data.date,
        category: data.category,
        odometer: data.odometer || null,
        description: data.description || '',
      });
      toast({ title: 'Expense added successfully' });
      form.reset({
        name: '',
        amount: 0,
        date: new Date(),
        category: 'Other',
        odometer: null,
        description: '',
      });
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Failed to add expense', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense</DialogTitle>
          <DialogDescription>
            Record a non-fuel, non-service expense
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expense Name *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="e.g., Annual Insurance"
                      data-testid="input-expense-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
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
                        data-testid="input-expense-amount"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-expense-category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat} data-testid={`option-category-${cat}`}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                          data-testid="button-expense-date"
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

            <FormField
              control={form.control}
              name="odometer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Odometer (km)</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      type="number"
                      min="0"
                      placeholder="Optional"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      data-testid="input-expense-odometer"
                    />
                  </FormControl>
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
                      placeholder="Additional details..."
                      className="resize-none"
                      rows={2}
                      data-testid="input-expense-description"
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
                data-testid="button-cancel-expense"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-save-expense">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Add Expense'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
