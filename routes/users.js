const express = require('express');
// const { modelName } = require('../models/user');
const catchAsync = require('../utils/catchAsync');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const users = require('../controllers/users');

var MagicLinkStrategy = require('passport-magic-link').Strategy;
var sendgrid = require('@sendgrid/mail');
var db = require('mongoose');
sendgrid.setApiKey(process.env['SENDGRID_API_KEY']);

passport.use(new MagicLinkStrategy({
    secret: 'keyboard cat',
    userFields: [ 'username','email', 'password' ],
    tokenField: 'token',
    verifyUserAfterToken: true
  }, function send(user, token) {
        var link = 'http://blooming-escarpment-35978.herokuapp.com/register/email/verify?token=' + token;
        var msg = {
        to: user.email,
        from: process.env['EMAIL'],
        subject: 'Sign in to YelpCamp-5500',
        text: 'Hello! Click the link below to finish signing in to YelpCamp-5500.\r\n\r\n' + link,
        html: '<h3>Hello!</h3><p>Click the link below to finish signing in to YelpCamp-5500.</p><p><a href="' + link + '">Sign in</a></p>',
        };
        return sendgrid.send(msg);
    }, users.register));

router.route('/register')
    .get(users.renderRegister)
    .post(passport.authenticate('magiclink', {
        action: 'requestToken',
        failureRedirect: '/login'
      }), function(req, res, next) {
        res.redirect('/register/email/check');
      });

router.route('/login')
    .get((users.renderLogin))
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), users.login);
      
router.post('/register/email/check', passport.authenticate('magiclink', {
        action: 'requestToken',
        failureRedirect: '/login'
      }), function(req, res, next) {
        res.redirect('/register/email/check');
      });
router.get('/register/email/check', function(req, res, next) {
      res.render('users/register/email/check');
    });
router.get('/register/email/verify', passport.authenticate('magiclink', {
        successReturnToOrRedirect: '/campgrounds',
        failureRedirect: '/register'
      }));
// newest passport documentation recommends to user POST or DELETE requests instead of GET
router.get('/logout', users.logout);

module.exports = router;