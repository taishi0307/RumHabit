import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'workout', 'sleep', 'hydration', etc.
  name: text("name").notNull(),
  targetValue: real("target_value"), // For single value goals
  unit: text("unit"), // For single value goals
  category: text("category").notNull(), // 'workout', 'sleep', 'hydration', etc.
  // Multiple value fields for workout goals
  targetDistance: real("target_distance"),
  targetTime: real("target_time"),
  targetHeartRate: real("target_heart_rate"),
  targetCalories: real("target_calories"),
  // Multiple value fields for sleep goals
  targetSleepTime: real("target_sleep_time"),
  targetSleepScore: real("target_sleep_score"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM:SS format
  distance: real("distance").notNull(),
  heartRate: integer("heart_rate").notNull(),
  duration: integer("duration").notNull(), // in seconds
  calories: integer("calories").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const habitData = pgTable("habit_data", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  achieved: boolean("achieved").default(false),
  actualValue: real("actual_value"), // The actual measured value
  workoutId: integer("workout_id").references(() => workouts.id),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
}).extend({
  targetValue: z.number().nullable().optional(),
  targetDistance: z.number().nullable().optional(),
  targetTime: z.number().nullable().optional(),
  targetHeartRate: z.number().nullable().optional(),
  targetCalories: z.number().nullable().optional(),
  targetSleepTime: z.number().nullable().optional(),
  targetSleepScore: z.number().nullable().optional(),
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  createdAt: true,
});

export const insertHabitDataSchema = createInsertSchema(habitData).omit({
  id: true,
});

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertHabitData = z.infer<typeof insertHabitDataSchema>;
export type HabitData = typeof habitData.$inferSelect;
