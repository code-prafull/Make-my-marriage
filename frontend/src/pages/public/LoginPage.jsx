import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Heart } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import { loginSchema } from "../../features/auth/auth.schemas";
import { useLogin, useSession } from "../../features/auth/useAuth";
import { getApiErrorMessage } from "../../services/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";

  const { data: session, isLoading: sessionLoading } = useSession();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  // Already signed in → go straight to the dashboard
  useEffect(() => {
    if (!sessionLoading && session) navigate(from, { replace: true });
  }, [session, sessionLoading, navigate, from]);

  const onSubmit = (values) =>
    login.mutate(values, {
      onSuccess: () => navigate(from, { replace: true }),
    });

  return (
    <div>
      <div className="mb-8">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-wine-100 text-wine-700 ring-1 ring-wine-200">
          <Heart className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-semibold text-wine-950">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-wine-500">
          Sign in to continue planning your wedding.
        </p>
      </div>

      {login.isError && (
        <Alert className="mb-5">{getApiErrorMessage(login.error)}</Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          togglePassword
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-wine-700 underline-offset-2 hover:text-wine-900 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" size="lg" loading={login.isPending} className="w-full">
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-wine-500">
        New here?{" "}
        <Link
          to="/signup"
          className="font-semibold text-wine-700 underline-offset-2 hover:text-wine-900 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
