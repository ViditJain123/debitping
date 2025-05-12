import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to get started with our service
          </p>
        </div>
        <div className="mt-8">
          <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
        </div>
      </div>
    </div>
  );
}
