import asyncHandler from 'express-async-handler'
import Repository from '../models/repositoryModel.js'
import Team from '../models/teamModel.js'

// @desc Create Repository
// @route POST /api/repository
// @access Private/User
const createTeam = asyncHandler(async (req, res) => {
  const { teamName: name, ...data } = req.body

  const team = await Team.create({ name })

  const repository = await Repository.create(data)

  team.repository = repository
  await team.save()

  res.status(201).json(repository)
})

export { createTeam }
