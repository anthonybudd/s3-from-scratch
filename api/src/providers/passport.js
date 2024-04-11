const LocalStrategy = require('passport-local').Strategy;
const { User, Group } = require('./../models');
const passportJWT = require('passport-jwt');
const ExtractJWT = passportJWT.ExtractJwt;
const JWTStrategy = passportJWT.Strategy;
const bcrypt = require('bcrypt-nodejs');
const passport = require('passport');
const fs = require('fs');


passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, cb) => {

    const user = await User.unscoped().findOne({
        where: { email },
        include: [Group]
    });

    if (!user) return cb(null, false, { message: 'Incorrect email or password.' });

    return bcrypt.compare(password, user.password, (err, compare) => {
        if (compare) {
            return cb(null, user, { message: 'Logged in successfully' });
        } else {
            return cb(null, false, { message: 'Incorrect email or password.' });
        }
    });
}));


passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromExtractors([
        ExtractJWT.fromAuthHeaderAsBearerToken(),
        ExtractJWT.fromUrlQueryParameter('token'),
    ]),
    secretOrKey: fs.readFileSync(process.env.PUBLIC_KEY_PATH, 'utf8'),
}, (jwtPayload, cb) => cb(null, jwtPayload)));


module.exports = passport;
