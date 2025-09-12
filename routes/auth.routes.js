import  { Router } from 'express';

import {signin, signout, signup} from '../controllers/auth.controllers.js'

const authRouter = Router();

authRouter.post('/signup', signup);
authRouter.post('/signin', signin);
authRouter.post('/signout', signout);

export default authRouter;

