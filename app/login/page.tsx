import LoginForm from '@/app/login/form';
 
export default function LoginPage() {
  return (
    <main className="flex items-center justify-center md:h-screen">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32">
        <div className="flex h-20 w-full items-end rounded-lg bg-orange-500 p-3 md:h-22">
          <div className="w-32 text-white md:w-36">
            Prompt2
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}