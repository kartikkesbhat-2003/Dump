const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("./config/passport");
const fileUpload = require("express-fileupload");
const { cloudnairyconnect } = require("./config/cloudinary");

const cors = require("cors");
const app = express();
const http = require('http');
const { initSocket } = require('./utils/socket');

// Configure CORS early so preflight (OPTIONS) and other middleware get the headers
const corsOptions = {
  origin: [
    "https://dumppp-api1.onrender.com",
    "https://dump-eight.vercel.app",
    "https://dumpsocial.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
  maxAge: 14400
};

app.use(cors(corsOptions));
// Ensure preflight requests receive CORS headers
app.options(/.*/, cors(corsOptions));

const PORT = process.env.PORT || 5000;
database.connect();

app.use(express.json());
app.use(cookieParser());

// Session middleware must come before passport
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

cloudnairyconnect();

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");

// Use routes
app.use("/auth", authRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);
app.use("/notification", notificationRoutes);
app.use('/user', userRoutes);


app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

// Create HTTP server and initialize socket.io
const server = http.createServer(app);
// Initialize socket.io with cors options similar to express
initSocket(server, { cors: { origin: corsOptions.origin, methods: corsOptions.methods, credentials: corsOptions.credentials } });

server.listen(PORT, () => {
  console.info(`Server is running on port ${PORT}`);
});
