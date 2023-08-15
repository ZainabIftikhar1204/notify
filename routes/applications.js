const express = require('express');
const { Application, validate } = require('../models/application');

const router = express.Router();

router.get('/', async (req, res) => {
  const applications = await Application.find({});
  res.send(applications);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let application = new Application({
    name: req.body.name,
    description: req.body.description,
    is_deleted: false,
  });

  application = await application.save();

  return res.send(application);
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const application = await Application.findByIdAndUpdate(
    req.params.id,
    {
      ...(req.body.name && { name: req.body.name }),
      ...(req.body.description && { description: req.body.description }),
      ...(req.body.is_deleted !== undefined && {
        is_deleted: req.body.is_deleted,
      }),
    },
    {
      new: true,
    },
  );

  if (!application)
    return res
      .status(404)
      .send('The application with the given ID was not found.');

  return res.send(application);
});

module.exports = router;
