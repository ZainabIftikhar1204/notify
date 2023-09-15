const httpStatus = require('http-status-codes');
const { Tag } = require('../../models/tag');

// GET /api/tags
async function listAllTags(req, res) {
  const tags = await Tag.find({}).sort('label');
  const tagsArray = [];
  tags.forEach((tag) => {
    tagsArray.push(tag.label);
  });

  //   console.log(tags);
  return res.status(httpStatus.StatusCodes.OK).send(tagsArray);
}

module.exports.listAllTags = listAllTags;
