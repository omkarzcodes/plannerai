import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../src/app.js";

describe("API smoke tests", () => {
  it("GET /api/health returns 200 ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("blocks unauthenticated access to protected routes", async () => {
    const res = await request(app).get("/api/boards");
    expect(res.status).toBe(401);
  });

  it("rejects an invalid login body with 422", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "not-an-email" });
    expect(res.status).toBe(422);
  });
});
