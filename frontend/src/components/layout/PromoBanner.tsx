import React from "react";
import { useTranslation } from "react-i18next";

interface PromoBannerProps {
    promoMessage?: string;
}

export const PromoBanner: React.FC<PromoBannerProps> = ({ promoMessage }) => {
    const { t } = useTranslation();

    return (
        <div className="w-full rounded-2xl bg-[#FFB6C1] p-4 shadow-sm">
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">

                <div className="flex items-center gap-2 font-black tracking-wider text-slate-800">
                    <span aria-hidden="true">🎉</span>
                    <span>{t("customer.special_treats")}</span>
                    <span aria-hidden="true">🎉</span>
                </div>

                <div className="rounded-full bg-white/60 px-6 py-1.5 font-bold text-slate-800 shadow-sm backdrop-blur-sm">
                    {promoMessage || t("customer.default_promo")}
                </div>

            </div>
        </div>
    );
};

export default PromoBanner;