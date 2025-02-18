# Loady - Tour Planning Web Application

A responsive web application for managing logistics tours, drivers, and customers. Built with Vue 3, TypeScript, and Vuetify, this application provides an intuitive interface for planning and managing delivery tours while ensuring proper driver assignment based on location constraints.
you can find the live demo [here](https://loady-tour.web.app/)

## 🚀 Features

### Driver Management
- Interactive map visualization of driver locations
- CRUD operations for driver management
- Location validation (no numbers allowed)
- Status tracking (available/assigned)
- Filterable driver list with pagination

### Tour Management
- Tour planning interface
- Smart driver assignment based on location
- Interactive map visualization of tour routes
- Advanced filtering and search capabilities

### Customer Management
- Customer database management
- Integration with tour planning
- Customer location tracking

## 🛠 Technical Stack

### Frontend
- Vue 3 with Composition API
- TypeScript for type safety
- Vuetify 3 for Material Design components
- Pinia for state management
- Vue Router for navigation
- MapLibre GL for map visualization

### Development Tools
- Vite for fast development and building
- ESLint for code quality
- Vitest for unit testing
- Vue Test Utils for component testing

## 🏗 Architecture

The application follows a modern, component-based architecture with these key aspects:

### Core Components
- `DataMap`: Reusable map component for visualizing locations
- `DataTableCrud`: Generic CRUD table component with filtering
- Store modules for drivers, tours, and customers

### State Management
- Pinia stores for centralized state management
- Modular store design for scalability


## 🚦 Getting Started

1. **Prerequisites**
   - Node.js (v18 or higher)
   - npm or yarn

2. **Installation**
   ```bash
   # Clone the repository
   git clone https://github.com/albasheer0/loady-tours.git

   # Install dependencies
   npm install
   ```

3. **Development**
   ```bash
   # Start development server
   npm run dev

   # Run tests
   npm run test

   # Build for production
   npm run build
   ```

## 🧪 Testing

The application includes comprehensive testing:
- Unit tests for business logic
- Component tests for UI elements
- Integration tests for critical workflows

Run tests with:
```bash
npm run test        # Run tests
```

## 📱 Responsive Design

The application is fully responsive and works seamlessly across:
- Desktop browsers
- Tablets
- Mobile devices
