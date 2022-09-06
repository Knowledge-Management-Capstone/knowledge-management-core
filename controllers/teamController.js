import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

import { populateTeams, populateTeamsByUser } from "../utils/queries.js";

import Chat from "../models/chatModel.js";
import Document from "../models/documentModel.js";
import Folder from "../models/folderModel.js";
import Repository from "../models/repositoryModel.js";
import Team from "../models/teamModel.js";
import User from "../models/userModel.js";

// @desc Create Team
// @route POST /api/team
// @access Private/User
const createTeam = asyncHandler(async (req, res) => {
  const { name, creator, description, topics, title, startDate, endDate } =
    req.body;

  const sampleFolder = await Folder.create({
    title: "Sample Folder",
    note: "<h1>Details Here...</h1><p>Click the edit note button!</p>",
    description: "This is a sample folder",
    authors: [creator],
  });

  const sampleDocument = await Document.create({
    title: "Sample File",
    description: "This is a sample document",
    type: "docx",
    link: "https://firebasestorage.googleapis.com/v0/b/knowledge-management-capstone.appspot.com/o/sample%2FDokumen%20C251_46336%20v.0.0.docx?alt=media&token=bdc62d8e-cf01-4b08-8cac-85bf4d6b10d9",
  });

  const root = await Folder.create({
    title,
    note: `<h1>${title}</h1><p>Click the edit note button!</p>`,
    description: "This is the root folder",
    documents: [sampleDocument],
    folders: [sampleFolder],
    authors: [creator],
  });

  const repository = await Repository.create({
    title,
    startDate,
    endDate,
    root,
  });

  const chat = await Chat.create({});

  let team = await Team.create({
    name,
    description,
    topics,
    administrators: [creator],
    members: [creator],
    repository,
    chat,
  });

  await User.findByIdAndUpdate(creator, {
    $push: {
      teams: team._id,
    },
  });

  const query = {
    _id: { $eq: team._id },
  };

  team = await populateTeamsByUser(query, creator);

  // TODO: use $unwind instead
  res.status(201).json(team[0]);
});

/**
 * @desc Approve/Reject Team
 * @route PUT /api/team/:id?/approve?value={approve}
 * @access Private/Admin
 */
const approveTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  const approval = req.query.value === "true" ? "accepted" : "rejected";

  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  team.status = approval;
  const approvedTeam = team.save();
  res.status(200).json(approvedTeam);
});

// @desc Get All Team
// @route GET /api/team
// @access Private/Admin
const getTeams = asyncHandler(async (req, res) => {
  const query = { _id: { $exists: true } };
  const teams = await populateTeams(query);
  res.status(200).json(teams);
});

// @desc Get Team by Id
// @route GET /api/team/:id
// @access Private/User
// FIXME: Problems with the query
const getTeamById = asyncHandler(async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.params.id);
  const query = {
    _id: { $eq: userId },
  };
  const team = await populateTeamsByUser(query, userId);

  if (!team[0]) {
    res.status(404);
    throw new Error("Team not found");
  }

  res.status(200).json(team[0]);
});

// @desc Update Team
// @route PUT /api/team/:id
// @access Private/User
const updateTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  const repository = await Repository.findById(team.repository);
  const { name, title, description, startDate, endDate, topics } = req.body;

  if (!team) {
    res.status(404);
    throw new Error("Team not found");
  }

  team.name = name;
  team.description = description;
  team.topics = topics;
  if (team.status === "rejected") {
    team.status = "updated";
  }

  repository.title = title;
  repository.startDate = startDate;
  repository.endDate = endDate;

  const [updatedTeam, updatedRepository] = await Promise.all([
    team.save(),
    repository.save(),
  ]);

  res.status(204).json({
    name: updatedTeam.name,
    status: updatedTeam.status,
    description: updatedTeam.description,
    topics: updatedTeam.topics,
    startDate: updatedRepository.startDate,
    endDate: updatedRepository.endDate,
  });
});

// @desc Add Member to Team
// @route POST /api/team/:id/member
// @access Private/User
const addMember = asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params;
  const { role } = req.query;

  let query = {
    $push: {
      members: memberId,
    },
  };

  if (role === "administrator") {
    query = {
      ...query,
      $push: {
        ...query.$push,
        administrators: memberId,
      },
    };
  }

  const team = await Team.findByIdAndUpdate(teamId, query);

  res.status(201).json(team);
});

// @desc Update Member from Team
// @route PUT /api/team/:id/member
// @access Private/User
const updateMember = asyncHandler(async (req, res) => {
  const { teamId, memberId } = req.params;
  const { role } = req.query;

  let query;

  if (role === "administrator") {
    query = {
      $addToSet: {
        administrators: memberId,
      },
    };
  }

  if (role === "researcher") {
    query = {
      $pull: {
        administrators: memberId,
      },
    };
  }

  const team = await Team.findByIdAndUpdate(teamId, query);

  res.status(201).json(team);
});

/**
 * @desc Delete Member from Team
 * @route DELETE /api/team/:teamId/member/:memberId
 * @access Private/User
 */
const deleteMember = asyncHandler(async (req, res) => {
  await Team.findByIdAndUpdate(req.params.teamId, {
    $pull: {
      members: req.params.memberId,
      administrators: req.params.memberId,
    },
  });

  res.status(204).json({ message: "Member deleted successfully" });
});

/**
 * @desc Delete Team by Id
 * @route DELETE /api/team/:id
 * @access Private/User
 */
const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findByIdAndDelete(req.params.id);
  Repository.findByIdAndDelete(team.repository._id);

  res.status(204).json({ message: "team deleted successfully" });
});

export {
  createTeam,
  approveTeam,
  getTeams,
  getTeamById,
  updateTeam,
  deleteTeam,
  addMember,
  updateMember,
  deleteMember,
};
