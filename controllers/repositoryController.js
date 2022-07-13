import asyncHandler from 'express-async-handler'
import Repository from '../models/repositoryModel'
import Team from '../models/teamModel'

// @desc Create Repository
// @route POST /api/repository/create
// @access Private/User
const createRepository = asyncHandler(async (req, res) => {
  const { teamId, ...data } = req.body

  const team = await Team.findById(teamId)

  if (!team) {
    res.status(404)
    throw new Error('Team not found')
  }

  const repository = await Repository.create({ ...data })
  team.repository = repository
  await team.save()

  res.status(201).json(repository)
})

export { createRepository }
