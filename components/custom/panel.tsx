export default function RootLayout({
    children,
    className,
}: Readonly<{
    children: React.ReactNode;
    className?: string;
}>) {
    return (
        <div className={`mt-10 p-6 border rounded ${className ? className : ''}`}>
            {children}
        </div>
    );
}