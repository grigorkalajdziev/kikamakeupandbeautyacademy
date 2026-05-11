import Select from "react-select";
import { AiOutlineEyeInvisible, AiOutlineEye } from "react-icons/ai";

interface CountryOption { value: string; label: string; flag?: string; }
interface CityOption   { value: string; label: string; }

interface Props {
  t: (k: string) => string;
  user: unknown;
  firstName: string; setFirstName: (v: string) => void;
  lastName:  string; setLastName:  (v: string) => void;
  displayName: string; setDisplayName: (v: string) => void;
  email: string;
  address: string; setAddress: (v: string) => void;
  zipCode: string; setZipCode: (v: string) => void;
  phone:   string; setPhone:   (v: string) => void;
  currentPassword:  string; setCurrentPassword:  (v: string) => void;
  newPassword:      string; setNewPassword:      (v: string) => void;
  confirmPassword:  string; setConfirmPassword:  (v: string) => void;
  isLoading: boolean;
  selectedCountry: CountryOption | null; setSelectedCountry: (v: CountryOption | null) => void;
  selectedCity:    CityOption   | null; setSelectedCity:    (v: CityOption   | null) => void;
  cityOptions: CityOption[];
  nameOnCard: string; setNameOnCard: (v: string) => void;
  cardNumber: string; setCardNumber: (v: string) => void;
  expiration: string; setExpiration: (v: string) => void;
  cvc:        string; setCvc:        (v: string) => void;
  hasChanges: boolean; initialLoaded: boolean;
  isCanceling: boolean; setIsCanceling: (v: boolean) => void;
  handleSave:   (e: React.FormEvent) => void;
  handleCancel: () => void;
  countryOptions: CountryOption[];
  customStyles: unknown;
  showCurrentPassword: boolean; toggleCurrentPasswordVisibility: () => void;
  showNewPassword:     boolean; toggleNewPasswordVisibility:     () => void;
  showConfirmPassword: boolean; toggleConfirmPasswordVisibility: () => void;
  formatCardNumber: (v: string) => string;
  formatExpiration: (v: string) => string;
}

const PwField = ({ label, value, onChange, show, toggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; toggle: () => void }) => (
  <div className="relative">
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-secondary">{label}</label>
    <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} className="pr-12" />
    <button type="button" onClick={toggle} className="absolute bottom-3 right-3 text-muted hover:text-secondary">
      {show ? <AiOutlineEye size={18} /> : <AiOutlineEyeInvisible size={18} />}
    </button>
  </div>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-secondary">{label}</label>
    {children}
  </div>
);

const AccountDetailsTab = ({ t, firstName, setFirstName, lastName, setLastName, displayName, setDisplayName, email, address, setAddress, zipCode, setZipCode, phone, setPhone, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, isLoading, selectedCountry, setSelectedCountry, selectedCity, setSelectedCity, cityOptions, nameOnCard, setNameOnCard, cardNumber, setCardNumber, expiration, setExpiration, cvc, setCvc, hasChanges, initialLoaded, isCanceling, setIsCanceling, handleSave, handleCancel, countryOptions, customStyles, showCurrentPassword, toggleCurrentPasswordVisibility, showNewPassword, toggleNewPasswordVisibility, showConfirmPassword, toggleConfirmPasswordVisibility, formatCardNumber, formatExpiration }: Props) => (
  <form onSubmit={handleSave} className="space-y-10">
    {/* Profile */}
    <div>
      <h4 className="mb-6 text-xs font-semibold uppercase tracking-widest text-secondary">{t("account_details")}</h4>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("first_name")}><input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} /></Field>
        <Field label={t("last_name")} ><input type="text" value={lastName}  onChange={(e) => setLastName(e.target.value)} /></Field>
        <Field label={t("display_name")}><input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></Field>
        <Field label={t("email_address")}><input type="email" value={email} readOnly className="cursor-not-allowed opacity-60" /></Field>
      </div>
    </div>

    {/* Billing */}
    <div>
      <h4 className="mb-6 text-xs font-semibold uppercase tracking-widest text-secondary">{t("billing_address")}</h4>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("country_label")}>
          <Select options={countryOptions} value={selectedCountry} onChange={setSelectedCountry as (v: unknown) => void}
            placeholder={t("select_country")} isClearable styles={customStyles as object}
            formatOptionLabel={(opt: CountryOption) => (
              <div className="flex items-center gap-2">
                {opt.flag && <img src={opt.flag} className="h-4 w-6 object-cover" alt="" />}
                <span className="text-sm">{opt.label}</span>
              </div>
            )}
          />
        </Field>
        <Field label={t("city_label")}>
          <Select options={cityOptions} value={selectedCity} onChange={setSelectedCity as (v: unknown) => void}
            placeholder={t("select_city")} isClearable isDisabled={!selectedCountry} styles={customStyles as object} />
        </Field>
        <Field label={t("address_label")}><input type="text" value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
        <Field label={t("phone_label")}><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
        <Field label={t("zip_label")}><input type="text" value={zipCode} onChange={(e) => setZipCode(e.target.value)} /></Field>
      </div>
    </div>

    {/* Password */}
    <div>
      <h4 className="mb-6 text-xs font-semibold uppercase tracking-widest text-secondary">{t("change_password")}</h4>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <PwField label={t("current_password")} value={currentPassword} onChange={setCurrentPassword} show={showCurrentPassword} toggle={toggleCurrentPasswordVisibility} />
        <PwField label={t("new_password")}     value={newPassword}     onChange={setNewPassword}     show={showNewPassword}     toggle={toggleNewPasswordVisibility} />
        <PwField label={t("confirm_password")} value={confirmPassword} onChange={setConfirmPassword} show={showConfirmPassword} toggle={toggleConfirmPasswordVisibility} />
      </div>
    </div>

    {/* Card */}
    <div>
      <h4 className="mb-6 text-xs font-semibold uppercase tracking-widest text-secondary">{t("payment_information")}</h4>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label={t("name_on_card_label")}><input type="text" value={nameOnCard} onChange={(e) => setNameOnCard(e.target.value)} /></Field>
        <Field label={t("card_number_label")}><input type="text" value={cardNumber} maxLength={19} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} /></Field>
        <Field label={t("expiration_date_label")}><input type="text" value={expiration} maxLength={5} onChange={(e) => setExpiration(formatExpiration(e.target.value))} /></Field>
        <Field label={t("cvc_label")}><input type="text" value={cvc} maxLength={4} onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))} /></Field>
      </div>
    </div>

    {/* Actions */}
    {hasChanges && initialLoaded && (
      <div className="flex gap-4">
        <button type="submit" disabled={isLoading} className="lezada-button lezada-button--medium">
          {isLoading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : t("save_changes")}
        </button>
        <button type="button" onClick={() => { setIsCanceling(true); handleCancel(); setTimeout(() => setIsCanceling(false), 300); }}
          disabled={isCanceling} className="lezada-button lezada-button--medium border-muted text-muted hover:bg-muted hover:text-white">
          {t("cancel")}
        </button>
      </div>
    )}
  </form>
);
export default AccountDetailsTab;
