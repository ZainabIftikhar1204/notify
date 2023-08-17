const { Application } = require('../models/application');
const { Event, validate, validateEventUpdate } = require('../models/event');

async function listAllEvents(req, res) {
  const application = await Application.findById(req.query.applicationId);
  if (!application)
    return res
      .status(404)
      .send('The application with the given ID was not found.');
  // eslint-disable-next-line no-underscore-dangle
  const events = await Event.find({ applicationId: application._id });
  return res.send(events);
}

async function createEvent(req, res) {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const applicationId = await Application.findById(req.query.applicationId);
  if (!applicationId) return res.status(400).send('Invalid application.');

  let event = new Event({
    name: req.body.name,
    description: req.body.description,
    is_deleted: false,
    applicationId: req.query.applicationId,
  });
  event = await event.save();

  return res.send(event);
}

async function updateEvent(req, res) {
  const { error } = validateEventUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const application = await Application.findById(req.query.applicationId);
  if (!application) return res.status(400).send('Invalid application.');

  const event = await Event.findByIdAndUpdate(
    req.query.applicationid, // change krna hai to eventid baad may krna hai but :P
    req.body,
    {
      new: true,
    },
  );

  if (!event)
    return res.status(404).send('The event with the given ID was not found.');

  return res.send(event);
}

exports.listAllEvents = listAllEvents;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
