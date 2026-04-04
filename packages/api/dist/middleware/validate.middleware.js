"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
const errors_1 = require("../utils/errors");
function validate(schema, location = 'body') {
    return (0, errors_1.asyncHandler)(async (req, res, next) => {
        try {
            const result = schema.parse(req[location]);
            req[location] = result;
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                throw new errors_1.ApiError(400, 'VALIDATION_ERROR', 'Invalid request data', {
                    errors: err.errors.map((e) => ({
                        field: e.path.join('.'),
                        message: e.message,
                    })),
                });
            }
            throw err;
        }
    });
}
