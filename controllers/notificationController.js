import asyncHandler from "express-async-handler";

/**
 * @desc Get Notifications By MemberId and RoomId
 * @route GET /api/notification/:roomId/member/:memberId
 * @access Private/User
 */
const getNotificationById = asyncHandler(async () => {});

/**
 * @desc Reset Notification By MemberId and RoomId
 * @route PUT /api/notification/:roomId/member/:memberId
 * @access Private/User
 */
const resetNotificationById = asyncHandler(async () => {});

export { getNotificationById, resetNotificationById };
