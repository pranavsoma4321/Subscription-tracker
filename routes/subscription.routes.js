import { Router } from 'express'
import authorize from "../middleware/auth.middleware.js";
import {createSubscription, getUsersSubscriptions} from "../controllers/subscription.controller.js";

const subscriptionRoutes = Router();

subscriptionRoutes.get('/', (req, res) => {
    res.send({ title:'Get all subscription' })
})

subscriptionRoutes.get('/:id', (req, res) => {
    res.send({ title:'Get all subscription details' })
})

subscriptionRoutes.post('/', authorize, createSubscription);

subscriptionRoutes.put('/:id', (req, res) => {
    res.send({ title:'Update the Subscription' })
})

subscriptionRoutes.delete('/:id', (req, res) => {
    res.send({ title:'Delete a subscription' })
})

subscriptionRoutes.get('/user/:id', authorize, getUsersSubscriptions)

export default subscriptionRoutes;