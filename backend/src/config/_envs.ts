import dotenv from "dotenv";
import process from "process";

import { logger } from "@shared";

dotenv.config();

export const requiredEnvs = [
    "MONGODB_URI",
    "STUDENT_AUTH_COOKIE_NAME",
    "AGENCY_AUTH_COOKIE_NAME",
    "AUTH_COOKIE_DURATION_DAYS",
    "JWT_SECRET",
    "NODE_ENV",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URL",
    "COOKIE_SECRET",
    "LAST_PAGE_URL_COOKIE_NAME",
    "TEMP_AUTH_DATA_COOKIE_NAME",
    "SIGNUP_URL",
    "CLIENT_LOGIN_REDIRECT_URL",
    "EMAIL_SUFFIX",
    "SECRETARY_EMAIL",
    "MAIL_SERVER",
    "MAIL_USERNAME",
    "MAIL_PASSWORD",
    "SEND_EMAIL_FROM",
    "POSITION_STACK_API_KEY",
    "GOOGLE_RECAPTCHA_V2_SECRET_KEY",
    "GOOGLE_RECAPTCHA_V3_SECRET_KEY"
] as const;

type EnvName = typeof requiredEnvs[number];
type EnvsType = {
    [envName in EnvName]: string;
};

export class Envs {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static _env: EnvsType = {} as any;

    static get env() {
        if (!Envs._env.NODE_ENV) {
            Envs._loadEnvs();
        }
        return Envs._env;
    }

    public static _loadEnvs = () => {
        logger.info("Loading envs...");

        const missingEnvs: string[] = [];
        const loadedEnvs: string[] = [];
        for (const env of requiredEnvs) {
            if (typeof process.env[env] !== "string") {
                logger.debug(`Env "${env}" doesn't exist`);
                missingEnvs.push(env);
            } else {
                loadedEnvs.push(env);
                Envs._env[env] = process.env[env] as string;
            }
        }
        logger.info(
            "Loaded envs: " +
                (Envs._env.NODE_ENV === "test"
                    ? loadedEnvs.map(e => e + "=" + process.env[e]).join(", ")
                    : loadedEnvs.join(", "))
        );

        if (missingEnvs.length > 0) {
            logger.error(
                `Missing required envs: "${missingEnvs.join('", "')}"`
            );
            process.exit(1);
        }

        logger.info("NODE_ENV is set to " + Envs._env.NODE_ENV);
    };

    // private static _staticConstructor = Envs._loadEnvs();
}
