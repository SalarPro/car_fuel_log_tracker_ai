# Design Guidelines: Car Management & Expense Tracking Application

## Design Approach

**Selected System**: Material Design with inspiration from Linear and Notion for dashboard aesthetics

**Justification**: This data-heavy productivity application requires clear information hierarchy, efficient data display, and intuitive navigation across multiple sections (cars, fuel logs, services, expenses). Material Design provides robust patterns for forms, tables, and cards while Linear's clean aesthetic ensures the interface doesn't feel cluttered despite information density.

**Key Principles**:
- **Data Clarity First**: Every metric and record should be instantly scannable
- **Progressive Disclosure**: Show summary views with drill-down capability
- **Action-Oriented**: Primary actions (Add Car, Log Fuel, Record Service) prominently accessible
- **Visual Alerts**: "Needs Attention" indicators must stand out without being aggressive

---

## Typography

**Font Stack**: Inter (Google Fonts) - optimized for data display and UI
- **Display/Headers**: Inter Bold, 32px-24px
- **Section Titles**: Inter Semibold, 20px-18px
- **Body/Labels**: Inter Regular, 16px-14px
- **Data/Numbers**: Inter Medium, 16px (tabular numerals)
- **Captions/Meta**: Inter Regular, 13px-12px

**Hierarchy**:
- Dashboard page titles: Bold 32px
- Car names in cards: Semibold 20px
- Metric labels: Regular 14px
- Metric values: Medium 18px with tabular numerals
- Form labels: Semibold 14px
- Table headers: Semibold 13px uppercase with letter-spacing

---

## Layout System

**Spacing Primitives**: Tailwind units of **2, 4, 6, 8, 12, 16** (p-2, m-4, gap-6, py-8, space-y-12, px-16)

**Grid Structure**:
- **Container**: max-w-7xl mx-auto px-6
- **Dashboard Cards**: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Detail Views**: Single column max-w-4xl with sidebar for quick actions
- **Tables**: Full width with horizontal scroll on mobile

**Page Layout**:
- **Sidebar Navigation** (fixed left, 240px wide):
  - User profile section at top (p-4)
  - Car list with icons (py-2 per item)
  - Settings at bottom
  - Active state: subtle background, left border accent
  
- **Main Content Area**:
  - Top bar: Page title + primary action button (h-16, px-8)
  - Content padding: p-8
  - Card spacing: gap-6 between elements

**Responsive Behavior**:
- Mobile: Bottom navigation bar, collapsible sidebar
- Tablet: Condensed sidebar (icons only, expand on hover)
- Desktop: Full persistent sidebar

---

## Component Library

### 1. Navigation Components

**Sidebar**:
- Fixed height with scroll for car list
- Each car item: Icon (car glyph) + Name + Plate
- Divider between car list and settings
- Logout button at absolute bottom

**Top Bar**:
- Breadcrumb navigation (Home > Cars > [Car Name])
- Page title (left)
- Primary CTA button (right) with icon
- Height: 64px, border-bottom separator

### 2. Dashboard Cards

**Car Summary Card**:
- Elevated card (shadow-md, rounded-lg, p-6)
- Header: Car name + plate + options menu
- Grid of 4 metrics (2x2):
  - Current Odometer (large, prominent)
  - Total Fuel Cost
  - Total Service Cost
  - Last Service Date
- Footer: "View Details" link + quick action buttons
- Needs Attention badge (top-right corner if applicable)

**Stat Cards** (for overview metrics):
- Compact card (p-4, rounded-md)
- Icon (top-left, 24px)
- Large number (32px, tabular)
- Label below (13px, muted)
- 4-column grid on desktop

### 3. Data Tables

**Fuel/Service/Expense Tables**:
- Clean borders, alternating row backgrounds
- Header row: Sticky, semibold, smaller text
- Columns:
  - Date (sortable icon)
  - Description/Name
  - Amount (right-aligned, tabular)
  - Odometer (right-aligned)
  - Actions (icon buttons: edit, delete)
- Row height: 56px (comfortable tapping)
- Pagination at bottom (10/25/50 items)
- Empty state: Centered illustration + "Add First Entry" button

**Mobile Table Adaptation**:
- Card-based layout instead of table
- Each row becomes a card with vertical stack
- Swipe actions for edit/delete

### 4. Forms

**Add/Edit Forms**:
- Modal overlay (max-w-2xl, centered)
- Form sections with clear headings
- Input groups:
  - Label (14px, semibold, mb-2)
  - Input field (h-12, rounded-md, border, px-4)
  - Helper text or error (12px, mt-1)
- Field spacing: space-y-6
- Form actions: Footer with Cancel + Save buttons (right-aligned)

**Inline Edit Forms**:
- Same styling as modal forms
- Slide-in panel from right (400px wide)
- Close button (top-right)

**Input Types**:
- Text inputs: Standard with focus ring
- Number inputs: Steppers for odometer
- Date picker: Calendar dropdown
- Currency: Prepended symbol (selected from settings)
- Dropdowns: Chevron icon, smooth open animation
- Textarea: Min 3 rows for notes

### 5. Buttons & Actions

**Primary Button**:
- Height: 44px, px-6
- Semibold text, 15px
- Rounded-md
- Icon support (left or right, 20px)

**Secondary Button**:
- Same size, outlined variant
- Transparent background

**Icon Buttons**:
- 40x40px touch target
- 20px icon
- Subtle hover background

**Floating Action Button** (mobile):
- Fixed bottom-right
- 56x56px circle
- Plus icon
- Opens action sheet

### 6. Alerts & Badges

**Needs Attention Indicator**:
- Badge (px-3, py-1, rounded-full)
- Icon + "Needs Attention" text
- Pulsing animation (subtle)
- Appears on car cards and service rows

**Alert Banners**:
- Full-width, px-6, py-4
- Icon left, message, dismiss button right
- Types: info, success, warning, error
- Slide-in from top animation

### 7. Data Visualization (Future-Ready)

**Placeholder Card for Analytics**:
- Same card styling as others
- "Analytics Coming Soon" message
- Reserve space for:
  - Fuel consumption chart (line graph)
  - Cost breakdown (pie chart)
  - Odometer timeline

---

## Images

**Dashboard Welcome State**:
- Top section hero-style illustration (not photograph)
- Abstract vector graphic of car dashboard/gauges
- Placement: Above car cards when user has 0-1 cars
- Style: Line art, minimal, professional
- Size: 400x300px, centered

**Empty States**:
- No cars: Illustration of car with key
- No fuel logs: Gas pump illustration
- No services: Wrench/tools illustration
- No expenses: Receipt/wallet illustration
- Size: 200x200px, centered with text below

**Settings Page**:
- Currency icon illustrations (small, 24px) next to each currency option

**Note**: No large hero images needed - this is a utility application focused on data management. Keep imagery functional and supporting the workflow.

---

## Key Interactions

- **Card hover**: Subtle elevation increase (shadow-lg)
- **Row selection**: Background change, no animation
- **Delete actions**: Confirmation modal with warning message
- **Odometer validation**: Real-time error display if value decreases
- **Currency change**: Inline confirmation (doesn't affect historical data display)
- **Filter/Sort**: Instant update, no loading states for client-side operations

**Animation Philosophy**: Minimal and purposeful. Use only for state transitions (modal open/close, dropdown expand) and loading states. No decorative animations.