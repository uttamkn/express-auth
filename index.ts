import express from "express";
import connectDB from "./db";
import authRoutes from "./routes/auth";
import { PORT } from "./env";

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("listening on port", PORT);
    });
  })
  .catch((err) => console.error(err));
