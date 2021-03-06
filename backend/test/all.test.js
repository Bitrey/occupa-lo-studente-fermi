const chai = require("chai");
const chaiHttp = require("chai-http");
const { faker, Faker } = require("@faker-js/faker");
const CodiceFiscale = require("codice-fiscale-js");
const moment = require("moment");

const { expect } = chai;

chai.use(chaiHttp);

const URL = "http://localhost:5000/api";
const agent = chai.request.agent(URL);

const name = faker.name.firstName();
const surname = faker.name.lastName();

const cf = new CodiceFiscale({
  birthplace: "Modena",
  birthplaceProvincia: "MO",
  day: faker.datatype.number({ min: 1, max: 30 }),
  gender: "M",
  month: faker.datatype.number({ min: 1, max: 12 }),
  name,
  surname,
  year: faker.datatype.number({ min: 2003, max: 2005 })
});

const rawStudent = {
  googleId: faker.datatype.number({ min: 1000, max: 9999 }).toString(),
  firstName: name,
  lastName: surname,
  fiscalNumber: cf.toString(),
  email: `${name}.${surname}@fermi.mo.it`,
  pictureUrl: "https://picsum.photos/300",
  phoneNumber: "3924133359",
  fieldOfStudy: "it",
  hasDrivingLicense: faker.datatype.boolean(),
  canTravel: faker.datatype.boolean()
  // spidVerified: false,
};

let studentDB;

const agencyName = faker.name.firstName();
const agencySurname = faker.name.lastName();

const agencyCf = new CodiceFiscale({
  birthplace: "Modena",
  birthplaceProvincia: "MO",
  day: faker.datatype.number({ min: 1, max: 30 }),
  gender: "M",
  month: faker.datatype.number({ min: 1, max: 12 }),
  name: agencyName,
  surname: agencySurname,
  year: faker.datatype.number({ min: 1990, max: 2003 })
});

const rawAgency = {
  responsibleFirstName: agencyName,
  responsibleLastName: agencySurname,
  responsibleFiscalNumber: agencyCf.toString(),
  email: faker.internet.email(agencyName, agencySurname),
  websiteUrl: "https://www.google.com",
  phoneNumber: "3924133359",
  password: "diocaneporco",
  agencyName: faker.company.companyName(),
  agencyDescription: faker.lorem.paragraphs(3),
  agencyAddress: faker.address.city() + " " + faker.address.secondaryAddress(),
  vatCode: faker.datatype.string(10),
  logoUrl: "https://picsum.photos/500",
  bannerUrl: "https://picsum.photos/2000"
};

console.log({ pw: rawAgency.password });

let agencyDB;

const rawJobOffer = {
  agency: agencyDB?._id,
  title: faker.lorem.word(10),
  description: faker.lorem.sentences(10),
  fieldOfStudy: faker.random.arrayElement(["it", "electronics", "chemistry"]),
  expiryDate: faker.date.between(
    moment().add(1, "week").toISOString(),
    moment().add(10, "months").toISOString()
  ),
  mustHaveDiploma: faker.datatype.boolean(),
  numberOfPositions: faker.datatype.number({ min: 1, max: 10 })
};

let jobOfferDB;

const rawJobApplication1 = {
  forJobOffer: jobOfferDB?._id,
  forAgency: agencyDB?._id,
  message: faker.lorem.paragraphs(3)
};

const rawJobApplication2 = {
  forJobOffer: jobOfferDB?._id,
  forAgency: agencyDB?._id,
  message: faker.lorem.paragraphs(3)
};

let jobApplicationDB1, jobApplicationDB2;

