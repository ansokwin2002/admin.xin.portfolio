import React, { useState } from 'react';
import { Button } from "src/components/ui/button";
import { Input } from "src/components/ui/input";
import { Label } from "src/components/ui/label";
import { useAuth } from 'src/context/auth-context';
import { Verify } from 'react-puzzle-captcha';
import 'react-puzzle-captcha/dist/react-puzzle-captcha.css';

const AuthRegister = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isVerified) {
      setError('Please complete the puzzle');
      return;
    }
    
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name, email, password, passwordConfirmation, 'puzzle_verified');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form className="mt-4" onSubmit={handleSubmit}>
        {error && <div className="text-red-500 mb-4 text-sm font-medium">{error}</div>}
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="name" className="font-semibold" >Name</Label>
          </div>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="emadd" className="font-semibold">Email Address</Label>
          </div>
          <Input
            id="emadd"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="userpwd" className="font-semibold">Password</Label>
          </div>
          <Input
            id="userpwd"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <div className="mb-2 block">
            <Label htmlFor="confirmpwd" className="font-semibold">Confirm Password</Label>
          </div>
          <Input
            id="confirmpwd"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <Verify 
            onSuccess={() => setIsVerified(true)}
            onRefresh={() => setIsVerified(false)}
            onCustomverify={(data) => {
              // Increased tolerance slightly to 5px for better UX while remaining strict
              const isStrict = Math.abs(data.left - data.destX) < 5;
              return {
                spliced: isStrict,
                verified: data.verified
              };
            }}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting || !isVerified}>
          {isSubmitting ? 'Signing Up...' : 'Sign Up'}
        </Button>
      </form>
    </>
  )
}

export default AuthRegister
