const knex = require('../startup/dbpg');

async function listAllEvents(req, res) {
  const { applicationId } = req.query;

  // Check if the application with the given ID exists
  const application = await knex('applications')
    .where('id', applicationId)
    .first();

  if (!application) {
    return res
      .status(404)
      .send('The application with the given ID was not found.');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 3;
  const startIndex = (page - 1) * limit;

  // Get the total count of events associated with the application
  const [{ totalDocuments }] = await knex('events')
    .where('is_deleted', false)
    .where('application_id', applicationId)
    .count('* as totalDocuments');

  const totalPages = Math.ceil(totalDocuments / limit);

  // Fetch events associated with the application
  const events = await knex('events')
    .select('*')
    .where('is_deleted', false)
    .where('application_id', applicationId)
    .offset(startIndex)
    .limit(limit);

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments,
  };

  return res.json({ events, pagination: paginationInfo });
}

async function createEvent(req, res) {
  const { applicationId } = req.query;

  // Check if the application with the given ID exists
  const application = await knex('applications')
    .where('id', applicationId)
    .first();

  if (!application) {
    return res.status(400).send('Invalid application.');
  }

  const { name, description } = req.body;

  // Insert the new event record
  const [newEvent] = await knex('events')
    .insert({
      name,
      description,
      is_deleted: false,
      is_active: true,
      application_id: applicationId,
    })
    .returning('*');

  return res.send(newEvent);
}

async function updateEvent(req, res) {
  const { applicationId } = req.query;

  // Check if the application with the given ID exists
  const application = await knex('applications')
    .where('id', applicationId)
    .first();

  if (!application) {
    return res.status(400).send('Invalid application.');
  }

  const eventId = req.params.id;

  // Fetch the event by ID and application association
  const event = await knex('events')
    .where('id', eventId)
    .where('application_id', applicationId)
    .first();

  if (!event) {
    return res.status(404).send('Invalid event.');
  }

  const updatedEvent = req.body;

  // Update the event record
  const [updatedCount] = await knex('events')
    .where('id', eventId)
    .where('application_id', applicationId)
    .update(updatedEvent)
    .returning('*');

  if (updatedCount === 0) {
    return res.status(404).send('The event with the given ID was not found.');
  }

  return res.send(updatedEvent);
}

exports.pgListAllEvents = listAllEvents;
exports.pgCreateEvent = createEvent;
exports.pgUpdateEvent = updateEvent;
