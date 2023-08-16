const { Event } = require('../models/event');
const { Notification, validate } = require('../models/event');

async function listAllNotifications(req, res) {
  const event = await Event.findById(req.query.applicationId);
  if (!event)
    return res.status(404).send('The event with the given ID was not found.');
  // eslint-disable-next-line no-underscore-dangle
  const notifications = await Notification.find({ eventId: event._id });
  return res.send(notifications);
}

async function createNotification(req, res) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  try {
    const event = await Event.findById(req.query.eventId); // Assuming you have the Event model imported
    if (!event) return res.status(400).send('Invalid event.');
    const { name, description, tags } = req.body;
    console.log(tags);
    // Construct the tags array based on the request body
    const tagsArray = tags.map((tag) => ({
      label: tag.label,
    }));

    const notification = new Notification({
      name,
      description,
      is_deleted: false,
      // eslint-disable-next-line no-underscore-dangle
      eventId: event._id, // Use event's _id
      tags: tagsArray,
    });

    const savedNotification = await notification.save();

    return res.send(savedNotification);
  } catch (err) {
    return res.status(500).send('Internal server error');
  }
}

exports.listAllNotifications = listAllNotifications;
exports.createNotification = createNotification;
