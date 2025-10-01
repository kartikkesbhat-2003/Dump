const express = require("express");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { googleOAuthHandler } = require("./controllers/auth");
const fileUpload = require("express-fileupload");
const { cloudnairyconnect } = require("./config/cloudinary");


const app = express();
const cors = require("cors");

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true in production with HTTPS
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const user = await googleOAuthHandler(profile);
        return done(null, user);
    } catch (error) {
        console.error("Error in Google OAuth strategy:", error);
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const User = require("./models/User");
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

const dotenv = require("dotenv");
dotenv.config();

// Configure CORS
const corsOptions = {
  origin: [
    "https://dump-frontend.onrender.com",
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
    "Origin"
  ],
  credentials: true,
  optionsSuccessStatus: 200, // For legacy browser support
  maxAge: 14400
};

// Add environment-specific origins if available
if (process.env.CORS_ORIGIN) {
  try {
    const envOrigins = JSON.parse(process.env.CORS_ORIGIN);
    corsOptions.origin = corsOptions.origin.concat(envOrigins);
  } catch (error) {
    console.warn("Failed to parse CORS_ORIGIN environment variable:", error);
  }
}

app.use(cors(corsOptions));

// Handle preflight requests explicitly for all routes
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Max-Age', '14400');
    return res.status(200).end();
  }
  next();
});

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
