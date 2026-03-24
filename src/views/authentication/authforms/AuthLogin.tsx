import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Button } from 'src/components/ui/button';
import { Checkbox } from 'src/components/ui/checkbox';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { useAuth } from 'src/context/auth-context';
import { Verify, VerifySuccessData } from 'react-puzzle-captcha';
import 'react-puzzle-captcha/dist/react-puzzle-captcha.css';
import { Icon } from '@iconify/react';

const MathChallenge = ({ onVerify }: { onVerify: (verified: boolean) => void }) => {
  const [problem, setProblem] = useState({ a: 0, b: 0, op: '+', result: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const generateProblem = useCallback(() => {
    const a = Math.floor(Math.random() * 10) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const ops = ['+', '-', '*'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let result = 0;
    switch (op) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
    }
    setProblem({ a, b, op, result });
    setUserAnswer('');
    setIsCorrect(null);
    onVerify(false);
  }, [onVerify]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  const checkAnswer = (val: string) => {
    setUserAnswer(val);
    const numericAnswer = parseInt(val);
    if (!isNaN(numericAnswer) && numericAnswer === problem.result) {
      setIsCorrect(true);
      onVerify(true);
    } else {
      setIsCorrect(false);
      onVerify(false);
    }
  };

  return (
    <div className="bg-lightprimary/20 p-4 rounded-md border border-primary/20 mt-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-bold text-primary flex items-center gap-2">
          <Icon icon="tabler:calculator" />
          Solve this to continue:
        </Label>
        <Button 
          type="button" 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-primary"
          onClick={generateProblem}
        >
          <Icon icon="tabler:refresh" />
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-lg font-bold min-w-[80px] text-center">
          {problem.a} {problem.op} {problem.b} =
        </div>
        <Input
          type="number"
          placeholder="?"
          value={userAnswer}
          onChange={(e) => checkAnswer(e.target.value)}
          className={`w-20 text-center font-bold ${
            isCorrect === true ? 'border-green-500 focus-visible:ring-green-500' : 
            isCorrect === false ? 'border-red-500 focus-visible:ring-red-500' : ''
          }`}
        />
        {isCorrect === true && (
          <Icon icon="tabler:check" className="text-green-500" width={24} />
        )}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2 italic">
        * Too many failed attempts. Verification required.
      </p>
    </div>
  );
};

interface AuthLoginProps {
  onCooldownUpdate?: (countdown: number) => void;
}

const AuthLogin = ({ onCooldownUpdate }: AuthLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isMathVerified, setIsMathVerified] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  // Load expiry time from localStorage on mount
  useEffect(() => {
    const expiry = localStorage.getItem('login_cooldown_expiry');
    if (expiry) {
      const now = Date.now();
      const diff = Math.ceil((parseInt(expiry) - now) / 1000);
      if (diff > 0) {
        setCountdown(diff);
        setAttempts(3);
        onCooldownUpdate?.(diff);
      } else {
        localStorage.removeItem('login_cooldown_expiry');
      }
    }
  }, [onCooldownUpdate]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          const newVal = prev - 1;
          onCooldownUpdate?.(newVal);
          if (newVal <= 0) {
              localStorage.removeItem('login_cooldown_expiry');
          }
          return newVal;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, onCooldownUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (countdown > 0) {
      setError(`Please wait ${countdown} seconds before trying again.`);
      return;
    }

    if (!isVerified) {
      setError('Please complete the puzzle');
      return;
    }

    if (attempts >= 3 && !isMathVerified) {
      setError('Please solve the math challenge');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password, 'verified');
      setAttempts(0); 
    } catch (err: any) {
      const msg = err.message || 'Invalid credentials';
      setError(msg);
      
      setAttempts(prev => prev + 1);
      
      // Extract seconds from message if it's a 429 error
      if (msg.includes('Too many failed login attempts')) {
          setAttempts(3);
          const match = msg.match(/(\d+) seconds/);
          let seconds = 60;
          if (match && match[1]) {
            seconds = parseInt(match[1]);
          }
          setCountdown(seconds);
          onCooldownUpdate?.(seconds);
          localStorage.setItem('login_cooldown_expiry', (Date.now() + seconds * 1000).toString());
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="mt-4" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-md mb-4 text-sm font-medium flex items-center gap-2">
            <Icon icon="tabler:alert-circle" width={20} />
            <span className="flex-1">{error}</span>
          </div>
        )}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="email">Email</Label>
          </div>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={countdown > 0}
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd">Password</Label>
          </div>
          <div className="relative">
            <Input 
              id="userpwd" 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={countdown > 0}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} width={20} />
            </button>
          </div>
        </div>
        
        <div className="mb-4 space-y-4">
          <Verify 
            onSuccess={() => setIsVerified(true)}
            onRefresh={() => setIsVerified(false)}
            onCustomverify={(data: VerifySuccessData) => {
              const isStrict = Math.abs(data.left - data.destX) < 5;
              return {
                spliced: isStrict,
                verified: data.verified
              };
            }}
          />

          {attempts >= 3 && countdown === 0 && (
            <MathChallenge onVerify={setIsMathVerified} />
          )}

          {countdown > 0 && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex flex-col items-center justify-center gap-2">
              <Icon icon="tabler:hourglass-empty" className="text-amber-500 animate-spin-slow" width={32} />
              <p className="text-amber-700 font-bold">Cooldown Active</p>
              <p className="text-amber-600 text-sm text-center">
                You can try again in <span className="text-lg font-black">{countdown}</span> seconds
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between my-5">
          <div className="flex items-center gap-2">
            <Checkbox id="accept" className="checkbox" disabled={countdown > 0} />
            <Label htmlFor="accept" className="opacity-90 font-normal cursor-pointer">
              Remember this Device
            </Label>
          </div>
          <Link 
            to={'/admin/auth/maintenance'} 
            className={`text-primary text-sm font-medium ${countdown > 0 ? 'pointer-events-none opacity-50' : ''}`}
            onClick={(e) => countdown > 0 && e.preventDefault()}
          >
            Forgot Password ?
          </Link>
        </div>
        <Button 
          type="submit" 
          className="w-full py-6 text-base font-bold" 
          disabled={isSubmitting || !isVerified || (attempts >= 3 && !isMathVerified) || countdown > 0}
        >
          {isSubmitting ? 'Signing in...' : countdown > 0 ? `Wait ${countdown}s` : 'Sign in'}
        </Button>
      </form>
    </>
  );
};

export default AuthLogin;
