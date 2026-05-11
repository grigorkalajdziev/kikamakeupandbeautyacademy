"use client";
import { useState, useEffect } from "react";
import { IoIosStar, IoIosStarOutline } from "react-icons/io";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "sonner";
import { onAuthStateChanged } from "firebase/auth";
import { database, ref, push, set, get, auth } from "../../pages/api/register";
import { useLocalization } from "../../context/LocalizationContext";
import type { Product } from "../../types";

interface Review { reviewerName: string; reviewerEmail: string; message: string; rating: number; date: string; }

interface Props { product: Product; }

type TabKey = "description" | "reviews";

const RatingStars = ({ rating, setRating }: { rating: number; setRating: (n: number) => void }) => (
  <div className="flex gap-1 text-xl">
    {Array.from({ length: 5 }, (_, i) => (
      <button key={i} type="button" onClick={() => setRating(i + 1)} className="text-amber-400 hover:scale-110 transition-transform">
        {i < rating ? <IoIosStar /> : <IoIosStarOutline />}
      </button>
    ))}
  </div>
);

const ProductDescriptionTab = ({ product }: Props) => {
  const { t, currentLanguage } = useLocalization();
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [reviews, setReviews] = useState<Record<string, Review>>({});
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [rating, setRating] = useState(0);

  const formatDate = (d: string) => {
    if (!d) return "";
    const parts = d.includes("-") ? d.split("-") : d.split("/");
    return parts.length === 3 && parts[0].length === 4
      ? `${parts[2]}-${parts[1]}-${parts[0]}`
      : d;
  };

  const fetchReviews = async () => {
    try {
      const snap = await get(ref(database, `productReviews/${product.id}/reviews`));
      setReviews(snap.exists() ? (snap.val() as Record<string, Review>) : {});
    } catch { setReviews({}); }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) { setReviewerEmail(user.email ?? ""); fetchReviews(); }
      else { setReviewerEmail(""); setReviews({}); }
    });
    return () => unsub();
  }, [product.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) { toast.error(t("you_must_be_logged_in")); return; }
    if (!reviewerName.trim()) { toast.error(t("please_enter_your_name")); return; }
    if (rating === 0) { toast.error(t("please_give_a_rating")); return; }
    if (!reviewMessage.trim()) { toast.error(t("please_enter_a_message")); return; }

    try {
      const newRef = push(ref(database, `productReviews/${product.id}/reviews`));
      await set(newRef, {
        reviewerName, reviewerEmail, message: reviewMessage,
        rating: rating || 5,
        date: new Date().toISOString().split("T")[0],
      });
      setReviewerName(""); setReviewMessage(""); setRating(0);
      toast.success(t("review_submitted_successfully"));
      await fetchReviews();

      await fetch("/api/sendReviewEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: ["grigorkalajdziev@gmail.com", "makeupbykika@hotmail.com"],
          reviewerName, productName: product.name[currentLanguage],
          rating, message: reviewMessage, language: currentLanguage,
        }),
      });
    } catch { toast.error(t("review_submission_failed")); }
  };

  const reviewKeys = Object.keys(reviews);

  const tabs: { key: TabKey; label: string }[] = [
    { key: "description", label: t("description") },
    { key: "reviews", label: `${t("reviews")}${reviewKeys.length ? ` (${reviewKeys.length})` : ""}` },
  ];

  return (
    <div className="mt-16 border-t border-border pt-16">
      {/* Tab nav */}
      <div className="mb-10 flex justify-center gap-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
              activeTab === tab.key
                ? "border-b-2 border-secondary text-secondary"
                : "text-muted hover:text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Description tab */}
      {activeTab === "description" && (
        <div className="mx-auto max-w-3xl text-sm text-muted leading-relaxed">
          {product.fullDescription?.[currentLanguage]}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className="mx-auto max-w-3xl space-y-12">
          {/* Existing reviews */}
          {reviewKeys.length > 0 && (
            <div className="space-y-8">
              <h2 className="font-baskerville text-xl font-normal text-secondary">
                {reviewKeys.length} {t("reviews_on")} {product.name[currentLanguage] ?? product.name.en}
              </h2>
              {reviewKeys.map((key) => {
                const r = reviews[key];
                return (
                  <div key={key} className="flex gap-4 border-b border-border pb-6">
                    <FaUserCircle size={50} className="flex-shrink-0 text-muted" />
                    <div>
                      <div className="flex gap-0.5 text-amber-400 text-sm mb-1">
                        {Array.from({ length: r.rating }, (_, i) => <IoIosStar key={i} />)}
                        {Array.from({ length: 5 - r.rating }, (_, i) => <IoIosStarOutline key={i} />)}
                      </div>
                      <p className="text-sm font-semibold text-secondary">{r.reviewerName}</p>
                      <p className="text-xs text-muted mb-2">{formatDate(r.date)}</p>
                      <p className="text-sm text-secondary">{r.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Add review form */}
          <div>
            <h2 className="mb-6 font-baskerville text-xl font-normal text-secondary">{t("add_review")}</h2>
            <p className="mb-6 text-center text-xs text-muted">{t("email_privacy_notice")}</p>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <input type="text" placeholder={`${t("name")} *`} value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} />
                <input type="email" placeholder={`${t("email")} *`} value={reviewerEmail} onChange={(e) => setReviewerEmail(e.target.value)} disabled={!!auth.currentUser} />
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-secondary">{t("your_rating")}</span>
                <RatingStars rating={rating} setRating={setRating} />
              </div>
              <textarea rows={6} placeholder={`${t("your_review")} *`} value={reviewMessage} onChange={(e) => setReviewMessage(e.target.value)} className="form-input resize-none" />
              <div className="text-center">
                <button type="submit" className="lezada-button lezada-button--medium">{t("submit")}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDescriptionTab;
