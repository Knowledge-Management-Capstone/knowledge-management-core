import express from 'express'
import { authAdmin } from '../controllers/adminController.js'
import { admin } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.route('/login', authAdmin)

export default router
