import mongoose from "mongoose";
import Users from "../models/users.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
    FREE: 'free',
    BASIC: 'basic',
    PREMIUM: 'premium'
};

const DEFAULT_SUBSCRIPTION = {
    plan: SUBSCRIPTION_PLANS.FREE,
    status: 'active',
    startDate: new Date(),
    endDate: null
};

export const signup = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { name, email, password, subscriptionPlan } = req.body;

        // Validate input
        if (!name || !email || !password) {
            const error = new Error('Name, email, and password are required');
            error.statusCode = 400;
            throw error;
        }

        // Check if user exists
        const existingUser = await Users.findOne({ email }).session(session);
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Set up subscription based on plan
        const subscription = subscriptionPlan
            ? {
                ...DEFAULT_SUBSCRIPTION,
                plan: SUBSCRIPTION_PLANS[subscriptionPlan.toUpperCase()] || SUBSCRIPTION_PLANS.FREE
            }
            : DEFAULT_SUBSCRIPTION;

        // Create new user
        const newUser = await Users.create([{
            name,
            email,
            password: hashedPassword,
            subscription
        }], { session });

        // Generate JWT token
        const token = jwt.sign({
            userId: newUser[0]._id
        }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        await session.commitTransaction();
        session.endSession();

        // Remove sensitive information from response
        const userResponse = {
            _id: newUser[0]._id,
            name: newUser[0].name,
            email: newUser[0].email,
            subscription: newUser[0].subscription,
            createdAt: newUser[0].createdAt,
            updatedAt: newUser[0].updatedAt
        };

        res.status(201).json({
            success: true,
            message: 'User successfully created!',
            data: {
                token,
                user: userResponse,
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export const signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input - only email and password required
        if (!email || !password) {
            const error = new Error('Email and password are required');
            error.statusCode = 400;
            throw error;
        }

        // Find user and explicitly include password field
        const user = await Users.findOne({ email }).select('+password');
        if (!user) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid email or password');
            error.statusCode = 401;
            throw error;
        }

        // Generate JWT token
        const token = jwt.sign({
            userId: user._id,
            subscription: user.subscription?.plan || 'free'
        }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
        });

        // Remove sensitive information from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            subscription: user.subscription,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({
            success: true,
            message: 'Successfully signed in!',
            data: {
                token,
                user: userResponse
            }
        });
    } catch (error) {
        next(error);
    }
};

export const signout = async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Successfully signed out'
    });
};

// Additional subscription management functions

export const upgradeSubscription = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId } = req.params;
        const { plan, duration } = req.body;

        // Validate input
        if (!SUBSCRIPTION_PLANS[plan.toUpperCase()]) {
            const error = new Error('Invalid subscription plan');
            error.statusCode = 400;
            throw error;
        }

        const user = await Users.findById(userId).session(session);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        // Calculate new subscription end date
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + duration);

        // Update subscription
        user.subscription = {
            plan: plan.toLowerCase(),
            status: 'active',
            startDate: new Date(),
            endDate: endDate
        };

        await user.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            success: true,
            message: 'Subscription upgraded successfully',
            data: {
                subscription: user.subscription
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export const getSubscriptionStatus = async (req, res, next) => {
    try {
        const { userId } = req.params;

        const user = await Users.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            data: {
                subscription: user.subscription
            }
        });
    } catch (error) {
        next(error);
    }
};

