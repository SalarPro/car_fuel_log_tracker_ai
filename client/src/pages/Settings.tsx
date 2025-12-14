import { useState } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Settings as SettingsIcon, Check, Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import { CURRENCIES } from '@/lib/types';

export default function Settings() {
  const [, setLocation] = useLocation();
  const { userSettings, updateSettings, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [selectedCurrency, setSelectedCurrency] = useState(userSettings?.currency || 'IQD');
  const [isSaving, setIsSaving] = useState(false);

  const handleCurrencyChange = async (currency: string) => {
    setSelectedCurrency(currency);
    setIsSaving(true);
    try {
      await updateSettings({ currency });
      toast({
        title: 'Settings saved',
        description: `Currency changed to ${CURRENCIES.find(c => c.code === currency)?.name}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to save settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setLocation('/')}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your preferences</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Name</Label>
              <p className="font-medium" data-testid="text-user-name">
                {user?.displayName || 'Not set'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium" data-testid="text-user-email">
                {user?.email}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>
              Choose your preferred currency for displaying amounts.
              This won't affect historical data - only how amounts are displayed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={selectedCurrency} 
              onValueChange={handleCurrencyChange}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              {CURRENCIES.map((currency) => (
                <Label
                  key={currency.code}
                  htmlFor={currency.code}
                  className={`flex items-center gap-3 p-4 rounded-md border cursor-pointer transition-colors hover-elevate ${
                    selectedCurrency === currency.code 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border'
                  }`}
                  data-testid={`option-currency-${currency.code}`}
                >
                  <RadioGroupItem value={currency.code} id={currency.code} />
                  <div className="flex-1">
                    <p className="font-medium">{currency.code}</p>
                    <p className="text-sm text-muted-foreground">{currency.name}</p>
                  </div>
                  <span className="text-xl">{currency.symbol}</span>
                </Label>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how the app looks on your device
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setTheme('light')}
                data-testid="button-theme-light"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                className="flex-1 gap-2"
                onClick={() => setTheme('dark')}
                data-testid="button-theme-dark"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Info */}
        <Card>
          <CardHeader>
            <CardTitle>Data</CardTitle>
            <CardDescription>
              Your data is stored securely in the cloud and synced across all your devices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All your car data, fuel logs, services, and expenses are automatically saved 
              and will persist even when you're offline. Changes will sync when you're back online.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
