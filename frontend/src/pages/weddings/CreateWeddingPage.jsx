import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, Heart } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Alert from "../../components/ui/Alert";
import { createWeddingSchema } from "../../features/weddings/wedding.schemas";
import { useCreateWedding } from "../../features/weddings/useWeddings";
import { getApiErrorMessage } from "../../services/api";

const today = new Date();
const todayISO = today.toISOString().slice(0, 10);
const todayLabel = today.toLocaleDateString("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/** Create a new wedding workspace → redirects into it. */
export default function CreateWeddingPage() {
  const navigate = useNavigate();
  const createWedding = useCreateWedding();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createWeddingSchema),
    defaultValues: {
      title: "",
      couple: { partnerOne: "", partnerTwo: "" },
      weddingDate: "",
      location: { venue: "", city: "", state: "", country: "India" },
    },
  });

  // Auto-suggest the title while the user hasn't typed one manually
  const [partnerOne, partnerTwo, title] = useWatch({
    control,
    name: ["couple.partnerOne", "couple.partnerTwo", "title"],
  });
  useEffect(() => {
    if (!title && partnerOne && partnerTwo) {
      setValue("title", `${partnerOne} & ${partnerTwo} Wedding`, { shouldValidate: false });
    }
  }, [partnerOne, partnerTwo, title, setValue]);

  const onSubmit = (values) =>
    createWedding.mutate(values, {
      onSuccess: (res) => {
        const id = res?.data?.id;
        navigate(id ? `/weddings/${id}` : "/dashboard", { replace: true });
      },
    });

  return (
    <div className="min-h-screen bg-wine-50">
      <header className="border-b border-wine-200 bg-white/80">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/dashboard"
            className="rounded-lg p-2 text-wine-500 transition-colors hover:bg-wine-100 hover:text-wine-800"
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </Link>
          <span className="font-display text-lg font-semibold text-wine-950">
            Create your wedding
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-wine-100 text-wine-700 ring-1 ring-wine-200">
            <Heart className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="font-display text-3xl font-semibold text-wine-950">
            Let's set up your wedding workspace
          </h1>
          <p className="mt-2 text-sm text-wine-500">
            You can invite family and friends to help plan after this.
          </p>
        </div>

        {createWedding.isError && (
          <Alert className="mb-5">{getApiErrorMessage(createWedding.error)}</Alert>
        )}

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-5 rounded-2xl border border-wine-100 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Partner one"
              type="text"
              placeholder="Amit"
              autoComplete="off"
              error={errors.couple?.partnerOne?.message}
              {...register("couple.partnerOne")}
            />
            <Input
              label="Partner two"
              type="text"
              placeholder="Sona"
              autoComplete="off"
              error={errors.couple?.partnerTwo?.message}
              {...register("couple.partnerTwo")}
            />
          </div>

          <Input
            label="Wedding title"
            type="text"
            placeholder="Amit & Sona Wedding"
            hint="Suggested from your names — change it to anything you like"
            error={errors.title?.message}
            {...register("title")}
          />

          <Input
            label="Wedding date"
            type="date"
            hint={`Today is ${todayLabel}`}
            error={errors.weddingDate?.message}
            {...register("weddingDate", { min: todayISO })}
          />

          <div>
            <p className="mb-3 text-sm font-medium text-wine-900">
              Venue <span className="font-normal text-wine-400">(optional)</span>
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Venue name"
                type="text"
                placeholder="Royal Palace"
                error={errors.location?.venue?.message}
                {...register("location.venue")}
              />
              <Input
                label="City"
                type="text"
                placeholder="Bhopal"
                error={errors.location?.city?.message}
                {...register("location.city")}
              />
              <Input
                label="State"
                type="text"
                placeholder="Madhya Pradesh"
                error={errors.location?.state?.message}
                {...register("location.state")}
              />
              <Input
                label="Country"
                type="text"
                placeholder="India"
                error={errors.location?.country?.message}
                {...register("location.country")}
              />
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Link
              to="/dashboard"
              className="inline-flex h-11 items-center justify-center rounded-xl border border-wine-200 px-5 text-sm font-medium text-wine-800 transition-colors hover:bg-wine-50"
            >
              Cancel
            </Link>
            <Button type="submit" size="lg" loading={createWedding.isPending}>
              Create wedding
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
