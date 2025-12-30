import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';

/**
 * Validation middleware to handle express-validator results
 */
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const extractedErrors: { [key: string]: string }[] = [];
    
    errors.array().forEach((err: ExpressValidationError) => {
      if (err.type === 'field') {
        extractedErrors.push({ [err.path]: err.msg });
      }
    });

    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: extractedErrors,
    });
    return;
  }
  
  next();
};
