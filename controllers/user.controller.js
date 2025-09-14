import User from '../models/users.model.js'

export const getUsers = async (req, res) => {
    try{
        const users = await User.find()

        res.status(200).json({success: true, data: users})
    } catch (error) {
        next(error)
    }
}

export const getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.status(200).json({ success: true, data: user });

        if(!user){
            const error = new Error('User does not exist');
            error.status = 400;
            next(error);
        }

        res.status(200).json({ success: true, data: user });
    }catch (error) {
        next(error);

    }
}

