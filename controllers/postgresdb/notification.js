/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
const knex = require('../../startup/postgresdb/db');

async function listAllNotifications(req, res) {
  const { eventId, appId } = req.query;

  // Fetch the event by ID
  const event = await knex('events').where('id', eventId).first();

  if (!event) {
    return res.status(404).send('The event with the given ID was not found.');
  }

  // Fetch the application by ID
  const application = await knex('applications').where('id', appId).first();

  if (!application || application.id !== event.application_id) {
    return res
      .status(404)
      .send('The application with the given ID was not found.');
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 2;
  const startIndex = (page - 1) * limit;

  // Get the total count of notifications associated with the event
  const [{ totalDocuments }] = await knex('notifications')
    .where('is_deleted', false)
    .where('event_id', eventId)
    .count('* as totalDocuments');

  const totalPages = Math.ceil(totalDocuments / limit);

  // Fetch notifications associated with the event
  const notifications = await knex('notifications')
    .select('*')
    .where('is_deleted', false)
    .where('event_id', eventId)
    .offset(startIndex)
    .limit(limit);

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments,
  };

  return res.json({ notifications, pagination: paginationInfo });
}

function parseTemplate(template_body) {
  // eslint-disable-next-line no-useless-escape
  const regex = /\{\{([^\}]+)\}\}/g;
  const matches = [];
  let match;

  // eslint-disable-next-line no-cond-assign
  while ((match = regex.exec(template_body))) {
    matches.push({ label: match[1] });
  }

  return matches;
}

async function createNotification(req, res) {
  const { eventId, appId } = req.query;

  // Fetch the event by ID
  const event = await knex('events').where('id', eventId).first();

  if (!event) {
    return res.status(400).send('Invalid event.');
  }

  // Fetch the application by ID
  const application = await knex('applications').where('id', appId).first();

  if (!application || application.id !== event.application_id) {
    return res.status(404).send('The event with the given ID was not found.');
  }

  const { name, description, templatebody } = req.body;

  const parseTags = parseTemplate(templatebody); // Assuming parseTemplate function is defined

  // Insert the new notification record
  const [newNotification] = await knex('notifications')
    .insert({
      name,
      description,
      is_deleted: false,
      event_id: eventId,
      templatebody,
      tags: JSON.stringify(parseTags), // Store tags as a JSON array
      is_active: true,
    })
    .returning('*');

  // Insert new tags if they don't exist
  for (const tag of parseTags) {
    const tagFound = await knex('tags').where('label', tag.label).first();
    if (!tagFound) {
      await knex('tags').insert({ label: tag.label });
    }
  }

  return res.send(newNotification);
}

// PATCH /api/notification/:id?eventId=xxx&appId=xxx
async function updateNotification(req, res) {
  const { eventId, appId } = req.query;

  // Fetch the event by ID
  const event = await knex('events').where('id', eventId).first();
  if (!event) {
    return res.status(400).send('Invalid event.');
  }

  // Fetch the application by ID
  const application = await knex('applications').where('id', appId).first();
  if (!application || application.id !== event.application_id) {
    return res.status(404).send('The event with the given ID was not found.');
  }

  const notification = await knex('notifications')
    .where('id', req.params.id)
    .first();

  if (!notification) {
    return res
      .status(404)
      .send('The notification with the given ID was not found.');
  }

  // Update the notification fields
  const updatedFields = {
    ...notification,
    ...req.body,
  };

  if (req.body.templatebody) {
    const tagsArray = parseTemplate(req.body.templatebody);
    // Convert tags array to JSON string
    updatedFields.tags = JSON.stringify(tagsArray);

    // Insert new tags if they don't exist
    for (const tag of tagsArray) {
      const tagFound = await knex('tags').where('label', tag.label).first();
      if (!tagFound) {
        await knex('tags').insert({ label: tag.label });
      }
    }
  }

  // Update the notification in the database
  const [updatedNotification] = await knex('notifications')
    .where('id', req.params.id)
    .update(updatedFields)
    .returning('*');

  return res.send(updatedNotification);
}

// POST /api/notification/:id/message
async function previewNotificationMessage(req, res) {
  const { eventId } = req.query;
  const notificationId = req.params.id;

  // Fetch the notification by ID
  const notification = await knex('notifications')
    .where('id', notificationId)
    .first();
  if (!notification || notification.event_id.toString() !== eventId) {
    return res
      .status(404)
      .send(
        'The notification with the given ID was not found or invalid event',
      );
  }

  const { name } = notification;
  const notificationTags = notification.tags.map((tag) => tag.label);
  const { applicationName, eventName, to: recipients } = req.body;

  for (const recipient of recipients) {
    const { email, tags: metadata } = recipient;
    const userTags = Object.keys(metadata);
    let { templatebody } = notification;

    for (const tag of userTags) {
      if (notificationTags.includes(tag)) {
        templatebody = templatebody.replace(`{{${tag}}}`, metadata[tag]);
      }
    }

    templatebody = `${applicationName}\n${eventName}\n${name}\n${templatebody}`;

    const message = {
      email,
      body: templatebody,
      notification_id: notificationId,
    };

    // Insert the new message record
    await knex('messages').insert(message);
  }

  return res.status(200).send('Messages Saved in DB');
}

exports.listAllNotifications = listAllNotifications;
exports.createNotification = createNotification;
exports.updateNotification = updateNotification;
exports.previewNotificationMessage = previewNotificationMessage;
