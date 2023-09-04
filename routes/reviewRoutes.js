const express = require('express')
const router = express.Router()

const {
  authenticateUser,
  authorizePermissions,
} = require('../middleware/authentication')

const {
  getAllReviews,
  getSingleReview,
  updateReview,
  deleteReview,
  createReview,
} = require('../controllers/reviewController')

router.route('/').get(getAllReviews).post(authenticateUser, createReview) //algo a mais

router
  .route('/:id')
  .get(getSingleReview)
  .patch(authenticateUser, updateReview) //algo a mais
  .delete(authenticateUser, deleteReview) //algo a mais

module.exports = router
