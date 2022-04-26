const passport = require("passport");
var GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

if (process.env.PROD == "true") {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.PROD_CLIENT_ID,
                clientSecret: process.env.PROD_SECRET,
                callbackURL: process.env.PROD_REDIRECT_URI,
                passReqToCallback: true,
            },
            function (request, accessToken, refreshToken, profile, done) {
                return done(null, profile);
            }
        )
    );
} else {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.TEST_CLIENT_ID,
                clientSecret: process.env.TEST_SECRET,
                callbackURL: process.env.TEST_REDIRECT_URI,
                passReqToCallback: true,
            },
            function (request, accessToken, refreshToken, profile, done) {
                return done(null, profile);
            }
        )
    );
}
