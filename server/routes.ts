import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertWorkoutSchema, insertHabitDataSchema, type HabitData, insertUserSchema, loginSchema } from "@shared/schema";
import { smartWatchRoutes } from "./smartwatch-apis";
import { sessionConfig, requireAuth, optionalAuth, createUser, findUserByEmail, verifyPassword, generateToken, verifyToken, findUserById } from "./auth";
import passport from "passport";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  app.use(sessionConfig);
  app.use(passport.initialize());
  app.use(passport.session());

  // Test route to verify API is working
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await findUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ error: "このメールアドレスは既に登録されています" });
      }

      const user = await createUser(userData);
      const token = generateToken(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "入力データが無効です", details: error.errors });
      } else {
        res.status(500).json({ error: "ユーザー登録に失敗しました" });
      }
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています" });
      }

      if (!user.password) {
        return res.status(401).json({ error: "Googleアカウントでログインしてください" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています" });
      }

      const token = generateToken(user.id);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
        token,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "入力データが無効です", details: error.errors });
      } else {
        res.status(500).json({ error: "ログインに失敗しました" });
      }
    }
  });

  // Get current user
  app.get("/api/auth/user", async (req, res) => {
    try {
      // Check session-based auth first
      if (req.isAuthenticated && req.isAuthenticated()) {
        const user = req.user as any;
        return res.json({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        });
      }

      // Check JWT token
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) {
        const decoded = verifyToken(token);
        if (decoded) {
          const user = await findUserById(decoded.userId);
          if (user) {
            return res.json({
              id: user.id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              profileImageUrl: user.profileImageUrl,
            });
          }
        }
      }

      res.status(401).json({ error: "認証が必要です" });
    } catch (error) {
      res.status(500).json({ error: "ユーザー情報の取得に失敗しました" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "ログアウトしました" });
    });
  });

  // Google OAuth routes
  app.get("/api/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    async (req, res) => {
      const user = req.user as any;
      if (user) {
        const token = generateToken(user.id);
        res.redirect(`/?token=${token}`);
      } else {
        res.redirect("/login?error=auth_failed");
      }
    }
  );
  // Goals endpoints (認証が必要)
  app.get("/api/goals", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const category = req.query.category as string;
      const goals = category 
        ? await storage.getGoalsByCategory(userId, category)
        : await storage.getGoals(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "Failed to get goals" });
    }
  });

  app.post("/api/goals", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      console.log("Received goal data:", req.body);
      const goalData = insertGoalSchema.parse(req.body);
      console.log("Parsed goal data:", goalData);
      const goal = await storage.createGoal(userId, goalData);
      console.log("Created goal:", goal);
      res.json(goal);
    } catch (error) {
      console.error("Goal creation error:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        console.error("Storage error:", error);
        res.status(500).json({ message: "Failed to create goal" });
      }
    }
  });

  app.put("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const id = parseInt(req.params.id);
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.updateGoal(userId, id, goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  app.delete("/api/goals/:id", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const id = parseInt(req.params.id);
      const success = await storage.deleteGoal(userId, id);
      res.json({ success });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete goal" });
    }
  });

  // Workouts endpoints
  app.get("/api/workouts", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const workouts = await storage.getWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workouts" });
    }
  });

  app.post("/api/workouts", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(userId, workoutData);
      res.json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create workout" });
      }
    }
  });

  // Habit data endpoints
  app.get("/api/habit-data", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const goalId = req.query.goalId as string;
      const date = req.query.date as string;
      
      let habitData: HabitData[];
      if (goalId) {
        habitData = await storage.getHabitDataByGoal(userId, parseInt(goalId));
      } else if (date) {
        habitData = await storage.getHabitDataByDate(userId, date);
      } else {
        habitData = await storage.getHabitData(userId);
      }
      
      res.json(habitData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get habit data" });
    }
  });

  app.post("/api/habit-data", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const habitDataInput = insertHabitDataSchema.parse(req.body);
      const habitData = await storage.createOrUpdateHabitData(userId, habitDataInput);
      res.json(habitData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create/update habit data" });
      }
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", requireAuth, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user.id;
      const goals = await storage.getGoals(userId);
      const habitData = await storage.getHabitData(userId);
      
      // Calculate statistics
      let streak = 0;
      let totalWorkoutDays = 0;
      let totalAchievements = 0;
      let totalDays = 0;
      
      // Group habit data by date
      const dataByDate = new Map<string, HabitData[]>();
      habitData.forEach(data => {
        if (!dataByDate.has(data.date)) {
          dataByDate.set(data.date, []);
        }
        dataByDate.get(data.date)!.push(data);
      });
      
      // Sort dates (newest first)
      const sortedDates = Array.from(dataByDate.keys()).sort((a, b) => 
        new Date(b).getTime() - new Date(a).getTime()
      );
      
      // Calculate current streak
      for (const date of sortedDates) {
        const dayData = dataByDate.get(date)!;
        const allAchieved = dayData.every(data => data.achieved);
        if (allAchieved && dayData.length > 0) {
          streak++;
        } else {
          break;
        }
      }
      
      // Calculate total statistics
      totalWorkoutDays = sortedDates.length;
      
      sortedDates.forEach(date => {
        const dayData = dataByDate.get(date)!;
        const achievedCount = dayData.filter(data => data.achieved).length;
        totalAchievements += achievedCount;
        totalDays += dayData.length;
      });
      
      const averageAchievementRate = totalDays > 0 ? (totalAchievements / totalDays) * 100 : 0;
      
      res.json({
        streak,
        totalWorkoutDays,
        averageAchievementRate: Math.round(averageAchievementRate),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get statistics" });
    }
  });

  // Smart Watch API routes
  smartWatchRoutes(app);

  return createServer(app);
}