import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6">
          <img src="/logo.png" alt="AvisMaker" className="w-16 h-16 object-contain" />
        </div>
        <h1 className="text-5xl font-bold text-[#0D1117] mb-3">404</h1>
        <h2 className="text-xl font-semibold text-[#0D1117] mb-2">{t("notFound.title")}</h2>
        <p className="text-[#6B7280] mb-8">{t("notFound.desc")}</p>
        <Link href="/">
          <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("notFound.backHome")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