describe("Agencies", () => {
  describe("Create an agency", () => {
    it("emits email param", async () => {
      const res = await agent
        .post("/agency")
        .send({ ...rawAgency, email: "invalid" });
      expect(res).to.have.status(400);
    });

    it("uses short password", async () => {
      const res = await agent
        .post("/agency")
        .send({ ...rawAgency, password: faker.internet.password(4) });
      expect(res).to.have.status(400);
    });

    it("sends correct params", async () => {
      const res = await agent.post("/agency").send(rawAgency);
      expect(res).to.have.status(200);
      expect(res).to.have.cookie("agencytoken");

      agencyDB = res.body;
    });
  });

  describe("View agency", () => {
    it("shows logged in agency", async () => {
      const res = await agent.get("/agency");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object").with.property("_id");
    });
  });

  describe("Logs out and logs in", () => {
    it("logs out", async () => {
      const res = await agent.get("/agency/logout");
      expect(res).to.have.status(200);
    });

    it("returns unauthorized", async () => {
      const res = await agent.get("/agency");
      expect(res).to.have.status(401);
    });

    it("logs in", async () => {
      const res = await agent
        .post("/agency/login")
        .send({ email: rawAgency.email, password: rawAgency.password });
      expect(res).to.have.status(200);
    });

    it("shows logged in agency", async () => {
      const res = await agent.get("/agency");
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object").with.property("_id");
    });
  });

  describe("Approves agency", () => {
    it("approves it", async () => {
      const res = await agent
        .post("/secretary/approve/" + agencyDB?._id)
        .query({ username: "fermi", password: "fermi", action: "approve" });
      expect(res).to.have.status(200);
    });
  });

  describe("Edit agency", () => {
    it("updates the email", async () => {
      const res = await agent
        .put("/agency")
        .send({ email: faker.internet.email() });
      expect(res).to.have.status(200);
      expect(res.body).to.be.an("object").with.property("_id");

      agencyDB = res.body;

      // Update job applications with correct _id
      rawJobApplication1.forAgency = agencyDB._id;
      rawJobApplication2.forAgency = agencyDB._id;
    });
  });

  describe("Job offers", () => {
    describe("Create a job offer", () => {
      it("uses an invalid expiry date", async () => {
        rawJobOffer.agency = agencyDB._id;

        const res = await agent
          .post("/joboffer")
          .send({ ...rawJobOffer, expiryDate: faker.datatype.string() });
        expect(res).to.have.status(400);
      });

      it("uses expiry date too in the future", async () => {
        const res = await agent
          .post("/joboffer")
          .send({ ...rawJobOffer, expiryDate: moment().add(2, "years") });
        expect(res).to.have.status(400);
      });

      it("uses an invalid field of study", async () => {
        const res = await agent
          .post("/joboffer")
          .send({ ...rawJobOffer, fieldOfStudy: faker.lorem.word(16) });
        expect(res).to.have.status(400);
      });

      it("uses valid data", async () => {
        const res = await agent.post("/joboffer").send(rawJobOffer);

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object").with.property("_id");

        jobOfferDB = res.body;
      });
    });

    describe("Get a job offer", () => {
      it("uses an invalid ObjectId", async () => {
        const res = await agent.get("/joboffer/" + faker.lorem.word());
        expect(res).to.have.status(400);
      });

      it("finds the job offer", async () => {
        const res = await agent.get("/joboffer/" + jobOfferDB?._id);
        // console.log(res.body);
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object").with.property("_id");
      });
    });

    describe("Edit a job offer", () => {
      it("updates the title", async () => {
        const res = await agent
          .put("/joboffer/" + jobOfferDB?._id)
          .send({ title: faker.lorem.word(10) });
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object").with.property("_id");

        jobOfferDB = res.body;

        rawJobApplication1.forJobOffer = jobOfferDB._id;
        rawJobApplication2.forJobOffer = jobOfferDB._id;
      });
    });
  });
});

describe("Students", () => {
  describe("Test routes while not logged in", () => {
    describe("gets current user ", () => {
      it("returns unauthorized", async () => {
        const res = await agent.get("/student");
        expect(res).to.have.status(401);
      });
    });

    describe("gets approved agencies", () => {
      it("returns unauthorized", async () => {
        const res = await agent.get("/student/agencies").query({ field: "it" });
        expect(res).to.have.status(401);
      });
    });

    describe("delete student", () => {
      it("returns unauthorized", async () => {
        const res = await agent.delete("/student");
        expect(res).to.have.status(401);
      });
    });
  });

  describe("Login using test route", () => {
    it("logs student in", async () => {
      // console.log(rawStudent);
      const res = await agent.post("/student/auth/testauth").send(rawStudent);

      expect(res).to.have.status(200);
      expect(res).to.have.cookie("studenttoken");

      studentDB = res.body;
    });

    describe("gets current user ", () => {
      it("returns the student", async () => {
        const res = await agent.get("/student");
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("object").with.property("_id");
      });
    });

    describe("gets approved agencies", () => {
      it("lists the agencies", async () => {
        const res = await agent.get("/student/agencies").query({ field: "it" });
        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
      });
    });
  });

  describe("Job applications", () => {
    describe("Student job application", () => {
      it("creates a job application", async () => {
        const res = await agent
          .post("/student/jobapplication")
          .send(rawJobApplication1);
        expect(res).to.have.status(200);
        jobApplicationDB1 = res.body;
        // console.log(jobApplicationDB1);
      });

      // GETS AUTOMATICALLY DELETED BY DELETING AGENCY
      // it("deletes the job application", async () => {
      //   const res = await agent.delete(
      //     "/student/jobapplication/" + jobApplicationDB1?._id
      //   );
      //   expect(res).to.have.status(200);
      // });
    });
  });

  describe("delete student", () => {
    it("deletes the student", async () => {
      const res = await agent.delete("/student");
      expect(res).to.have.status(200);
    });
  });

  describe("Delete a job offer", async () => {
    it("uses an invalid ObjectId", async () => {
      const res = await agent.delete("/joboffer/" + faker.lorem.word());
      expect(res).to.have.status(400);
    });

    it("deletes the job offer", async () => {
      const res = await agent.delete("/joboffer/" + jobOfferDB?._id);
      expect(res).to.have.status(200);
    });
  });

  describe("Delete an agency", () => {
    it("deletes it", async () => {
      const res = await agent.delete("/agency");
      expect(res).to.have.status(200);
    });
  });
});
