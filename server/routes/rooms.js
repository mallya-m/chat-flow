const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const Room = require('../models/Room')
const authMiddleware = require('../middleware/authMiddleware')
const messageRoutes = require('./messages')

router.use('/:roomId/messages', messageRoutes)

router.post('/',
  authMiddleware,
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Room name is required'),
    body('description')
      .optional()
      .trim()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      })
    }

    try {
      const { name, description } = req.body

      const existingRoom = await Room.findOne({ name })
      if (existingRoom) {
        return res.status(400).json({
          message: 'A room with this name already exists'
        })
      }

      const newRoom = new Room({
        name,
        description,
        createdBy: req.user.userId,
        members: [req.user.userId]
      })

      const savedRoom = await newRoom.save()

      res.status(201).json({
        message: 'Room created successfully',
        room: savedRoom
      })

    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

router.get('/', authMiddleware, async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    res.status(200).json({
      message: 'Rooms fetched successfully',
      rooms
    })

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('createdBy', 'name email')

    if (!room) {
      return res.status(404).json({
        message: 'Room not found'
      })
    }

    res.status(200).json({
      message: 'Room fetched successfully',
      room
    })

  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
})

module.exports = router