import React, { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  KeyRound,
  Info,
} from "lucide-react";
import { authApi } from "../api/auth";
import { useLanguage } from "../i18n/LanguageContext";
import safeherLogo from "../assets/branding/safeher-logo-full.png";

export default function Auth({ initialView = "login", onAuthSuccess, onBackToLanding }) {
  const { t } = useLanguage();
  const [view, setView] = useState(initialView); // "login" | "signup" | "forgot"
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Forgot password form state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState(1); // 1: request code, 2: enter code & new pass
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [resetInfoNote, setResetInfoNote] = useState("");

  function fillDemoUser() {
    setLoginEmail("harshaa@safeher.org");
    setLoginPassword("SafeHer@2026");
    setError("");
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError(t("auth.email_pass_required"));
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.login({
        email: loginEmail.trim(),
        password: loginPassword,
        remember: rememberMe,
      });
      onAuthSuccess(data.user);
    } catch (err) {
      console.error("Login error:", err);
      if (err.isNetworkError) {
        setError("Unable to reach SafeHer servers. Please check your connection and try again.");
      } else {
        setError(err.message || "Sign in failed. Please verify your credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError(t("auth.all_fields_required"));
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setError(t("auth.passwords_match_error"));
      return;
    }

    if (signupPassword.length < 6) {
      setError(t("auth.password_length_error"));
      return;
    }

    if (!agreedTerms) {
      setError(t("auth.terms_error"));
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.register({
        name: signupName.trim(),
        email: signupEmail.trim(),
        phone: signupPhone.trim(),
        password: signupPassword,
      });
      onAuthSuccess(data.user);
    } catch (err) {
      console.error("Signup error:", err);
      if (err.isNetworkError) {
        setError("Unable to reach SafeHer servers. Please check your internet connection.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotRequest(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setResetInfoNote("");

    if (!forgotEmail.trim()) {
      setError(t("auth.email_pass_required"));
      return;
    }

    setLoading(true);

    try {
      const data = await authApi.forgotPassword(forgotEmail.trim());

      // Truthful reporting: do NOT pretend email was sent if not configured
      if (!data.email_service_configured) {
        setResetInfoNote(
          data.note || "SMTP email provider is not configured. Use the server verification code to test password reset."
        );
        if (data.verification_code) {
          setResetCode(data.verification_code);
        }
      }

      setSuccessMsg("Reset code generated. Please enter your verification code and new password.");
      setForgotStep(2);
    } catch (err) {
      console.error("Forgot error:", err);
      if (err.isNetworkError) {
        setError("Unable to connect to SafeHer. Please check your internet connection.");
      } else {
        setError(err.message || "Unable to process password reset. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!resetCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError(t("auth.password_length_error"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError(t("auth.passwords_match_error"));
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({
        email: forgotEmail.trim(),
        code: resetCode.trim(),
        new_password: newPassword,
      });

      setSuccessMsg("Password reset successful! Please sign in with your new password.");
      setView("login");
      setForgotStep(1);
      setLoginEmail(forgotEmail);
      setLoginPassword("");
    } catch (err) {
      console.error("Reset error:", err);
      setError(err.message || "Failed to reset password. Please check your verification code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Brand Header */}
        <div className="auth-brand" onClick={onBackToLanding} role="button" tabIndex={0}>
          <img
            src={safeherLogo}
            alt="SafeHer logo"
            className="auth-brand-logo-img"
          />
          <p className="auth-brand-tag">{t("tagline") || "Safety. Always Within Reach."}</p>
        </div>

        {/* Auth Box */}
        <div className="auth-card">
          {/* Tabs */}
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              className={`auth-tab ${view === "login" ? "active" : ""}`}
              onClick={() => {
                setView("login");
                setError("");
                setSuccessMsg("");
              }}
              role="tab"
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${view === "signup" ? "active" : ""}`}
              onClick={() => {
                setView("signup");
                setError("");
                setSuccessMsg("");
              }}
              role="tab"
            >
              Create Account
            </button>
          </div>

          {/* Feedback messages */}
          {error && (
            <div className="auth-alert error" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="auth-alert success" role="status">
              <CheckCircle2 size={17} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* 1. LOGIN VIEW */}
          {view === "login" && (
            <form onSubmit={handleLoginSubmit} className="auth-form">
              <div className="demo-autofill-bar">
                <span>{t("auth.testing_prompt")}</span>
                <button type="button" className="btn-demo-autofill" onClick={fillDemoUser}>
                  <Sparkles size={14} /> {t("auth.demo_login")}
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="login-email">{t("auth.email")}</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder={t("auth.email_placeholder")}
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label htmlFor="login-password">{t("auth.password")}</label>
                  <button
                    type="button"
                    className="link-btn-subtle"
                    onClick={() => {
                      setView("forgot");
                      setError("");
                      setSuccessMsg("");
                      setForgotStep(1);
                      setForgotEmail(loginEmail);
                    }}
                  >
                    {t("auth.forgot_password")}
                  </button>
                </div>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.password_placeholder")}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-options-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span>{t("auth.remember_me")}</span>
                </label>
              </div>

              <button type="submit" className="btn btn-auth-submit" disabled={loading}>
                {loading ? t("auth.signing_in") : t("auth.login_btn")}
                <ArrowRight size={17} />
              </button>

              <div className="auth-footer-prompt">
                <span>{t("auth.no_account")}</span>
                <button
                  type="button"
                  className="link-btn-strong"
                  onClick={() => {
                    setView("signup");
                    setError("");
                  }}
                >
                  {t("auth.create_one_now")}
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGNUP VIEW */}
          {view === "signup" && (
            <form onSubmit={handleSignupSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="signup-name">{t("auth.full_name")} *</label>
                <div className="input-with-icon">
                  <User size={18} className="input-icon" />
                  <input
                    id="signup-name"
                    type="text"
                    placeholder={t("auth.full_name_placeholder")}
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    required
                    autoComplete="name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">{t("auth.email")} *</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="signup-email"
                    type="email"
                    placeholder={t("auth.email_placeholder")}
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-phone">{t("auth.phone")}</label>
                <div className="input-with-icon">
                  <Phone size={18} className="input-icon" />
                  <input
                    id="signup-phone"
                    type="tel"
                    placeholder={t("auth.phone_placeholder")}
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-pass">{t("auth.password")} *</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="signup-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.password_placeholder")}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-eye-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="signup-confirm-pass">{t("auth.confirm_password")} *</label>
                <div className="input-with-icon">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="signup-confirm-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.confirm_password_placeholder")}
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-terms-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedTerms}
                    onChange={(e) => setAgreedTerms(e.target.checked)}
                    required
                  />
                  <span>
                    {t("auth.terms_agree")}
                  </span>
                </label>
              </div>

              <button type="submit" className="btn btn-auth-submit" disabled={loading}>
                {loading ? t("auth.creating_account") : t("auth.signup_btn")}
                <ArrowRight size={17} />
              </button>

              <div className="auth-footer-prompt">
                <span>{t("auth.have_account")}</span>
                <button
                  type="button"
                  className="link-btn-strong"
                  onClick={() => {
                    setView("login");
                    setError("");
                  }}
                >
                  {t("auth.sign_in")}
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD VIEW (Two-step verified architecture) */}
          {view === "forgot" && (
            <div className="auth-form">
              {forgotStep === 1 ? (
                <form onSubmit={handleForgotRequest}>
                  <div className="auth-form-desc">
                    {t("auth.forgot_instruction")}
                  </div>

                  <div className="form-group">
                    <label htmlFor="forgot-email">{t("auth.email")}</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        id="forgot-email"
                        type="email"
                        placeholder={t("auth.email_placeholder")}
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-auth-submit" disabled={loading}>
                    {loading ? t("common.loading") : t("auth.request_code")}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary w-full"
                    style={{ marginTop: "10px" }}
                    onClick={() => {
                      setView("login");
                      setError("");
                      setSuccessMsg("");
                    }}
                  >
                    Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword}>
                  {resetInfoNote && (
                    <div className="auth-alert info" style={{ background: "#f8fafc", color: "#334155", border: "1px solid #e2e8f0", padding: "10px", borderRadius: "10px", fontSize: "12px", marginBottom: "12px", display: "flex", gap: "8px" }}>
                      <Info size={18} className="text-blue" />
                      <span>{resetInfoNote}</span>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="reset-code">{t("auth.verification_code")}</label>
                    <div className="input-with-icon">
                      <KeyRound size={18} className="input-icon" />
                      <input
                        id="reset-code"
                        type="text"
                        placeholder={t("auth.verification_code_placeholder")}
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        required
                        maxLength={10}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-pass">{t("auth.password")}</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="new-pass"
                        type="password"
                        placeholder={t("auth.new_password_placeholder")}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirm-new-pass">{t("auth.confirm_password")}</label>
                    <div className="input-with-icon">
                      <Lock size={18} className="input-icon" />
                      <input
                        id="confirm-new-pass"
                        type="password"
                        placeholder={t("auth.confirm_password_placeholder")}
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-auth-submit" disabled={loading}>
                    {loading ? t("auth.updating_password") : t("auth.set_new_password")}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary w-full"
                    style={{ marginTop: "10px" }}
                    onClick={() => setForgotStep(1)}
                  >
                    &larr; Resend or Change Email
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
