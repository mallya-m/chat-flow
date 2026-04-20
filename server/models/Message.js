const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    trim: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text'
  },
  imageUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
})

const Message = mongoose.model('Message', messageSchema)

module.exports = Message