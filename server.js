require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { randomInt } = require('node:crypto');
const path = require('node:path');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB models
const catalogItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  itemId: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

catalogItemSchema.index({ category: 1, itemId: 1 }, { unique: true });
const CatalogItem = mongoose.model('CatalogItem', catalogItemSchema);

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  bookingType: { type: String, required: true },
  itemId: { type: String, required: true },
  itemName: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  roomCount: Number,
  totalCost: { type: Number, required: true },
  paymentAmountEntered: { type: Number, required: true },
  status: { type: String, required: true }
}, { timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true }
}, { timestamps: true });

const ContactMessage = mongoose.model('ContactMessage', messageSchema);

// Sample destinations
const destinations = [
  {
    id: 'paris',
    name: 'Paris',
    type: 'Place',
    country: 'France',
    description: 'Paris is known for its art, cafés, historic streets, and famous landmarks.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
    priceFrom: 250,
    popularPlaces: [
      {
        name: 'Eiffel Tower',
        description: 'Visit the famous tower and enjoy views across Paris.',
        exampleCost: '$20 per person (sample cost)',
        image: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris'
      },
      {
        name: 'Louvre Museum',
        description: 'Explore the famous museum and its art collections.',
        exampleCost: '$25 per person (sample cost)',
        image: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris'
      },
      {
        name: 'Arc de Triomphe',
        description: 'See the historic monument on the Champs-Élysées.',
        exampleCost: '$16 per person (sample cost)',
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Arc+de+Triomphe+Paris'
      }
    ]
  },
  {
    id: 'venice',
    name: 'Venice',
    type: 'Place',
    country: 'Italy',
    description: 'Discover Venice, known for its canals, historic buildings, and boat rides.',
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1200&q=80',
    priceFrom: 300,
    popularPlaces: [
      {
        name: 'St. Mark’s Basilica',
        description: 'See the ornate mosaics and architecture in Venice’s famous St. Mark’s Square.',
        exampleCost: 'From $0 per person (sample; some areas may require a ticket)',
        image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=St+Marks+Basilica+Venice'
      },
      {
        name: 'Doge’s Palace',
        description: 'Explore the historic palace and its grand rooms beside St. Mark’s Square.',
        exampleCost: '$30 per person (sample cost)',
        image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Doges+Palace+Venice'
      },
      {
        name: 'Grand Canal',
        description: 'Take in canal-side palaces and bridges from a vaporetto or a gondola ride.',
        exampleCost: '$10 per person by vaporetto (sample cost)',
        image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Grand+Canal+Venice'
      }
    ]
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    type: 'Place',
    country: 'Japan',
    description: 'Visit Kyoto for its temples, gardens, and traditional streets.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80',
    priceFrom: 400,
    popularPlaces: [
      {
        name: 'Fushimi Inari Taisha',
        description: 'Walk beneath the rows of red torii gates on the mountain paths.',
        exampleCost: 'Free entry (sample information)',
        image: 'https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Taisha+Kyoto'
      },
      {
        name: 'Kinkaku-ji',
        description: 'Visit Kyoto’s Golden Pavilion and its surrounding garden.',
        exampleCost: '$4 per person (sample cost)',
        image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Kinkakuji+Kyoto'
      },
      {
        name: 'Arashiyama Bamboo Grove',
        description: 'Stroll through the tall bamboo paths in the Arashiyama district.',
        exampleCost: 'Free entry (sample information)',
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Arashiyama+Bamboo+Grove+Kyoto'
      }
    ]
  },
  {
    id: 'bali',
    name: 'Bali',
    type: 'Place',
    country: 'Indonesia',
    description: 'Explore Bali’s beaches, waterfalls, green landscapes, and temples.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80',
    priceFrom: 220,
    popularPlaces: [
      {
        name: 'Uluwatu Temple',
        description: 'Visit the clifftop temple and enjoy views over the Indian Ocean.',
        exampleCost: '$3 per person (sample cost; transport not included)',
        image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Uluwatu+Temple+Bali'
      },
      {
        name: 'Tegallalang Rice Terraces',
        description: 'See Bali’s green rice terraces and walking paths near Ubud.',
        exampleCost: '$2 per person (sample cost)',
        image: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tegallalang+Rice+Terraces+Bali'
      },
      {
        name: 'Tegenungan Waterfall',
        description: 'Walk to a popular waterfall surrounded by tropical greenery.',
        exampleCost: '$2 per person (sample cost)',
        image: 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=800&q=80',
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tegenungan+Waterfall+Bali'
      }
    ]
  }
];

