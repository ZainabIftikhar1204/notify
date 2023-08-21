const knex = require('../startup/dbpg');

// GET api/applications
async function pgListAllApplications(req, res) {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 3;
  const startIndex = (page - 1) * limit;

  // Get the total count of records
  const [{ totalDocuments }] = await knex('applications').count(
    '* as totalDocuments',
  );

  const totalPages = Math.ceil(totalDocuments / limit);

  // Retrieve paginated applications
  const applications = await knex('applications')
    .select('*')
    .offset(startIndex)
    .limit(limit);

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments,
  };

  return res.json({ applications, pagination: paginationInfo });
}

// POST /api/applications
async function pgCreateApplication(req, res) {
  const { name, description } = req.body;

  const [newApplication] = await knex('applications')
    .insert({
      name,
      description,
      is_deleted: false,
      is_active: true,
    })
    .returning('*');

  return res.send(newApplication);
}

// PATCH /api/application/:id
async function pgUpdateApplication(req, res) {
  const { id } = req.params;
  const updatedApplication = req.body;

  // Update the application record
  const updatedCount = await knex('applications')
    .where({ id })
    .update(updatedApplication);

  if (updatedCount === 0) {
    return res
      .status(404)
      .send('The application with the given ID was not found.');
  }

  // Fetch the updated application record
  const application = await knex('applications').where({ id }).first();

  return res.send(application);
}

async function pgListApplication(req, res) {
  const { id } = req.params;

  // Fetch the application by ID
  const application = await knex('applications').where({ id }).first();

  if (!application) {
    return res
      .status(404)
      .send('The application with the given ID was not found.');
  }

  return res.send(application);
}

exports.pgListAllApplications = pgListAllApplications;
exports.pgCreateApplication = pgCreateApplication;
exports.pgUpdateApplication = pgUpdateApplication;
exports.pgListApplication = pgListApplication;
