# Travila - Travel & Tourism Booking Platform

Travila is a comprehensive travel and tourism booking platform built with modern web technologies. The website provides a one-stop solution for travelers to book tours, hotels, car rentals, activities, and tickets through an intuitive, responsive interface.

## 🚀 Features

### Frontend
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI/UX**: Clean, intuitive interface with smooth animations
- **Interactive Components**: Sliders, carousels, and dynamic content
- **Authentication**: Complete signup/login system with validation
- **Form Validation**: Real-time validation with user feedback
- **Search Functionality**: Dynamic search with filters and suggestions
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Performance**: Optimized images and lazy loading

### Backend
- **RESTful API**: Complete API with Express.js
- **Authentication**: JWT-based authentication system
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Server-side validation with express-validator
- **Security**: Password hashing, rate limiting, CORS protection
- **Data Seeding**: Automated database seeding with sample data

## 🛠️ Tech Stack

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **Tailwind CSS** for styling
- **PostCSS** with Autoprefixer
- **Heroicons** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for validation
- **CORS** for cross-origin requests

## 📁 Project Structure

```
travila-travel-platform/
├── assets/
│   └── images/          # All images and icons
├── models/              # MongoDB models
│   ├── User.js
│   ├── Tour.js
│   ├── Hotel.js
│   ├── Car.js
│   ├── Category.js
│   ├── Booking.js
│   ├── Review.js
│   ├── Activity.js
│   └── Ticket.js
├── routes/              # API routes
│   ├── auth.js
│   ├── tours.js
│   ├── hotels.js
│   ├── cars.js
│   ├── categories.js
│   ├── bookings.js
│   ├── reviews.js
│   ├── activities.js
│   ├── tickets.js
│   └── search.js
├── middleware/          # Custom middleware
│   ├── auth.js
│   └── validation.js
├── partials/            # HTML partials
│   ├── auth-modal.html
│   ├── navbar.html
│   ├── hero.html
│   ├── featured-tours.html
│   ├── top-categories.html
│   ├── top-rated-hotels.html
│   ├── payment.html
│   ├── why-travel.html
│   ├── recent-cars.html
│   ├── search-box.html
│   └── footer.html
├── scripts/             # Utility scripts
│   └── seedData.js
├── src/
│   └── css/
│       ├── tailwind.css
│       ├── components.css
│       └── utilities.css
├── js/
│   ├── auth.js          # Authentication system
│   ├── index.js         # Main JavaScript
│   ├── components.js    # UI components
│   └── api.js           # API utilities
├── server.js            # Express server
├── index.html           # Main HTML file
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
├── package.json         # Dependencies and scripts
└── .env                 # Environment variables
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travila-travel-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/travila_db
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   
   # Server
   PORT=3000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use a cloud service like MongoDB Atlas.

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the development server**
   ```bash
   npm run dev:server
   ```

7. **In another terminal, start the CSS watcher**
   ```bash
   npm run dev
   ```

8. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔐 Authentication

The platform includes a complete authentication system:

### Features
- User registration with validation
- Secure login with JWT tokens
- Password strength requirements
- Real-time form validation
- Remember me functionality
- User profile management
- Password change functionality

### Test Account
After seeding the database, you can use:
- **Email**: test@travila.com
- **Password**: Test123!

## 📊 Database Collections

### Users
- User account information and preferences
- Password hashing and security
- Wishlist and booking history

### Tours
- Tour packages and travel experiences
- Pricing, duration, and availability
- Ratings and reviews

### Hotels
- Hotel listings with amenities
- Room types and pricing
- Location and contact information

### Cars
- Car rental inventory
- Specifications and features
- Availability and pricing

### Categories
- Tour and destination categories
- Popular categories and display order

### Bookings
- All booking transactions
- Payment and cancellation policies
- Guest information and preferences

### Reviews
- User reviews and ratings
- Verification and moderation
- Helpful votes system

### Activities
- Activity listings and experiences
- Difficulty levels and requirements
- Seasonal availability

### Tickets
- Flight, train, and event tickets
- Pricing and availability
- Booking restrictions

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/password` - Change password

### Tours
- `GET /api/tours` - Get all tours
- `GET /api/tours/featured` - Get featured tours
- `GET /api/tours/top-rated` - Get top-rated tours
- `GET /api/tours/:id` - Get tour by ID
- `GET /api/tours/search` - Search tours

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/top-rated` - Get top-rated hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `GET /api/hotels/search` - Search hotels

### Cars
- `GET /api/cars` - Get all cars
- `GET /api/cars/recent` - Get recent launches
- `GET /api/cars/:id` - Get car by ID
- `GET /api/cars/search` - Search cars

### Search
- `POST /api/search` - Universal search
- `GET /api/search/suggestions` - Get search suggestions
- `GET /api/search/filters` - Get available filters

## 🎨 Customization

### Colors
Update the color scheme in `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-color',
        secondary: '#your-color',
      }
    }
  }
}
```

### Components
Modify component styles in `src/css/components.css`:

```css
.btn-primary {
  @apply bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors;
}
```

## 📱 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔧 Available Scripts

- `npm run dev` - Start CSS development server
- `npm run dev:server` - Start backend development server
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

## 🔒 Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Helmet.js security headers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you have any questions or need help, please open an issue or contact the development team.

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com
```

### Build for Production
```bash
npm run build
npm start
```