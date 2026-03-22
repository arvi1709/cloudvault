# CloudVault 🛡️

CloudVault is a premium, highly secure, cloud-based file storage web application. Designed with a modern, dark-themed UI (reminiscent of professional dashboards), CloudVault allows users to seamlessly upload, manage, share, and encrypt their files with enterprise-grade security right from their browser.

## 🚀 Features

### Core Functionality
*   **Secure Authentication:** Powered by Firebase Authentication (Email/Password & Google Sign-in).
*   **Lightning-Fast Uploads:** Built on top of Supabase Storage to bypass restrictive CORS policies and provide massive bandwidth.
*   **File Management:** Grid and list views, size filtering (small, medium, large), bulk actions, and favorites.
*   **Trash System:** Safely move items to the trash with auto-delete configurations available in settings.

### Enterprise-Grade Security
*   **Client-Side AES-256 Encryption:** Files are scrambled directly in the browser *before* they are uploaded. The server only stores encrypted blobs.
*   **On-the-Fly Decryption:** When downloading, files are pulled from the server and decrypted locally in the browser, ensuring zero-knowledge privacy.
*   **Encrypted Vault (PIN Protected):** A highly secure folder protected by an additional 4-digit PIN for sensitive assets.

### Sharing & Collaboration
*   **Custom Sharing Controls:** Generate public or private sharing links.
*   **Link Expiry:** Set specific calendar dates for share links to automatically expire.

### Premium Dashboards
*   **User Profile:** A rich profile dashboard showing storage breakdown, recent activity, and account join dates.
*   **System Settings:** A massive configuration panel to control Security, Storage, Appearance (Dark/Light mode), System language, and Vault Encryption settings.

## 🛠️ Technology Stack

*   **Frontend Framework:** React 19 + TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS + `clsx` + `tailwind-merge`
*   **Icons:** Lucide React
*   **Animations:** Framer Motion (`motion/react`)
*   **Authentication & Database:** Firebase (Auth & Firestore)
*   **File Storage:** Supabase Storage
*   **Encryption:** `crypto-js`

## 📦 Local Installation & Setup

To run CloudVault on your local machine, follow these steps:

### 1. Clone the repository
```bash
git clone https://github.com/arvi1709/cloudvault.git
cd cloudvault
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Configuration
You need both Firebase and Supabase credentials to run this app. 

*   **Firebase:** Update the `firebase-applet-config.json` file in the root directory with your Firebase project config (apiKey, authDomain, projectId, etc.).
*   **Supabase:** Create a `.env` file (based on `.env.example`) or update `src/lib/supabase.ts` with your Supabase Project URL and Anon Public Key. Ensure you have created a public bucket named `vault-files` in your Supabase dashboard and configured the Row Level Security (RLS) policies to allow inserts/selects.

### 4. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` (or whatever port Vite assigns) in your browser.

## 🔒 A Note on Architecture (Why Supabase + Firebase?)

This project uses a hybrid backend approach to maximize efficiency and bypass common cloud provider limits:
1.  **Firebase Firestore** handles all user data, metadata, encryption keys, and folder structure.
2.  **Firebase Auth** handles all identity management.
3.  **Supabase Storage** handles the heavy lifting of the encrypted file blobs, providing a generous 1GB free tier without the strict credit card/CORS requirements often encountered when setting up fresh Firebase Storage buckets.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/arvi1709/cloudvault/issues).

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
