import LoginForm from "@/components/login-form";

/**
 * @description Innloggingsside for Futleie-applikasjonen.
 * Rendrer et innloggingsskjema sentrert på siden med responsivt design.
 *
 * @returns En innloggingsside med et sentrert LoginForm-komponent
 */
export default function Page() {
    return (
        <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    );
}
