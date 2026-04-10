const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { body, validationResult } = require('express-validator')
const User = require('../models/User')

router.post('/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
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
      const { name, email, password } = req.body

      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          message: 'User with this email already exists'
        })
      }

      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      const newUser = new User({
        name,
        email,
        password: hashedPassword
      })

      const savedUser = await newUser.save()

      res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email
        }
      })

    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

router.post('/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
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
      const { email, password } = req.body

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({
          message: 'Invalid email or password'
        })
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password)
      if (!isPasswordCorrect) {
        return res.status(400).json({
          message: 'Invalid email or password'
        })
      }

      const token = jwt.sign(
        {
          userId: user._id,
          name: user.name
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '7d'
        }
      )

      res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      })

    } catch (error) {
      res.status(500).json({
        message: 'Server error',
        error: error.message
      })
    }
  }
)

module.exports = router