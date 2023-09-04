// eslint-disable-next-line import/no-extraneous-dependencies
const httpStatus = require('http-status-codes');
const knex = require('../../startup/postgresdb/db');

// GET api/applications
async function listAllApplications(req, res) {
  const { filter } = req; // Default to empty filter if not specified
  const { sort, sortby } = req.query;

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 3;
  const startIndex = (page - 1) * limit;

  const query = knex('applications')
    .select('*')
    .where(filter)
    .offset(startIndex)
    .limit(limit);

  // Apply sorting based on sort and sortby query parameters
  if (sortby === 'name' || sortby === 'is_active') {
    const sortOrder = sort === 'desc' ? 'desc' : 'asc';
    query.orderBy(sortby, sortOrder);
  }

  const totalDocumentsQuery = knex('applications')
    .count('* as totalDocuments')
    .where(filter)
    .first();

  const totalDocuments = await totalDocumentsQuery;

  const totalPages = Math.ceil(totalDocuments.totalDocuments / limit);
  const applications = await query;

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments.totalDocuments,
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
  // Check if the application with the given ID exists
  const application = await knex('applications').where({ id }).first();

  if (!application) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'The application with the given ID was not found.',
    });
  }
  if (req.body.name) {
    const existingApplication = await knex('applications')
      .where({ name: req.body.name })
      .first();
    if (existingApplication) {
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
  if (updatedCount.length === 0) {
    return res.status(httpStatus.StatusCodes.NOT_FOUND).send({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'The application with the given ID was not found.',
    });
  }

  // Fetch the updated application record
  // const application = await knex('applications').where({ id }).first();

  return res.status(httpStatus.StatusCodes.OK).send(updatedCount[0]);
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

  return res.status(httpStatus.StatusCodes.OK).json(application);
}

exports.listAllApplications = listAllApplications;
exports.createApplication = createApplication;
exports.updateApplication = updateApplication;
exports.listApplication = listApplication;
