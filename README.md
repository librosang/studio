# StockFlow - Intelligent Inventory Management PWA

![StockFlow Logo](public/icons/icon-512x512.png)

**StockFlow** is a modern, feature-rich Progressive Web App (PWA) designed for seamless inventory and point-of-sale management. Built with a powerful tech stack including Next.js, Firebase, and Google's Genkit, it provides an intelligent, offline-first solution for small to medium-sized businesses.

This application is designed to be robust, scalable, and easy to use, providing a user experience on par with native desktop and mobile applications.

---

## ✨ Key Features

- **Progressive Web App (PWA)**: Fully installable on desktop and mobile devices for a native app-like experience with offline support.
- **Offline First**: Powered by Firestore's offline persistence, all transactions (sales, stock updates, etc.) work seamlessly without an internet connection and sync automatically when online.
- **Real-time Database**: Leverages Firebase Firestore for instantaneous data synchronization across all connected devices.
- **Stock & Shop Management**: Easily manage products in your main stockroom and transfer them to your shop floor.
- **Point of Sale (POS) Interface**: A cashier-friendly, fullscreen interface for quick and efficient sales processing.
- **Barcode Scanning**: Use your device's camera to scan product barcodes.
- **Automated Product Lookup**: Integrates with the **Open Food Facts API** to automatically fetch product names and images when a barcode is scanned.
- **AI-Powered Category Suggestions**: Uses Google AI (via Genkit) to intelligently suggest product categories based on the product name.
- **Comprehensive Dashboard**: Get a real-time overview of your daily sales, returns, and top-selling products.
- **Activity Logging**: A detailed, filterable log of all inventory changes, transactions, and user actions.
- **User Role Management**: Two pre-configured roles:
    - **Manager**: Full access to all features, including stock management, user accounts, and dashboard analytics.
    - **Cashier**: Access limited to the POS and Shop interfaces.
- **Multi-Language Support**: Fully internationalized with support for **English** and **Arabic (RTL)** out of the box.
- **Responsive Design**: A beautiful and functional UI that works flawlessly on any device, from a desktop monitor to a smartphone.
- **Data Export**: Export your activity logs to an Excel file for reporting and analysis.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) 14 (App Router)
- **Database**: [Firebase Firestore](https://firebase.google.com/docs/firestore) (Real-time, Offline-first)
- **Generative AI**: [Genkit (Google AI)](https://firebase.google.com/docs/genkit)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **PWA**: [@ducanh2912/next-pwa](https://www.npmjs.com/package/@ducanh2912/next-pwa)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Forms**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18.17 or later)
- A [Firebase Project](https://console.firebase.google.com/)

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd <repository-name>
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your project dashboard, go to **Project Settings** (the gear icon).
3.  Under the "General" tab, scroll down to "Your apps".
4.  Click the **Web** icon (`</>`) to create a new web app.
5.  Give it a nickname and register the app.
6.  You will be shown a `firebaseConfig` object. Copy these keys.

### 4. Configure Environment Variables

Create a file named `.env` in the root of the project and add your Firebase configuration keys:

```.env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID
```

### 5. Configure Firebase Firestore

1.  In the Firebase Console, go to the **Firestore Database** section.
2.  Click **"Create database"**.
3.  Start in **Production mode**.
4.  Choose a location for your database.
5.  Go to the **Rules** tab and paste the following rules. This allows anyone to read/write for development purposes. **Remember to secure this for a real production environment!**

    ```firestore
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    ```

### 6. Run the Development Server

```bash
npm run dev
```

The app should now be running at [http://localhost:9002](http://localhost:9002).

You can log in with one of the pre-configured test users:
- **Manager**: `manager@test.com`
- **Cashier**: `john@test.com`

---

## ☁️ Deployment

This Next.js application can be easily deployed to any hosting service that supports Node.js. For a simple and free deployment, we recommend **Vercel**.

### Deploying with Vercel

1.  **Push to a Git Repository**: Make sure your project is pushed to a GitHub, GitLab, or Bitbucket repository.
2.  **Sign up on Vercel**: Create an account on [Vercel](https://vercel.com/) with your Git provider account.
3.  **Import Project**: From your Vercel dashboard, click "Add New... > Project" and import the repository you just created.
4.  **Configure Environment Variables**: In the project settings on Vercel, navigate to the "Environment Variables" section. Add all the `NEXT_PUBLIC_FIREBASE_*` variables from your `.env` file.
5.  **Deploy**: Click the "Deploy" button. Vercel will automatically build and deploy your application.

Your professional inventory management PWA is now live!
