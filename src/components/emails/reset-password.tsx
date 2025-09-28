import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface MatchStatResetPasswordEmailProps {
  user?: string;
  resetPasswordLink?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const MatchStatResetPasswordEmail = ({
  user,
  resetPasswordLink,
}: MatchStatResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Réinitialisation mot de passe</Preview>
        <Container style={container}>
          <Img src={`${baseUrl}/logo.png`} width="80" height="80" alt="PRC" />
          <Section>
            <Text style={text}>Bonjour {user},</Text>
            <Text style={text}>
              Quelqu'un a récemment demandé à modifier le mot de passe de votre
              compte Match Stats PRC. Si vous êtes à l'origine de la demande,
              vous pouvez définir un nouveau mot de passe ici :
            </Text>
            <Button style={button} href={resetPasswordLink}>
              Changer mot de passe
            </Button>
            <Text style={text}>
              Si vous ne souhaitez pas modifier votre mot de passe ou si vous
              n'en avez pas fait la demande, ignorez et supprimez simplement ce
              mail.
            </Text>
            <Text style={text}>Forza PRC (et pas PLP) !</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default MatchStatResetPasswordEmail;

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
};
