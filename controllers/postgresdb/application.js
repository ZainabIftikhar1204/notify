// eslint-disable-next-line import/no-extraneous-dependencies
const httpStatus = require('http-status-codes');
const knex = require('../../startup/postgresdb/db');

// GET api/applications
async function listAllApplications(req, res) {
  const { filter } = req; // Default to empty filter if not specified
  if (filter.name) filter.name = { $regex: filter.name, $options: 'i' };
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 3;
  const startIndex = (page - 1) * limit;

  // Get the total count of records
  const { totalDocuments } = await knex('applications')
    .count('* as totalDocuments')
    .where(filter)
    .first(); // CHANGED

  const totalPages = Math.ceil(totalDocuments / limit);

  // Retrieve paginated applications
  const applications = await knex('applications')
    .select('*')
    .where(filter)
    .offset(startIndex)
    .limit(limit);

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments,
  };
  if (applications.length === 0) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'No applications found.',
    });
  }

  return res
    .status(httpStatus.StatusCodes.OK)
    .json({ applications, pagination: paginationInfo });
}

// POST /api/applications
async function createApplication(req, res) {
  const { name, description } = req.body;
  // checl if application with same name already exists
  const application = await knex('applications').where({ name }).first();

  if (application) {
    return res.status(httpStatus.StatusCodes.CONFLICT).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.CONFLICT),
      message: 'Application with the name already exists.',
    });
  }
  const [newApplication] = await knex('applications')
    .insert({
      name,
      description,
      is_deleted: false,
      is_active: true,
    })
    .returning('*');

  return res.status(httpStatus.StatusCodes.CREATED).send(newApplication);
}

// PATCH /api/application/:id
async function updateApplication(req, res) {
  const { id } = req.params;
  const updatedApplication = req.body;
  if (req.body.name) {
    const application = await knex('applications')
      .where({ name: req.body.name })
      .first();

    if (application) {
      return res.status(httpStatus.StatusCodes.CONFLICT).json({
        error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.CONFLICT),
        message: 'Application with the name already exists.',
      });
    }
  }

  // Update the application record
  const updatedCount = await knex('applications')
    .where({ id })
    .update(updatedApplication)
    .returning('*');

  console.log(req.body.name, updatedCount);
  if (updatedCount.length === 0) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).send({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'The application with the given ID was not found.',
    });
  }

  // Fetch the updated application record
  // const application = await knex('applications').where({ id }).first();

  return res.status(httpStatus.StatusCodes.OK).send(updatedCount);
}

async function listApplication(req, res) {
  const { id } = req.params;

  // Fetch the application by ID
  const application = await knex('applications').where({ id }).first();

  if (!application) {
    return res
      .status(404)
      .send('The application with the given ID was not found.');
  }

  return res.status(httpStatus.StatusCodes.OK).json({ application });
}

exports.listAllApplications = listAllApplications;
exports.createApplication = createApplication;
exports.updateApplication = updateApplication;
exports.listApplication = listApplication;
