const { Application } = require('../models/application');

// GET api/applications
async function listAllApplications(req, res) {
  const page = parseInt(req.query.page, 10) || 1; // Default to page 1 if not specified
  const limit = parseInt(req.query.limit, 10) || 3; // Default limit to 10 if not specified

  const startIndex = (page - 1) * limit;

  const totalDocuments = await Application.countDocuments();
  const totalPages = Math.ceil(totalDocuments / limit);

  const applications = await Application.find({}).skip(startIndex).limit(limit);

  const paginationInfo = {
    currentPage: page,
    totalPages,
    pageSize: limit,
    totalCount: totalDocuments,
  };

  return res.json({ applications, pagination: paginationInfo });
}

// POST /api/applications
async function createApplication(req, res) {
  let application = new Application({
    name: req.body.name,
    description: req.body.description,
    is_deleted: false,
    is_active: true,
  });
  application = await application.save();

  return res.send(application);
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
    return res
      .status(404)
      .send('The application with the given ID was not found.');

  return res.send(application);
}

// GET /api/applications/:id
async function listApplication(req, res) {
  const application = await Application.findById(req.params.id);

  if (!application)
    return res
      .status(404)
      .send('The application with the given ID was not found.');

  return res.send(application);
}

exports.listAllApplications = listAllApplications;
exports.createApplication = createApplication;
exports.updateApplication = updateApplication;
exports.listApplication = listApplication;
