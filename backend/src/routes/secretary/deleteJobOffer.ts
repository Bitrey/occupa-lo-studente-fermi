import { Router } from "express";
import { param, query, validationResult } from "express-validator";
import { ResErr } from "routes/ResErr";

import { secretaryAuth } from "@middlewares";
import { JobOfferService } from "@services";
import { logger } from "@shared";

/**
 * @openapi
 * /api/secretary/deletejoboffer/{jobOfferId}:
 *  get:
 *    summary: Deletes a jobOffer for an agency
 *    parameters:
 *      - in: query
 *        name: username
 *        schema:
 *          type: string
 *        required: true
 *        description: Secretary username
 *      - in: query
 *        name: password
 *        schema:
 *          type: string
 *        required: true
 *        description: Secretary password
 *      - in: path
 *        name: jobOfferId
 *        schema:
 *          type: string
 *        required: true
 *        description: ObjectId of the jobOfferId to delete
 *      - in: query
 *        name: notifyAgency
 *        schema:
 *          type: string
 *          enum:
 *            - yes
 *            - no
 *        required: false
 *        description: Whether to send an email to the jobOffer's agency notifying the deletion
 *    tags:
 *      - secretary
 *    responses:
 *      '200':
 *        description: Agency deleted
 *      '400':
 *        description: Invalid jobOfferId
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 *      '401':
 *        description: Invalid password
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 *      '404':
 *        description: Agency not found
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

router.get(
    "/:jobOfferId",
    param("jobOfferId").isMongoId(),
    query("notifyAgency").optional().isIn(["yes", "no"]),
    secretaryAuth,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // eslint-disable-next-line no-console
            console.log(errors.array());
            return res.status(400).json({
                err: errors
                    .array()
                    .map(e => e.msg)
                    .join(", ")
            } as ResErr);
        }

        const { jobOfferId } = req.params;
        const { notifyAgency } = req.query;

        const jobOffer = await JobOfferService.findOne({ _id: jobOfferId });
        if (!jobOffer) {
            logger.debug(`JobOffer to delete "${jobOfferId}" not found`);
            return res
                .status(404)
                .json({ err: "Job offer not found" } as ResErr);
        }

        await JobOfferService.delete(jobOffer);

        logger.debug("deleteAgency notifyAgency=" + notifyAgency);
        if (notifyAgency !== "no") {
            // DEBUG to be implemented
            logger.warn("DEBUG notifyAgency for JobOffer deletion!");
        }

        return res.sendStatus(200);
    }
);

export default router;