const errorMiddleware = (err, req, res, next) => {
    try {
       let error = { ...err };

       error.message = err.message;
       console.error(err);

       //mongoose bad object id
        if(err.name === 'castError') {
            const message = 'Resource not found';

            error = new Error(message);
            error.statusCode = 404;
        }

        if(err.code === 11000) {
            const message = Object.values(err.errors).map(val.message);
            error = new Error(message.join(', '));
            error.StatusCode = 500;
        }

        res.status(err.statusCode || 500).json({ success: false, message: error.message || 'Server Error' });
       
    } catch(error) {
        next(error);

    }
};

export default errorMiddleware;