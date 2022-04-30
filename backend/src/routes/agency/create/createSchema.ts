import CodiceFiscale from "codice-fiscale-js";
import { Schema } from "express-validator";
import { isValidPhoneNumber, parsePhoneNumber } from "libphonenumber-js";
import moment from "moment";

import { logger, urlExists } from "@shared";

export const validatorSchema: Schema = {
    responsibleFirstName: {
        in: "body",
        errorMessage: "Agency's responsible first name not specified",
        isLength: {
            errorMessage:
                "Agency's responsible first name must be 1-100 characters long",
            options: { min: 1, max: 100 }
        }
    },
    responsibleLastName: {
        in: "body",
        errorMessage: "Agency's responsible last name not specified",
        isLength: {
            errorMessage:
                "Agency's responsible last name must be 1-100 characters long",
            options: { min: 1, max: 100 }
        }
    },
    responsibleFiscalNumber: {
        in: "body",
        errorMessage: "Fiscal number not specified",
        isString: {
            errorMessage: "fiscalNumber must be string"
        },
        custom: {
            // errorMessage: "Invalid fiscal number",
            options: value => {
                if (!CodiceFiscale.check(value)) {
                    logger.debug("Invalid fiscal number");
                    throw new Error("Invalid fiscal number");
                }

                const cf = new CodiceFiscale(value);
                // only 18 year olds and older
                if (moment().diff(moment(cf.birthday), "years") < 18) {
                    logger.debug(
                        "Agency's responsible is not old enough (< 18)"
                    );
                    throw new Error("Agency's responsible must be at least 18");
                }
                return true;
            }
        }
    },
    websiteUrl: {
        in: "body",
        errorMessage: "Website URL not specified",
        isURL: {
            errorMessage: "Website URL must be a valid URL"
        },
        custom: {
            errorMessage: "Website URL doesn't exist",
            options: async v => await urlExists(v)
        }
    },
    email: {
        in: "body",
        errorMessage: "Email not specified",
        isEmail: {
            errorMessage: "Invalid email"
        }
    },
    password: {
        in: "body",
        errorMessage: "Password not specified",
        isLength: {
            options: { min: 8, max: 64 },
            errorMessage: "Password must be between 8-64 characters long"
        }
    },
    phoneNumber: {
        in: "body",
        errorMessage: "Phone number not specified",
        isString: {
            bail: true,
            errorMessage: "Phone number must be a string"
        },
        custom: {
            options: value => {
                if (!isValidPhoneNumber(value, "IT")) {
                    throw new Error("Invalid phone number");
                }
                return true;
            }
        },
        customSanitizer: {
            options: value => {
                return parsePhoneNumber(value, "IT").format("E.164");
            }
        }
    },
    agencyName: {
        in: "body",
        errorMessage: "Agency name not specified",
        isLength: {
            errorMessage: "Invalid agency name length",
            options: { min: 1, max: 100 }
        }
    },
    agencyDescription: {
        in: "body",
        errorMessage: "Agency description not specified",
        isLength: {
            errorMessage: "Description must be 16-1000 characters long",
            options: { min: 16, max: 1000 }
        }
    },
    agencyAddress: {
        in: "body",
        errorMessage: "Agency address not specified",
        isLength: {
            errorMessage: "Agency address must be at least 3 characters long",
            options: { min: 3 }
        }
    },
    vatCode: {
        in: "body",
        errorMessage: "Agency VAT code not specified",
        isLength: {
            errorMessage: "VAT code must be between 2-32 characters long",
            options: { min: 2, max: 32 }
        }
    },
    logoUrl: {
        in: "body",
        errorMessage: "Logo URL not specified",
        isURL: {
            errorMessage: "Logo URL must be an URL"
        },
        custom: {
            errorMessage: "Logo URL doesn't exist",
            options: async v => await urlExists(v)
        },
        optional: true
    },
    captcha: {
        in: "body",
        errorMessage: "Invalid ReCAPTCHA code"
    }
};

export default validatorSchema;
