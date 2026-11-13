import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import { signupSchema } from "../../features/auth/auth.schemas";
import { useSignup, useSession } from "../../features/auth/useAuth";
import { getApiErrorMessage } from "../../services/api";

export default function SignupPage() {
  const navigate = useNavigate();

  const { data: session, isLoading: sessionLoading } = useSession();
  const signup = useSignup();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  // Already signed in → go straight to the dashboard
  useEffect(() => {
    if (!sessionLoading && session) navigate("/dashboard", { replace: true });
  }, [session, sessionLoading, navigate]);

  const onSubmit = (values) =>
    signup.mutate(values, {
      onSuccess: () => navigate("/dashboard", { replace: true }),
    });

  return (
    <div>
      <div className="mb-8">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-wine-100 text-wine-700 ring-1 ring-wine-200">
          <Sparkles className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="font-display text-3xl font-semibold text-wine-950">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-wine-500">
          Start planning the big day — it only takes a minute.
        </p>
      </div>

      {signup.isError && (
        <Alert className="mb-5">{getApiErrorMessage(signup.error)}</Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Full name"
          type="text"
          placeholder="Rahul Singh"
          autoComplete="name"
          error={errors.name?.message}
          {...register("name")}
        />

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
          placeholder="Create a strong password"
          autoComplete="new-password"
          togglePassword
          hint="At least 8 characters with a letter and a number"
          error={errors.password?.message}
          {...register("password")}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat your password"
          autoComplete="new-password"
          togglePassword
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <Button type="submit" size="lg" loading={signup.isPending} className="w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-wine-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-wine-700 underline-offset-2 hover:text-wine-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
