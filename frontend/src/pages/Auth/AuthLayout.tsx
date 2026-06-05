import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { PageTransition } from "../../components/ui/PageTransition";
import { useTranslation } from "react-i18next";
import React from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const isLogin = pathname === "/connexion";
  const isRegister = pathname === "/inscription";

  return (
    <PageTransition>
    <div className="container flex justify-center py-16">
      <Card className="w-full max-w-md p-8">

        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center border border-blue-500/20 bg-blue-500/5">
          <img
            src="/favicon.ico"
            alt="CynaSecure"
            className="h-7 w-7 object-contain"
          />
        </div>

        <h1 className="text-center text-2xl font-black tracking-tight" style={{ letterSpacing: "-0.02em" }}>
          CynaSecure
        </h1>
        <p className="mt-1 text-center text-sm text-gray-400">
          {t("auth.layoutSubtitle")}
        </p>

        <div className="mt-6 grid grid-cols-2 border border-gray-800">
          <Link
            to="/connexion"
            className={`py-2.5 text-center text-sm font-mono tracking-wide transition-colors ${
              isLogin
                ? "bg-blue-600 text-white"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {t("nav.login")}
          </Link>

          <Link
            to="/inscription"
            className={`py-2.5 text-center text-sm font-mono tracking-wide border-l border-gray-800 transition-colors ${
              isRegister
                ? "bg-blue-600 text-white border-blue-600"
                : "text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          >
            {t("nav.register")}
          </Link>
        </div>

        <div className="mt-6">{children}</div>
      </Card>
    </div>
    </PageTransition>
  );
}
