/**
 * Email Validation Middleware
 * 
 * Purpose: Enforce Gmail-only registration for security and reliability
 * Location: /backend/middleware/emailValidation.js
 * 
 * Usage:
 *   const { validateGmailEmail } = require('./emailValidation')
 *   router.post('/auth/register', validateGmailEmail, registerController.register)
 * 
 * Features:
 * ✅ Validates email format
 * ✅ Enforces @gmail.com domain
 * ✅ Logs all validation attempts
 * ✅ Returns clear error messages
 * ✅ Defense-in-depth with frontend validation
 */

const logger = require('../utils/logger'); // Adjust path to your logger

/**
 * Main validation middleware
 * Ensures only @gmail.com emails can register
 */
const validateGmailEmail = (req, res, next) => {
  try {
    const email = req.body?.email?.toString().toLowerCase().trim();

    // ✅ Check: Email provided
    if (!email) {
      logger.warn('[EMAIL_VALIDATION] Missing email in registration request');
      return res.status(400).json({
        success: false,
        code: 'EMAIL_REQUIRED',
        message: 'Email address is required'
      });
    }

    // ✅ Check: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.warn(`[EMAIL_VALIDATION] Invalid email format: ${email}`);
      return res.status(400).json({
        success: false,
        code: 'EMAIL_INVALID_FORMAT',
        message: 'Please provide a valid email address'
      });
    }

    // ✅ Check: Gmail domain ONLY
    const gmailRegex = /^[^\s@]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      const domain = email.substring(email.indexOf('@') + 1);
      
      // Log the attempt
      logger.warn(`[EMAIL_VALIDATION] Non-Gmail registration attempt: ${email} (domain: @${domain})`);
      
      // Return clear error
      return res.status(400).json({
        success: false,
        code: 'EMAIL_NOT_GMAIL',
        message: `Only @gmail.com emails are allowed. You provided @${domain}`,
        details: {
          provided: `...@${domain}`,
          required: '@gmail.com'
        }
      });
    }

    // ✅ All checks passed
    logger.info(`[EMAIL_VALIDATION] Valid Gmail email for registration: ${email}`);
    
    // Attach validated email to request for use in next middleware/controller
    req.validatedEmail = email;
    
    next();

  } catch (error) {
    logger.error('[EMAIL_VALIDATION] Middleware error:', error);
    return res.status(500).json({
      success: false,
      code: 'EMAIL_VALIDATION_ERROR',
      message: 'Email validation error. Please try again later.'
    });
  }
};

/**
 * Optional: Utility function for testing email validity
 * Can be used elsewhere in the app (not just middleware)
 * 
 * Usage:
 *   const { isValidGmailEmail } = require('./emailValidation')
 *   if (isValidGmailEmail(email)) { ... }
 */
const isValidGmailEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const cleanEmail = email.toLowerCase().trim();
  const gmailRegex = /^[^\s@]+@gmail\.com$/;
  
  return gmailRegex.test(cleanEmail);
};

/**
 * Optional: Detailed validation result object
 * Useful for responses that include validation details
 * 
 * Usage:
 *   const result = validationResult(email)
 *   if (!result.isValid) {
 *     res.status(400).json(result)
 *   }
 */
const getValidationResult = (email) => {
  if (!email) {
    return {
      isValid: false,
      email: null,
      error: 'EMAIL_REQUIRED',
      message: 'Email is required'
    };
  }

  const cleanEmail = email.toString().toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const gmailRegex = /^[^\s@]+@gmail\.com$/;

  if (!emailRegex.test(cleanEmail)) {
    return {
      isValid: false,
      email: cleanEmail,
      error: 'EMAIL_INVALID_FORMAT',
      message: 'Email format is invalid'
    };
  }

  if (!gmailRegex.test(cleanEmail)) {
    const domain = cleanEmail.substring(cleanEmail.indexOf('@') + 1);
    return {
      isValid: false,
      email: cleanEmail,
      error: 'EMAIL_NOT_GMAIL',
      message: `Only @gmail.com emails allowed. Provided: @${domain}`,
      providedDomain: domain,
      requiredDomain: 'gmail.com'
    };
  }

  return {
    isValid: true,
    email: cleanEmail,
    error: null,
    message: 'Valid Gmail email'
  };
};

/**
 * Batch validation helper
 * Useful for validating multiple emails at once
 * 
 * Usage:
 *   const results = validateEmails(['user1@gmail.com', 'user2@yahoo.com'])
 */
const validateEmails = (emailArray) => {
  if (!Array.isArray(emailArray)) {
    return { valid: [], invalid: [] };
  }

  const results = {
    valid: [],
    invalid: []
  };

  emailArray.forEach(email => {
    if (isValidGmailEmail(email)) {
      results.valid.push(email.toLowerCase().trim());
    } else {
      results.invalid.push(email.toLowerCase().trim());
    }
  });

  return results;
};

// ============ EXPORTS ============

module.exports = {
  // Middleware function (main export)
  validateGmailEmail,
  
  // Utility functions
  isValidGmailEmail,
  getValidationResult,
  validateEmails,
  
  // Constants for error codes
  ERROR_CODES: {
    EMAIL_REQUIRED: 'EMAIL_REQUIRED',
    EMAIL_INVALID_FORMAT: 'EMAIL_INVALID_FORMAT',
    EMAIL_NOT_GMAIL: 'EMAIL_NOT_GMAIL',
    EMAIL_VALIDATION_ERROR: 'EMAIL_VALIDATION_ERROR'
  }
};
