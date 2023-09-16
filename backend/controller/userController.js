const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = require("../schemas/userModel");
const docSchema = require("../schemas/docModel");
const documentVersionSchema = require("../schemas/versionHistory");

//////////for registering/////////////////////////////
const registerController = async (req, res) => {
  try {
    const existsUser = await userSchema.findOne({ email: req.body.email });
    if (existsUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;

    const newUser = new userSchema(req.body);
    await newUser.save();

    return res
      .status(201)
      .send({ message: "Register Successfully", success: true });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

////for the login
const loginController = async (req, res) => {
  try {
    const user = await userSchema.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invalid email or password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "30d",
    });
    user.password = undefined;
    return res.status(200).send({
      message: "Login successfully",
      success: true,
      token,
      userData: user,
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: `${error.message}` });
  }
};

const postDocumentController = async (req, res) => {
  const { title, authorName, content, userId } = req.body;
  try {
    const doc = new docSchema({
      userId,
      title,
      content,
      authorName,
      editedBy: [{ editorName: authorName }],
    });

    // Save the document to the database
    await doc.save();

    const docVersion = new documentVersionSchema({
      documentId: doc._id,
      userId: userId,
      editorName: authorName,
      title,
      content: content,
      timestamp: Date.now(),
    });

    await docVersion.save();

    // Send a success response
    return res.status(200).send({
      success: true,
      message: "Your Document is saved",
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const allDocsController = async (req, res) => {
  try {
    const allDocs = await docSchema.find();
    return res.status(200).send({
      success: true,
      data: allDocs,
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const updateDocController = async (req, res) => {
  const { docid } = req.params;
  try {
    const user = await userSchema.findOne({ _id: req.body.userId });
    const updatedDoc = {
      title: req.body.title,
      content: req.body.content,
      $push: {
        // Use $push to add a new element to the 'editedBy' array
        editedBy: {
          editorName: user.name,
          timestamp: new Date(), // You can use the current timestamp
        },
      },
    };
    const doc = await docSchema.findByIdAndUpdate(
      { _id: docid },
      updatedDoc, // Use the updatedDoc object to specify the changes
      { new: true } // To return the updated document
    );

    const newDocVersion = new documentVersionSchema({
      userId: req.body.userId, // Assuming you have a userId associated with the version
      documentId: docid, // Assuming you have a reference to the original document
      editorName: user.name,
      title: req.body.title,
      content: req.body.content,
      timestamp: Date.now(),
    });

    // Save the new document version
    await newDocVersion.save();

    return res.status(201).send({
      success: true,
      message: "Document updated successfully",
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(500).send({ message: "Server error" });
  }
};

const deleteDocController = async (req, res) => {
  const { docid } = req.params;
  try {
    const doc = await docSchema.findByIdAndDelete({
      _id: docid,
    });

    return res.status(201).send({
      success: true,
      message: "document deleted succesfully",
    });
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(500).send({ message: "Server error" });
  }
};

const getAllVersion = async(req, res) => {
    try {
      const allVersion = await documentVersionSchema.find()
  
      return res.status(201).send({
        success :true ,  data :allVersion
      })
    } catch (error) {
      console.error("Error creating document:", error);
      return res.status(500).send({ message: "Server error" });
    }
  }

module.exports = {
  registerController,
  loginController,
  postDocumentController,
  allDocsController,
  updateDocController,
  deleteDocController,
  getAllVersion,
};
