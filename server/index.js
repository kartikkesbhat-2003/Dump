const express = require("express");
const dotenv = require("dotenv");
dotenv.config();

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const { cloudnairyconnect } = require("./config/cloudinary");

const cors = require("cors");
const app = express();

// Configure CORS early so preflight (OPTIONS) and other middleware get the headers
const corsOptions = {
  origin: [
    "https://dump-frontend-q1mu.onrender.com",
    "https://dumppp-api1.onrender.com", // Allow API domain too
    "http://localhost:5173", // For local development
    "http://localhost:3000"  // Alternative local port
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
// Use a regex route to match all paths so path-to-regexp is not asked to parse a wildcard string
app.options(/.*/, cors(corsOptions));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}))

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp",
  })
);

const PORT = process.env.PORT || 5000;
database.connect();

app.use(express.json());
app.use(cookieParser());

cloudnairyconnect();

// Import routes
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");

// Use routes
app.use("/auth", authRoutes);
app.use("/post", postRoutes);
app.use("/comment", commentRoutes);


app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the API",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
