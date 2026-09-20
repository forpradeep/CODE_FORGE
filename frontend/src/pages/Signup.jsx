import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { registerUser } from '../authSlice';
import { 
  Code2, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  Circle, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const signupSchema = z.object({
  firstName: z.string().min(3, "Name must be at least 3 characters"),
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Must be at least 8 characters")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[0-9]/, "Must include a number")
    .regex(/[^A-Za-z0-9]/, "Must include a special character (!@#$%^&*)")
});

const passwordChecks = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One number (0-9)", test: (v) => /[0-9]/.test(v) },
  { label: "One special character (!@#$)", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ 
    resolver: zodResolver(signupSchema),
    defaultValues: { firstName: '', emailId: '', password: '' }
  });

  const passwordValue = watch('password', '');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(registerUser(data));
  };

  return (
    <div className="min-h-screen flex bg-base-100 selection:bg-primary/30">
      {/* Left Column: Visual Brand */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-base-300 via-base-200 to-base-300 p-12 flex-col justify-between overflow-hidden border-r border-base-content/10">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Code2 className="w-6 h-6 text-primary-content" />
            </div>
            <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              CodeForge
            </span>
          </div>
        </div>

        <div className="relative z-10 my-auto space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Join 10,000+ Developers & Students</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-base-content">
            Start Your Journey Towards Coding Mastery.
          </h1>

          <p className="text-base-content/70 text-base leading-relaxed">
            Create an account to track your solved problems, participate in faculty tests, and prepare for high-stakes technical interviews.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-content/5">
              <span className="text-2xl font-black text-primary">100+</span>
              <p className="text-xs text-base-content/60 mt-1">Curated DSA Problems</p>
            </div>
            <div className="p-3.5 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-content/5">
              <span className="text-2xl font-black text-secondary">3+</span>
              <p className="text-xs text-base-content/60 mt-1">Supported Languages</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-base-content/50">
          © {new Date().getFullYear()} CodeForge Platform. All rights reserved.
        </div>
      </div>

      {/* Right Column: Sign Up Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="w-full max-w-md space-y-6 my-auto">
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex lg:hidden items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-content">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl">CodeForge</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-base-content">Create an account</h2>
            <p className="text-sm text-base-content/60">
              Sign up today and accelerate your coding journey
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name Field */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs text-base-content/80">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Alex Morgan"
                  className={`input input-bordered w-full pl-10 h-11 text-sm bg-base-200/50 rounded-xl focus:bg-base-100 ${
                    errors.firstName ? 'input-error' : ''
                  }`}
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && (
                <span className="text-error text-xs mt-1.5 font-medium">{errors.firstName.message}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs text-base-content/80">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="alex@example.com"
                  className={`input input-bordered w-full pl-10 h-11 text-sm bg-base-200/50 rounded-xl focus:bg-base-100 ${
                    errors.emailId ? 'input-error' : ''
                  }`}
                  {...register('emailId')}
                />
              </div>
              {errors.emailId && (
                <span className="text-error text-xs mt-1.5 font-medium">{errors.emailId.message}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs text-base-content/80">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-base-content/40">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`input input-bordered w-full pl-10 pr-10 h-11 text-sm bg-base-200/50 rounded-xl focus:bg-base-100 ${
                    errors.password ? 'input-error' : ''
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Dynamic Live Password Strength Checklist */}
              <div className="mt-2.5 p-3 rounded-xl bg-base-200/50 border border-base-content/5 space-y-1.5">
                <span className="text-[11px] font-semibold text-base-content/60 block">Password Requirements:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {passwordChecks.map((check) => {
                    const met = check.test(passwordValue);
                    return (
                      <div
                        key={check.label}
                        className={`text-xs flex items-center gap-1.5 transition-colors ${
                          met ? 'text-success font-medium' : 'text-base-content/40'
                        }`}
                      >
                        {met ? (
                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-3.5 h-3.5 flex-shrink-0 opacity-40" />
                        )}
                        <span className="truncate">{check.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 mt-2 gap-2"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Login Link */}
          <div className="text-center pt-2">
            <p className="text-sm text-base-content/70">
              Already have an account?{' '}
              <NavLink to="/login" className="link link-primary font-semibold hover:underline">
                Sign In
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;