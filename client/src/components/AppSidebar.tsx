import { Link, useLocation } from 'wouter';
import { 
  Car, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Plus,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useCars } from '@/hooks/useCars';
import { useServices } from '@/hooks/useServices';
import { Skeleton } from '@/components/ui/skeleton';

interface CarWithAttention {
  id: string;
  name: string;
  plateNumber: string;
  needsAttention: boolean;
}

function CarMenuItem({ car, isActive }: { car: CarWithAttention; isActive: boolean }) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link href={`/car/${car.id}`} data-testid={`link-car-${car.id}`}>
          <Car className="h-4 w-4" />
          <div className="flex flex-col flex-1 min-w-0">
            <span className="truncate font-medium">{car.name}</span>
            {car.plateNumber && (
              <span className="text-xs text-muted-foreground truncate">{car.plateNumber}</span>
            )}
          </div>
          {car.needsAttention && (
            <Badge variant="destructive" className="ml-auto h-5 px-1.5">
              <AlertTriangle className="h-3 w-3" />
            </Badge>
          )}
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const [location, setLocation] = useLocation();
  const { user, signOut } = useAuth();
  const { cars, loading: carsLoading } = useCars();

  const handleSignOut = async () => {
    await signOut();
    setLocation('/login');
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 p-2 h-auto">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {getInitials(user?.displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start flex-1 min-w-0">
                <span className="font-semibold truncate w-full text-left">
                  {user?.displayName || 'User'}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full text-left">
                  {user?.email}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem onClick={() => setLocation('/settings')} data-testid="menu-settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut} data-testid="menu-signout">
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location === '/'}>
                  <Link href="/" data-testid="link-dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between gap-2">
            <span>My Cars</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setLocation('/car/new')}
              data-testid="button-add-car-sidebar"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {carsLoading ? (
                <>
                  <SidebarMenuItem>
                    <div className="flex items-center gap-3 p-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <div className="flex items-center gap-3 p-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 flex-1" />
                    </div>
                  </SidebarMenuItem>
                </>
              ) : cars.length === 0 ? (
                <SidebarMenuItem>
                  <div className="p-3 text-sm text-muted-foreground text-center">
                    No cars yet
                  </div>
                </SidebarMenuItem>
              ) : (
                cars.map((car) => (
                  <CarMenuItem 
                    key={car.id} 
                    car={{ ...car, needsAttention: false }}
                    isActive={location === `/car/${car.id}`}
                  />
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={location === '/settings'}>
              <Link href="/settings" data-testid="link-settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
