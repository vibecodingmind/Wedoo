import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

const weddingDate = new Date()
weddingDate.setMonth(weddingDate.getMonth() + 3)

export async function POST() {
  const existing = await db.wedding.count()
  if (existing > 0) {
    return NextResponse.json({ message: 'Data already seeded' })
  }

  // Create demo user
  const user = await db.user.create({
    data: {
      email: 'sarah@wedoo.com',
      name: 'Sarah Thompson',
      avatar: null,
      role: 'COUPLE',
    },
  })

  const wedding = await db.wedding.create({
    data: {
      name: 'Sarah & James',
      date: weddingDate,
      budget: 35000,
      status: 'PLANNING',
    },
  })

  const wid = wedding.id

  // Create wedding member link
  await db.weddingMember.create({
    data: {
      weddingId: wid,
      userId: user.id,
      role: 'COUPLE',
    },
  })

  await db.pledge.createMany({
    data: [
      { weddingId: wid, contributorName: 'Margaret Thompson', contributorEmail: 'margaret@email.com', amount: 5000, category: 'Venue', status: 'PAID', message: 'With love for your special day!' },
      { weddingId: wid, contributorName: 'Robert & Linda Chen', contributorEmail: 'robert@email.com', amount: 3000, category: 'Photography', status: 'PAID', message: '' },
      { weddingId: wid, contributorName: 'David Williams', contributorEmail: 'david@email.com', amount: 2000, category: 'Catering', status: 'PENDING', message: 'Happy for you both!' },
      { weddingId: wid, contributorName: 'Emily Carter', contributorEmail: 'emily@email.com', amount: 1500, category: 'Flowers', status: 'PAID', message: '' },
      { weddingId: wid, contributorName: 'Michael Brown', contributorEmail: 'michael@email.com', amount: 1000, category: 'Music', status: 'PENDING', message: 'Congratulations!' },
      { weddingId: wid, contributorName: 'Sophie Laurent', contributorEmail: 'sophie@email.com', amount: 2500, category: 'Venue', status: 'PAID', message: 'So excited for you!' },
      { weddingId: wid, contributorName: 'James Sr. Thompson', contributorEmail: 'james.sr@email.com', amount: 5000, category: 'Venue', status: 'PAID', message: '' },
      { weddingId: wid, contributorName: 'Anna Kowalski', contributorEmail: 'anna@email.com', amount: 800, category: 'Decor', status: 'PENDING', message: 'Wishing you joy!' },
      { weddingId: wid, contributorName: 'Thomas O\'Brien', contributorEmail: 'thomas@email.com', amount: 1200, category: 'Attire', status: 'CANCELLED', message: '' },
      { weddingId: wid, contributorName: 'Grace Nakamura', contributorEmail: 'grace@email.com', amount: 2000, category: 'Honeymoon', status: 'PENDING', message: 'For the honeymoon fund!' },
    ],
  })

  await db.budgetCategory.createMany({
    data: [
      { weddingId: wid, name: 'Venue', allocatedAmount: 8000, spentAmount: 7500 },
      { weddingId: wid, name: 'Catering', allocatedAmount: 7000, spentAmount: 4200 },
      { weddingId: wid, name: 'Photography', allocatedAmount: 4000, spentAmount: 3800 },
      { weddingId: wid, name: 'Flowers & Decor', allocatedAmount: 3500, spentAmount: 2100 },
      { weddingId: wid, name: 'Music & Entertainment', allocatedAmount: 3000, spentAmount: 1500 },
      { weddingId: wid, name: 'Attire', allocatedAmount: 3000, spentAmount: 2800 },
      { weddingId: wid, name: 'Stationery', allocatedAmount: 1500, spentAmount: 600 },
      { weddingId: wid, name: 'Transportation', allocatedAmount: 2000, spentAmount: 800 },
      { weddingId: wid, name: 'Miscellaneous', allocatedAmount: 3000, spentAmount: 1200 },
    ],
  })

  await db.guest.createMany({
    data: [
      { weddingId: wid, name: 'Margaret Thompson', email: 'margaret@email.com', phone: '+1-555-0101', rsvpStatus: 'ACCEPTED', tableNumber: 1, plusOne: true },
      { weddingId: wid, name: 'Robert Chen', email: 'robert@email.com', phone: '+1-555-0102', rsvpStatus: 'ACCEPTED', tableNumber: 1, plusOne: true, dietaryRestriction: 'Vegetarian' },
      { weddingId: wid, name: 'David Williams', email: 'david@email.com', phone: '+1-555-0103', rsvpStatus: 'ACCEPTED', tableNumber: 2, plusOne: false },
      { weddingId: wid, name: 'Emily Carter', email: 'emily@email.com', phone: '+1-555-0104', rsvpStatus: 'PENDING', tableNumber: null, plusOne: true },
      { weddingId: wid, name: 'Michael Brown', email: 'michael@email.com', rsvpStatus: 'DECLINED', tableNumber: null, plusOne: false },
      { weddingId: wid, name: 'Sophie Laurent', email: 'sophie@email.com', phone: '+1-555-0106', rsvpStatus: 'ACCEPTED', tableNumber: 3, plusOne: false, dietaryRestriction: 'Gluten-free' },
      { weddingId: wid, name: 'James Thompson Sr.', email: 'james.sr@email.com', phone: '+1-555-0107', rsvpStatus: 'ACCEPTED', tableNumber: 1, plusOne: true },
      { weddingId: wid, name: 'Anna Kowalski', email: 'anna@email.com', rsvpStatus: 'PENDING', tableNumber: null, plusOne: false },
      { weddingId: wid, name: 'Thomas O\'Brien', email: 'thomas@email.com', rsvpStatus: 'ACCEPTED', tableNumber: 2, plusOne: false },
      { weddingId: wid, name: 'Grace Nakamura', email: 'grace@email.com', phone: '+1-555-0110', rsvpStatus: 'ACCEPTED', tableNumber: 3, plusOne: true, dietaryRestriction: 'Vegan' },
      { weddingId: wid, name: 'Olivia Martinez', email: 'olivia@email.com', rsvpStatus: 'PENDING', tableNumber: null, plusOne: true },
      { weddingId: wid, name: 'Daniel Kim', email: 'daniel@email.com', rsvpStatus: 'ACCEPTED', tableNumber: 4, plusOne: false },
      { weddingId: wid, name: 'Rachel Green', email: 'rachel@email.com', rsvpStatus: 'ACCEPTED', tableNumber: 4, plusOne: true },
      { weddingId: wid, name: 'Lucas Anderson', email: 'lucas@email.com', rsvpStatus: 'DECLINED', tableNumber: null, plusOne: false },
      { weddingId: wid, name: 'Mia Johnson', email: 'mia@email.com', rsvpStatus: 'PENDING', tableNumber: null, plusOne: false },
      { weddingId: wid, name: 'Ethan Davis', email: 'ethan@email.com', rsvpStatus: 'ACCEPTED', tableNumber: 5, plusOne: true },
      { weddingId: wid, name: 'Isabella Wilson', email: 'isabella@email.com', rsvpStatus: 'PENDING', tableNumber: null, plusOne: false },
      { weddingId: wid, name: 'Aiden Taylor', email: 'aiden@email.com', rsvpStatus: 'ACCEPTED', tableNumber: 5, plusOne: false },
    ],
  })

  await db.vendor.createMany({
    data: [
      { name: 'The Grand Estate', category: 'Venue', description: 'Stunning 18th-century estate with manicured gardens and grand ballroom. Accommodates up to 300 guests.', priceRange: '$8,000 - $15,000', rating: 4.9, contactEmail: 'info@grandestate.com', website: 'grandestate.com' },
      { name: 'Bloom & Petal', category: 'Florist', description: 'Award-winning floral design studio specializing in romantic garden and modern minimalist arrangements.', priceRange: '$2,000 - $5,000', rating: 4.8, contactEmail: 'hello@bloompetal.com' },
      { name: 'Captured Moments', category: 'Photography', description: 'Award-winning wedding photography with a documentary style. Includes engagement shoot and full-day coverage.', priceRange: '$3,000 - $6,000', rating: 4.9, contactEmail: 'book@capturedmoments.com', website: 'capturedmoments.com' },
      { name: 'Golden Fork Catering', category: 'Catering', description: 'Farm-to-table catering featuring seasonal menus with international flair. Full bar service available.', priceRange: '$6,000 - $12,000', rating: 4.7, contactEmail: 'events@goldenfork.com' },
      { name: 'Harmony Strings Quartet', category: 'Music', description: 'Professional string quartet performing classical and contemporary pieces for ceremonies and receptions.', priceRange: '$1,500 - $3,000', rating: 4.6, contactEmail: 'booking@harmonystrings.com' },
      { name: 'Velvet & Lace Bridal', category: 'Attire', description: 'Bespoke bridal gowns and formal wear with personal styling consultations. Designer collections available.', priceRange: '$2,000 - $8,000', rating: 4.8, contactEmail: 'studio@velvetlace.com' },
      { name: 'Paper & Bloom Co.', category: 'Stationery', description: 'Luxury wedding stationery including invitations, programs, menus, and place cards. Letterpress and foil options.', priceRange: '$500 - $2,000', rating: 4.5, contactEmail: 'hello@paperbloom.com' },
      { name: 'Elegant Rides', category: 'Transportation', description: 'Vintage and luxury vehicle fleet for wedding transportation. Includes Rolls Royce, Bentley, and classic cars.', priceRange: '$800 - $2,500', rating: 4.7, contactEmail: 'reservations@elegantrides.com' },
      { name: 'DJ Nova', category: 'Entertainment', description: 'Professional DJ and MC services with state-of-the-art sound and lighting. Custom playlists welcome.', priceRange: '$1,200 - $2,500', rating: 4.4, contactEmail: 'parties@djnova.com' },
      { name: 'Sweet Layers Bakery', category: 'Catering', description: 'Artisan wedding cakes and dessert tables. Custom flavors, dietary options, and sugar flower artistry.', priceRange: '$500 - $2,000', rating: 4.9, contactEmail: 'orders@sweetlayers.com' },
    ],
  })

  const msgDate = new Date()
  await db.message.createMany({
    data: [
      { weddingId: wid, channelName: 'General', senderName: 'Sarah', content: 'Hey everyone! The venue tour is confirmed for next Saturday at 2pm.', createdAt: new Date(msgDate.getTime() - 86400000 * 3) },
      { weddingId: wid, channelName: 'General', senderName: 'James', content: 'Perfect! I\'ll book the car. Should we invite the florist too?', createdAt: new Date(msgDate.getTime() - 86400000 * 3 + 3600000) },
      { weddingId: wid, channelName: 'General', senderName: 'Sarah', content: 'Great idea! Let me coordinate with Bloom & Petal.', createdAt: new Date(msgDate.getTime() - 86400000 * 3 + 7200000) },
      { weddingId: wid, channelName: 'Wedding Party', senderName: 'Emily', content: 'Bridesmaids! Dress fitting this Thursday at 5pm. Don\'t forget!', createdAt: new Date(msgDate.getTime() - 86400000 * 2) },
      { weddingId: wid, channelName: 'Wedding Party', senderName: 'Rachel', content: 'Got it! Can\'t wait to see the dresses!', createdAt: new Date(msgDate.getTime() - 86400000 * 2 + 1800000) },
      { weddingId: wid, channelName: 'Vendors', senderName: 'Sarah', content: 'Hi everyone! Quick update on the timeline for the big day.', createdAt: new Date(msgDate.getTime() - 86400000) },
      { weddingId: wid, channelName: 'Vendors', senderName: 'Captured Moments', content: 'Thank you! We\'ll have our second shooter ready by 1pm for prep photos.', createdAt: new Date(msgDate.getTime() - 86400000 + 3600000) },
      { weddingId: wid, channelName: 'Family', senderName: 'Margaret', content: 'Sarah dear, your Aunt Helen wants to know if she can bring her famous pie!', createdAt: new Date(msgDate.getTime() - 3600000 * 5) },
      { weddingId: wid, channelName: 'Family', senderName: 'Sarah', content: 'Of course! The more food the better! Love to Aunt Helen!', createdAt: new Date(msgDate.getTime() - 3600000 * 4) },
      { weddingId: wid, channelName: 'Family', senderName: 'James Sr.', content: 'I\'ve arranged the rehearsal dinner at Rivera\'s. Reservation for 20.', createdAt: new Date(msgDate.getTime() - 3600000 * 2) },
    ],
  })

  await db.notification.createMany({
    data: [
      { weddingId: wid, title: 'Pledge Received', message: 'Margaret Thompson pledged $5,000 for Venue', type: 'SUCCESS', read: true, createdAt: new Date(msgDate.getTime() - 86400000 * 5) },
      { weddingId: wid, title: 'RSVP Reminder', message: '5 guests have not yet responded to their invitation', type: 'WARNING', read: false, createdAt: new Date(msgDate.getTime() - 86400000 * 3) },
      { weddingId: wid, title: 'Budget Alert', message: 'Venue spending is at 94% of allocated budget', type: 'URGENT', read: false, createdAt: new Date(msgDate.getTime() - 86400000 * 2) },
      { weddingId: wid, title: 'Vendor Confirmed', message: 'Captured Moments has confirmed your booking', type: 'SUCCESS', read: true, createdAt: new Date(msgDate.getTime() - 86400000) },
      { weddingId: wid, title: 'New Message', message: 'Margaret posted in the Family channel', type: 'INFO', read: false, createdAt: new Date(msgDate.getTime() - 3600000 * 5) },
      { weddingId: wid, title: 'Countdown Update', message: 'Only 90 days until your wedding!', type: 'INFO', read: true, createdAt: new Date(msgDate.getTime() - 86400000 * 7) },
      { weddingId: wid, title: 'Dietary Note', message: 'Grace Nakamura noted a vegan dietary restriction', type: 'WARNING', read: false, createdAt: new Date(msgDate.getTime() - 3600000 * 10) },
      { weddingId: wid, title: 'Card Ready', message: 'Save the Date cards are ready for review', type: 'INFO', read: true, createdAt: new Date(msgDate.getTime() - 86400000 * 4) },
    ],
  })

  await db.card.createMany({
    data: [
      { weddingId: wid, type: 'SAVE_THE_DATE', title: 'Sarah & James', subtitle: 'Save the Date', designData: JSON.stringify({ template: 'blush', color: 'rose' }) },
      { weddingId: wid, type: 'INVITATION', title: 'You Are Invited', subtitle: 'Sarah & James request the pleasure of your company', designData: JSON.stringify({ template: 'classic', color: 'gold' }) },
      { weddingId: wid, type: 'THANK_YOU', title: 'Thank You', subtitle: 'Your presence made our day truly special', designData: JSON.stringify({ template: 'garden', color: 'sage' }) },
    ],
  })

  // Seed checklist items
  const now = new Date()
  await db.checklistItem.createMany({
    data: [
      { weddingId: wid, title: 'Set wedding date', category: 'General', dueDate: new Date(now.getTime() - 86400000 * 60), completed: true, order: 0 },
      { weddingId: wid, title: 'Book the venue', category: 'Venue', dueDate: new Date(now.getTime() - 86400000 * 45), completed: true, order: 1 },
      { weddingId: wid, title: 'Hire photographer', category: 'Photography', dueDate: new Date(now.getTime() - 86400000 * 30), completed: true, order: 2 },
      { weddingId: wid, title: 'Book catering service', category: 'Catering', dueDate: new Date(now.getTime() - 86400000 * 20), completed: true, order: 3 },
      { weddingId: wid, title: 'Order wedding cake', category: 'Catering', dueDate: new Date(now.getTime() - 86400000 * 14), completed: true, order: 4 },
      { weddingId: wid, title: 'Choose bridesmaid dresses', category: 'Attire', dueDate: new Date(now.getTime() - 86400000 * 10), completed: true, order: 5 },
      { weddingId: wid, title: 'Book florist and arrange centerpieces', category: 'Decor', dueDate: new Date(now.getTime() - 86400000 * 7), completed: false, order: 6 },
      { weddingId: wid, title: 'Finalize guest list', category: 'General', dueDate: new Date(now.getTime() - 86400000 * 5), completed: false, order: 7 },
      { weddingId: wid, title: 'Send save-the-date cards', category: 'Stationery', dueDate: new Date(now.getTime() - 86400000 * 3), completed: false, order: 8 },
      { weddingId: wid, title: 'Book transportation for wedding party', category: 'Transport', dueDate: new Date(now.getTime() + 86400000 * 3), completed: false, order: 9 },
      { weddingId: wid, title: 'Final dress fitting', category: 'Attire', dueDate: new Date(now.getTime() + 86400000 * 7), completed: false, order: 10 },
      { weddingId: wid, title: 'Book band or DJ for reception', category: 'Music', dueDate: new Date(now.getTime() + 86400000 * 10), completed: false, order: 11 },
      { weddingId: wid, title: 'Plan rehearsal dinner menu', category: 'Catering', dueDate: new Date(now.getTime() + 86400000 * 14), completed: false, order: 12 },
      { weddingId: wid, title: 'Create seating chart', category: 'Venue', dueDate: new Date(now.getTime() + 86400000 * 21), completed: false, order: 13 },
      { weddingId: wid, title: 'Send formal invitations', category: 'Stationery', dueDate: new Date(now.getTime() + 86400000 * 30), completed: false, order: 14 },
      { weddingId: wid, title: 'Final venue walkthrough', category: 'Venue', dueDate: new Date(now.getTime() + 86400000 * 60), completed: false, order: 15 },
      { weddingId: wid, title: 'Apply for marriage license', category: 'General', dueDate: new Date(now.getTime() + 86400000 * 70), completed: false, order: 16 },
      { weddingId: wid, title: 'Arrange honeymoon accommodations', category: 'General', dueDate: new Date(now.getTime() + 86400000 * 80), completed: false, order: 17 },
    ],
  })

  // Seed timeline events
  await db.timelineEvent.createMany({
    data: [
      { weddingId: wid, time: '14:00', title: 'Wedding Ceremony', description: 'Exchange of vows and rings in the garden pavilion', category: 'ceremony', sortOrder: 0 },
      { weddingId: wid, time: '15:00', title: 'Cocktail Hour', description: 'Welcome drinks and hors d\'oeuvres on the terrace', category: 'reception', sortOrder: 1 },
      { weddingId: wid, time: '16:00', title: 'Grand Entrance', description: 'Bride and groom announced into the ballroom', category: 'reception', sortOrder: 2 },
      { weddingId: wid, time: '16:15', title: 'First Dance', description: 'Bride and groom\'s first dance as a married couple', category: 'reception', sortOrder: 3 },
      { weddingId: wid, time: '16:30', title: 'Toasts', description: 'Best man and maid of honor speeches', category: 'reception', sortOrder: 4 },
      { weddingId: wid, time: '17:00', title: 'Dinner', description: 'Plated three-course dinner service begins', category: 'reception', sortOrder: 5 },
      { weddingId: wid, time: '18:30', title: 'Cake Cutting', description: 'Wedding cake cutting and dessert service', category: 'reception', sortOrder: 6 },
      { weddingId: wid, time: '19:00', title: 'Bouquet Toss', description: 'Traditional bouquet toss for all single guests', category: 'reception', sortOrder: 7 },
      { weddingId: wid, time: '19:30', title: 'Open Dance', description: 'Dance floor opens to all guests with DJ Nova', category: 'reception', sortOrder: 8 },
      { weddingId: wid, time: '22:00', title: 'Sparkler Send-Off', description: 'Grand exit through a sparkler tunnel', category: 'ceremony', sortOrder: 9 },
    ],
  })

  // Seed photos (using placeholder gradient colors)
  await db.photo.createMany({
    data: [
      { weddingId: wid, src: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)', caption: 'The Grand Estate - our dream venue with beautiful gardens', category: 'Venue' },
      { weddingId: wid, src: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)', caption: 'Garden ceremony setup with natural floral arch', category: 'Decor' },
      { weddingId: wid, src: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)', caption: 'Bridal gown and groom\'s tuxedo hanging ready', category: 'Attire' },
      { weddingId: wid, src: 'linear-gradient(135deg, #fce4ec 0%, #f3e5f5 50%, #e1bee7 100%)', caption: 'Tasting menu preview from Golden Fork Catering', category: 'Food' },
      { weddingId: wid, src: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)', caption: 'Color palette inspiration board - blush and gold', category: 'Inspiration' },
      { weddingId: wid, src: 'linear-gradient(135deg, #fbe9e7 0%, #ffccbc 50%, #ffab91 100%)', caption: 'Table centerpiece concept with candles and greenery', category: 'Decor' },
    ],
  })

  return NextResponse.json({ message: 'Database seeded successfully', weddingId: wid, userId: user.id })
}
