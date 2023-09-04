// eslint-disable-next-line import/no-extraneous-dependencies
const httpStatus = require('http-status-codes');
const { Application } = require('../../models/application');

// GET api/applications
async function listAllApplications(req, res) {
  const { filter } = req; // Default to empty filter if not specified
  const { sort, sortby } = req.query;

  if (filter.name) filter.name = { $regex: filter.name, $options: 'i' };

  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit, 10) || 3; // Default limit to 3 if not specified
  const startIndex = (page - 1) * limit;

  const query = Application.find(filter).skip(startIndex).limit(limit);
  // Apply sorting based on sort and sortby query parameters
  if (sortby === 'name' || sortby === 'is_active') {
    const sortOrder = sort === 'desc' ? -1 : 1;
    query.sort({ [sortby]: sortOrder });
  }

  const totalDocuments = await Application.countDocuments(filter);
  const totalPages = Math.ceil(totalDocuments / limit);

  const applications = await query.exec();

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
  let application = new Application({
    name: req.body.name,
    description: req.body.description,
    is_deleted: false,
    is_active: true,
  });

  // check if application with the same name already exists
  const existingApplication = await Application.findOne({
    name: req.body.name,
  });
  if (existingApplication) {
    return res.status(httpStatus.StatusCodes.CONFLICT).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.CONFLICT),
      message: 'Application with the name already exists.',
    });
  }
  application = await application.save();

  return res.status(httpStatus.StatusCodes.CREATED).send(application);
}

// PATCH /api/application/:id
async function updateApplication(req, res) {
  const application = await Application.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
    },
  );

  if (!application)
    return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
      error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
      message: 'The application with the given ID was not found.',
    });

  if (req.body.name) {
    const existingApplication = await Application.findOne({
      name: req.body.name,
    });
    if (existingApplication) {
      return res.status(httpStatus.StatusCodes.CONFLICT).json({
        error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.CONFLICT),
        message: 'Application with the name already exists.',
      });
    }
  }

  return res.status(httpStatus.StatusCodes.OK).json({ application });
}

// GET /api/applications/:id
async function listApplication(req, res) {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(httpStatus.StatusCodes.NOT_FOUND).json({
        error: httpStatus.getReasonPhrase(httpStatus.StatusCodes.NOT_FOUND),
        message: 'The application with the given ID was not found.',
      });
    }

    return res.status(httpStatus.OK).json(application);
  } catch (error) {
    return res.status(httpStatus.StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: httpStatus.getReasonPhrase(
        httpStatus.StatusCodes.INTERNAL_SERVER_ERROR,
      ),
      message: 'Failed to retrieve application.',
    });
  }
}

exports.listAllApplications = listAllApplications;
exports.createApplication = createApplication;
exports.updateApplication = updateApplication;
exports.listApplication = listApplication;
