const express = require('express')
const router = express.Router({ mergeParams: true })
const Message = require('../models/Message')
const Room = require('../models/Room')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params

    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      })
    }

    const messages = await Message.find({ room: roomId })
      .populate('sender', 'name email')
      .sort({ createdAt: 1 })
      .limit(50)

    res.status(200).json({
      message: 'Messages fetched successfully',
      messages
    })

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { roomId } = req.params
    const { content, messageType, imageUrl } = req.body

    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      })
    }

    if (messageType !== 'image' && (!content || content.trim() === '')) {
      return res.status(400).json({
        message: 'Message content cannot be empty'
      })
    }

    const newMessage = new Message({
      content: content || '',
      sender: req.user.userId,
      room: roomId,
      messageType: messageType || 'text',
      imageUrl: imageUrl || ''
    })

    const savedMessage = await newMessage.save()

    const populatedMessage = await savedMessage
      .populate('sender', 'name email')

    res.status(201).json({
      message: 'Message sent successfully',
      message: populatedMessage
    })

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router