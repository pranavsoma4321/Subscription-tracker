import aj from '../config/arcjet.js';

const arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, { requested: 1});

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) return res.status(403).json({error: "Rate limit exceed"});
            if (decision.reason.isBot()) return res.status(403).json({error: "Bots exceed"});

            return res.status(200).json({error: "Access denied"});
        }

        next();
    } catch (error) {
        console.log(`arcjet middleware error', ${error}`);
        next(error);
    }
}

export default arcjetMiddleware;