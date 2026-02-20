import cors from "cors";
import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "Receipt Scanner API Docs",
    customCss: ".swagger-ui .topbar { display: none }",
    swaggerOptions: {
      persistAuthorization: true,
    },
  }),
);

// Swagger JSON endpoint (for importing into other tools)
app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Receipt Scanner API is running" });
});

// Root endpoint - redirect to API docs
app.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/api-docs.json`);
});

export default app;
