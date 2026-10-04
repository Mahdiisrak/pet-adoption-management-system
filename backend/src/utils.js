const safe = handler =>
  (req,res,next) =>
    Promise.resolve(handler(req,res,next)).catch(next);

const required = (body,fields) =>
  fields.filter(field =>
    body[field] === undefined ||
    body[field] === null ||
    body[field] === ''
  );

module.exports = {
  safe,
  required
};
