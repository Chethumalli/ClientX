import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config";
import connectDatabase from "./config/database.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { HTTPSTATUS } from "./config/http.config";
import "./config/passport.config";
import passport from "passport";

// Routes
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import workspaceRoutes from "./routes/workspace.route";
import memberRoutes from "./routes/member.route";
import projectRoutes from "./routes/project.route";
import taskRoutes from "./routes/task.route";
import isAuthenticated from "./middlewares/isAuthenticated.middleware";

const app = express();
const BASE_PATH = config.BASE_PATH;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// ✅ Health check route (public, no auth required)
app.get("/", (req: Request, res: Response) => {
  res.status(HTTPSTATUS.OK).json({
    message: "✅ Server is running",
    env: config.NODE_ENV,
  });
});

// Protected routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

// Global error handler
app.use(errorHandler);

// ✅ Use Render’s assigned port or fallback
const PORT = process.env.PORT || config.PORT;

app.listen(PORT, async () => {
  console.log(`Server listening on port ${PORT} in ${config.NODE_ENV}`);
  await connectDatabase();
});
