'use strict'

var User = require('../models/users')
var Pin = require('../models/pins')

var path = process.cwd()

module.exports = function (app, passport) {
  function isLoggedIn (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    } else {
      res.redirect('/login')
    }
  }

  app.route('/')
		.get(function (req, res) {
  res.render('index', {user: req.user})
})

  app.route('/login')
		.get(function (req, res) {
  res.render('login', { message: req.flash('loginMessage') })
})

  app.route('/logout')
		.get(function (req, res) {
  req.logout()
  res.redirect('/')
})

  app.route('/signup')
    .get(function (req, res) {
      res.render('signup', {message: req.flash('signupMessage')})
    })

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/mypins', // redirect to the secure mypins section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/mypins', // redirect to the secure mypins section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }))

  app.route('/mypins')
		.get(isLoggedIn, function (req, res) {
  Pin.find({owner: req.user.id}, function (error, pins) {
    if (error) return res.send(error)
    res.render('myPins', {
      pins: pins,
      user: req.user
    })
  })
})
  app.route('/allpins')
		.get(function (req, res) {
  Pin.find({}, function (error, pins) {
    if (error) return res.send(error)
    res.render('allPins', {
      pins: pins,
      user: req.user
    })
  })
})
  app.route('/newPin')
    .post(isLoggedIn, function (req, res) {
      var newPin = new Pin({
        quote: req.body.quote,
        image: req.body.image,
        owner: req.user.id
      })
      newPin.save(function (err) {
        if (err) throw err
        res.redirect('/mypins')
      })
    })
  app.route('/deletePin/:pinId')
		.get(isLoggedIn, function (req, res) {
  Pin.findOne({_id: req.params.pinId}, function (error, pin) {
    if (error) return res.send(error)
    if (!pin) return res.send('No matching pin found')
    if (pin.owner == req.user.id) {
      pin.remove()
      res.redirect('/myPins')
    } else {
      res.json({error: 'You cannot delete other users pins'})
    }
  })
})

      // =====================================
    // TWITTER ROUTES ======================
    // =====================================
    // route for twitter authentication and login
  app.get('/auth/twitter', passport.authenticate('twitter'))

    // handle the callback after twitter has authenticated the user
  app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
          successRedirect: '/mypins',
          failureRedirect: '/'
        }))
}
