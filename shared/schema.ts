import { pgTable, text, serial, integer, boolean, timestamp, real, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email").unique().notNull(),
  password: varchar("password"), // nullable for Google OAuth users
  googleId: varchar("google_id").unique(), // for Google OAuth
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
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
  userId: integer("user_id").references(() => users.id).notNull(),
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
  userId: integer("user_id").references(() => users.id).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  goalId: integer("goal_id").references(() => goals.id).notNull(),
  achieved: boolean("achieved").default(false),
  actualValue: real("actual_value"), // The actual measured value
  workoutId: integer("workout_id").references(() => workouts.id),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email(),
  password: z.string().min(8).optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  userId: true,
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
  userId: true,
  createdAt: true,
});

export const insertHabitDataSchema = createInsertSchema(habitData).omit({
  id: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export type InsertHabitData = z.infer<typeof insertHabitDataSchema>;
export type HabitData = typeof habitData.$inferSelect;
