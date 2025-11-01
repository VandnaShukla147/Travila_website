const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const { User } = require('../models/common');
const Tour = require('../models/Tour');
const Hotel = require('../models/Hotel');
const Car = require('../models/Car');
const { Category } = require('../models/common');
const Activity = require('../models/Activity');
const Ticket = require('../models/Ticket');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travila_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Sample data
const sampleCategories = [
  {
    name: 'Mountain',
    slug: 'mountain',
    image: 'assets/images/mountain.png',
    stats: { tours: 356, activities: 248 },
    description: 'Explore majestic mountain destinations',
    isPopular: true,
    displayOrder: 1
  },
  {
    name: 'Safari',
    slug: 'safari',
    image: 'assets/images/safari.png',
    stats: { tours: 356, activities: 248 },
    description: 'Experience wildlife adventures in their natural habitat',
    isPopular: true,
    displayOrder: 2
  },
  {
    name: 'Desert',
    slug: 'desert',
    image: 'assets/images/desert.png',
    stats: { tours: 356, activities: 248 },
    description: 'Discover the beauty of desert landscapes',
    isPopular: true,
    displayOrder: 3
  },
  {
    name: 'Flower',
    slug: 'flower',
    image: 'assets/images/flower.png',
    stats: { tours: 356, activities: 248 },
    description: 'Immerse yourself in beautiful flower fields and gardens',
    isPopular: true,
    displayOrder: 4
  },
  {
    name: 'Beach',
    slug: 'beach',
    image: 'assets/images/beach.png',
    stats: { tours: 356, activities: 248 },
    description: 'Relax on beautiful beaches worldwide',
    isPopular: true,
    displayOrder: 5
  },
  {
    name: 'Temples',
    slug: 'temples',
    image: 'assets/images/temples.png',
    stats: { tours: 356, activities: 248 },
    description: 'Visit ancient temples and religious sites',
    isPopular: true,
    displayOrder: 6
  },
  {
    name: 'Yacht',
    slug: 'yacht',
    image: 'assets/images/yacht.png',
    stats: { tours: 356, activities: 248 },
    description: 'Luxury yacht experiences and sailing adventures',
    isPopular: true,
    displayOrder: 7
  },
  {
    name: 'Valley',
    slug: 'valley',
    image: 'assets/images/valley.png',
    stats: { tours: 356, activities: 248 },
    description: 'Experience stunning valley views',
    isPopular: true,
    displayOrder: 8
  }
];

