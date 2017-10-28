'use strict'

var mongoose = require('mongoose')

var pinSchema = mongoose.Schema({

  image: String,
  quote: String,
  owner: String,
  isAccepted: { type: Boolean, default: false }

}, { collection: 'fccBuildPinterestClonePin' })

module.exports = mongoose.model('Pin', pinSchema)
