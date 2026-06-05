import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/Button";
import { PageTransition } from "../../components/ui/PageTransition";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <div className="relative flex min-h-[80vh] items-center justify-center px-6 text-center">

        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
          aria-hidden="true"
        />

        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex flex-col items-center">

          <div className="mb-8 flex items-center justify-center w-16 h-16 border border-blue-500/20 bg-blue-500/5">
            <ShieldAlert className="h-8 w-8 text-blue-400" aria-hidden="true" />
          </div>

          <p className="font-mono text-[0.7rem] tracking-[0.2em] uppercase text-blue-500 mb-4">
            404
          </p>

          <h1 className="text-3xl font-black text-white tracking-tight" style={{ letterSpacing: "-0.02em" }}>
            {t("common.notFound")}
          </h1>

          <p className="mt-4 max-w-sm text-gray-400 text-sm leading-relaxed">
            {t("common.notFoundDesc")}
          </p>

          <Link to="/" className="mt-8">
            <Button
              size="lg"
              className="gap-2 bg-blue-600 hover:bg-blue-500 active:scale-[0.97] text-white rounded-none transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              {t("common.backHome")}
            </Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
