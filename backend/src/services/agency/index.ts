import jwt from "jsonwebtoken";
import { FilterQuery } from "mongoose";

import { Envs } from "@config";

import { Agency, AgencyClass, AgencyDoc, JobOffer } from "@models";
import { logger } from "@shared";
import { DocumentType } from "@typegoose/typegoose";

export class AgencyService {
    public static async findOne(
        fields: FilterQuery<DocumentType<AgencyClass> | null>,
        populateJobOffers = false,
        showHashedPassword = false,
        lean = false
    ): Promise<DocumentType<AgencyClass> | null> {
        logger.debug("Finding single agency...");

        const query = Agency.findOne(fields);

        if (!showHashedPassword) {
            query.select("-hashedPassword");
        }
        if (populateJobOffers) {
            query.populate("jobOffers");
        }
        if (lean) {
            query.lean();
        }
        return await query.exec();
    }

    public static async find(params: {
        fields: FilterQuery<AgencyDoc | null>;
        populateJobOffers?: boolean;
        showHashedPassword?: boolean;
        skip?: number;
        limit?: number;
        showPersonalData?: boolean;
        lean?: boolean;
        projection?: any;
        sortBy?: any;
    }): Promise<AgencyDoc[]> {
        logger.debug("Finding all agencies...");
        const query = Agency.find(params.fields, params.projection);

        if (params.skip) query.skip(params.skip);
        if (params.limit) query.limit(params.limit);

        if (!params.showHashedPassword) {
            query.select("-hashedPassword");
        }
        if (!params.showPersonalData) {
            query.select(
                "-responsibleFirstName -responsibleLastName -responsibleFiscalNumber -approvalStatus -approvalDate"
            );
        }
        if (params.populateJobOffers) {
            query.populate("jobOffers");
        }
        if (params.lean) {
            query.lean();
        }

        query.sort(params.sortBy || { updatedAt: -1 });

        return await query.exec();
    }

    public static async create(newAgency: AgencyDoc) {
        logger.debug("Create agency with name " + newAgency.agencyName);
        return await Agency.create(newAgency);
    }

    public static async update(agency: AgencyDoc) {
        logger.debug("Updating agency with _id " + agency._id);
        return await agency.save();
    }

    public static async delete(agency: AgencyDoc) {
        logger.debug(
            `Deleting jobOffers for agency ${
                agency._id
            }: ${agency.jobOffers.join(", ")}`
        );
        await JobOffer.deleteMany({ _id: { $in: agency.jobOffers } });
        logger.debug(`Deleting agency ${agency._id}`);
        await agency.deleteOne();
    }

    // Auth

    public static async parseAuthCookie(jwtCookie: string): Promise<AgencyDoc> {
        return new Promise((resolve, reject) => {
            jwt.verify(
                jwtCookie,
                Envs.env.JWT_SECRET,
                {},
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (err, jwtPayload: any) => {
                    if (err) {
                        logger.debug(
                            "parseAuthCookie failed: error while parsing auth cookie"
                        );
                        logger.debug(err);
                        return reject(err);
                    }

                    if (!jwtPayload.agency) {
                        return reject(
                            "parseAuthCookie jwtPayload has no agency"
                        );
                    }

                    AgencyService.findOne({
                        _id: jwtPayload.agency
                    })
                        .then(obj =>
                            obj
                                ? resolve(obj)
                                : reject("parseAuthCookie can't find agency")
                        )
                        .catch(err => {
                            logger.warn("parseAuthCookie failed");
                            logger.warn(err);
                            return reject(err);
                        });
                }
            );
        });
    }

    public static async createAuthCookie(agency: AgencyDoc): Promise<string> {
        return new Promise((resolve, reject) => {
            logger.debug(`Creating JWT auth cookie for agency "${agency._id}"`);
            jwt.sign(
                { agency: agency._id },
                Envs.env.JWT_SECRET,
                {},
                (err, cookie) => {
                    if (err) {
                        logger.warn(
                            "createAuthCookie failed: error while creating auth cookie"
                        );
                        logger.warn(err);
                        return reject(err);
                    } else if (!cookie) {
                        logger.debug("createAuthCookie cookie is undefined");
                        return reject("createAuthCookie cookie is undefined");
                    }

                    return resolve(cookie);
                }
            );
        });
    }
}
