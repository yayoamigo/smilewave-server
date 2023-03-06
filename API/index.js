// Import necessary libraries
const express = require("express"); // Framework to create a REST API
const app = express(); // Create an instance of the express application
const https = require('https');
const mongoose = require("mongoose"); // Library for connecting to MongoDB
const helmet = require("helmet"); // Library for setting HTTP headers to improve security
const morgan = require("morgan"); // Library for logging HTTP requests
const dotenv = require("dotenv"); // Library for loading environment variables
const userRouter = require("./routes/users"); // User routes
const authRouter = require("./routes/auth"); // Authentication routes
const postRoute = require("./routes/posts"); // Post routes
const path = require('path'); // Library for working with file and directory paths
const multer = require("multer"); // Library for handling file uploads
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const io = require('socket.io');
const cors = require("cors");
const fs = require('fs');

// Load environment variables from a .env file
dotenv.config();

// Connect to MongoDB using the URL stored in the environment variable
mongoose.connect(
    process.env.MONGO_URL, 
    {useNewUrlParser: true,useUnifiedTopology: true},
    ()=>{
    console.log("connected to Mongo")
    }
    );


const options = {
   key:  fs.readFileSync('../key.pem'),
   cert:  fs.readFileSync('../cer.pm')
};


    
    // Create an HTTP server using the express app
const server = https.createServer(options, app);
    
    
    const socketServer = io(server);
  
    
    // Set up middleware to parse JSON data and log HTTP requests
    app.use(express.json());
    app.use(morgan("common"));
    
    const corsOptions = {
        origin: '*',
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type"],
        crossOriginResourcePolicy: { policy: "same-site" }
      };
      app.use(cors(corsOptions));
    // Set up middleware to set HTTP headers for improved security
    app.use(
    helmet({
    contentSecurityPolicy: {
    directives: {
    ...helmet.contentSecurityPolicy.getDefaultDirectives(),
    "img-src": ["'self'", "data:", "blob:"],
    },
    },
    })
    );
    
    // Set up routes for users, authentication, and posts
    app.use("/api/users", userRouter);
    app.use("/api/auth", authRouter);
    app.use("/api/posts", postRoute);
    app.use("/api/conversations", conversationRoute);
    app.use("/api/messages", messageRoute);
    
    // Set up multer middleware for handling file uploads and set the file storage location and name
    const storage = multer.diskStorage({
    destination: (req, file, cb) => {
    cb(null, "images/assets");
    },
    filename: (req, file, cb) => {
    cb(null, req.body.name);
    },
    });
    
    const upload = multer({ storage: storage });
    
    // Set up route to handle file uploads and return the filename
    app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
    const fileName = req.file.filename;
    return res.status(200).json({ fileName });
    } catch (error) {
    console.error(error);
    }
    });
    
    
  
  app.use('/images', express.static(path.join(__dirname, 'images/assets'), { 
  setHeaders: function (res, path, stat) {
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    }
  }
}));
    
  

    const sockets = require('./socket');
    
    // Start the HTTP server on port 8000 and log a message to the console
    const PORT = process.env.PORT || 8000;
    server.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`);
    });

    sockets.listen(socketServer);
    //exporting app
    module.exports = app;
