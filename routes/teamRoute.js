import express from 'express'
import { createTeam } from '../controllers/teamController.js'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/').post(protect, createTeam)

export default router
