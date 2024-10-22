const express = require("express")
const postsController = require("../controllers/postsController")
const { indentifier } = require("../middlewares/identification");

const router = express.Router()

router.get('/all-posts', postsController.getPosts);
// router.get('/signle-post', authController.signin);
// router.post('/create-post', indentifier, authController.signout);
// router.put('/update-post', indentifier, authController.changePasword);
// router.delete('/delete-post', indentifier, authController.changePasword);



module.exports = router