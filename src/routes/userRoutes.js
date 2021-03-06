import express from 'express'
import mongoose, { Query } from 'mongoose'


// Models
import User from '../models/usermodel'
import Product from '../models/productmodel'


import createError from 'http-errors'

const router = express.Router()


// ---------------------- USER ROUTES ------------------------- //
// POST a new product to user cabinet
router.delete('/remove_product/:productId', async (req, res, next) => {
  console.log(`/remove_product/${req.params.productId}\n   req.body.userId:${req.body.userId})`)
  try {
    const user = await User.findByIdAndUpdate(req.body.userId,
      { $pull: { cabinet: { product: req.params.productId } } },
      { safe: true, upsert: true, new: true })
      .populate({ path: 'cabinet.product', model: Product })
    res.json(user.cabinet)
  }
  catch (err) {
    console.error("Error:", err)
    next(err)
  }
})

// POST a new product to user cabinet
router.post('/add_product/:productId', async (req, res, next) => {
  console.log(`/add_product/${req.params.productId}\n   req.body.userId:${req.body.userId})`)
  try {
    const user = await User.findByIdAndUpdate(req.body.userId,
      { $addToSet: { cabinet: { product: req.params.productId } } },
      { safe: true, upsert: true, new: true })
      .populate({ path: 'cabinet.product', model: Product })
    // console.log("user", user)
    res.json(user.cabinet)
  }
  catch (err) {
    console.error("Error:", err)
    next(err)
  }
})

// Get User products
router.get('/:id/cabinet', async (req, res, next) => {
  console.log(`GET /user/${req.params.id}`)
  try {
    const user = await User.findById(req.params.id).populate({ path: 'cabinet.product', model: Product })
    if (user) {
      res.json(user.cabinet)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  }
  catch (err) {
    next(err)
  }
})




// POST a product as finished/unfinished
router.post('/finished/:productId', async (req, res, next) => {
  console.log(`user/finished/${req.params.productId}\n   req.body.userId:${req.body.userId})`)
  try {
    const { cabinet } = await User.findById(req.body.userId)

    const updatedCabinet = cabinet.map(item => {
      if (item.product == req.params.productId) {
        return {
          "_id": item._id,
          "product": item.product,
          "finished": !item.finished,
        }
      }
      return item
    })
    const user = await User.findByIdAndUpdate(req.body.userId,{ cabinet: updatedCabinet },
      { safe: true, upsert: true, new: true })
      .populate({ path: 'cabinet.product', model: Product })
    res.json(user.cabinet)
  }
  catch (err) {
    console.error("Error:", err)
    next(err)
  }
})


// DELETE
// router.delete('/id/:id', async (req, res, next) => {
//   console.log("DELETE /product/id/", req.params.id)
//   try {
//     const product = await Product.findById(req.params.id)
//     // If no product found
//     if (product == null) {
//       throw createError(404, 'No product with this id found')
//     }
//     product.deleteOne()
//     res.json(product).status(204)
//   }
//   catch (err) {
//     next(err)
//   }
// })


module.exports = router
