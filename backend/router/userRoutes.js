const express = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const {
  registerController,
  loginController,
  postDocumentController,
  allDocsController,
  updateDocController,
  deleteDocController,
  getAllVersion,
} = require("../controller/userController");

const router = express.Router();

router.post("/register", registerController);

router.post("/login", loginController);

router.post("/postdocument", authMiddleware, postDocumentController);

router.get('/getalldocs', authMiddleware, allDocsController)

router.put('/updatedoc/:docid', authMiddleware, updateDocController)

router.delete('/deletedoc/:docid', authMiddleware, deleteDocController)

router.get('/getallversions', getAllVersion)

module.exports = router;