const hotels = [
  {
    id: 'ocean-view-bali',
    name: 'Ocean View Hotel',
    type: 'Hotel',
    country: 'Bali, Indonesia',
    description: 'A sample hotel near Bali’s coast with ocean views.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80',
    roomType: 'Deluxe Ocean View Room',
    availableRooms: 32,
    perNight: 150,
    facilities: ['Balcony: Available (private balcony)', 'One king-size bed', 'Private washroom', 'Air conditioning (AC)', 'Ceiling fan', 'Television (TV)', 'Table and chairs', 'Wi-Fi']
  },
  {
    id: 'grand-palace-paris',
    name: 'Grand Palace Hotel',
    type: 'Hotel',
    country: 'Paris, France',
    description: 'A sample hotel close to central Paris attractions.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80',
    roomType: 'Classic Double Room',
    availableRooms: 45,
    perNight: 220,
    facilities: ['Balcony: Not available', 'One double bed', 'Private washroom', 'Air conditioning (AC)', 'Fan', 'Television (TV)', 'Table and chairs', 'Wi-Fi']
  },
  {
    id: 'luxury-beach-resort',
    name: 'Luxury Beach Resort',
    type: 'Hotel',
    country: 'Maldives',
    description: 'A sample beach resort with rooms near the ocean.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=1200&q=80',
    roomImage: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80',
    roomType: 'Beach Villa',
    availableRooms: 20,
    perNight: 180,
    facilities: ['Balcony: Available (private balcony)', 'One king-size bed', 'Private washroom', 'Air conditioning (AC)', 'Ceiling fan', 'Television (TV)', 'Table and chairs', 'Wi-Fi']
  }
];

const flights = [
  {
    id: 'flight-mumbai-paris-01',
    airline: 'Pacific Air',
    from: 'Mumbai',
    to: 'Paris',
    connection: 'Dubai',
    stops: 1,
    duration: '13 hours 20 minutes',
    fare: 620
  },
  {
    id: 'flight-mumbai-paris-02',
    airline: 'Sky Journey',
    from: 'Mumbai',
    to: 'Paris',
    connection: 'Doha',
    stops: 1,
    duration: '12 hours 45 minutes',
    fare: 680
  },
  {
    id: 'flight-mumbai-bali-01',
    airline: 'Pacific Air',
    from: 'Mumbai',
    to: 'Bali',
    connection: 'Singapore',
    stops: 1,
    duration: '10 hours 30 minutes',
    fare: 410
  },
  {
    id: 'flight-mumbai-venice-01',
    airline: 'Pacific Air',
    from: 'Mumbai',
    to: 'Venice',
    connection: 'Doha',
    stops: 1,
    duration: '12 hours 10 minutes',
    fare: 590
  },
  {
    id: 'flight-mumbai-venice-02',
    airline: 'Sky Journey',
    from: 'Mumbai',
    to: 'Venice',
    connection: 'Istanbul',
    stops: 1,
    duration: '13 hours 5 minutes',
    fare: 640
  },
  {
    id: 'flight-mumbai-kyoto-01',
    airline: 'Pacific Air',
    from: 'Mumbai',
    to: 'Kyoto',
    connection: 'Tokyo',
    stops: 1,
    duration: '11 hours 50 minutes',
    fare: 720
  },
  {
    id: 'flight-mumbai-kyoto-02',
    airline: 'Sky Journey',
    from: 'Mumbai',
    to: 'Kyoto',
    connection: 'Singapore',
    stops: 1,
    duration: '12 hours 30 minutes',
    fare: 760
  }
];

