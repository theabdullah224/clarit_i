import { Metadata } from "next";
import AuthContainer from "../components/AuthContainer";
import { useRouter } from "next/router";
import { getServerSession } from "next-auth";
import authOptions from "../auth/authOptions";
import { redirect } from "next/navigation";

const Login = async () => {
  const session = await getServerSession(authOptions);
  console.log(session)
  if (session) redirect("/home");
  return <AuthContainer routeName="login" routeText="Don't have an account?" />;
};

export const metadata: Metadata = {
  title: "Login - Blackrobe",
  description: "Login to use blackrobe",
};
export default Login;
