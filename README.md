# 🚗 CarTrack - Vehicle Expense Manager

A modern, full-stack web application for tracking vehicle expenses, fuel consumption, maintenance records, and services. Built with React, TypeScript, Firebase, and shadcn/ui.

## ✨ Features

- **🔐 User Authentication** - Secure email/password authentication with Firebase Auth
- **🚙 Multi-Vehicle Management** - Track multiple vehicles with individual records
- **⛽ Fuel Log Tracking** - Record fuel purchases, calculate consumption and costs
- **🔧 Service Records** - Maintain service history with odometer-based reminders
- **💰 Expense Tracking** - Categorize and track all vehicle-related expenses
- **📊 Analytics Dashboard** - Visualize fuel efficiency, costs, and trends
- **🌍 Multi-Currency Support** - Track expenses in IQD, USD, EUR, GBP, AED, SAR, KWD, JOD
- **🌓 Dark Mode** - Beautiful dark/light theme with seamless transitions
- **📱 Responsive Design** - Works perfectly on desktop, tablet, and mobile devices
- **💾 Offline Support** - IndexedDB persistence for offline functionality

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible component library
- **Radix UI** - Headless UI primitives
- **React Hook Form** - Performant form management
- **Zod** - Schema validation
- **TanStack Query** - Data fetching and caching
- **Recharts** - Data visualization
- **Wouter** - Lightweight routing
- **Lucide React** - Beautiful icons

### Backend & Database
- **Firebase Authentication** - Secure user management
- **Cloud Firestore** - NoSQL cloud database
- **Firebase Security Rules** - Data protection and validation

### Development Tools
- **tsx** - TypeScript execution
- **ESBuild** - Fast bundling
- **Drizzle ORM** - TypeScript ORM (for future migrations)

## 📁 Project Structure

```
├── client/
│   ├── public/           # Static assets
│   └── src/
│       ├── components/   # Reusable UI components
│       │   └── ui/       # shadcn/ui components
│       ├── contexts/     # React contexts (Auth)
│       ├── hooks/        # Custom React hooks
│       ├── lib/          # Utilities and Firebase config
│       ├── pages/        # Page components
│       └── main.tsx      # App entry point
├── server/               # Server configuration
├── shared/               # Shared types and schemas
├── firestore.rules       # Firebase security rules
└── package.json          # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SalarPro/car_fuel_log_tracker_ai.git
   cd car_fuel_log_tracker_ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**

   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Deploy Firebase Security Rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`

### Building for Production

```bash
npm run build
npm start
```

## 🔒 Security

The application implements comprehensive Firebase Security Rules that:
- ✅ Require authentication for all operations
- ✅ Enforce user data isolation (users can only access their own data)
- ✅ Validate data types and required fields
- ✅ Ensure data integrity (positive numbers, non-empty strings, etc.)
- ✅ Protect against unauthorized access

## 📊 Database Structure

```
users/{userId}/
  ├── settings/
  │   └── preferences      # User settings (currency, etc.)
  └── cars/{carId}/
      ├── fuel_logs/       # Fuel purchase records
      ├── services/        # Maintenance records
      └── expenses/        # Other expenses
```

## 🎨 Features in Detail

### Fuel Tracking
- Record fuel purchases with date, amount, quantity, and odometer
- Automatic fuel efficiency calculations
- Brand tracking for comparison
- Visual charts for consumption trends

### Service Management
- Track all vehicle services and repairs
- Set odometer-based reminders
- Service history with descriptions
- Attention alerts for upcoming maintenance

### Expense Categories
- Insurance, Registration, Parking, Tolls
- Car Wash, Accessories, Fines
- Custom categorization
- Date and odometer tracking

### Dashboard Analytics
- Total expenses overview
- Fuel efficiency trends
- Service reminders
- Recent activity timeline

## 🌐 Supported Currencies

Iraqi Dinar (IQD), US Dollar (USD), Euro (EUR), British Pound (GBP), UAE Dirham (AED), Saudi Riyal (SAR), Kuwaiti Dinar (KWD), Jordanian Dinar (JOD)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**SalarPro**
- GitHub: [@SalarPro](https://github.com/SalarPro)

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the amazing component library
- [Firebase](https://firebase.google.com/) for backend services
- [Lucide](https://lucide.dev/) for beautiful icons
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

⭐ If you find this project useful, please consider giving it a star!
