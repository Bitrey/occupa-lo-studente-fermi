import bcrypt from "bcrypt";
import { Request, Response, Router } from "express";
import { checkSchema, validationResult } from "express-validator";
import Mail from "nodemailer/lib/mailer";

import { Envs } from "@config";

import { Agency } from "@models";
import { ResErr } from "@routes";
import { CaptchaService } from "@services";
import {
    AgencyService,
    EmailService,
    agencyRegistration,
    secretaryNewAgency
} from "@services";
import { logger } from "@shared";
import { mongoose } from "@typegoose/typegoose";

import { AgencyAuthCookieManager } from "./helpers";
import schema from "./schema/createSchema";

/**
 * @openapi
 * /api/agency:
 *  post:
 *    summary: Create a new agency
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
 *      '500':
 *        description: Server error
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ResErr'
 */

const router = Router();

router.post("/", checkSchema(schema), async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            err: errors
                .array()
                .map(e => e.msg)
                .join(", ")
        } as ResErr);
    }

    const {
        responsibleFirstName,
        responsibleLastName,
        responsibleFiscalNumber,
        email,
        password,
        websiteUrl,
        phoneNumber,
        agencyName,
        agencyDescription,
        agencyAddress,
        vatCode,
        logoUrl,
        bannerUrl,
        captcha
    } = req.body;

    // Check CAPTCHA
    // DEBUG decomment this
    // if (Envs.env.NODE_ENV === "test") {
    //     logger.warn("Create agency skipping CAPTCHA verification");
    // } else {
    try {
        const { success } = await CaptchaService.verify(captcha);
        if (!success) throw new ReferenceError();
    } catch (err) {
        if (err instanceof ReferenceError) {
            logger.debug("CAPTCHA failed for creating agency " + agencyName);
            return res.status(401).json({ err: "Invalid ReCAPTCHA" } as ResErr);
        }
        logger.error("Error while verifying ReCAPTCHA");
        logger.error(err);
        return res
            .status(500)
            .json({ err: "Error while verifying ReCAPTCHA" } as ResErr);
    }
    // }

    // Check if agency already exists
    let existingAgency;
    try {
        existingAgency = await AgencyService.findOne({
            $or: [{ agencyName }, { email }, { vatCode }]
        });
    } catch (err) {
        logger.error("Error while finding existing agency");
        logger.error(err);
        return res
            .status(500)
            .json({ err: "Error while creating agency" } as ResErr);
    }

    if (existingAgency) {
        return res.status(400).json({
            err: "Agency with the same data (name, email or VAT code) already exists"
        } as ResErr);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const agencyDoc = new Agency({
        responsibleFirstName,
        responsibleLastName,
        responsibleFiscalNumber,
        email,
        hashedPassword,
        websiteUrl,
        phoneNumber,
        agencyName,
        agencyDescription,
        agencyAddress,
        vatCode,
        logoUrl,
        bannerUrl,
        approvalStatus: "waiting",
        jobOffers: [],
        jobApplications: []
    });

    let agency;
    try {
        agency = await AgencyService.create(agencyDoc);
    } catch (err) {
        if (err instanceof mongoose.Error.ValidationError) {
            logger.debug("Agency create validation error");
            logger.debug(err.message);
            return res.status(400).json({ err: err.message } as ResErr);
        }
        logger.error("Error while creating agency");
        logger.error(err);
        return res
            .status(500)
            .json({ err: "Error while creating agency" } as ResErr);
    }

    const secretaryEmail: Mail.Options = {
        from: `"Occupa lo Studente" ${Envs.env.SEND_EMAIL_FROM}`,
        to: Envs.env.SECRETARY_EMAIL,
        subject: `Nuova azienda "${agencyDoc.agencyName}" da approvare`,
        html: secretaryNewAgency(agencyDoc)
    };

    const agencyEmail: Mail.Options = {
        from: `"Occupa lo Studente" ${Envs.env.SEND_EMAIL_FROM}`,
        to: agencyDoc.email,
        subject: `Registrazione di "${agencyDoc.agencyName}" su Occupa lo studente`,
        html: agencyRegistration(agencyDoc)
    };

    try {
        await EmailService.sendMail(secretaryEmail);
        logger.info(`Email sent to secretary for new agency "${agencyName}"`);

        await EmailService.sendMail(agencyEmail);
        logger.info(`Email sent to agency for new agency "${agencyName}"`);
    } catch (err) {
        logger.error("Error while sending email");
        logger.error(err);
    }

    try {
        await AgencyAuthCookieManager.saveAgencyAuthCookie(res, agency);
    } catch (err) {
        logger.error("Error while saving agency auth cookie in agency create");
        logger.error(err);
    }

    // DEBUG send confirmation email

    res.json(agency.toObject());
});

export default router;
