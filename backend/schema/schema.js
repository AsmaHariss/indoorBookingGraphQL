const { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLSchema } = require('graphql');
const _ = require('lodash');

const Court = require('../models/courtModel');
const User = require('../models/userModel');
const SuperAdmin = require('../models/superAdminModel');
const CourtAdmin = require('../models/courtAdminModel');
const Booking = require('../models/bookingModel');
const CourtRegistration = require('../models/courtRegistrationModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SECRET_KEY = 'random#secret';
const validator = require('validator');

// Define Court type
const CourtType = new GraphQLObjectType({
    name: 'court',
    fields: () => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        sportName: { type: GraphQLString },
        location: { type: GraphQLString },
        //to make connection between court and its booking
        bookings: {
            type: new GraphQLList(BookingType),
            resolve(parent, args) {
                return Booking.find({ userId: parent.id });
            }
        }
    })
});

// Define User Type
const UserType = new GraphQLObjectType({
    name: 'user',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        token: { type: GraphQLString },
        //to make connection between user and their booking
        bookings: {
            type: new GraphQLList(BookingType),
            resolve(parent, args) {
                return Booking.find({ userId: parent.id });
            }
        },
        //to make connection between user and their registeration request
        courtRegistrations: {
            type: new GraphQLList(RegistrationType),
            resolve(parent, args) {
                return CourtRegistration.find({ userId: parent.id });
            }
        }

    })
})

// Define Super Admin Type
const SuperAdminType = new GraphQLObjectType({
    name: 'superAdmin',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        token: { type: GraphQLString }
    })
})

// Define Court Admin Type
const CourtAdminType = new GraphQLObjectType({
    name: 'courtAdmin',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        phone: { type: GraphQLString },
        email: { type: GraphQLString },
        password: { type: GraphQLString },
        token: { type: GraphQLString }
    })
})

// Define booking Type
const BookingType = new GraphQLObjectType({
    name: 'booking',
    fields: () => ({
        id: { type: GraphQLID },
        startTime: { type: GraphQLString },
        endTime: { type: GraphQLString },
        sportName: { type: GraphQLString },
        status: { type: GraphQLString },
        //to make connection between booking and user
        user: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.userId);
            }
        },
        //to make connection between booking and court
        court: {
            type: CourtType,
            resolve(parent, args) {
                return Court.findById(parent.courtId);
            }
        }
    })
})

// Define registatrion Type
const RegistrationType = new GraphQLObjectType({
    name: 'courtRegistration',
    fields: () => ({
        id: { type: GraphQLID },
        courtName: { type: GraphQLString },
        location: { type: GraphQLString },
        sportName: { type: GraphQLString },
        status: { type: GraphQLString },
        //to make connection between registration request and user
        user: {
            type: UserType,
            resolve(parent, args) {
                return User.findById(parent.userId);
            }
        }
    })
})

