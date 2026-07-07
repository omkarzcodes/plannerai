import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

export type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.params) {
        // Validate params (throws if invalid); read them via req.params in controllers
        schemas.params.parse(req.params);
      }
      if (schemas.query) {
        // In Express 5, req.query is read-only, so store the parsed result here
        res.locals.query = schemas.query.parse(req.query);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
