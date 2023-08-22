const { Application } = require('../../models/application');
const { Event } = require('../../models/event');

// GET api/events?applicationId=xxx
async function listAllEvents(req, res) {
  const application = await Application.findById(req.query.applicationId);
  if (!application)
    return res
      .status(404)
      .send('The application with the given ID was not found.');

  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit, 10) || 3; // Default limit to 10 if not specified

  const startIndex = (page - 1) * limit;

  const totalDocuments = await Event.countDocuments();
  const totalPages = Math.ceil(totalDocuments / limit);

  const events = await Event.find({
    is_deleted: false,
    // eslint-disable-next-line no-underscore-dangle
    applicationId: application._id,
  })
    .skip(startIndex)
    .limit(limit);

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments,
  };

  return res.json({ events, pagination: paginationInfo });
}

// GET api/events?applicationId=xxx
async function createEvent(req, res) {
  const applicationId = await Application.findById(req.query.applicationId);
  if (!applicationId) return res.status(400).send('Invalid application.');

  let event = new Event({
    name: req.body.name,
    description: req.body.description,
    is_deleted: false,
    is_active: true,
    applicationId: req.query.applicationId,
  });
  event = await event.save();

  return res.send(event);
}

// PATCH api/events/:id?applicationId=xxx
async function updateEvent(req, res) {
  const application = await Application.findById(req.query.applicationId);
  if (!application) return res.status(400).send('Invalid application.');

  let event = await Event.findById(req.params.id);
  if (
    !event ||
    event.applicationId.toString() !== req.query.applicationId.toString()
  )
    return res.status(404).send('Invalid event.');

  event = await Event.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  if (!event)
    return res.status(404).send('The event with the given ID was not found.');

  return res.send(event);
}

exports.listAllEvents = listAllEvents;
exports.createEvent = createEvent;
exports.updateEvent = updateEvent;
