import { Request, Response, Router } from "express";
import { param, validationResult } from "express-validator";

import { ResErr } from "@routes";
import { JobOfferService } from "@services";
import { logger } from "@shared";

/**
 * @openapi
 * /api/jobOffer/{jobOfferId}:
 *  delete:
 *    summary: Delete a job offer
 *    parameters:
 *      - in: path
 *        name: jobOfferId
 *        schema:
 *          type: string
 *        required: true
 *        description: ObjectId of the jobOffer to delete
 *    tags:
 *      - joboffer
 *    responses:
 *      '200':
 *        description: Job offer got deleted (empty body)
 *      '400':
 *        description: Bad request
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

router.delete(
    "/:_id",
    param("_id").isMongoId(),
    async (req: Request, res: Response) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ err: "Invalid ObjectId" } as ResErr);
        }

        const { _id } = req.params;

        let jobOffer;

        try {
            jobOffer = await JobOfferService.findOne({ _id });
            if (!jobOffer) throw new Error("jobOffer validated but not found");
        } catch (err) {
            logger.error("Error while finding jobOffer in update route");
            logger.error(err);
            return res
                .status(500)
                .json({ err: "Error while finding job offer" } as ResErr);
        }

        try {
            await JobOfferService.delete(jobOffer);
        } catch (err) {
            logger.error("Error while deleting jobOffer " + jobOffer._id);
            logger.error(err);
            return res
                .status(500)
                .json({ err: "Error while deleting jobOffer" } as ResErr);
        }

        res.sendStatus(200);
    }
);

export default router;
