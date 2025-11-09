# Firebase & API Configuration

## 🔥 Firebase Setup

This project uses Firebase for authentication and backend services.

### Environment Variables

All Firebase configuration is stored in `.env` file (already configured):

```env
VITE_APP_FIREBASE_API_KEY=AIzaSyCJsIRsl6dAooYiGqhVQwySHlyy3VAS1r8
VITE_APP_FIREBASE_AUTH_DOMAIN=scholarship-routing.firebaseapp.com
VITE_APP_FIREBASE_PROJECT_ID=scholarship-routing
VITE_APP_FIREBASE_STORAGE_BUCKET=scholarship-routing.firebasestorage.app
VITE_APP_FIREBASE_MESSAGING_SENDER_ID=363455079953
VITE_APP_FIREBASE_APP_ID=1:363455079953:web:3a637dc40a5549305333b0
VITE_APP_FIREBASE_MEASUREMENT_ID=G-FHF3RZY3ZQ
VITE_APP_API_URL=http://159.223.60.221:8000/api/v1
```

### Files Created

1. **`src/lib/firebase.ts`** - Firebase initialization and service exports
2. **`src/lib/firebase-auth.ts`** - Firebase authentication hooks
3. **`.env`** - Environment variables (configured)
4. **`.env.example`** - Template for other developers

### Available Firebase Services

```typescript
import { auth, db, storage, analytics } from '@/lib/firebase';
```

- `auth` - Firebase Authentication
- `db` - Firestore Database
- `storage` - Firebase Storage
- `analytics` - Firebase Analytics

### Authentication Hooks

```typescript
import { 
  useFirebaseUser, 
  useFirebaseLogin, 
  useFirebaseRegister, 
  useFirebaseLogout 
} from '@/lib/firebase-auth';
```

#### Example Usage:

```typescript
// Get current user
const { data: user, isLoading } = useFirebaseUser();

// Login
const login = useFirebaseLogin();
login.mutate({ email, password });

// Register
const register = useFirebaseRegister();
register.mutate({ email, password, firstName, lastName });

// Logout
const logout = useFirebaseLogout();
logout.mutate();
```

## 🌐 API Configuration

Backend API is configured at: `http://159.223.60.221:8000/api/v1`

### Usage:

```typescript
import { api } from '@/lib/api-client';

// Make API calls
const data = await api.get('/scholarships');
const result = await api.post('/applications', { ... });
```

## 📦 Installation

For other developers to install dependencies:

```bash
yarn install
```

Firebase is already added to `package.json` (version 12.5.0).

## 🚀 Running the App

```bash
yarn dev
```

App will run on `http://localhost:3000`