const guides = [
  {
    id: 'guide-anna',
    name: 'Anna Williams',
    destination: 'Paris',
    languages: ['English', 'French'],
    rating: 4.8,
    experience: '5 years',
    about: 'Anna helps visitors discover Paris landmarks, cafés, art, and local neighborhoods.',
    howTheyWork: 'Plans a walking itinerary with you, guides you between nearby sights, and shares local history.',
    pricePerDay: 80,
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'guide-kenji',
    name: 'Kenji Sato',
    destination: 'Kyoto',
    languages: ['English', 'Japanese'],
    rating: 4.9,
    experience: '7 years',
    about: 'Kenji specializes in Kyoto temples, gardens, traditional streets, and local customs.',
    howTheyWork: 'Agrees on your interests first, then guides you by foot and public transport around Kyoto.',
    pricePerDay: 75,
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80'
  }
];

const packages = [
  {
    id: 'paris-day-tour',
    name: 'Paris Highlights Tour',
    destination: 'Paris',
    duration: '3 days',
    description: 'A sample city itinerary that groups well-known Paris sights by nearby areas.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1000&q=80',
    cost: 350,
    itinerary: [
      { day: 1, place: 'Eiffel Tower', description: 'Go up the landmark tower for views across Paris.', visitCost: 20, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Eiffel+Tower+Paris' },
      { day: 1, place: 'Champ de Mars', description: 'Walk in the open gardens beside the Eiffel Tower.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Champ+de+Mars+Paris' },
      { day: 1, place: 'Seine river walk', description: 'Take a riverside walk near central Paris landmarks.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Seine+River+Paris' },
      { day: 2, place: 'Louvre Museum', description: 'Explore the museum and its art collections.', visitCost: 25, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Louvre+Museum+Paris' },
      { day: 2, place: 'Tuileries Garden', description: 'Visit the gardens next to the Louvre.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tuileries+Garden+Paris' },
      { day: 3, place: 'Arc de Triomphe', description: 'See the historic monument at the end of the Champs-Élysées.', visitCost: 16, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Arc+de+Triomphe+Paris' },
      { day: 3, place: 'Champs-Élysées', description: 'Walk along the famous avenue and browse its shops.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Champs-Elysees+Paris' }
    ]
  },
  {
    id: 'venice-city-tour',
    name: 'Venice Canals and Old Town',
    destination: 'Venice',
    duration: '2 days',
    description: 'A sample two-day route through Venice’s central canals and historic sights.',
    image: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1000&q=80',
    cost: 280,
    itinerary: [
      { day: 1, place: 'St. Mark’s Basilica', description: 'Visit the famous basilica in St. Mark’s Square.', visitCost: 10, mapUrl: 'https://www.google.com/maps/search/?api=1&query=St+Mark%27s+Basilica+Venice' },
      { day: 1, place: 'Doge’s Palace', description: 'Explore the historic palace beside the basilica.', visitCost: 30, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Doge%27s+Palace+Venice' },
      { day: 1, place: 'Rialto Bridge', description: 'See the well-known bridge over the Grand Canal.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Rialto+Bridge+Venice' },
      { day: 2, place: 'Grand Canal vaporetto ride', description: 'Ride a public water bus along the Grand Canal.', visitCost: 10, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Grand+Canal+Venice' },
      { day: 2, place: 'Gallerie dell’Accademia', description: 'View Venetian art in the Accademia gallery.', visitCost: 15, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gallerie+dell%27Accademia+Venice' },
      { day: 2, place: 'Dorsoduro neighborhood', description: 'Walk through the canals and lanes of Dorsoduro.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Dorsoduro+Venice' }
    ]
  },
  {
    id: 'kyoto-culture-tour',
    name: 'Kyoto Temples and Traditional Streets',
    destination: 'Kyoto',
    duration: '3 days',
    description: 'A sample Kyoto itinerary arranged by nearby temple and neighborhood areas.',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80',
    cost: 320,
    itinerary: [
      { day: 1, place: 'Kiyomizu-dera', description: 'Visit the hillside temple and its viewing terrace.', visitCost: 4, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Kiyomizu-dera+Kyoto' },
      { day: 1, place: 'Sannenzaka and Ninenzaka', description: 'Walk the traditional lanes near Kiyomizu-dera.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Sannenzaka+Ninenzaka+Kyoto' },
      { day: 2, place: 'Fushimi Inari Taisha', description: 'Walk through the shrine gates and hillside paths.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Fushimi+Inari+Taisha+Kyoto' },
      { day: 3, place: 'Arashiyama Bamboo Grove', description: 'Walk among the bamboo paths in Arashiyama.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Arashiyama+Bamboo+Grove+Kyoto' },
      { day: 3, place: 'Tenryu-ji', description: 'Visit the temple and its garden near the bamboo grove.', visitCost: 5, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tenryu-ji+Kyoto' }
    ]
  },
  {
    id: 'bali-island-tour',
    name: 'Bali Temples and Nature',
    destination: 'Bali',
    duration: '3 days',
    description: 'A sample island route combining cultural, nature, and coastal stops.',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1000&q=80',
    cost: 300,
    itinerary: [
      { day: 1, place: 'Ubud Palace', description: 'See the historic palace in central Ubud.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ubud+Palace+Bali' },
      { day: 1, place: 'Ubud Art Market', description: 'Browse local crafts and market stalls nearby.', visitCost: 0, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Ubud+Art+Market+Bali' },
      { day: 2, place: 'Tegallalang Rice Terraces', description: 'Visit the rice terraces and nearby viewpoints.', visitCost: 3, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Tegallalang+Rice+Terraces+Bali' },
      { day: 3, place: 'Uluwatu Temple', description: 'Visit the coastal temple and its surrounding viewpoints.', visitCost: 5, mapUrl: 'https://www.google.com/maps/search/?api=1&query=Uluwatu+Temple+Bali' }
    ]
  }
];

async function seedCatalog() {
  const groups = [
    ['destinations', destinations],
    ['hotels', hotels],
    ['flights', flights],
    ['guides', guides],
    ['packages', packages]
  ];

  const operations = groups.flatMap(([category, items]) => items.map((item) => ({
    updateOne: {
      filter: { category, itemId: String(item.id) },
      update: { $setOnInsert: { category, itemId: String(item.id), data: item } },
      upsert: true
    }
  })));

  if (operations.length) await CatalogItem.bulkWrite(operations);
}

function searchCatalog(items, query, fields) {
  const search = String(query || '').trim().toLowerCase();
  if (!search) return [];

  return items
    .filter((item) => fields(item.data).toLowerCase().includes(search))
    .map((item) => item.data);
}

let databaseReady;

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return;
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured.');
  }
  if (!databaseReady) {
    databaseReady = mongoose.connect(process.env.MONGODB_URI)
      .then(seedCatalog)
      .catch((error) => {
        databaseReady = undefined;
        throw error;
      });
  }
  await databaseReady;
}

app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    res.status(503).json({
      ok: false,
      database: 'disconnected',
      message: 'The database is temporarily unavailable.'
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: mongoose.connection.readyState === 1,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'Backend is running.'
  });
});

app.get('/api/destinations', async (req, res) => {
  const items = await CatalogItem.find({
    category: { $in: ['destinations', 'hotels'] }
  }).lean();

  const results = searchCatalog(items, req.query.q, (item) =>
    `${item.name || ''} ${item.type || ''} ${item.country || ''}`
  );

  res.json({ results });
});

app.get('/api/flights', async (req, res) => {
  const items = await CatalogItem.find({ category: 'flights' }).lean();

  const results = searchCatalog(items, req.query.q, (flight) =>
    `${flight.from || ''} ${flight.to || ''} ${flight.connection || ''}`
  );

  res.json({ results });
});

app.get('/api/guides', async (req, res) => {
  const items = await CatalogItem.find({ category: 'guides' }).lean();

  const results = searchCatalog(items, req.query.q, (guide) =>
    `${guide.name || ''} ${guide.destination || ''} ${(guide.languages || []).join(' ')}`
  );

  res.json({ results });
});

app.get('/api/packages', async (req, res) => {
  const items = await CatalogItem.find({ category: 'packages' }).lean();

  const results = searchCatalog(items, req.query.q, (tour) =>
    `${tour.name || ''} ${tour.destination || ''}`
  );

  res.json({ results });
});

app.get('/api/hotels', async (req, res) => {
  const items = await CatalogItem.find({ category: 'hotels' }).lean();

  const results = searchCatalog(items, req.query.q, (hotel) =>
    `${hotel.name || ''} ${hotel.country || ''}`
  );

  res.json({ results });
});

// Demo booking endpoint. It stores the booking, but does not process payment.
app.post('/api/bookings', async (req, res) => {
  const {
    bookingType,
    itemId,
    name,
    email,
    aadharNumber,
    fromDate,
    toDate,
    paymentAmount,
    roomCount
  } = req.body;

  if (
    !bookingType ||
    !itemId ||
    !name ||
    !email ||
    !aadharNumber ||
    !fromDate ||
    !toDate ||
    paymentAmount === undefined
  ) {
    return res.status(400).json({
      error: 'Please fill in all required booking fields.'
    });
  }

  if (!/^\d{12}$/.test(String(aadharNumber))) {
    return res.status(400).json({
      error: 'Enter any 12-digit number in the Aadhaar field.'
    });
  }

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!validEmail) {
    return res.status(400).json({
      error: 'Please enter a valid email address.'
    });
  }

  const amountEntered = Number(paymentAmount);

  if (!Number.isFinite(amountEntered) || amountEntered < 0) {
    return res.status(400).json({
      error: 'Enter a valid payment amount number.'
    });
  }

  const start = new Date(fromDate);
  const end = new Date(toDate);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return res.status(400).json({
      error: 'Enter valid dates. The end date must be after the start date.'
    });
  }

  const normalizedType = String(bookingType).toLowerCase();

  const categoryByType = {
    flight: 'flights',
    hotel: 'hotels',
    package: 'packages',
    guide: 'guides'
  };

  const category = categoryByType[normalizedType];

  if (!category) {
    return res.status(400).json({
      error: 'That booking type is not supported.'
    });
  }

  const catalogEntry = await CatalogItem.findOne({
    category,
    itemId: String(itemId)
  }).lean();

  const item = catalogEntry && catalogEntry.data;

  if (!item) {
    return res.status(404).json({
      error: 'The selected option was not found.'
    });
  }

  const numberOfDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  );

  const requestedRoomCount = roomCount === undefined ? 1 : Number(roomCount);

  if (
    normalizedType === 'hotel' &&
    (!Number.isInteger(requestedRoomCount) ||
      requestedRoomCount < 1 ||
      requestedRoomCount > Number(item.availableRooms || 0))
  ) {
    return res.status(400).json({
      error: `Choose between 1 and ${item.availableRooms} rooms.`
    });
  }

  let totalCost;

  if (normalizedType === 'hotel') {
    totalCost = item.perNight * numberOfDays * requestedRoomCount;
  } else if (normalizedType === 'guide') {
    totalCost = item.pricePerDay * numberOfDays;
  } else if (normalizedType === 'package') {
    totalCost = item.cost;
  } else {
    totalCost = item.fare;
  }

  let bookingId;

  do {
    bookingId = String(randomInt(100000, 1000000));
  } while (await Booking.exists({ bookingId }));

  const booking = {
    bookingId,
    bookingType: normalizedType,
    itemId: item.id,
    itemName: item.name || `${item.from} to ${item.to}`,
    name: name.trim(),
    email: email.trim(),
    fromDate,
    toDate,
    ...(normalizedType === 'hotel' && { roomCount: requestedRoomCount }),
    totalCost,
    paymentAmountEntered: amountEntered,
    status: 'Demo booking confirmed',
    createdAt: new Date()
  };

  // The Aadhaar number is checked but not saved.
  const savedBooking = await Booking.create(booking);

  res.status(201).json({
    ok: true,
    message: 'Demo booking confirmed successfully. No real payment was processed.',
    booking: savedBooking.toObject()
  });
});

app.post('/api/messages', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      error: 'Please fill in every field.'
    });
  }

  await ContactMessage.create({
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim()
  });

  res.status(201).json({
    ok: true,
    message: 'Thanks! Your message has been received.'
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDatabase();
    console.log('Connected to MongoDB Atlas');
    console.log('Catalog data is ready in MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`Website running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Could not start the website:', error.message);
  }
}

module.exports = app;

if (require.main === module) {
  startServer();
}
