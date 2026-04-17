import { db } from '@/lib/db'

async function main() {
  // Create default wedding
  const weddingDate = new Date()
  weddingDate.setMonth(weddingDate.getMonth() + 3)

  const wedding = await db.wedding.create({
    data: {
      name: 'Sarah & James Wedding',
      date: weddingDate,
      budget: 35000,
      status: 'PLANNING',
    },
  })

  // Create pledges
  await db.pledge.createMany({
    data: [
      { weddingId: wedding.id, contributorName: 'Emily Thompson', contributorEmail: 'emily@example.com', amount: 500, category: 'Gift', status: 'PAID', message: 'Wishing you both a lifetime of happiness!' },
      { weddingId: wedding.id, contributorName: 'Michael Chen', contributorEmail: 'michael@example.com', amount: 250, category: 'Honeymoon Fund', status: 'PAID', message: 'For your adventure together!' },
      { weddingId: wedding.id, contributorName: 'Sophia Rodriguez', contributorEmail: 'sophia@example.com', amount: 1000, category: 'Venue', status: 'PAID', message: 'Love you both so much!' },
      { weddingId: wedding.id, contributorName: 'David Park', contributorEmail: 'david@example.com', amount: 150, category: 'Gift', status: 'PENDING', message: 'Congratulations!' },
      { weddingId: wedding.id, contributorName: 'Olivia Brown', contributorEmail: 'olivia@example.com', amount: 300, category: 'Catering', status: 'PENDING', message: 'So excited for your big day!' },
      { weddingId: wedding.id, contributorName: 'James Wilson', contributorEmail: 'james@example.com', amount: 200, category: 'Honeymoon Fund', status: 'PENDING', message: 'Have an amazing honeymoon!' },
      { weddingId: wedding.id, contributorName: 'Ava Martinez', contributorEmail: 'ava@example.com', amount: 400, category: 'Photography', status: 'PAID', message: 'Capture every beautiful moment!' },
      { weddingId: wedding.id, contributorName: 'Lucas Taylor', contributorEmail: 'lucas@example.com', amount: 75, category: 'Gift', status: 'CANCELLED', message: 'Sorry, cannot make it.' },
      { weddingId: wedding.id, contributorName: 'Isabella Lee', contributorEmail: 'isabella@example.com', amount: 350, category: 'Flowers', status: 'PENDING', message: 'Best wishes to the happy couple!' },
      { weddingId: wedding.id, contributorName: 'Ethan Anderson', contributorEmail: 'ethan@example.com', amount: 600, category: 'Gift', status: 'PAID', message: 'You two are perfect together!' },
    ],
  })

  // Create budget categories
  await db.budgetCategory.createMany({
    data: [
      { weddingId: wedding.id, name: 'Venue & Reception', allocatedAmount: 10000, spentAmount: 8500 },
      { weddingId: wedding.id, name: 'Catering & Bar', allocatedAmount: 8000, spentAmount: 6000 },
      { weddingId: wedding.id, name: 'Photography & Video', allocatedAmount: 4000, spentAmount: 3500 },
      { weddingId: wedding.id, name: 'Flowers & Decor', allocatedAmount: 3000, spentAmount: 2200 },
      { weddingId: wedding.id, name: 'Music & Entertainment', allocatedAmount: 2500, spentAmount: 1800 },
      { weddingId: wedding.id, name: 'Wedding Attire', allocatedAmount: 3500, spentAmount: 3000 },
      { weddingId: wedding.id, name: 'Stationery & Invitations', allocatedAmount: 1500, spentAmount: 900 },
      { weddingId: wedding.id, name: 'Transportation', allocatedAmount: 2000, spentAmount: 1200 },
    ],
  })

  // Create guests
  await db.guest.createMany({
    data: [
      { weddingId: wedding.id, name: 'Emily Thompson', email: 'emily@example.com', phone: '+1-555-0101', dietaryRestriction: 'Vegetarian', rsvpStatus: 'ACCEPTED', tableNumber: 1, plusOne: true },
      { weddingId: wedding.id, name: 'Michael Chen', email: 'michael@example.com', phone: '+1-555-0102', dietaryRestriction: null, rsvpStatus: 'ACCEPTED', tableNumber: 1, plusOne: false },
      { weddingId: wedding.id, name: 'Sophia Rodriguez', email: 'sophia@example.com', phone: '+1-555-0103', dietaryRestriction: 'Gluten-free', rsvpStatus: 'ACCEPTED', tableNumber: 2, plusOne: true },
      { weddingId: wedding.id, name: 'David Park', email: 'david@example.com', phone: '+1-555-0104', dietaryRestriction: null, rsvpStatus: 'PENDING', tableNumber: null, plusOne: false },
      { weddingId: wedding.id, name: 'Olivia Brown', email: 'olivia@example.com', phone: '+1-555-0105', dietaryRestriction: 'Vegan', rsvpStatus: 'ACCEPTED', tableNumber: 3, plusOne: true },
      { weddingId: wedding.id, name: 'James Wilson', email: 'james@example.com', phone: '+1-555-0106', dietaryRestriction: null, rsvpStatus: 'DECLINED', tableNumber: null, plusOne: false },
      { weddingId: wedding.id, name: 'Ava Martinez', email: 'ava@example.com', phone: '+1-555-0107', dietaryRestriction: 'Nut allergy', rsvpStatus: 'ACCEPTED', tableNumber: 3, plusOne: false },
      { weddingId: wedding.id, name: 'Lucas Taylor', email: 'lucas@example.com', phone: '+1-555-0108', dietaryRestriction: null, rsvpStatus: 'PENDING', tableNumber: null, plusOne: true },
      { weddingId: wedding.id, name: 'Isabella Lee', email: 'isabella@example.com', phone: '+1-555-0109', dietaryRestriction: 'Vegetarian', rsvpStatus: 'ACCEPTED', tableNumber: 4, plusOne: false },
      { weddingId: wedding.id, name: 'Ethan Anderson', email: 'ethan@example.com', phone: '+1-555-0110', dietaryRestriction: null, rsvpStatus: 'ACCEPTED', tableNumber: 4, plusOne: true },
      { weddingId: wedding.id, name: 'Mia Johnson', email: 'mia@example.com', phone: '+1-555-0111', dietaryRestriction: 'Lactose-free', rsvpStatus: 'PENDING', tableNumber: null, plusOne: false },
      { weddingId: wedding.id, name: 'Noah Williams', email: 'noah@example.com', phone: '+1-555-0112', dietaryRestriction: null, rsvpStatus: 'ACCEPTED', tableNumber: 2, plusOne: true },
      { weddingId: wedding.id, name: 'Charlotte Davis', email: 'charlotte@example.com', phone: '+1-555-0113', dietaryRestriction: 'Pescatarian', rsvpStatus: 'DECLINED', tableNumber: null, plusOne: false },
      { weddingId: wedding.id, name: 'Benjamin Garcia', email: 'benjamin@example.com', phone: '+1-555-0114', dietaryRestriction: null, rsvpStatus: 'ACCEPTED', tableNumber: 5, plusOne: false },
      { weddingId: wedding.id, name: 'Amelia Miller', email: 'amelia@example.com', phone: '+1-555-0115', dietaryRestriction: 'Vegetarian', rsvpStatus: 'PENDING', tableNumber: null, plusOne: true },
      { weddingId: wedding.id, name: 'William Thomas', email: 'william@example.com', phone: '+1-555-0116', dietaryRestriction: null, rsvpStatus: 'ACCEPTED', tableNumber: 5, plusOne: true },
      { weddingId: wedding.id, name: 'Harper White', email: 'harper@example.com', phone: '+1-555-0117', dietaryRestriction: null, rsvpStatus: 'ACCEPTED', tableNumber: 1, plusOne: false },
      { weddingId: wedding.id, name: 'Alexander Harris', email: 'alex@example.com', phone: '+1-555-0118', dietaryRestriction: 'Gluten-free', rsvpStatus: 'PENDING', tableNumber: null, plusOne: false },
      { weddingId: wedding.id, name: 'Evelyn Clark', email: 'evelyn@example.com', phone: '+1-555-0119', dietaryRestriction: null, rsvpStatus: 'DECLINED', tableNumber: null, plusOne: false },
      { weddingId: wedding.id, name: 'Henry Lewis', email: 'henry@example.com', phone: '+1-555-0120', dietaryRestriction: 'Halal', rsvpStatus: 'ACCEPTED', tableNumber: 2, plusOne: false },
    ],
  })

  // Create vendors
  await db.vendor.createMany({
    data: [
      { name: 'Rosewood Estate', category: 'Venue', description: 'A breathtaking outdoor venue with manicured gardens, a grand ballroom, and panoramic mountain views. Perfect for both ceremonies and receptions.', priceRange: '$8,000 - $15,000', rating: 4.8, contactEmail: 'info@rosewoodestate.com', website: 'www.rosewoodestate.com' },
      { name: 'Golden Palate Catering', category: 'Catering', description: 'Award-winning catering service specializing in farm-to-table cuisine. Custom menus with local, seasonal ingredients.', priceRange: '$5,000 - $12,000', rating: 4.9, contactEmail: 'hello@goldenpalate.com', website: 'www.goldenpalate.com' },
      { name: 'Lens & Light Studio', category: 'Photography', description: 'Cinematic wedding photography and videography. We capture the authentic emotions and fleeting moments of your special day.', priceRange: '$3,000 - $7,000', rating: 4.7, contactEmail: 'book@lensandlight.com', website: 'www.lensandlight.com' },
      { name: 'Petal & Bloom', category: 'Florist', description: 'Luxury floral design for weddings and events. From bridal bouquets to grand floral installations, we bring your vision to life.', priceRange: '$2,000 - $6,000', rating: 4.6, contactEmail: 'hello@petalandbloom.com', website: 'www.petalandbloom.com' },
      { name: 'Harmony Strings Quartet', category: 'Music', description: 'Elegant live music for your ceremony and reception. Classical, jazz, and contemporary arrangements by professional musicians.', priceRange: '$1,500 - $4,000', rating: 4.9, contactEmail: 'book@harmonystrings.com', website: 'www.harmonystrings.com' },
      { name: 'DJ Groove Masters', category: 'Entertainment', description: 'High-energy DJ and MC services to keep your dance floor packed all night. Custom playlists and lighting packages available.', priceRange: '$1,000 - $3,500', rating: 4.5, contactEmail: 'party@djgroovemasters.com', website: 'www.djgroovemasters.com' },
      { name: 'Sweet Layers Bakery', category: 'Catering', description: 'Artisan wedding cakes and dessert tables. Custom flavors, dietary options, and stunning designs crafted with love.', priceRange: '$500 - $2,500', rating: 4.8, contactEmail: 'orders@sweetlayers.com', website: 'www.sweetlayers.com' },
      { name: 'The Grand Atrium', category: 'Venue', description: 'An elegant indoor venue with soaring glass ceilings, marble floors, and sophisticated ambiance for unforgettable celebrations.', priceRange: '$10,000 - $20,000', rating: 4.7, contactEmail: 'events@thegrandatrium.com', website: 'www.thegrandatrium.com' },
      { name: 'Captured Moments Co.', category: 'Photography', description: 'Documentary-style wedding photography that tells your unique love story. Engagement shoots included in all packages.', priceRange: '$2,500 - $5,000', rating: 4.4, contactEmail: 'hello@capturedmoments.co', website: 'www.capturedmoments.co' },
      { name: 'Garden Grace Florals', category: 'Florist', description: 'Romantic and whimsical floral designs. We specialize in garden-style arrangements using locally sourced blooms.', priceRange: '$1,500 - $4,000', rating: 4.6, contactEmail: 'info@gardengrace.com', website: 'www.gardengrace.com' },
    ],
  })

  // Create messages
  const now = new Date()
  const hour = (h: number) => {
    const d = new Date(now)
    d.setHours(d.getHours() - h)
    return d
  }

  await db.message.createMany({
    data: [
      { weddingId: wedding.id, channelName: 'General', senderName: 'Sarah', content: "Hey everyone! Just confirmed the venue deposit 💕", createdAt: hour(24) },
      { weddingId: wedding.id, channelName: 'General', senderName: 'James', content: "That's amazing! Can't wait for the big day!", createdAt: hour(23) },
      { weddingId: wedding.id, channelName: 'General', senderName: 'Emily', content: "I'm so excited! Do you need any help with decorations?", createdAt: hour(20) },
      { weddingId: wedding.id, channelName: 'General', senderName: 'Sarah', content: "That would be wonderful, Emily! Let's chat this weekend 🌸", createdAt: hour(19) },
      { weddingId: wedding.id, channelName: 'Wedding Party', senderName: 'Sarah', content: "Bridesmaids, the dress fitting is scheduled for next Saturday at 2pm!", createdAt: hour(48) },
      { weddingId: wedding.id, channelName: 'Wedding Party', senderName: 'Sophia', content: "Perfect! I'll be there. Can't wait to try on the dresses!", createdAt: hour(47) },
      { weddingId: wedding.id, channelName: 'Wedding Party', senderName: 'Olivia', content: "Same here! Should I bring anything?", createdAt: hour(46) },
      { weddingId: wedding.id, channelName: 'Wedding Party', senderName: 'Sarah', content: "Just bring your excitement and maybe a coffee ☕", createdAt: hour(45) },
      { weddingId: wedding.id, channelName: 'Vendors', senderName: 'Sarah', content: "Hi! Quick question about the catering timeline for the reception.", createdAt: hour(72) },
      { weddingId: wedding.id, channelName: 'Vendors', senderName: 'Golden Palate', content: "Of course! We typically arrive 3 hours before service. I'll send a detailed timeline.", createdAt: hour(71) },
      { weddingId: wedding.id, channelName: 'Family', senderName: 'Mom (Linda)', content: "Sarah, don't forget to invite Uncle Robert and Aunt Martha!", createdAt: hour(96) },
      { weddingId: wedding.id, channelName: 'Family', senderName: 'Sarah', content: "Already done, Mom! They RSVP'd yes with a plus one! 💕", createdAt: hour(95) },
      { weddingId: wedding.id, channelName: 'Family', senderName: 'Dad (Robert)', content: "Looking forward to walking you down the aisle, sweetheart.", createdAt: hour(90) },
    ],
  })

  // Create notifications
  await db.notification.createMany({
    data: [
      { weddingId: wedding.id, title: 'RSVP Deadline Approaching', message: 'You have 5 guests who haven\'t responded to their invitations. Follow up before the deadline!', type: 'WARNING', read: false, createdAt: hour(2) },
      { weddingId: wedding.id, title: 'Payment Received', message: 'Emily Thompson\'s pledge of $500 has been received and confirmed.', type: 'SUCCESS', read: false, createdAt: hour(5) },
      { weddingId: wedding.id, title: 'Venue Contract Signed', message: 'The contract with Rosewood Estate has been signed. Deposit of $2,500 processed.', type: 'SUCCESS', read: true, createdAt: hour(24) },
      { weddingId: wedding.id, title: 'Budget Alert', message: 'Photography & Video spending is at 87.5% of allocated budget. Review remaining expenses.', type: 'WARNING', read: false, createdAt: hour(12) },
      { weddingId: wedding.id, title: 'New RSVP Received', message: 'Benjamin Garcia has accepted the invitation and will be attending with a plus one.', type: 'INFO', read: true, createdAt: hour(18) },
      { weddingId: wedding.id, title: 'Catering Menu Due', message: 'Final menu selections for Golden Palate are due in 5 days. Please confirm dietary requirements.', type: 'URGENT', read: false, createdAt: hour(1) },
      { weddingId: wedding.id, title: 'Dress Fitting Reminder', message: 'Bridesmaids dress fitting is scheduled for Saturday at 2pm at Bella Bridal Studio.', type: 'INFO', read: true, createdAt: hour(48) },
      { weddingId: wedding.id, title: 'Pledge Cancelled', message: 'Lucas Taylor has cancelled their pledge of $75.', type: 'WARNING', read: true, createdAt: hour(36) },
    ],
  })

  // Create cards
  await db.card.createMany({
    data: [
      {
        weddingId: wedding.id,
        type: 'SAVE_THE_DATE',
        title: 'Sarah & James',
        subtitle: 'Save the Date',
        designData: JSON.stringify({ template: 'floral', color: 'rose', date: weddingDate.toISOString() }),
      },
      {
        weddingId: wedding.id,
        type: 'INVITATION',
        title: 'Sarah & James',
        subtitle: 'You Are Invited',
        designData: JSON.stringify({ template: 'elegant', color: 'gold', date: weddingDate.toISOString(), venue: 'Rosewood Estate' }),
      },
      {
        weddingId: wedding.id,
        type: 'THANK_YOU',
        title: 'Thank You',
        subtitle: 'From Sarah & James',
        designData: JSON.stringify({ template: 'minimal', color: 'sage' }),
      },
    ],
  })

  console.log('Seed data created successfully!')
  console.log('Wedding ID:', wedding.id)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
