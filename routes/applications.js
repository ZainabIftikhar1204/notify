const express = require('express');
const { Application, validate } = require('../models/application');

const router = express.Router();
router.get('/', async (req, res) => {
  try {
    const applications = await Application.find({});
    return res.send(applications);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});

router.post('/', async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let application = new Application({
      name: req.body.name,
      description: req.body.description,
      is_deleted: false,
    });
    application = await application.save();

    return res.send(application);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});

router.patch('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
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
  } catch (err) {
    return res.status(500).send('Internal server error');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application)
      return res
        .status(404)
        .send('The application with the given ID was not found.');

    return res.send(application);
  } catch (error) {
    return res.status(500).send('Internal server error');
  }
});

module.exports = router;
