import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router'; 
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import { 
  Code2, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  Cpu, 
  ShieldCheck, 
  ArrowRight,
  UserCheck
} from 'lucide-react';

const loginSchema = z.object({
  emailId: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required") 
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ 
    resolver: zodResolver(loginSchema),
    defaultValues: { emailId: '', password: '' }
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  const handleQuickFill = (email, pass) => {
    setValue('emailId', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen flex bg-base-100 selection:bg-primary/30">
      {/* Left Column: Visual Brand & Feature Showcase */}
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

        <div className="relative z-10 my-auto space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Coding & Assessment Platform</span>
          </div>
          
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-base-content">
            Master Data Structures & Excel in Coding Tests.
          </h1>

          <p className="text-base-content/70 text-base leading-relaxed">
            Practice algorithmic problems with instant multi-language execution, receive AI-powered doubt assistance, and tackle timed faculty assessments.
          </p>

          <div className="space-y-3.5 pt-2">
            {[
              { icon: Cpu, title: "Judge0 Multi-Language Execution", desc: "Fast C++, Java, and JavaScript test runners." },
              { icon: Sparkles, title: "Integrated AI Doubt Assistant", desc: "Get intelligent hints without giving away solutions." },
              { icon: ShieldCheck, title: "Timed Faculty Assessments", desc: "Secure proctored test windows with auto-submit." }
            ].map((feat, i) => (
              <div key={i} className="flex items-start gap-3.5 p-3 rounded-xl bg-base-100/50 backdrop-blur-sm border border-base-content/5">
                <div className="p-2 rounded-lg bg-primary/10 text-primary mt-0.5">
                  <feat.icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-base-content">{feat.title}</h4>
                  <p className="text-xs text-base-content/60">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-base-content/50">
          © {new Date().getFullYear()} CodeForge Platform. All rights reserved.
        </div>
      </div>

      {/* Right Column: Authentication Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center lg:text-left space-y-2">
            <div className="inline-flex lg:hidden items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-primary-content">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-xl">CodeForge</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-base-content">Welcome back</h2>
            <p className="text-sm text-base-content/60">
              Enter your credentials to access your problems & tests
            </p>
          </div>

          {/* Global error banner if any */}
          {error && (
            <div className="alert alert-error text-sm rounded-xl py-2.5">
              <span>{typeof error === 'string' ? error : 'Login failed. Please verify your credentials.'}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="name@example.com"
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
              {errors.password && (
                <span className="text-error text-xs mt-1.5 font-medium">{errors.password.message}</span>
              )}
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials for Fast Testing */}
          <div className="pt-2 border-t border-base-content/10">
            <span className="text-[11px] uppercase tracking-wider font-bold text-base-content/40 block mb-2 text-center">
              Quick Autofill Demo Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('student@test.com', 'Password@123')}
                className="btn btn-xs btn-outline rounded-lg text-xs"
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('faculty@test.com', 'Password@123')}
                className="btn btn-xs btn-outline btn-warning rounded-lg text-xs"
              >
                Faculty
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@test.com', 'Password@123')}
                className="btn btn-xs btn-outline btn-error rounded-lg text-xs"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Sign Up Footer */}
          <div className="text-center pt-2">
            <p className="text-sm text-base-content/70">
              Don't have an account?{' '}
              <NavLink to="/signup" className="link link-primary font-semibold hover:underline">
                Create an account
              </NavLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;