const sampleTours = [
  {
    title: 'California Sunset/Twilight Boat Cruise',
    location: 'California, United States',
    duration: { days: 2, nights: 3 },
    price: { amount: 48.25, currency: 'USD', per: 'person' },
    rating: { score: 4.96, reviews: 672, badge: 'Top Rated' },
    image: 'assets/images/california_sunset.png',
    description: 'Experience breathtaking sunsets on a luxury boat cruise along the California coast.',
    category: 'Nature & Adventure',
    highlights: ['Boat cruise', 'Sunset viewing', 'Coastal scenery'],
    isFeatured: true,
    isTopRated: true,
    availability: true,
    maxGroupSize: 6,
    minGroupSize: 4,
    minAge: 12,
    included: ['Boat cruise', 'Guide', 'Refreshments'],
    excluded: ['Meals', 'Accommodation'],
    itinerary: [
      {
        day: 1,
        title: 'Boat Cruise Departure',
        description: 'Board the luxury boat and begin coastal cruise.',
        activities: ['Boarding', 'Safety briefing', 'Coastal tour']
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'NYC: Food Tastings and Culture Tour',
    location: 'New York, United States',
    duration: { days: 3, nights: 3 },
    price: { amount: 17.32, currency: 'USD', per: 'person' },
    rating: { score: 4.96, reviews: 672, badge: 'Best Value' },
    image: 'assets/images/nyc_food.png',
    description: 'Taste your way through New York City with this culinary adventure featuring the best local eateries and cultural landmarks.',
    category: 'Food & Culture',
    highlights: ['Food tastings', 'Cultural sites', 'Local markets'],
    isFeatured: true,
    isTopRated: false,
    availability: true,
    maxGroupSize: 6,
    minGroupSize: 4,
    minAge: 16,
    included: ['Food tastings', 'Transportation', 'Guide'],
    excluded: ['Accommodation', 'Personal expenses'],
    itinerary: [
      {
        day: 1,
        title: 'Food Tour Start',
        description: 'Begin culinary journey through NYC.',
        activities: ['Market visit', 'Food tastings', 'Cultural sites']
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    title: 'Grand Canyon Horseshoe Bend 2 days',
    location: 'Arizona, United States',
    duration: { days: 7, nights: 6 },
    price: { amount: 15.63, currency: 'USD', per: 'person' },
    rating: { score: 4.96, reviews: 672, badge: 'New' },
    image: 'assets/images/grand_canyon.png',
    description: 'Discover the awe-inspiring Grand Canyon and Horseshoe Bend with guided tours.',
    category: 'Nature & Adventure',
    highlights: ['Canyon views', 'Horseshoe Bend', 'Photography'],
    isFeatured: true,
    isTopRated: false,
    availability: true,
    maxGroupSize: 6,
    minGroupSize: 4,
    minAge: 8,
    included: ['Transportation', 'Guide', 'Park fees'],
    excluded: ['Meals', 'Accommodation'],
    itinerary: [
      {
        day: 1,
        title: 'Canyon Arrival',
        description: 'Arrive at Grand Canyon and begin exploration.',
        activities: ['Orientation', 'Canyon viewing', 'Photography']
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleHotels = [
  {
    name: 'Beachfront Paradise Hotel',
    location: {
      city: 'Manchester',
      country: 'England',
      address: 'Beach Road 123',
      coordinates: { latitude: 53.4808, longitude: -2.2426 }
    },
    rating: { score: 4.96, reviews: 672, stars: 5 },
    price: { perNight: 48.25, currency: 'USD' },
    images: {
      main: 'assets/images/california_sunset.png',
      gallery: []
    },
    amenities: ['Free WiFi', 'Swimming Pool', 'Beach Access', 'Restaurant'],
    roomTypes: [
      {
        type: 'Ocean View Room',
        capacity: 2,
        price: 48.25,
        description: 'Spacious room with ocean views'
      }
    ],
    isTopRated: true,
    availability: true,
    checkIn: '15:00',
    checkOut: '11:00'
  },
  {
    name: 'City Central Boutique Hotel',
    location: {
      city: 'Manchester',
      country: 'England',
      address: 'Main Street 456',
      coordinates: { latitude: 53.4808, longitude: -2.2426 }
    },
    rating: { score: 4.96, reviews: 672, stars: 5 },
    price: { perNight: 17.32, currency: 'USD' },
    images: {
      main: 'assets/images/nyc_food.png',
      gallery: []
    },
    amenities: ['Free WiFi', 'Restaurant', 'Bar'],
    roomTypes: [
      {
        type: 'Standard Room',
        capacity: 2,
        price: 17.32,
        description: 'Comfortable city room'
      }
    ],
    isTopRated: true,
    availability: true,
    checkIn: '15:00',
    checkOut: '11:00'
  },
  {
    name: 'Desert Adventure Resort',
    location: {
      city: 'Manchester',
      country: 'England',
      address: 'Desert Road 789',
      coordinates: { latitude: 53.4808, longitude: -2.2426 }
    },
    rating: { score: 4.96, reviews: 672, stars: 5 },
    price: { perNight: 15.63, currency: 'USD' },
    images: {
      main: 'assets/images/grand_canyon.png',
      gallery: []
    },
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa'],
    roomTypes: [
      {
        type: 'Desert View Suite',
        capacity: 2,
        price: 15.63,
        description: 'Luxury suite with desert views'
      }
    ],
    isTopRated: true,
    availability: true,
    checkIn: '15:00',
    checkOut: '11:00'
  },
  {
    name: 'The Montcalm Royal London House',
    location: {
      city: 'London',
      country: 'United Kingdom',
      address: '22-25 Finsbury Square',
      coordinates: { latitude: 51.5200, longitude: -0.0900 }
    },
    rating: { score: 4.7, reviews: 856, stars: 5 },
    price: { perNight: 358.32, currency: 'USD' },
    images: {
      main: 'assets/images/california_sunset.png',
      gallery: []
    },
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Fitness Center', 'Restaurant', 'Bar'],
    roomTypes: [
      {
        type: 'Deluxe Suite',
        capacity: 2,
        price: 358.32,
        description: 'Spacious suite with city views',
        amenities: ['King bed', 'Mini bar', 'Balcony', 'Room service']
      },
      {
        type: 'Standard Room',
        capacity: 2,
        price: 280.00,
        description: 'Comfortable room with modern amenities',
        amenities: ['Queen bed', 'Work desk', 'City view']
      }
    ],
    isTopRated: true,
    availability: true,
    checkIn: '15:00',
    checkOut: '11:00',
    policies: {
      cancellation: 'Free cancellation up to 24 hours before check-in',
      petPolicy: 'Pets allowed with additional fee',
      smokingPolicy: 'Non-smoking property'
    }
  },
  {
    name: 'Bali Beach Resort',
    location: {
      city: 'Ubud',
      country: 'Indonesia',
      address: 'Jl. Monkey Forest, Ubud',
      coordinates: { latitude: -8.5193, longitude: 115.2633 }
    },
    rating: { score: 4.6, reviews: 423, stars: 4 },
    price: { perNight: 125.00, currency: 'USD' },
    images: {
      main: 'assets/images/nyc_food.png',
      gallery: []
    },
    amenities: ['Free WiFi', 'Swimming Pool', 'Spa', 'Restaurant', 'Airport Shuttle'],
    roomTypes: [
      {
        type: 'Garden Villa',
        capacity: 2,
        price: 125.00,
        description: 'Private villa with garden view',
        amenities: ['King bed', 'Private pool', 'Garden', 'Kitchenette']
      }
    ],
    isTopRated: false,
    availability: true,
    checkIn: '14:00',
    checkOut: '12:00'
  }
];

const sampleCars = [
  // Card 1 – Audi (Manchester, England)
  {
    model: 'Audi A3 1.6 TDI S line',
    brand: 'Audi',
    location: {
      city: 'Manchester',
      country: 'England',
      address: 'Manchester Airport Car Rental'
    },
    specifications: {
      mileage: 25100,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 7,
      engine: '1.6L TDI',
      power: '150 HP',
      fuelCapacity: 50
    },
    price: { amount: 498.25, currency: 'USD', per: 'day' },
    image: 'assets/images/audi.png',
    features: ['GPS Navigation', 'Air Conditioning', 'Bluetooth', 'USB Port'],
    isRecentLaunch: true,
    availability: true,
    rating: { score: 4.96, reviews: 672 },
    year: 2024,
    color: 'Black',
    condition: 'New'
  },
  // Card 2 – Audi (Manchester, England)
  {
    model: 'Audi A3 1.6 TDI S line',
    brand: 'Audi',
    location: {
      city: 'Manchester',
      country: 'England',
      address: 'Manchester Airport Car Rental'
    },
    specifications: {
      mileage: 25100,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 7,
      engine: '1.6L TDI',
      power: '150 HP',
      fuelCapacity: 50
    },
    price: { amount: 498.25, currency: 'USD', per: 'day' },
    image: 'assets/images/audi2.png',
    features: ['GPS Navigation', 'Air Conditioning', 'Bluetooth', 'USB Port'],
    isRecentLaunch: true,
    availability: true,
    rating: { score: 4.96, reviews: 672 },
    year: 2024,
    color: 'White',
    condition: 'New'
  },
  // Card 3 – Audi (Manchester, England)
  {
    model: 'Audi A3 1.6 TDI S line',
    brand: 'Audi',
    location: {
      city: 'Manchester',
      country: 'England',
      address: 'Manchester Airport Car Rental'
    },
    specifications: {
      mileage: 25100,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 7,
      engine: '1.6L TDI',
      power: '150 HP',
      fuelCapacity: 50
    },
    price: { amount: 498.25, currency: 'USD', per: 'day' },
    image: 'assets/images/audi3.png',
    features: ['GPS Navigation', 'Air Conditioning', 'Bluetooth', 'USB Port'],
    isRecentLaunch: true,
    availability: true,
    rating: { score: 4.96, reviews: 672 },
    year: 2024,
    color: 'Yellow',
    condition: 'New'
  },
  // Card 4 – Audi (New South Wales, Australia)
  {
    model: 'Audi A3 1.6 TDI S line',
    brand: 'Audi',
    location: {
      city: 'New South Wales',
      country: 'Australia',
      address: 'Sydney Airport Car Rental'
    },
    specifications: {
      mileage: 25100,
      transmission: 'Automatic',
      fuelType: 'Diesel',
      seats: 7,
      engine: '1.6L TDI',
      power: '150 HP',
      fuelCapacity: 50
    },
    price: { amount: 498.25, currency: 'USD', per: 'day' },
    image: 'assets/images/audi4.png',
    features: ['GPS Navigation', 'Air Conditioning', 'Bluetooth', 'USB Port'],
    isRecentLaunch: true,
    availability: true,
    rating: { score: 4.96, reviews: 672 },
    year: 2024,
    color: 'Grey',
    condition: 'New'
  }
];

const sampleActivities = [
  {
    title: 'Scuba Diving Adventure',
    category: 'Water Sports',
    location: {
      city: 'Bali',
      country: 'Indonesia',
      address: 'Tulamben Beach, Bali'
    },
    duration: { hours: 4, days: 0 },
    price: { amount: 85.00, currency: 'USD', per: 'person' },
    difficulty: 'Intermediate',
    minAge: 16,
    maxAge: 65,
    maxGroupSize: 8,
    minGroupSize: 2,
    included: ['Equipment', 'Instructor', 'Insurance', 'Transportation'],
    excluded: ['Lunch', 'Photos', 'Personal items'],
    requirements: ['Swimming ability', 'Medical certificate'],
    whatToBring: ['Swimsuit', 'Towel', 'Sunscreen'],
    rating: { score: 4.9, reviews: 342 },
    images: {
      main: 'assets/images/discover.png',
      gallery: []
    },
    description: 'Explore the underwater world of Bali with our professional scuba diving experience. See colorful coral reefs, tropical fish, and maybe even a sea turtle!',
    highlights: ['Coral reef exploration', 'Tropical fish spotting', 'Professional instruction', 'Small group size'],
    itinerary: [
      {
        time: '08:00',
        activity: 'Equipment briefing and safety instructions',
        description: 'Learn about scuba equipment and safety procedures'
      },
      {
        time: '09:00',
        activity: 'First dive session',
        description: 'Guided dive in shallow waters to practice skills'
      },
      {
        time: '11:00',
        activity: 'Break and refreshments',
        description: 'Rest period with light snacks and drinks'
      },
      {
        time: '12:00',
        activity: 'Second dive session',
        description: 'Deeper dive to explore coral reefs and marine life'
      }
    ],
    isPopular: true,
    isFeatured: false,
    availability: true,
    seasonality: {
      startMonth: 4,
      endMonth: 10
    },
    weatherDependent: true,
    cancellationPolicy: {
      freeCancellation: true,
      cancelBefore: 24
    }
  }
];

const sampleTickets = [
  {
    type: 'flight',
    departure: {
      location: 'New York (JFK)',
      code: 'JFK',
      dateTime: new Date('2024-12-01T08:30:00Z'),
      terminal: 'Terminal 4',
      gate: 'A12'
    },
    arrival: {
      location: 'London (LHR)',
      code: 'LHR',
      dateTime: new Date('2024-12-01T20:45:00Z'),
      terminal: 'Terminal 5',
      gate: 'B8'
    },
    provider: {
      name: 'British Airways',
      code: 'BA',
      logo: 'assets/images/travila_logo.png'
    },
    serviceDetails: {
      flightNumber: 'BA178',
      aircraft: 'Boeing 777-300ER'
    },
    class: 'Economy',
    price: { amount: 650.00, currency: 'USD', originalPrice: 750.00, discount: 13 },
    availableSeats: 45,
    totalSeats: 300,
    baggage: {
      cabin: '1 x 8kg',
      checked: '1 x 23kg',
      weightLimit: '23kg per bag'
    },
    amenities: ['In-flight entertainment', 'Meal service', 'WiFi', 'Power outlets'],
    restrictions: {
      refundable: false,
      changeable: true,
      transferable: false,
      cancellationFee: 150.00
    },
    duration: { hours: 7, minutes: 15 },
    stops: [],
    isAvailable: true,
    isFeatured: false,
    bookingDeadline: new Date('2024-11-30T23:59:59Z'),
    checkInDeadline: new Date('2024-12-01T06:30:00Z')
  }
];

// Seed function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Tour.deleteMany({}),
      Hotel.deleteMany({}),
      Car.deleteMany({}),
      Category.deleteMany({}),
      Activity.deleteMany({}),
      Ticket.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create categories
    const categories = await Category.insertMany(sampleCategories);
    console.log(`✅ Created ${categories.length} categories`);

    // Create tours
    const tours = await Tour.insertMany(sampleTours);
    console.log(`✅ Created ${tours.length} tours`);

    // Create hotels
    const hotels = await Hotel.insertMany(sampleHotels);
    console.log(`✅ Created ${hotels.length} hotels`);

    // Create cars
    const cars = await Car.insertMany(sampleCars);
    console.log(`✅ Created ${cars.length} cars`);

    // Create activities
    const activities = await Activity.insertMany(sampleActivities);
    console.log(`✅ Created ${activities.length} activities`);

    // Create tickets
    const tickets = await Ticket.insertMany(sampleTickets);
    console.log(`✅ Created ${tickets.length} tickets`);

    // Create a test user
    const testUser = new User({
      email: 'test@travila.com',
      password: 'Test123!',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        avatar: 'assets/images/user.png'
      },
      preferences: {
        currency: 'USD',
        language: 'en'
      },
      wishlist: [tours[0]._id, tours[1]._id],
      role: 'customer',
      isActive: true
    });

    await testUser.save();
    console.log('✅ Created test user (test@travila.com / Test123!)');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- Categories: ${categories.length}`);
    console.log(`- Tours: ${tours.length}`);
    console.log(`- Hotels: ${hotels.length}`);
    console.log(`- Cars: ${cars.length}`);
    console.log(`- Activities: ${activities.length}`);
    console.log(`- Tickets: ${tickets.length}`);
    console.log(`- Users: 1 (test user)`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run seeding
seedDatabase();