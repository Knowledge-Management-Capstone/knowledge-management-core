import express from 'express'
import { authAdmin } from '../controllers/adminController.js'
import { admin } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/login', authAdmin)

export default router
