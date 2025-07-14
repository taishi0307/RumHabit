import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGoalSchema, insertWorkoutSchema, insertHabitDataSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Goals endpoints
  app.get("/api/goals/current", async (req, res) => {
    try {
      const goal = await storage.getCurrentGoal();
      if (!goal) {
        return res.status(404).json({ message: "No goal found" });
      }
      res.json(goal);
    } catch (error) {
      res.status(500).json({ message: "Failed to get current goal" });
    }
  });

  app.put("/api/goals", async (req, res) => {
    try {
      const goalData = insertGoalSchema.parse(req.body);
      const goal = await storage.updateGoal(goalData);
      res.json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update goal" });
      }
    }
  });

  // Workouts endpoints
  app.get("/api/workouts", async (req, res) => {
    try {
      const workouts = await storage.getWorkouts();
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to get workouts" });
    }
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
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
  app.get("/api/habit-data", async (req, res) => {
    try {
      const habitData = await storage.getHabitData();
      res.json(habitData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get habit data" });
    }
  });

  app.get("/api/habit-data/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const habitData = await storage.getHabitDataByDate(date);
      if (!habitData) {
        return res.status(404).json({ message: "No habit data found for this date" });
      }
      res.json(habitData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get habit data" });
    }
  });

  app.post("/api/habit-data", async (req, res) => {
    try {
      const habitData = insertHabitDataSchema.parse(req.body);
      const result = await storage.createOrUpdateHabitData(habitData);
      res.json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create/update habit data" });
      }
    }
  });

  // Statistics endpoint
  app.get("/api/statistics", async (req, res) => {
    try {
      const habitData = await storage.getHabitData();
      const workouts = await storage.getWorkouts();
      
      // Calculate streak
      const today = new Date();
      let streak = 0;
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const data = habitData.find(h => h.date === dateStr);
        
        if (data && (data.distanceAchieved || data.heartRateAchieved || data.durationAchieved)) {
          streak++;
        } else {
          break;
        }
      }
      
      // Calculate total workout days
      const totalWorkoutDays = habitData.length;
      
      // Calculate average achievement rate
      let averageAchievementRate = 0;
      if (habitData.length > 0) {
        const totalRate = habitData.reduce((acc, day) => {
          const achieved = [day.distanceAchieved, day.heartRateAchieved, day.durationAchieved].filter(Boolean).length;
          return acc + (achieved / 3);
        }, 0);
        averageAchievementRate = Math.round(totalRate / habitData.length * 100);
      }
      
      res.json({
        streak,
        totalWorkoutDays,
        averageAchievementRate,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
