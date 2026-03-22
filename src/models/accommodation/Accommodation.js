import mongoose from 'mongoose';

const roomTypeSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Single', 'Double', 'Shared', 'Studio'],
    // required: true,
  },
  capacity: { type: Number, default: 1 },
  totalRooms: { type: Number}, //, required: true 
  availableRooms: { type: Number}, //""
  pricePerMonth: { type: Number},  //""
});

const accommodationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      // required: [true, 'Title is required'],
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      // required: [true, 'Description is required'],
      maxlength: 3000,
    },
    type: {
      type: String,
      enum: ['Apartment', 'Room', 'Annex', 'Shared', 'House'],
      // required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },

    // LOCATION
    location: {
      lat: { type: Number }, //, required: true
      lng: { type: Number },  //""
      address: { type: String }, //""
      city: { type: String}, //""
      area: { type: String, default: '' },
    },

    // ROOM TYPES
    roomTypes: [roomTypeSchema],

    // PRICING
    pricing: {
      monthlyRent: { type: Number, default: 0 },
      deposit: { type: Number, default: 0 },
      keyMoney: { type: Number, default: 0 },
      billsIncluded: { type: Boolean, default: false },
      billsDescription: { type: String, default: '' },
    },
    price: { type: Number, default: 0 },

    // PROPERTY DETAILS
    totalBedrooms: { type: Number, default: 1 },
    totalBathrooms: { type: Number, default: 1 },
    maxOccupants: { type: Number, default: 1 },
    genderPreference: {
      type: String,
      enum: ['Any', 'Male', 'Female'],
      default: 'Any',
    },
    minimumPeriod: {
      type: String,
      enum: ['1 Month', '3 Months', '6 Months', '1 Year'],
      default: '6 Months',
    },

    // AMENITIES & FEATURES
    amenities: [{ type: String }],
    features: [{ type: String }],

    // IMAGES
    images: [{ type: String }],

    // STATUS - ADMIN APPROVAL
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Rejected', 'Inactive'],
      default: 'Pending',
    },

    // AVAILABILITY
    isAvailable: { type: Boolean, default: true },
    isDeactivated: { type: Boolean, default: false },

    // RATINGS
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    // ADMIN APPROVAL TRACKING
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
accommodationSchema.index({ status: 1, isAvailable: 1, isDeactivated: 1 });
accommodationSchema.index({ 'location.city': 1 });
accommodationSchema.index({ owner: 1 });
accommodationSchema.index({ price: 1 });

const Accommodation = mongoose.model('Accommodation', accommodationSchema);

export default Accommodation;