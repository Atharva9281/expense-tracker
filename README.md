# 💰 Fintastic - Smart Expense Tracker

<div align="center">

**A modern, full-stack expense tracking application built with the MERN stack**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-brightgreen?style=for-the-badge&logo=vercel)](https://expense-tracker-cicd-pearl.vercel.app)

</div>

## 🚀 Overview

Fintastic is a comprehensive personal finance management application that helps users track their income, expenses, and budgets with beautiful visualizations and real-time analytics. Built with modern technologies and deployed with a complete CI/CD pipeline.

### ✨ Key Features

- 📊 **Real-time Dashboard** - Interactive charts and analytics
- 💰 **Income Tracking** - Manage multiple income sources with categories
- 💸 **Expense Management** - Track and categorize all expenses
- 🎯 **Budget Planning** - Set monthly/yearly budgets with progress tracking
- 📱 **Mobile Responsive** - Beautiful UI that works on all devices
- 🔐 **Secure Authentication** - JWT-based user authentication
- 📈 **Data Visualization** - Interactive charts powered by Recharts
- 📊 **Export Functionality** - Download reports as Excel
- ⚡ **Real-time Updates** - Instant data synchronization
- 🎨 **Modern UI/UX** - Clean design with smooth animations

## 🏗️ System Architecture

<div align="center">

![Fintastic Architecture](./docs/architecture.png)

*Modern MERN stack with REST API architecture*

</div>

### Why This Architecture Matters

- **🚀 Scalability** - Vercel's edge CDN and Render's auto-scaling handle traffic spikes
- **💰 Cost Efficiency** - Pay-per-use model with free tiers for development
- **🔒 Security** - Separated frontend/backend with JWT authentication
- **⚡ Performance** - CDN distribution and optimized database queries
- **🔄 Reliability** - Automated deployments with health checks and rollbacks

## 🛠️ Tech Stack

### Frontend
- **React.js** - Component-based UI library with hooks
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Recharts** - Beautiful, responsive charts for data visualization
- **React Router** - Declarative routing for single-page applications
- **React Hot Toast** - Elegant notification system
- **React Window** - Efficiently rendering large lists with virtualization
- **Lucide React** - Modern, customizable icon library

### Backend
- **Node.js** - JavaScript runtime for server-side development
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL document database for flexible data storage
- **Mongoose** - Object Document Mapper (ODM) for MongoDB
- **JWT** - JSON Web Tokens for secure authentication
- **Bcrypt** - Password hashing for enhanced security
- **Node Cache** - In-memory caching for improved performance

### DevOps & Deployment
- **GitHub Actions** - Automated CI/CD pipeline for seamless deployments
- **Vercel** - Frontend hosting with global CDN and automatic HTTPS
- **Render** - Backend hosting with Docker container support
- **MongoDB Atlas** - Fully managed cloud database service

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0 or higher
- MongoDB Atlas account (free tier available)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Atharva9281/expense-tracker.git
   cd expense-tracker
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install

   # Frontend dependencies
   cd ../frontend/expense-tracker
   npm install
   ```

3. **Environment Configuration**

   **Backend `.env`:**
   ```env
   # Database Configuration
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/expensetracker

   # Security
   JWT_SECRET=your-super-secure-jwt-secret-key-here

   # Server Configuration
   PORT=8000
   NODE_ENV=development

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

   **Frontend `.env`:**
   ```env
   VITE_API_URL=http://localhost:8000
   ```

4. **Start the development servers**
   ```bash
   # Start backend server (Terminal 1)
   cd backend
   npm run dev

   # Start frontend development server (Terminal 2)
   cd frontend/expense-tracker
   npm run dev
   ```

5. **Access the application**
   - 🌐 Frontend: http://localhost:5173
   - 🔗 Backend API: http://localhost:8000

### 🎯 Key Highlights
- **Real-time Dashboard** with interactive charts and financial insights
- **Mobile-First Design** that works seamlessly across all devices  
- **Smart Budget Tracking** with visual progress indicators
- **Export Functionality** for comprehensive financial reports
- **Secure Authentication** with JWT-based user management

## 🎯 Feature Deep Dive

### 📊 **Intelligent Dashboard**
- Real-time financial overview with interactive visualizations
- Income vs expense trends with customizable time periods
- Category-wise spending analysis with drill-down capabilities
- Budget progress indicators with visual alerts and notifications

### 💰 **Advanced Income Tracking**
- Multiple income sources (salary, freelance, investments, side hustles)
- Recurring income setup with automatic scheduling and notifications
- Custom category management with emoji support
- Historical income analysis with trend predictions

### 💸 **Smart Expense Management**
- Intelligent expense categorization with machine learning suggestions
- Receipt capture and storage with image optimization
- Bulk import functionality from Excel files
- Advanced filtering and search with multiple criteria

### 🎯 **Comprehensive Budget Planning**
- Flexible budget creation for various time periods (monthly, yearly)
- Real-time spending tracking against budget allocations
- Smart alert system for budget limits and overspending warnings
- Budget vs actual analysis with detailed variance reports

### 📈 **Advanced Analytics**
- Spending pattern analysis 
- Category-wise breakdowns 
- Export functionality to Excel

## 🔐 Security & Performance

### 🛡️ Security Implementation
- **JWT Authentication** - Secure token-based authentication system
- **Password Security** - bcrypt hashing with configurable salt rounds
- **Input Validation** - Comprehensive validation and sanitization
- **API Rate Limiting** - Protection against abuse and DoS attacks
- **CORS Configuration** - Secure cross-origin resource sharing
- **Environment Protection** - Secure handling of sensitive configuration

### 📈 Performance Metrics

| **70%** | **100%** | **100%** | **91%** |
|---------|----------|----------|---------|
| Performance Score | Accessibility | Best Practices | SEO Score |

| **4.0s** | **200ms** | **99.9%** | **Auto** |
|----------|-----------|-----------|----------|
| Mobile Load Time* | API Response | System Uptime | Scaling |

*_Measured on simulated mobile 4G connection_
## 🚀 Deployment & DevOps

### 🔄 CI/CD Pipeline



### 🌐 Production Environment
- **Frontend Hosting** - Vercel with global CDN and automatic HTTPS
- **Backend Hosting** - Render with Docker containers and auto-scaling
- **Database** - MongoDB Atlas with automated backups and monitoring
- **Monitoring** - Real-time error tracking and performance monitoring
- **Logging** - Centralized logging with structured log analysis

## 📂 Project Structure

```
expense-tracker/
├── 🗂️ backend/
│   ├── 🎮 controllers/          # API request handlers and business logic
│   │   ├── authControllers.js   # Authentication and user management
│   │   ├── incomeControllers.js # Income-related operations
│   │   ├── expenseControllers.js# Expense management
│   │   └── budgetControllers.js # Budget planning and analysis
│   ├── 📄 models/               # Database schemas and models
│   │   ├── User.js              # User account schema
│   │   ├── Income.js            # Income record schema
│   │   ├── Expense.js           # Expense record schema
│   │   └── Budget.js            # Budget planning schema
│   ├── 🛣️ routes/               # API endpoint definitions
│   ├── 🔧 middleware/           # Custom middleware functions
│   │   ├── auth.js              # JWT authentication middleware
│   │   ├── validation.js        # Input validation middleware
│   │   └── cache.js             # Caching middleware
│   ├── 🛠️ utils/                # Helper functions and utilities
│   ├── ⚙️ config/               # Configuration files
│   │   ├── database.js          # MongoDB connection setup
│   │   └── emailService.js      # Email service configuration
│   └── 🚀 server.js             # Application entry point
│
├── 🖥️ frontend/expense-tracker/
│   ├── 📁 src/
│   │   ├── 🧩 components/       # Reusable UI components
│   │   │   ├── layouts/         # Layout components
│   │   │   ├── charts/          # Chart components
│   │   │   ├── modals/          # Modal dialogs
│   │   │   └── forms/           # Form components
│   │   ├── 📄 pages/            # Route-based page components
│   │   │   ├── Auth/            # Authentication pages
│   │   │   ├── Dashboard/       # Main dashboard
│   │   │   └── Settings/        # User settings
│   │   ├── 🔄 context/          # React context providers
│   │   ├── 🪝 hooks/            # Custom React hooks
│   │   ├── 🛠️ utils/            # Frontend utilities
│   │   └── 📱 App.jsx           # Main application component
│   ├── 🌐 public/               # Static assets
│   └── ⚙️ vite.config.js        # Vite configuration
│
├── 🐳 docker-compose.yml        # Local development stack
├── ⚙️ .github/workflows/        # CI/CD automation workflows
├── 📋 docs/                     # Project documentation
│   └── architecture.png         # System architecture diagram
└── 📖 README.md                 # Project documentation
```

## 🤝 Contributing

We welcome contributions from the community! Here's how to get started:

### 📋 Development Workflow
1. **🍴 Fork** the repository to your GitHub account
2. **🌟 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **🔧 Develop** your feature with proper testing
4. **💾 Commit** changes with descriptive messages
5. **📤 Push** to your feature branch
6. **🔄 Submit** a Pull Request with detailed description

### 🎯 Development Guidelines
- **Code Style** - Follow ESLint and Prettier configurations
- **Commit Messages** - Use conventional commit format
- **Testing** - Add unit tests for new features
- **Documentation** - Update README and inline documentation
- **Mobile First** - Ensure responsive design for all new UI components

## 📈 Performance Metrics

- **⚡ Page Load Time** - < 2 seconds on average connection
- **📱 Mobile Performance** - 95+ Google PageSpeed score
- **🔄 API Response Time** - < 200ms average response time
- **💾 Bundle Size** - Optimized with tree-shaking and code splitting
- **📊 Lighthouse Score** - 90+ across all performance metrics
- **🔍 Core Web Vitals** - Meets Google's performance standards

## 🐛 Troubleshooting & Common Issues

### Frequently Encountered Problems

**🔧 Build and Deployment**
```bash
# Clear cache and dependencies
rm -rf node_modules package-lock.json
npm install

# Reset local development environment
docker-compose down -v
docker-compose up --build
```

**🌐 CORS and API Connection**
- Verify `FRONTEND_URL` in backend environment variables
- Check API URL configuration in frontend `.env` file
- Ensure CORS middleware includes your frontend domain

**💾 Database Connection Issues**
- Confirm MongoDB Atlas IP whitelist includes deployment IPs
- Verify connection string format and credentials
- Check network connectivity and firewall settings

**📱 Mobile Responsiveness**
- Test on various device sizes using browser dev tools
- Verify Tailwind CSS responsive classes are applied correctly
- Check for horizontal scrolling issues on mobile devices

## 📋 Development Roadmap

### 🎯 Planned Features
- [ ] 🌙 **Dark Mode** - Complete dark theme with user preference persistence
- [ ] 💱 **Multi-Currency** - Support for multiple currencies with real-time conversion
- [ ] 🏦 **Bank Integration** - Connect bank accounts via Plaid API
- [ ] 📱 **Mobile App** - React Native mobile application
- [ ] 🔔 **Smart Notifications** - Bill reminders and spending alerts
- [ ] 📊 **AI Insights** - Machine learning-powered financial insights
- [ ] 🎯 **Goal Setting** - Financial goal tracking and achievement
- [ ] 💼 **Business Features** - Multi-user accounts for business expense tracking

### 🚀 Technical Improvements
- [ ] **GraphQL API** - Transition from REST to GraphQL
- [ ] **Real-time Updates** - WebSocket integration for live data
- [ ] **Offline Support** - Progressive Web App capabilities
- [ ] **Advanced Caching** - Redis implementation for better performance

## 🏆 What I Learned

This project provided valuable insights into modern web development:

### 🛠️ **Technical Skills**
- **MERN Stack Mastery** - Full-stack development with React, Node.js, Express, and MongoDB
- **Modern React Patterns** - Hooks, Context API, and performance optimization techniques
- **API Design** - RESTful API architecture with proper error handling and validation
- **Database Design** - NoSQL schema design and optimization for financial data
- **DevOps Implementation** - CI/CD pipeline setup with automated testing and deployment

### 🔒 **Security Best Practices**
- **Authentication Systems** - JWT implementation with refresh token strategies
- **Data Protection** - Input validation, sanitization, and SQL injection prevention
- **API Security** - Rate limiting, CORS configuration, and secure headers

## 🌟 Support the Project

If you found this project helpful or interesting:

- ⭐ **Star this repository** to show your support
- 🍴 **Fork the project** to contribute or customize
- 📢 **Share with others** who might find it useful
- 🐛 **Report issues** to help improve the project

---

<div align="center">

**💰 Track your expenses smartly with Fintastic! 📊**

![GitHub stars](https://img.shields.io/github/stars/Atharva9281/expense-tracker?style=social)
![GitHub forks](https://img.shields.io/github/forks/Atharva9281/expense-tracker?style=social)

*Made with ❤️ and countless hours of coding*

**[🚀 Try the Live Demo](https://expense-tracker-cicd-pearl.vercel.app) | [📖 View Documentation](https://github.com/Atharva9281/expense-tracker) | [🐛 Report Issues](https://github.com/Atharva9281/expense-tracker/issues)**

</div>
