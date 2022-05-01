import jwt from "jsonwebtoken";
import { FilterQuery } from "mongoose";

import { Envs } from "@config";

import { CreateStudentData, Student, StudentClass } from "@models";
import { logger } from "@shared";
import { DocumentType } from "@typegoose/typegoose";

export class StudentService {
    public static async create(
        data: CreateStudentData
    ): Promise<DocumentType<StudentClass>> {
        return await Student.create(data);
    }

    public static async findOne(
        fields: FilterQuery<DocumentType<StudentClass> | null>
    ): Promise<DocumentType<StudentClass> | null> {
        return await Student.findOne(fields).exec();
    }

    public static async delete(student: DocumentType<StudentClass>) {
        logger.debug(`Deleting student ${student._id}`);
        await student.deleteOne();
    }

    // Auth

    public static createAuthCookie(
        student: DocumentType<StudentClass>
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            logger.debug(
                `Creating JWT auth cookie for student "${student._id}"`
            );
            jwt.sign(
                { student: student._id },
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

    public static async parseAuthCookie(
        jwtCookie: string
    ): Promise<DocumentType<StudentClass>> {
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

                    if (!jwtPayload.student) {
                        return reject(
                            "parseAuthCookie jwtPayload has no student"
                        );
                    }

                    StudentService.findOne({
                        _id: jwtPayload.student
                    })
                        .then(obj =>
                            obj
                                ? resolve(obj)
                                : reject("parseAuthCookie can't find student")
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
}

export * from "./google";
