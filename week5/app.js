const express = require('express')
const cors = require('cors')
const path = require('path')
const pinoHttp = require('pino-http')

const appError = require('./utils/appError')
const logger = require('./utils/logger')('app')

const creditPackageRouter = require('./routes/creditPackage')
const skillRouter = require('./routes/skill')
const userRouter = require('./routes/user')
const adminRouter = require('./routes/admin')
const coachRouter = require('./routes/coach')
const courseRouter = require('./routes/courses')
const uploadRouter = require('./routes/upload')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(pinoHttp({
  logger,
  serializers: {
    req (req) {
      req.body = req.raw.body
      return req
    }
  }
}))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/healthcheck', (req, res) => {
  res.status(200)
  res.send('OK')
})
app.use('/api/credit-package', creditPackageRouter)
app.use('/api/coaches/skill', skillRouter)
app.use('/api/users', userRouter)
app.use('/api/admin/coaches', adminRouter)
app.use('/api/coaches', coachRouter)
app.use('/api/courses', courseRouter)
app.use('/api/upload', uploadRouter)

app.use( (req, res, next) => {
  next(appError(404, 'error', '無此路由資訊', next))
})

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err)
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.name,
      message: err.message
    })
  } else {
    res.status(500).json({
      status: 'error',
      message: '伺服器錯誤'
    })
  }
})

module.exports = app
