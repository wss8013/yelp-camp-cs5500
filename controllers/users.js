const User = require('../models/user');

const logger = require('../utils/logger');
const log = new logger("controllers/users");

function renderRegisterFunc(req, res) {
    res.render('users/register');
}

async function registerFunc(req, res, next) {
    try {
        var {email, username, password} = req;
        log.info(`user ${username} registering with email ${email}`);
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        return registeredUser;
        
        // req.login(registeredUser, err => {
        //     if(err) return next(err);
        //     req.flash('success', 'Welcome to Yelp Camp!');
        //     res.redirect('/campgrounds');
        // })
    } catch(e) {
        log.error(`register error: ${e.message}`);
        return null;
        // req.flash('error', e.message);
        // res.redirect('register');
    }
 }

function renderLoginFunc(req, res) {
    res.render('users/login')
}

function loginFunc(req, res) {
    req.flash('success', 'welcome back!');
    // need to downgrade Passport version to 0.5.0 to achieve this returnTo
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

function logoutFunc(req, res) {
    // req.logout is now an asynchronous function in new version
    // req.logout(function(err) {
    //     if (err) { return next(err); }
    //     req.flash('success', 'Goodbye!');
    //     res.redirect('/campgrounds');
    //   });
    // have to downgrade to 0.5.0 to use the following code (npm i passport@0.5.0)
    req.logout();
    req.flash('success', 'Goodbye!');
    res.redirect('/campgrounds');
}

module.exports = {
    renderRegister: renderRegisterFunc,
    register: registerFunc,
    renderLogin: renderLoginFunc,
    login: loginFunc,
    logout: logoutFunc
}