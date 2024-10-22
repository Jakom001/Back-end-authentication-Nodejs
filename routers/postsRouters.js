const express = require("express")
const postsController = require("../controllers/postsController")
const { indentifier } = require("../middlewares/identification");

const router = express.Router()

router.get('/all-posts', postsController.getPosts);
router.get('/single-post', postsController.singlePost);
router.post('/create-post', indentifier, postsController.createPost);
router.put('/update-post', indentifier, postsController.updatePost);
router.delete('/delete-post', indentifier, postsController.deletePost);



module.exports = router