const JwtStrategy = require("passport-jwt").Strategy,
  ExtractJWT = require("passport-jwt").ExtractJwt;
const User = require("../models/user-model");

module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtractJWT.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = process.env.API_KEY;

  passport.use(
    new JwtStrategy(opts, async function (jwt_payload, done) {
      try {
        let user = await User.findById(jwt_payload._id);
        if (user) return done(null, user);
        else return done(null, false);
      } catch (err) {
        return done(err, false);
      }
    })
  );
};
