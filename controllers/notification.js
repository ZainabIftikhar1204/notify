const { Event } = require('../models/event');
const { Notification, validate } = require('../models/notification');
const { Tag } = require('../models/tag');

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

async function createNotification(req, res) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const event = await Event.findById(req.query.eventId); // Assuming you have the Event model imported
    if (!event) return res.status(400).send('Invalid event.');
    const { name, description, tags, templatebody } = req.body;
    let notification = new Notification({
      name,
      description,
      is_deleted: false,
      eventId: event._id,
      tags,
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
    const notification = await Notification.findByIdAndUpdate(
      req.query.notificationId,
      req.body,
      {
        new: true,
      },
    );
    if (!notification)
      return res
        .status(404)
        .send('The notification with the given ID was not found.');
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
    return res.send(notification);
  } catch (err) {
    return res.status(500).send('Internal server error');
  }
}

exports.listAllNotifications = listAllNotifications;
exports.createNotification = createNotification;
