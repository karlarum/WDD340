const utilities = require("../utilities/")

/* ****************************************
 * 500 Error
 * **************************************** */
async function triggerServerError(req, res, next) {
  try {
    const result = JSON.parse(undefined);
    res.status(500).render('errors/error', {
      title: '500 - Internal Server Error',
      message: 'A server-side error occurred while processing your request.'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  triggerServerError
}