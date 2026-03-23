
import { redirect } from "next/navigation";
// Cambiar esto a false cuando quieras ver el login:
const IS_AUTHENTICATED = false;

 export default async function Home() {
   if (IS_AUTHENTICATED) {
     redirect("/dashboard");
   } else {
     redirect("/login");
   }
  return <h1>Cargando...</h1>;
}
