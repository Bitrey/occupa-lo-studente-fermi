import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { checkSchema, validationResult } from "express-validator";

import { isLoggedIn } from "@middlewares";
import { ResErr } from "@routes";
import { AgencyService } from "@services";
import { logger } from "@shared";
import { mongoose } from "@typegoose/typegoose";

import schema from "./schema/updateSchema";

/**
 * @openapi
 * /api/agency:
 *  put:
 *    summary: Update the currently logged in agency
 *    security:
 *      - studentAuth: []
 *    tags:
 *      - agency
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/AgencyReq'
 *    responses:
 *      '200':
 *        description: Agency
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Agency'
 *      '400':
 *        description: Data validation failed
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 *      '401':
 *        description: Not logged in
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 *      '500':
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 */

const router = Router();

// DEBUG change for AgencyReq not Agency

router.put(
    "/",
    isLoggedIn.isAgencyLoggedIn,
    checkSchema(schema),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                err: errors
                    .array()
                    .map(e => e.msg)
                    .join(", ")
            });
        } else if (!req.agency) {
            logger.error("req.agency false in update route");
            return res.status(500).json({ err: "Error while loading agency" });
        }

        const {
            responsibleFirstName,
            responsibleLastName,
            responsibleFiscalNumber,
            websiteUrl,
            email,
            password,
            phoneNumber,
            agencyName,
            agencyDescription,
            agencyAddress,
            vatCode,
            logoUrl,
            bannerUrl
        } = req.body;

        for (const prop in {
            responsibleFirstName,
            responsibleLastName,
            responsibleFiscalNumber,
            websiteUrl,
            email,
            password,
            phoneNumber,
            agencyName,
            agencyDescription,
            agencyAddress,
            vatCode,
            logoUrl,
            bannerUrl
        }) {
            if (req.body[prop] !== undefined && req.body[prop] !== null) {
                if (prop === "password") {
                    const salt = await bcrypt.genSalt(10);
                    const hashedPassword = await bcrypt.hash(password, salt);

                    req.agency.hashedPassword = hashedPassword;
                }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                else (req.agency as any)[prop] = req.body[prop];
            }
        }

        try {
            await AgencyService.update(req.agency);
            await req.agency.populate("jobOffers");
            await req.agency.populate("jobApplications");
        } catch (err) {
            if (err instanceof mongoose.Error.ValidationError) {
                logger.debug("Agency update validation error");
                logger.debug(err.message);
                return res.status(400).json({ err: err.message } as ResErr);
            }
            logger.error("Error while updating agency " + req.agency._id);
            logger.error(err);
            return res
                .status(500)
                .json({ err: "Error while updating agency" } as ResErr);
        }

        return res.json(req.agency.toObject());
    }
);

export default router;
