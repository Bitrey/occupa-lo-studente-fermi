import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import ReCAPTCHA from "react-google-recaptcha";
import MdEditor from "react-markdown-editor-lite";
import MarkdownIt from "markdown-it";
import axios from "axios";
import { setAgency } from "../../slices/agencyAuthSlice";
import { useDispatch } from "react-redux";
import { setMessage } from "../../slices/alertSlice";
import BackButton from "../BackButton";

const mdParser = new MarkdownIt({
  linkify: true,
  typographer: true
});

const AgencySignup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [captcha, setCaptcha] = useState(null);
  const [responsibleFirstName, setResponsibleFirstName] = useState(""); // "string",
  const [responsibleLastName, setResponsibleLastName] = useState(""); // "string",
  const [responsibleFiscalNumber, setResponsibleFiscalNumber] = useState(""); // "string",
  const [email, setEmail] = useState(""); // "user@example.com",
  const [password, setPassword] = useState(""); // "stringst",
  const [websiteUrl, setWebsiteUrl] = useState(""); // "string",
  const [phoneNumber, setPhoneNumber] = useState(""); // "string",
  const [agencyName, setAgencyName] = useState(""); // "string",
  const [agencyDescription, setAgencyDescription] = useState(""); // "stringstringstri",
  const [agencyAddress, setAgencyAddress] = useState(""); // "string",
  const [vatCode, setVatCode] = useState(""); // "string",
  const [logoUrl, setLogoUrl] = useState(""); // "string"
  const [bannerUrl, setBannerUrl] = useState(""); // "string"

  // const [value, setValue] = React.useState({ firstName, lastName, email });
  const [disabled, setDisabled] = React.useState(true);

  // Ensure form is loaded
  useEffect(() => setDisabled(false), []);

  function handleEditorChange({ text }) {
    setAgencyDescription(text);

    const l = text.trim().length;
    if (l < 16) {
      return dispatch(
        setMessage({
          color: "red",
          text: "La descrizione deve essere lunga almeno 16 caratteri"
        })
      );
    } else if (l > 4000) {
      return dispatch(
        setMessage({
          color: "red",
          text: `Hai raggiunto la lunghezza massima di 4000 caratteri (${l})`
        })
      );
    }
  }

  async function submitForm(event) {
    event.preventDefault();

    const formData = {
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
      logoUrl: logoUrl || undefined,
      bannerUrl: bannerUrl || undefined,
      captcha
    };

    setDisabled(true);

    let agency;

    try {
      const res = await axios.post("/api/agency", formData);
      agency = res.data;
    } catch (err) {
      console.log(err?.response?.data || err);
      dispatch(
        setMessage({
          title: "Errore nella registrazione",
          text: err?.response?.data?.err || "Errore sconosciuto"
        })
      );
      setDisabled(false);
      return false;
    }

    console.log({ agency });
    dispatch(setAgency(agency));
    navigate("/agency/dashboard");
    dispatch(
      setMessage({
        color: "green",
        title: "Buone notizie",
        text: "Registrazione avvenuta con successo! Ora la segreteria deciderà se approvare"
      })
    );
    setDisabled(false);
    return false;
  }

  function captchaChange(value) {
    console.log("Captcha value:", value);
    setCaptcha(value);
  }

  return (
    <Container bg="dark" variant="dark" className="mt-8 mb-4">
      <BackButton path="/agency" />

      <div className="my-3">
        <h1 className="text-2xl font-light">Registrazione azienda</h1>

        <p>In questa pagina dovrai inserire i dati della tua azienda.</p>
        <p>
          Tutti i dati inseriti in questa pagina (ad eccezione della password){" "}
          <u>verranno controllati dalla segreteria scolastica</u>, la quale
          deciderà se approvare o rifiutare l'inserimento dell'azienda sulla
          piattaforma Occupa lo studente.
        </p>
        <p>
          Una volta approvata l'azienda, potrai creare <u>offerte di lavoro</u>{" "}
          alle quali gli studenti potranno candidarsi.
        </p>
      </div>

      <Form onSubmit={submitForm}>
        <Form.Group className="mb-3" controlId="responsibleFirstName">
          <Form.Label>Nome responsabile</Form.Label>
          <Form.Control
            type="text"
            placeholder="Mario"
            onChange={e => setResponsibleFirstName(e.target.value)}
            autoComplete="given-name"
            disabled={disabled}
            value={responsibleFirstName}
            minLength={1}
            maxLength={100}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="responsibleLastName">
          <Form.Label>Cognome responsabile</Form.Label>
          <Form.Control
            type="text"
            placeholder="Rossi"
            onChange={e => setResponsibleLastName(e.target.value)}
            autoComplete="family-name"
            disabled={disabled}
            value={responsibleLastName}
            minLength={1}
            maxLength={100}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="responsibleFiscalNumber">
          <Form.Label>Codice fiscale</Form.Label>
          <Form.Control
            type="text"
            placeholder="RSSMRA70A01F257E"
            onChange={e => setResponsibleFiscalNumber(e.target.value)}
            autoComplete="fiscal-number"
            pattern="^[a-zA-Z]{6}[0-9]{2}[a-zA-Z][0-9]{2}[a-zA-Z][0-9]{3}[a-zA-Z]$"
            disabled={disabled}
            value={responsibleFiscalNumber}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            placeholder="mario@rossi.it"
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            disabled={disabled}
            value={email}
            required
          />
          <Form.Text className="text-muted">
            Email utilizzata per il login e per ogni comunicazione di servizio.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            onChange={e => setPassword(e.target.value)}
            disabled={disabled}
            value={password}
            minLength={8}
            maxLength={64}
            required
          />
          <Form.Text className="text-muted">
            Password utilizzata per il login (verrà crittografata e non sarà
            inviata alla segreteria).
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="websiteUrl">
          <Form.Label>Sito web</Form.Label>
          <Form.Control
            type="text"
            placeholder="https://www.rossi.it"
            onChange={e => setWebsiteUrl(e.target.value)}
            pattern="https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)"
            disabled={disabled}
            value={websiteUrl}
            autoComplete="url"
            required
          />
          <Form.Text className="text-muted">
            URL completo del sito web aziendale (deve iniziare con http/https).
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="phoneNumber">
          <Form.Label>Numero di telefono</Form.Label>
          <Form.Control
            type="text"
            placeholder="3921234567"
            onChange={e => setPhoneNumber(e.target.value)}
            autoComplete="tel"
            disabled={disabled}
            value={phoneNumber}
            required
          />
          <Form.Text className="text-muted">
            Numero di telefono pubblicamente visibile agli studenti (senza
            prefisso +39)
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="agencyName">
          <Form.Label>Nome azienda</Form.Label>
          <Form.Control
            type="text"
            placeholder="Rossi S.p.A."
            onChange={e => setAgencyName(e.target.value)}
            disabled={disabled}
            value={agencyName}
            autoComplete="agency-name"
            minLength={1}
            maxLength={100}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="agencyDescription">
          <Form.Label>Descrizione azienda</Form.Label>

          <MdEditor
            style={{ height: "500px" }}
            renderHTML={text => mdParser.render(text)}
            onChange={handleEditorChange}
            defaultValue={""}
            allowPasteImage={false}
            imageAccept={false}
            autoComplete="off"
            minLength={16}
            maxLength={4000}
            required
          />
          <Form.Text className="text-muted">
            Descrizione esaustiva dell'azienda pubblicamente visibile agli
            studenti.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="agencyAddress">
          <Form.Label>Indirizzo azienda</Form.Label>
          <Form.Control
            type="text"
            placeholder="17 Largo G. Garibaldi, 41121 Modena"
            onChange={e => setAgencyAddress(e.target.value)}
            disabled={disabled}
            value={agencyAddress}
            // autoComplete="street-address"
            autoComplete="street-address"
            minLength={3}
            required
          />
          <Form.Text className="text-muted">
            Indirizzo completo dell'azienda pubblicamente visibile agli
            studenti.
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="vatCode">
          <Form.Label>Partita IVA</Form.Label>
          <Form.Control
            type="text"
            placeholder="02201090368"
            onChange={e => setVatCode(e.target.value)}
            disabled={disabled}
            value={vatCode}
            autoComplete="off"
            minLength={2}
            maxLength={32}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="logoUrl">
          <Form.Label>URL logo</Form.Label>
          <Form.Control
            type="text"
            onChange={e => setLogoUrl(e.target.value)}
            pattern="https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)"
            disabled={disabled}
            autoComplete="off"
            value={logoUrl}
          />
          <Form.Text className="text-muted">
            URL del logo azienda (opzionale, è consigliato utilizzare
            un'immagine quadrata).
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3" controlId="bannerUrl">
          <Form.Label>URL banner</Form.Label>
          <Form.Control
            type="text"
            onChange={e => setBannerUrl(e.target.value)}
            pattern="https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)"
            disabled={disabled}
            autoComplete="off"
            value={bannerUrl}
          />
          <Form.Text className="text-muted">
            Banner mostrato sopra il nome dell'azienda (opzionale).
          </Form.Text>
        </Form.Group>

        <ReCAPTCHA
          // sitekey="6LcPZrMfAAAAAGfknvhtuFNoBPinIM3snOr-Am5z"
          // DEBUG viene usata chiave di testing
          sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
          onChange={captchaChange}
        />

        <Button variant="outline-primary" type="submit" className="mt-3">
          Registra
        </Button>
      </Form>
    </Container>
  );
};

export default AgencySignup;
