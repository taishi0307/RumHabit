import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  distance: real("distance").notNull().default(5.0),
  heartRate: integer("heart_rate").notNull().default(150),
  duration: integer("duration").notNull().default(30), // in minutes
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
  date: text("date").notNull().unique(), // YYYY-MM-DD format
  distanceAchieved: boolean("distance_achieved").default(false),
  heartRateAchieved: boolean("heart_rate_achieved").default(false),
  durationAchieved: boolean("duration_achieved").default(false),
  workoutId: integer("workout_id").references(() => workouts.id),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
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
