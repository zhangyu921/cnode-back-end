const express = require('express')
const router = express.Router()
const fs = require('fs')
const auth = require('../middlewares/tokenverify')
const userModel = require('../models/mongo/user')
const multer = require('multer')
const bytes = require('bytes')
const uploader = require('../services/qiniu').uploader
const upload = multer({
  // dest: path.join(__dirname, '../tmp'),
  storage: multer.memoryStorage(),
  limits: {
    fileSize: bytes('2MB') // 限制文件在2MB以内
  },
  fileFilter: function (req, files, callback) {
    // 只允许上传jpg|png|jpeg|gif格式的文件
    const type = '|' + files.mimetype.slice(files.mimetype.lastIndexOf('/') + 1) + '|'
    const fileTypeValid = '|jpg|png|jpeg|gif|'.indexOf(type) !== -1
    callback(null, fileTypeValid)
  }
})
const Duplex = require('stream').Duplex

function bufferToStream (buffer) { //buffer转可读流
  let stream = new Duplex()
  stream.push(buffer)
  stream.push(null)
  return stream
}

/* GET users listing. */
router.route('/')
  .get(auth(), (req, res, next) => {
    (async () => {
      return userModel.getUsers()
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })

  .post((req, res, next) => {
    (async () => {
      let user = await userModel.createUser(req.body)
      return {
        code: 0,
        user: {
          _id: user._id,
          name: user.name,
          age: user.age,
        }
      }
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })

router.route('/:id')
  .get(auth(), (req, res, next) => {
    (async () => {
      return userModel.getUserById(req.token._id)
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })

  .post(auth(), upload.single('avatar'), (req, res, next) => {
    (async () => {
      if (!req.file) {throw new Error('File upload error')}
      let mimeType = req.file.mimetype ? req.file.mimetype.split('/')[1] : ''
      let fileName = 'image/avatar/' + req.tokenData._id + Date.now() + '.' + mimeType
      let log = await uploader(
        fileName,
        bufferToStream(req.file.buffer),
      )
      if (log.code === 200) {
        return await userModel.updateUserById(req.tokenData._id, {
          avatar: 'http://ouao7n06h.bkt.clouddn.com/' + fileName + '-avatar'
        })
      }
    })()
      .then(data => res.json(data))
      // .then(fs.unlink(req.file.path, err => { //删除本地文件
      //   if (err) {return Promise.reject(err)}
      // }))
      .catch(err => next(err))
  })

  .patch(auth(), (req, res, next) => {
    (async () => {
      return userModel.updateUserById(req.params.id, req.body)
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })

  .delete(auth(), (req, res, next) => {
    (async () => {
      return userModel.deleteUserById(req.params.id)
    })()
      .then(data => res.json(data))
      .catch(err => next(err))
  })

module.exports = router
