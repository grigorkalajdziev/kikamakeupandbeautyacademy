export const getFriendlyAuthMessage = (code: string, t: (k: string) => string): string =>
  t({
    "auth/invalid-login-credentials": "invalid_credentials",
    "auth/wrong-password": "invalid_credentials",
    "auth/user-not-found": "user_not_found",
    "auth/email-already-in-use": "email_in_use",
    "auth/too-many-requests": "too_many_requests",
    "auth/network-request-failed": "network_error",
    "auth/invalid-email": "invalid_email_format",
    "auth/weak-password": "password_too_short",
    "auth/operation-not-allowed": "operation_not_allowed",
    "auth/popup-closed-by-user": "popup_closed",
    "auth/cancelled-popup-request": "popup_cancelled",
    google_registration_failed: "google_registration_failed",
    something_went_wrong: "something_went_wrong",
  }[code] ?? "something_went_wrong");

export const validateEmail = (email: string): boolean =>
  Boolean(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const validatePasswordStrength = (pw: string): boolean =>
  Boolean(pw) && pw.length >= 6 && /^(?=.*[A-Za-z])(?=.*\d).+$/.test(pw);

export const validateName = (name: string): boolean =>
  Boolean(name) && name.trim().length >= 2;
