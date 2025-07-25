# CalvinNova Marketplace 🚀

**The campus-powered platform where students buy and sell within trusted university communities.**

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-demo-url.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9+-blue)](https://www.typescriptlang.org/)

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

## 📖 About

CalvinNova is a secure campus marketplace where students can buy and sell anything — from gadgets to textbooks — all within their school community. It supports real-time chat-based negotiation, verified transactions, and safe local pickups in public campus areas.

Our mission is to make student commerce safer, faster, and more accessible through technology and community trust.

## 🌟 Features

✅ **Real-time messaging** - Chat between buyers and sellers with live updates  
✅ **Product management** - Create, edit, and manage listings with rich media  
✅ **User authentication** - Secure Firebase-based authentication system  
✅ **Admin dashboard** - Comprehensive admin panel for user and content management  
✅ **Responsive design** - Mobile-first UI built with modern React patterns  
✅ **Context management** - Sophisticated state management for seamless UX  
✅ **Theme support** - Dark/light theme switching with persistent preferences  
✅ **Type safety** - Full TypeScript implementation for robust development  

## 🛠️ Tech Stack

**Frontend Framework**
- ⚛️ **React 18+** with modern hooks and patterns
- 📘 **TypeScript** for type safety and better DX
- 🎨 **Tailwind CSS** for utility-first styling
- 🧩 **ShadCN/UI** for accessible component primitives

**State Management & Context**
- 🔐 **Auth Context** - User authentication state
- 💬 **Chat Context** - Real-time messaging state
- 📦 **Product Context** - Product management state
- 🎨 **Theme Context** - UI theme preferences

**Backend Services**
- 🔥 **Firebase** - Authentication and real-time database
- 📡 **Custom API Services** - Product and admin management
- 💳 **Payment Integration** - Secure transaction processing

**Development Tools**
- ⚡ **Vite** - Fast build tool and dev server
- 🔧 **ESLint & Prettier** - Code quality and formatting
- 📱 **PWA Ready** - Service worker and offline support

## ⚙️ Installation

```bash
# Clone the repository
git clone https://github.com/Chijex5/CalvinNova-Webpp.git
cd CalvinNova-Webpp

# Install dependencies
npm install

# Start the development server
npm run dev
```

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# API Configuration
VITE_STREAM_API_KEY = stream_public-key
VITE_API_BASE_URL =  backend-base-url
VITE_PAYSTACK_LIVE_PUBLIC_KEY = paystack-live-key
VITE_PAYSTACK_LIVE_SECRET_KEY
VITE_PAYSTACK_TEST_PUBLIC_KEY
VITE_PAYSTACK_TEST_SECRET_KEY

# Development
VITE_DEV_MODE=true
```

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run dev:host     # Start dev server with network access

# Building
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues automatically
npm run type-check   # Run TypeScript compiler check

# Deployment
npm run deploy       # Deploy to hosting platform
```

## 📁 Project Structure

```
CalvinNova-Webpp/
├── public/                          # Static assets
│   ├── icons/                       # App icons and badges
│   └── index.html                   # HTML template
│
├── src/
│   ├── components/                  # Reusable UI components
│   │   ├── loaders/                 # Loading components
│   │   ├── ui/                      # Base UI components (buttons, inputs, etc.)
│   │   ├── CategoryFilter.tsx       # Product category filtering
│   │   ├── EditProduct.tsx          # Product editing interface
│   │   ├── Input.tsx                # Form input components
│   │   ├── Layout.tsx               # App layout wrapper
│   │   ├── Navigation.tsx           # Main navigation component
│   │   ├── NoContacts.tsx           # Empty state for contacts
│   │   ├── ProductCard.tsx          # Product display card
│   │   ├── ShowEmailSent.tsx        # Email confirmation UI
│   │   ├── Spinner.tsx              # Loading spinner
│   │   └── ThemeToggle.tsx          # Dark/light theme switcher
│   │
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.tsx          # Authentication state management
│   │   ├── ChatContext.tsx          # Chat/messaging state
│   │   ├── ProductContext.tsx       # Product management state
│   │   └── themeContext.tsx         # Theme preferences
│   │
│   ├── firebase/                    # Firebase configuration
│   │   └── firebaseConfig.ts        # Firebase setup and config
│   │
│   ├── functions/                   # Utility functions
│   │   └── noContacts.ts            # Contact management utilities
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useInitStreamChat.ts     # Chat initialization hook
│   │   └── useTypingHook.ts         # Typing indicator functionality
│   │
│   ├── lib/                         # Core utilities and configurations
│   │   └── stream-chats.ts          # Chat service integration
│   │
│   ├── pages/                       # Main application pages
│   │   ├── admin/                   # Admin panel pages
│   │   │   ├── AdminDashboard.tsx   # Main admin dashboard
│   │   │   └── Users.tsx            # User management interface
│   │   ├── BuyNow.tsx               # Purchase flow page
│   │   ├── Chat.tsx                 # Chat interface
│   │   ├── ChatBot.tsx              # AI chat assistant
│   │   ├── Dashboard.tsx            # User dashboard
│   │   ├── Home.tsx                 # Landing/home page
│   │   └── Login.tsx                # Authentication page
│   │
│   ├── services/                    # API and external service integrations
│   │   ├── adminService.ts          # Admin-related API calls
│   │   ├── productService.ts        # Product management APIs
│   │   └── selfService.ts           # User self-service APIs
│   │
│   ├── store/                       # State management (if using Redux/Zustand)
│   │   ├── adminData.ts             # Admin data store
│   │   ├── chatStore.ts             # Chat state management
│   │   ├── productStore.ts          # Product state management
│   │   └── userStore.ts             # User state management
│   │
│   ├── utils/                       # General utility functions
│   │   ├── App.tsx                  # Main app component utilities
│   │   ├── index.css                # Global styles
│   │   └── index.tsx                # Application entry point
│   │
│   ├── .env                         # Environment variables
│   ├── .gitignore                   # Git ignore rules
│   ├── eslint.config.js             # ESLint configuration
│   ├── firebase.json                # Firebase deployment config
│   ├── index.html                   # Main HTML template
│   ├── package.json                 # Dependencies and scripts
│   ├── package-lock.json            # Dependency lock file
│   ├── pglite-debug.log             # Database debug logs
│   ├── README.md                    # Project documentation
│   ├── tsconfig.json                # TypeScript configuration
│   └── vite.config.ts               # Vite build configuration
```

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how you can help:

### For Beginners
- Look for issues labeled `good-first-issue` or `beginner-friendly`
- Improve documentation or fix typos
- Add tests for existing functionality

### For Experienced Developers
- Work on new features or performance improvements
- Help with code reviews and mentoring
- Optimize build processes and deployment

### Contribution Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Add tests if applicable
5. Commit with conventional commit messages
6. Push to your branch and open a Pull Request

Please read our [Contributing Guidelines](./CONTRIBUTING.md) for detailed information.

## 🚨 Safety Notice

**Important**: CalvinNova facilitates connections between students but is not liable for in-person transactions. Always:
- Meet in public, well-lit campus areas
- Verify product condition before payment
- Use the in-app chat to confirm details
- Trust your instincts and prioritize personal safety

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 👨‍💻 Maintainers

This project is maintained by:
- **Chijioke Uzodinma** ([@Chijex5](https://github.com/Chijex5)) - Lead Developer & Product Vision
- **Ogechi Iyiegbu** ([@Goldy042])(https://github.com/Goldy042)

## 🎯 Roadmap

- [ ] Web Development (React)
- [ ] Advanced search and filtering
- [ ] Integration with campus payment systems
- [ ] Multi-university expansion
- [ ] AI-powered product recommendations

---

**Made with ❤️ for the student community**

For support, email us at support@calvinnova.com or open an issue on GitHub.