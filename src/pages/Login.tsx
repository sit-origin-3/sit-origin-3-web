import { useState, useCallback } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { Shield, LogIn, Eye, EyeOff, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { login as loginApi } from "../services/authService";
import { useAuthStore } from "../store/useAuthStore";

interface FormErrors {
  identifier: string | null;
  password: string | null;
  general: string | null;
}

const EMPTY_ERRORS: FormErrors = {
  identifier: null,
  password: null,
  general: null,
};

function validate(identifier: string, password: string, t: any): FormErrors {
  const errors: FormErrors = { ...EMPTY_ERRORS };
  if (!identifier.trim()) {
    errors.identifier = t("login.errorEmpty");
  }
  if (!password) {
    errors.password = t("login.errorEmpty");
  } else if (password.length < 6) {
    errors.password = t("login.errorInvalid");
  }
  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setErrors(EMPTY_ERRORS);

      const validationErrors = validate(identifier, password, t);
      if (hasErrors(validationErrors)) {
        setErrors(validationErrors);
        return;
      }

      setIsLoading(true);
      try {
        const { accessToken, user } = await loginApi({
          identifier: identifier.trim(),
          password,
        });
        setAuth(accessToken, user);
        navigate("/", { replace: true });
      } catch (err) {
        if (err instanceof AxiosError && err.response) {
          const status = err.response.status;
          const message =
            typeof err.response.data?.message === "string"
              ? err.response.data.message
              : null;

          if (status === 401) {
            setErrors({
              ...EMPTY_ERRORS,
              general: message ?? t("login.errorInvalid"),
            });
          } else if (status === 429) {
            setErrors({
              ...EMPTY_ERRORS,
              general: t("common.retry") || "คำขอมากเกินไป กรุณารอสักครู่",
            });
          } else {
            setErrors({
              ...EMPTY_ERRORS,
              general: message ?? t("common.offline"),
            });
          }
        } else {
          setErrors({
            ...EMPTY_ERRORS,
            general: t("common.offline"),
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [identifier, password, setAuth, navigate, t],
  );

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zpd-500 shadow-hard">
            <Shield className="h-8 w-8 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-h1 text-zpd-900">SIT Origin</h1>
          <p className="text-caption text-neutral-500">
            {t("login.title")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-[32px] border-2 border-white/60 bg-white/40 p-6 shadow-cartoon backdrop-blur-lg"
        >
          {errors.general && (
            <div
              role="alert"
              className="mb-4 rounded-2xl border border-pawp-500/30 bg-pawp-400/10 px-4 py-3 text-caption font-semibold text-pawp-500"
            >
              {errors.general}
            </div>
          )}

          <fieldset disabled={isLoading} className="space-y-4">
            <div>
              <label
                htmlFor="login-identifier"
                className="mb-1 block text-caption font-semibold text-zpd-800"
              >
                {t("login.emailOrIdPlaceholder")}
              </label>
              <input
                id="login-identifier"
                type="text"
                inputMode="email"
                autoComplete="username"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                aria-invalid={!!errors.identifier}
                aria-describedby={
                  errors.identifier ? "identifier-error" : undefined
                }
                className={`block w-full rounded-2xl border-2 bg-white/60 px-4 py-3 text-body text-zpd-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-zpd-500 focus:ring-2 focus:ring-zpd-500/30 ${
                  errors.identifier
                    ? "border-pawp-500"
                    : "border-white/60"
                }`}
                placeholder="email@sit.kmutt.ac.th"
              />
              {errors.identifier && (
                <p
                  id="identifier-error"
                  className="mt-1 text-caption text-pawp-500"
                >
                  {errors.identifier}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-1 block text-caption font-semibold text-zpd-800"
              >
                {t("login.passwordPlaceholder")}
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={`block w-full rounded-2xl border-2 bg-white/60 px-4 py-3 pr-12 text-body text-zpd-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-zpd-500 focus:ring-2 focus:ring-zpd-500/30 ${
                    errors.password
                      ? "border-pawp-500"
                      : "border-white/60"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-neutral-400 transition-colors hover:text-zpd-700"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="mt-1 text-caption text-pawp-500"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl bg-zpd-500 px-4 py-3 text-body-lg font-bold text-white shadow-hard transition-all hover:bg-zpd-600 active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" strokeWidth={2.5} />
                  {t("login.loginButton")}
                </>
              )}
            </button>
          </fieldset>
        </form>
      </div>
    </main>
  );
}
