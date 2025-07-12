import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1,
    max: 20
  },
  tableNumber: {
    type: Number
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  occasion: {
    type: String,
    enum: ['birthday', 'anniversary', 'business', 'date', 'family', 'other']
  },
  seatingPreference: {
    type: String,
    enum: ['indoor', 'outdoor', 'window', 'private', 'bar', 'no-preference'],
    default: 'no-preference'
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  confirmationCode: {
    type: String,
    unique: true
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate confirmation code before saving
reservationSchema.pre('save', function(next) {
  if (!this.confirmationCode) {
    this.confirmationCode = Math.random().toString(36).substr(2, 8).toUpperCase();
  }
  next();
});

export default mongoose.model('Reservation', reservationSchema);