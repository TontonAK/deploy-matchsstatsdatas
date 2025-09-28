import HeaderDisconnect from "@/components/navigation/header-disconnect";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function RouteLayout() {
  return (
    <>
      <HeaderDisconnect />
      <div className="pt-15 font-montserrat font-bold">
        <Card>
          <CardHeader>
            <CardTitle>Non autorisé</CardTitle>
            <CardDescription>
              Vous n'êtes pas autorisé à accéder à cette page. Merci de bien
              vouloir vous connecter.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}
