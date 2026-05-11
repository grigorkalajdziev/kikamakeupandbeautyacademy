import { useState, useEffect } from "react";
import { IoIosArrowRoundForward } from "react-icons/io";
import { useLocalization } from "../../context/LocalizationContext";
const SubscribeEmailTwo = () => {
  const { t, currentLanguage } = useLocalization();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"" | "sending" | "success" | "error">("");
  const [message, setMessage] = useState("");
  const submit = async () => {
    if (!email || !email.includes("@")) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/resend-subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, currentLanguage }) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error ?? "Failed"); }
      setStatus("success");
      setMessage(t("thank_you_for_subscribing"));
      setEmail("");
    } catch (e) { setStatus("error"); setMessage((e as Error).message); }
  };
  useEffect(() => {
    if (status !== "success") return;
    const id = setTimeout(() => { setStatus(""); setMessage(""); }, 3000);
    return () => clearTimeout(id);
  }, [status]);
  return (
    <div className="subscribe-form">
      <div className="mc-form">
        <input id="resend-form-email" className="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("email_placeholder")} />
        <button className="button" onClick={submit}><IoIosArrowRoundForward /></button>
      </div>
      {status === "sending" && <p className="mt-2 text-xs text-blue-500">{t("sending")}...</p>}
      {status === "error"   && <p className="mt-2 text-xs text-red-500">{message}</p>}
      {status === "success" && <p className="mt-2 text-xs text-green-500">{message}</p>}
    </div>
  );
};
export default SubscribeEmailTwo;
