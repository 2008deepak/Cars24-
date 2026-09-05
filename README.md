# Cars24 Clone - Buy & Sell Used Cars

A full-stack web application replicating the Cars24 platform for buying and selling pre-owned cars in India. Features include advanced search with fuzzy matching, dynamic pricing, vehicle history checks, EMI calculators, maintenance estimators, push notifications, and a referral/wallet rewards system.

## Tech Stack

### Frontend
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **Leaflet** for interactive maps
- **Fuse.js** for fuzzy search
- **Firebase** for push notifications (FCM)

### Backend
- **ASP.NET Core 9.0** (Web API) + **C#**
- **MongoDB Atlas** (with in-memory fallback)
- **JWT** authentication + **BCrypt** password hashing
- **Firebase Admin SDK** for server-side push notifications

## Features

### Core Marketplace
- **Buy Cars** — Advanced search with filters (brand, fuel, transmission, year, price, mileage, location), grid + map view
- **Sell Cars** — Multi-step car listing form
- **Car Details** — Individual car pages with full information
- **Featured Cars** — Curated verified listings on homepage

### Smart Search & Pricing
- **Custom Search Engine** — Levenshtein distance for typo tolerance, weighted field scoring, contextual bonuses
- **Dynamic Pricing Engine** — Location-aware (hilly/metro) and season-aware (monsoon/winter/summer) pricing rules

### Services & Tools
- **Car Check** — Vehicle history (insurance, PUC, fitness, loan status, stolen check, accident history)
- **Challan Check** — Traffic fine lookup by registration number
- **EMI Calculator** — Interactive loan calculator with tenure, interest, down payment
- **Maintenance Estimator** — Cost predictions with alerts, risk assessment, and saving tips (12+ Indian brands)

### User Features
- **Authentication** — JWT-based register/login with referral code support
- **Wishlist** — Save and manage favorite cars
- **Appointments** — Book test drives/inspections
- **Push Notifications** — FCM-powered real-time alerts with user preferences
- **Referral & Earn** — Unique referral codes, stats tracking, reward points
- **Wallet** — Points balance, transaction history, redemption

### Maps & Location
- **Interactive Map View** — Leaflet map with car listings and service center markers
- **Geolocation Detection** — Auto-detect city via IP or browser geolocation
- **20 Indian Cities** — Pre-configured with coordinates and service centers

## Project Structure

```
Cars24/
├── frontend/                  # Next.js 16 React app
│   ├── src/
│   │   ├── app/              # 16 pages (App Router)
│   │   ├── components/       # UI components, search, map, notifications
│   │   ├── context/          # Auth & Notification context providers
│   │   ├── hooks/            # Geolocation & FCM hooks
│   │   └── lib/              # API client, search engine, pricing rules, utilities
│   └── public/               # Static assets, service worker
│
└── backend/Cars24Api/        # ASP.NET Core 9.0 API
    ├── Controllers/          # 6 API controllers
    ├── Models/               # Data models
    ├── Services/             # Business logic + MongoDB services
    └── config/               # Firebase credentials (gitignored)
```

## Getting Started

### Prerequisites
- Node.js 18+
- .NET 9.0 SDK
- MongoDB Atlas account (or run with in-memory fallback)

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Backend
```bash
cd backend/Cars24Api
dotnet run
```
API runs at [http://localhost:5170](http://localhost:5170)

### Environment Variables

**Frontend** (`frontend/.env.local`):
```
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key
NEXT_PUBLIC_API_URL=http://localhost:5170
```

**Backend** (`backend/Cars24Api/appsettings.json`):
- MongoDB connection string
- JWT secret key
- Firebase service account path

## Key Technical Highlights

- **Resilient Architecture** — Every backend service has dual code paths (MongoDB + in-memory fallback), so the app works without a database connection
- **30 Seed Cars** — Realistic Indian car listings across hatchbacks, sedans, SUVs, EVs, and luxury categories
- **Mobile-First Design** — Responsive navigation, touch-friendly interactions, sheet/drawer on mobile
- **Real-Time Notifications** — Full Firebase Cloud Messaging stack with browser service workers

## License

This project is for educational purposes only.
