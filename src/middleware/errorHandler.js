
// Not Found Middleware
function notFound(req, res, next) {
    return res.status(404).json({
        status: 404,
        message: 'Not found',
    });
}

// Generic error handler for other errors
function serverError(err, req, res, next) {
    console.error(err.stack);
    return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Something went wrong!',
    });
}

module.exports = {
    notFound,
    serverError
}