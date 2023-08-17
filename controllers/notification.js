/* eslint-disable no-underscore-dangle */
const { Event } = require('../models/event');
const { Notification, validate } = require('../models/notification');
const { Tag } = require('../models/tag');
const { Message } = require('../models/message');

async function listAllNotifications(req, res) {
  const event = await Event.findById(req.query.eventId);
  if (!event)
    return res.status(404).send('The event with the given ID was not found.');
  // eslint-disable-next-line no-underscore-dangle
  const notifications = await Notification.find({ eventId: event._id });
  if (notifications) {
    return res.send(notifications);
  }
  return res
    .status(404)
    .send('The notification with the given ID was not found');
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
// start from here
async function createNotification(req, res) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const event = await Event.findById(req.query.eventId); // Assuming you have the Event model imported
    if (!event) return res.status(400).send('Invalid event.');
    const { name, description, templatebody } = req.body;
    const parseTags = parseTemplate(templatebody);
    let notification = new Notification({
      name,
      description,
      is_deleted: false,
      eventId: event._id,
      tags: parseTags,
      templatebody,
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
  } catch (err) {
    return res.status(500).send('Internal server error');
  }
}

async function updateNotification(req, res) {
  // const { error } = validate(req.body);
  // if (error) return res.status(400).send(error.details[0].message);
  try {
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
  } catch (err) {
    return res.status(500).send('Internal server error');
  }
}

async function previewNotificationMessage(req, res) {
  try {
    const notification = await Notification.findById(req.params.id);
    if (
      !notification ||
      notification.eventId.toString() !== req.query.eventId
    ) {
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
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
}

exports.listAllNotifications = listAllNotifications;
exports.createNotification = createNotification;
exports.updateNotification = updateNotification;
exports.previewNotificationMessage = previewNotificationMessage;
