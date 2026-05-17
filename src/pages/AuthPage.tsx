import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/lib/store/authStore";
import { authApi } from "@/lib/api/auth.api";
import { NoorApiError } from "@/lib/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import { BookOpen, Loader2, ArrowLeft, Mail, KeyRound, ShieldCheck } from "lucide-react";

type Step = "auth" | "otp-signup" | "otp-2fa" | "forgot-email" | "otp-forgot" | "reset-password";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();
  const from =
    (location.state as { from?: { pathname?: string } })?.from?.pathname || "/app/dashboard";

  const [step, setStep] = useState<Step>("auth");
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthYear, setBirthYear] = useState("");

  // OTP / multi-step state
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [preAuthToken, setPreAuthToken] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Login ──────────────────────────────────────────────────────────────────

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Please fill in all fields");
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });

      if ("requiresEmailVerification" in res && res.requiresEmailVerification) {
        setOtpEmail(res.email);
        setOtp("");
        setResendCooldown(60);
        setStep("otp-signup");
        toast.info("Please verify your email. A new code has been sent.");
      } else if ("requires2FA" in res && res.requires2FA) {
        setOtpEmail(res.email);
        setPreAuthToken(res.preAuthToken);
        setOtp("");
        setResendCooldown(60);
        setStep("otp-2fa");
        toast.info("A verification code has been sent to your email.");
      } else if ("token" in res && res.token) {
        setAuth(res.token, res.user);
        toast.success("Welcome back!");
        navigate(res.user.role === 'admin' ? '/admin' : from, { replace: true });
      }
    } catch (error) {
      toast.error(error instanceof NoorApiError ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Signup ─────────────────────────────────────────────────────────────────

  const handleSignup = async () => {
    if (!name || !email || !password || !birthYear) return toast.error("Please fill in all fields");
    if (password.length < 10) return toast.error("Password must be at least 10 characters");
    const yearNum = parseInt(birthYear, 10);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() - 13)
      return toast.error("You must be at least 13 years old to create an account");
    setLoading(true);
    try {
      await authApi.sendSignupOtp({ name, email, password, birthYear: yearNum });
      setOtpEmail(email);
      setOtp("");
      setResendCooldown(60);
      setStep("otp-signup");
      toast.success("Check your email for a 6-digit verification code.");
    } catch (error) {
      toast.error(error instanceof NoorApiError ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify signup OTP ──────────────────────────────────────────────────────

  const handleVerifySignupOtp = async () => {
    if (otp.length !== 6) return toast.error("Please enter the full 6-digit code");
    setLoading(true);
    try {
      const res = await authApi.verifySignupOtp({ email: otpEmail, otp });
      setAuth(res.token, res.user);
      toast.success("Email verified! Welcome to NoorStudio.");
      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      toast.error(error instanceof NoorApiError ? error.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify 2FA OTP ─────────────────────────────────────────────────────────

  const handleVerify2fa = async () => {
    if (otp.length !== 6) return toast.error("Please enter the full 6-digit code");
    setLoading(true);
    try {
      const res = await authApi.verify2fa({ preAuthToken, otp });
      setAuth(res.token, res.user);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error instanceof NoorApiError ? error.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Forgot password ────────────────────────────────────────────────────────

  const handleForgotPassword = async () => {
    if (!email) return toast.error("Please enter your email");
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setOtpEmail(email);
      setOtp("");
      setResendCooldown(60);
      setStep("otp-forgot");
      toast.success("If that email exists, a reset code has been sent.");
    } catch (error) {
      toast.error(error instanceof NoorApiError ? error.message : "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  // ── Verify reset OTP ───────────────────────────────────────────────────────

  const handleVerifyResetOtp = async () => {
    if (otp.length !== 6) return toast.error("Please enter the full 6-digit code");
    setLoading(true);
    try {
      const res = await authApi.verifyResetOtp({ email: otpEmail, otp });
      setResetToken(res.resetToken);
      setNewPassword("");
      setConfirmPassword("");
      setStep("reset-password");
    } catch (error) {
      toast.error(error instanceof NoorApiError ? error.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Reset password ─────────────────────────────────────────────────────────

  const handleResetPassword = async () => {
    if (!newPassword) return toast.error("Please enter a new password");
    if (newPassword.length < 10) return toast.error("Password must be at least 10 characters");
    if (newPassword !== confirmPassword) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      await authApi.resetPassword({ resetToken, password: newPassword });
      toast.success("Password reset! You can now sign in.");
      setStep("auth");
      setActiveTab("login");
      setPassword("");
    } catch (error) {
      toast.error(error instanceof NoorApiError ? error.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────────────────

  const handleResend = async (purpose: "signup" | "forgot-password" | "2fa") => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await authApi.resendOtp({
        email: purpose !== "2fa" ? otpEmail : undefined,
        purpose,
        preAuthToken: purpose === "2fa" ? preAuthToken : undefined,
      });
      setResendCooldown(60);
      toast.success("A new code has been sent to your email.");
    } catch (error) {
      toast.error(error instanceof NoorApiError ? error.message : "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  // ── Shared sub-elements ────────────────────────────────────────────────────

  const Logo = (
    <CardHeader className="text-center">
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-primary/10 p-3">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
      </div>
      <CardTitle className="text-2xl font-bold">NoorStudio</CardTitle>
      <CardDescription>Create beautiful Islamic children&apos;s books with AI</CardDescription>
    </CardHeader>
  );

  const OtpInput = (
    <div className="flex justify-center">
      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">

        {/* ── Auth: Login / Signup tabs ── */}
        {step === "auth" && (
          <>
            {Logo}
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "login" | "signup")}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Password</Label>
                        <button
                          type="button"
                          className="text-xs text-primary underline-offset-4 hover:underline"
                          onClick={() => { setStep("forgot-email"); setOtp(""); }}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                      />
                    </div>
                    <Button className="w-full mt-2" onClick={handleLogin} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="signup">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Min. 10 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-birth-year">Year of Birth</Label>
                      <Input
                        id="signup-birth-year"
                        type="number"
                        placeholder="e.g. 1990"
                        min={1900}
                        max={new Date().getFullYear() - 13}
                        value={birthYear}
                        onChange={(e) => setBirthYear(e.target.value)}
                        disabled={loading}
                        onKeyDown={(e) => e.key === "Enter" && handleSignup()}
                      />
                      <p className="text-xs text-muted-foreground">You must be at least 13 years old.</p>
                    </div>
                    <Button className="w-full mt-2" onClick={handleSignup} disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        )}

        {/* ── OTP: Email verification (signup / unverified login) ── */}
        {step === "otp-signup" && (
          <>
            {Logo}
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Verify your email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a 6-digit code to
                </p>
                <p className="text-sm font-medium">{otpEmail}</p>
              </div>
              {OtpInput}
              <Button
                className="w-full"
                onClick={handleVerifySignupOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep("auth"); setOtp(""); }}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResend("signup")}
                  disabled={loading || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* ── OTP: Two-factor authentication ── */}
        {step === "otp-2fa" && (
          <>
            {Logo}
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Two-factor verification</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the login code sent to
                </p>
                <p className="text-sm font-medium">{otpEmail}</p>
              </div>
              {OtpInput}
              <Button
                className="w-full"
                onClick={handleVerify2fa}
                disabled={loading || otp.length !== 6}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep("auth"); setActiveTab("login"); setOtp(""); }}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResend("2fa")}
                  disabled={loading || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* ── Forgot password: enter email ── */}
        {step === "forgot-email" && (
          <>
            {Logo}
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <KeyRound className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Forgot password?</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we&apos;ll send you a reset code.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="forgot-email-input">Email</Label>
                <Input
                  id="forgot-email-input"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleForgotPassword()}
                />
              </div>
              <Button className="w-full" onClick={handleForgotPassword} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Code
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep("auth")}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
              </Button>
            </CardContent>
          </>
        )}

        {/* ── Forgot password: enter OTP ── */}
        {step === "otp-forgot" && (
          <>
            {Logo}
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <KeyRound className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">Check your email</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  We sent a reset code to
                </p>
                <p className="text-sm font-medium">{otpEmail}</p>
              </div>
              {OtpInput}
              <Button
                className="w-full"
                onClick={handleVerifyResetOtp}
                disabled={loading || otp.length !== 6}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify Code
              </Button>
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setStep("forgot-email"); setOtp(""); }}
                  disabled={loading}
                >
                  <ArrowLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleResend("forgot-password")}
                  disabled={loading || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </Button>
              </div>
            </CardContent>
          </>
        )}

        {/* ── Reset password: set new password ── */}
        {step === "reset-password" && (
          <>
            {Logo}
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg">Set new password</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose a strong password for your account.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min. 10 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                />
              </div>
              <Button className="w-full" onClick={handleResetPassword} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reset Password
              </Button>
            </CardContent>
          </>
        )}

        <CardFooter className="flex justify-center border-t p-4">
          <p className="text-xs text-muted-foreground text-center">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;
