const express = require('express')
const router = express.Router()
const topicModel = require('../models/mongo/topic')
const userModel = require('../models/mongo/user')
/* GET topics listing. */

router.route('/')
  .get((req, res, next) => {
    (async () => {
      return topicModel.getTopics(req.query)
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })
  .post((req, res, next) => {
    (async () => {
      const user = await userModel.getUserById(req.body.userId)//验证
      if (!user) { throw new Error('Invalid Author') }
      const params = Object.assign({}, req.body, {authorId: user._id})
      return await topicModel.createTopic(params)
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })

router.route('/:id')
  .get((req, res, next) => {
    (async () => {
      return topicModel.getTopicById(req.params.id)
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })
  .patch((req, res, next) => {
    (async () => {
      return topicModel.upDateTopicById(req.params.id, req.body)
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })
  .delete((req, res, next) => {
    (async () => {
      return topicModel.deleteTopicById(req.params.id)
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })

// router.route('/:id/reply')
//   .post((req, res, next) => {
//     (async () => {
//       const user = await userModel.getUserById(req.body.userId)
//       const params = Object.assign({}, req.body, {user})
//       return await topicModel.addReply(req.params.id, params)
//     })()
//       .then(data => res.json(data))
//       .catch(err => next(err))
//   })

module.exports = router
