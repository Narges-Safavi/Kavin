type BadgeVariant = "default" | "info" | "success"

type BadgeProps = {
    variant? : BadgeVariant;
    children: React.ReactNode;
}

export default function Badge ({ variant= "default", children}: BadgeProps) {
    const variantStyles: Record<BadgeVariant, string> = {
            default: "bg-zinc-100 text-zinc-700",
            info: "bg-blue-100 text-blue-700",
            success: "bg-green-100 text-green-700"
    };
    return (
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${variantStyles[variant]}`}
        >
            {children}
        </span>
    );
}