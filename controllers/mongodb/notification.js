/* eslint-disable no-underscore-dangle */
const { Event } = require('../../models/event');
const { Application } = require('../../models/application');
const { Notification } = require('../../models/notification');
const { Tag } = require('../../models/tag');
const { Message } = require('../../models/message');

// GET /api/notificcation?eventId=xxx&appId=xxx
async function listAllNotifications(req, res) {
  const event = await Event.findById(req.query.eventId);
  if (!event)
    return res.status(404).send('The event with the given ID was not found.');
  const application = await Application.findById(req.query.appId);
  if (
    !application ||
    application._id.toString() !== event.applicationId.toString()
  )
    return res.status(404).send('The event with the given ID was not found.');

  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit, 10) || 2; // Default limit to 10 if not specified

  const startIndex = (page - 1) * limit;

  const totalDocuments = await Notification.countDocuments();
  const totalPages = Math.ceil(totalDocuments / limit);

  const notifications = await Notification.find({
    is_deleted: false,
    // eslint-disable-next-line no-underscore-dangle
    eventId: event._id,
  })
    .skip(startIndex)
    .limit(limit);

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments,
  };

  return res.json({ notifications, pagination: paginationInfo });
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
// POST /api/notification?eventId=xxx&appId=xxx
async function createNotification(req, res) {
  const event = await Event.findById(req.query.eventId);
  if (!event) return res.status(400).send('Invalid event.');
  const application = await Application.findById(req.query.appId);
  if (
    !application ||
    application._id.toString() !== event.applicationId.toString()
  )
    return res.status(404).send('The event with the given ID was not found.');

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

  // console.log(tagsArray);
  notification = await notification.save();
  return res.send(notification);
}

// PATCH api/notification/:id?evenId=xxx&appId=xxx
async function updateNotification(req, res) {
  const event = await Event.findById(req.query.eventId); // Assuming you have the Event model imported
  if (!event) return res.status(400).send('Invalid event.');
  let notification = await Notification.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );
  if (!notification)
    return res
      .status(404)
      .send('The notification with the given ID was not found.');
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
    notification = await notification.save();
  }

  return res.send(notification);
}

// POST api/notification/:id/message
async function previewNotificationMessage(req, res) {
  const notification = await Notification.findById(req.params.id);
  if (!notification || notification.eventId.toString() !== req.query.eventId) {
    return res
      .status(404)
      .send(
        'The notification with the given ID was not found or invalid event',
      );
  }

  const { name } = notification;
  let { tags: notifcationTags } = notification;
  notifcationTags = notifcationTags.map((tag) => tag.label);
  const { applicationName, eventName, to: recipients } = req.body;

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

  return res.status(200).send('Messages Saved in DB');
}

exports.listAllNotifications = listAllNotifications;
exports.createNotification = createNotification;
exports.updateNotification = updateNotification;
exports.previewNotificationMessage = previewNotificationMessage;
