/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line import/no-extraneous-dependencies
const httpStatus = require('http-status-codes');
const { Event } = require('../../models/event');
const { Notification } = require('../../models/notification');
const { Tag } = require('../../models/tag');
const { Message } = require('../../models/message');

// GET /api/notificcation?eventId=xxx
// GET /api/notifications?eventId=xxx
async function listAllNotifications(req, res) {
  const { filter } = req; // Default to empty filter if not specified
  const { sort, sortby } = req.query;

  if (filter.name) filter.name = { $regex: filter.name, $options: 'i' };

  const event = await Event.findById(req.query.eventId);
  if (!event)
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'No events found.',
    });

  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit, 10) || 4; // Default limit to 10 if not specified

  const startIndex = (page - 1) * limit;

  const query = Notification.find(filter).skip(startIndex).limit(limit);

  // Apply sorting based on sort and sortby query parameters
  if (sortby === 'name' || sortby === 'is_active') {
    const sortOrder = sort === 'desc' ? -1 : 1;
    query.sort({ [sortby]: sortOrder });
  }

  const totalDocuments = await Notification.countDocuments(filter);

  const totalPages = Math.ceil(totalDocuments / limit);
  const notifications = await query;

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments,
  };

  return res
    .status(httpStatus.StatusCodes.OK)
    .json({ notifications, pagination: paginationInfo });
}

function parseTemplate(templatebody) {
  // eslint-disable-next-line no-useless-escape
  const regex = /\{\{([^\}]+)\}\}/g;
  const matches = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(templatebody))) {
    matches.push({ label: match[1] });
  }

  return matches;
}

// POST /api/notification?eventId=xxx
async function createNotification(req, res) {
  const event = await Event.findById(req.body.eventId);
  if (!event)
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'Invalid Event',
    });

  // check if the notification with the same name already exists in the event
  const existingNotification = await Notification.findOne({
    name: req.body.name,
    eventId: req.body.eventId,
    _id: { $ne: req.params.id },
  });
  if (existingNotification)
    return res.status(httpStatus.StatusCodes.CONFLICT).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.CONFLICT),
      message: 'Notification with the name already exists.',
    });

  const { name, description, templatebody } = req.body;
  const parseTags = parseTemplate(templatebody);

  let notification = new Notification({
    name,
    description,
    is_deleted: false,
    eventId: event._id,
    tags: parseTags,
    templatebody,
    is_active: true,
  });

  const tagsArray = notification.tags;
  tagsArray.forEach(async (tag) => {
    const tagFound = await Tag.findOne({ label: tag.label });
    if (!tagFound) {
      const newTag = new Tag({
        label: tag.label,
      });
      await newTag.save();
    }
  });

  notification = await notification.save();
  return res.status(httpStatus.StatusCodes.CREATED).send(notification);
}

// PATCH api/notification/:id
async function updateNotification(req, res) {
  let notification = await Notification.findById(req.params.id);
  if (!notification)
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'Invalid Notification or Notification Id not given',
    });
  if (req.body.name) {
    // check if the notification with the same name already exists in the event
    const existingNotification = await Notification.findOne({
      name: req.body.name,
      eventId: notification.eventId,
      _id: { $ne: req.params.id },
    });
    if (existingNotification)
      return res.status(httpStatus.StatusCodes.CONFLICT).json({
        error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.CONFLICT),
        message: 'Notification with the name already exists.',
      });
  }
  notification = await Notification.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (req.body.templatebody) {
    const tagsArray = parseTemplate(req.body.templatebody);
    tagsArray.forEach(async (tag) => {
      const tagFound = await Tag.findOne({ label: tag.label });
      if (!tagFound) {
        const newTag = new Tag({
          label: tag.label,
        });
        await newTag.save();
      }
    });
    notification.tags = tagsArray;
    if (req.body.templatebody)
      notification.templatebody = req.body.templatebody;
    if (req.body.is_active) notification.is_active = req.body.is_active;
    if (req.body.is_deleted) notification.is_deleted = req.body.is_deleted;
    notification = await notification.save();
  }
  return res.status(httpStatus.StatusCodes.OK).json(notification);
}

// POST api/notification/:id/message
async function previewNotificationMessage(req, res) {
  const rest = req.body;

  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'Invalid Notification or Notification Id not given',
    });
  }

  const { name } = notification;
  let { tags: notifcationTags } = notification;
  notifcationTags = notifcationTags.map((tag) => tag.label);
  const { applicationName, eventName, to: recipients } = rest;

  recipients.forEach(async (recipient) => {
    const { email, tags: metadata } = recipient;
    const userTags = Object.keys(metadata);
    let { templatebody } = notification;
    userTags.forEach((tag) => {
      if (notifcationTags.includes(tag)) {
        templatebody = templatebody.replace(`{{${tag}}}`, metadata[tag]);
      }
    });

    templatebody = `${applicationName}\n${eventName}\n${name}\n${templatebody}`;
    const message = new Message({
      email,
      body: templatebody,
      // eslint-disable-next-line no-underscore-dangle
      notificationId: notification._id,
    });
    await message.save();
  });

  return res.status(httpStatus.StatusCodes.OK).send('Messages Saved in DB');
}

exports.listAllNotifications = listAllNotifications;
exports.createNotification = createNotification;
exports.updateNotification = updateNotification;
exports.previewNotificationMessage = previewNotificationMessage;
