import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const signupSchema = z.object({
  full_name: z.string().min(2, "Name is required").max(100),
  email: z.string().email("Enter a valid email"),
  phone: z.string().max(20).optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function Signup() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const update = (field: keyof typeof form, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const parsed = signupSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: form.full_name, phone: form.phone },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      return;
    }

    if (data.user) {
      await supabase
        .from("profiles")
        .update({ full_name: form.full_name, phone: form.phone })
        .eq("id", data.user.id);
    }

    setConfirmSent(true);
    toast({ title: "Account created", description: "Check your email to confirm your account." });
  };

  const signInWithGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast({ title: "Google sign up failed", description: String(result.error), variant: "destructive" });
    }
  };

  if (confirmSent) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="text-3xl font-light text-foreground mb-4">Confirm your email</h1>
        <p className="text-sm text-muted-foreground mb-8">
          We sent a confirmation link to {form.email}. Please click it to activate your account.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <h1 className="text-3xl font-light text-foreground mb-2">Create account</h1>
      <p className="text-sm text-muted-foreground mb-8">Join Kandamma Kids for faster ordering and updates.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Full Name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={(e) => update("full_name", e.target.value)}
            className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.full_name && <p className="text-xs text-destructive mt-1">{errors.full_name}</p>}
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full px-4 py-3 border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6">
        <button
          onClick={signInWithGoogle}
          className="w-full py-3 border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Continue with Google
        </button>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-foreground underline">Sign in</Link>
      </p>
    </div>
  );
}
