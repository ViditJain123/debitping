import { SignIn } from '@clerk/nextjs';
import ClerkSignInWrapper from '../../../components/ClerkSignInWrapper';

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>
        <div className="mt-8">
          <ClerkSignInWrapper>
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
          </ClerkSignInWrapper>
        </div>
      </div>
    </div>
  );
}