// Define RootQuery
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        court: {
            type: CourtType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                console.log(typeof (args.id));
                return Court.findById(args.id);
            }
        },
        courts: {
            type: new GraphQLList(CourtType),
            resolve(parent, args) {
                //list all courts
                return Court.find({});
            }
        },
        user: {
            type: UserType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                console.log(typeof (args.id));
                return User.findById(args.id);
            }
        },
        users: {
            type: new GraphQLList(UserType),
            resolve(parent, args) {
                //list all users
                return User.find({});
            }
        },
        superAdmin: {
            type: SuperAdminType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                console.log(typeof (args.id));
            }
        },
        courtAdmin: {
            type: CourtAdminType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                console.log(typeof (args.id));
            }
        },
        booking: {
            type: BookingType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                console.log(typeof (args.id));
                return Booking.findById(args.id);
            }
        },
        bookings: {
            type: new GraphQLList(BookingType),
            resolve(parent, args) {
                //list all bookings
                return Booking.find({});
            }
        },
        courtRegistration: {
            type: RegistrationType,
            args: { id: { type: GraphQLID } },
            resolve(parent, args) {
                console.log(typeof (args.id));
                return CourtRegistration.findById(args.id);
            }
        },
        courtRegistrations: {
            type: new GraphQLList(RegistrationType),
            resolve(parent, args) {
                //list all registration request
                return CourtRegistration.find({});
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addCourt: {
            type: CourtType,
            args: {
                name: { type: GraphQLString },
                sportName: { type: GraphQLString },
                location: { type: GraphQLString }
            },
            resolve(parent, args) {
                //create new court
                let court = new Court({
                    name: args.name,
                    sportName: args.sportName,
                    location: args.location
                });
                //store court to db
                return court.save();
            }
        },
        deleteCourt: {
            type: CourtType,
            args: {
                id: { type: GraphQLID }
            },
            async resolve(parent, args) {
                const court = await Court.findById(args.id);
                //checks if the court exists
                if (!court) {
                    throw new Error('Court not found');
                }
                // Remove the court from db
                return Court.findByIdAndDelete(args.id);
            }
        },
        signUpUser: {
            type: UserType,
            args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                phone: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                //making email unique
                const existingUser = await User.findOne({ email: args.email });
                if (existingUser) {
                    throw new Error('Email already in use');
                }
                // validator - validate the email (format)
                if (!validator.isEmail(args.email)) {
                    throw new Error('Please enter valid email');
                }
                //hashin password
                const hashedPassword = await bcrypt.hash(args.password, 10);
                //create new user
                let user = new User({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    phone: args.phone,
                    email: args.email,
                    password: hashedPassword
                });
                const newUser = await user.save();
                // generate token
                const token = jwt.sign({ userId: newUser.id, email: newUser.email }, SECRET_KEY);
                return { ...newUser._doc, id: newUser._id, token };
            }
        },
        loginUser: {
            type: UserType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, { email, password }) {
                //checks if the user exists by email
                const user = await User.findOne({ email });
                if (!user) {
                    throw new Error('User does not exist');
                }
                // Compare the password
                const isPasswordCorrect = await bcrypt.compare(password, user.password);
                if (!isPasswordCorrect) {
                    throw new Error('Incorrect password');
                }
                // generate token
                const token = jwt.sign({ userId: user.id, email: user.email }, SECRET_KEY);
                return { ...user._doc, id: user._id, token };
            }
        },
        signUpSuperAdmin: {
            type: SuperAdminType,
            args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                phone: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                
                const existingSuperAdmin = await SuperAdmin.findOne({ email: args.email });
                if (existingSuperAdmin) {
                    throw new Error('Email already in use');
                }
                if (!validator.isEmail(args.email)) {
                    throw new Error('Please enter valid email');
                }
                const hashedPassword = await bcrypt.hash(args.password, 10);
                let superAdmin = new SuperAdmin({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    phone: args.phone,
                    email: args.email,
                    password: hashedPassword
                });
                const newSuperAdmin = await superAdmin.save();
                const token = jwt.sign({ superAdminId: newSuperAdmin.id, email: newSuperAdmin.email }, SECRET_KEY);
                return { ...newSuperAdmin._doc, id: newSuperAdmin._id, token };
            }
        },
        loginSuperAdmin: {
            type: SuperAdminType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, { email, password }) {
                const superAdmin = await SuperAdmin.findOne({ email });
                if (!superAdmin) {
                    throw new Error('Super Admin does not exist');
                }
                // Compare the password
                const isPasswordCorrect = await bcrypt.compare(password, superAdmin.password);
                if (!isPasswordCorrect) {
                    throw new Error('Incorrect password');
                }
                const token = jwt.sign({ superAdmin: superAdmin.id, email: superAdmin.email }, SECRET_KEY);
                return { ...superAdmin._doc, id: superAdmin._id, token };
            }
        },
        signUpCourtAdmin: {
            type: CourtAdminType,
            args: {
                firstName: { type: GraphQLString },
                lastName: { type: GraphQLString },
                phone: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const existingCourtAdmin = await CourtAdmin.findOne({ email: args.email });
                if (existingCourtAdmin) {
                    throw new Error('Email already in use');
                }
                if (!validator.isEmail(args.email)) {
                    throw new Error('Please enter valid email');
                }
                const hashedPassword = await bcrypt.hash(args.password, 10);
                let courtAdmin = new CourtAdmin({
                    firstName: args.firstName,
                    lastName: args.lastName,
                    phone: args.phone,
                    email: args.email,
                    password: hashedPassword
                });
                const newCourtAdmin = await courtAdmin.save();
                const token = jwt.sign({ courtAdminId: newCourtAdmin.id, email: newCourtAdmin.email }, SECRET_KEY);
                return { ...newCourtAdmin._doc, id: newCourtAdmin._id, token };
            }
        },
        loginCourtAdmin: {
            type: CourtAdminType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            async resolve(parent, { email, password }) {
                const courtAdmin = await CourtAdmin.findOne({ email });
                if (!courtAdmin) {
                    throw new Error('Court Admin does not exist');
                }
                // Compare the password
                const isPasswordCorrect = await bcrypt.compare(password, courtAdmin.password);
                if (!isPasswordCorrect) {
                    throw new Error('Incorrect password');
                }
                const token = jwt.sign({ courtAdmin: courtAdmin.id, email: courtAdmin.email }, SECRET_KEY);
                return { ...courtAdmin._doc, id: courtAdmin._id, token };
            }
        },
        addBookings: {
            type: BookingType,
            args: {
                startTime: { type: GraphQLString },
                endTime: { type: GraphQLString },
                sportName: { type: GraphQLString },
                status: { type: GraphQLString },
                userId: { type: GraphQLString },
                courtId: { type: GraphQLString }
            },
            resolve(parent, args) {
                //create new booking
                let bookings = new Booking({
                    startTime: args.startTime,
                    endTime: args.endTime,
                    sportName: args.sportName,
                    status: args.status,
                    userId: args.userId,
                    courtId: args.courtId

                });
                //store booking details to db
                return bookings.save();
            }
        },
        deleteBooking: {
            type: BookingType,
            args: {
                id: { type: GraphQLID }
            },
            async resolve(parent, args) {
                //checks if the booking exists 
                const booking = await Booking.findById(args.id);
                if (!booking) {
                    throw new Error('booking not found');
                }
                // Remove the booking from db
                return Booking.findByIdAndDelete(args.id);
            }
        },
        updateBookingStatus: {
            type: BookingType,
            args: {
                //id and status fields to update the booking status 
                id: { type: GraphQLID },
                status: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const booking = await Booking.findById(args.id);
                if (!booking) {
                    throw new Error('booking not found');
                }
                //update the booking
                return Booking.findByIdAndUpdate(args.id, { status: args.status }, { new: true });
            }
        },
        addCourtRegistration: {
            type: RegistrationType,
            args: {
                courtName: { type: GraphQLString },
                location: { type: GraphQLString },
                sportName: { type: GraphQLString },
                status: { type: GraphQLString },
                userId: { type: GraphQLString }
            },
            resolve(parent, args) {
                //create new register request
                let courtRegistration = new CourtRegistration({
                    courtName: args.courtName,
                    location: args.location,
                    sportName: args.sportName,
                    status: args.status,
                    userId: args.userId
                });

                //store register request to db
                return courtRegistration.save();
            }
        },
        deleteCourRegistrationt: {
            type: RegistrationType,
            args: {
                id: { type: GraphQLID }
            },
            async resolve(parent, args) {
                const courtRegistration = await CourtRegistration.findById(args.id);
                if (!courtRegistration) {
                    throw new Error('courtRegistration  not found');
                }
                // Remove the court from db
                return CourtRegistration.findByIdAndDelete(args.id);
            }
        },
        updateRegistrationStatus: {
            type: RegistrationType,
            args: {
                 //id and status fields to update the booking status 
                id: { type: GraphQLID },
                status: { type: GraphQLString }
            },
            async resolve(parent, args) {
                const registration = await CourtRegistration.findById(args.id);
                //if checks registration exists
                if (!registration) {
                    throw new Error('registration  not found');
                }
                //update and store the status to db
                return CourtRegistration.findByIdAndUpdate(args.id, { status: args.status }, { new: true });
            }
        }
    }
})

// Export schema
module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});
