type ButtonVariant = "primary" | "secondary"

type ButtonProps = {
    variant? : ButtonVariant;
    children : React . ReactNode;
}  & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button ( {
    variant = "primary",
    children,
    className,
    ...rest
} : ButtonProps ) {
    const baseStyles = 
        "rounded-lg px-5 py-2.5 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";


  const variantStyles: Record<ButtonVariant, string> = {
    primary: "bg-zinc-900 text-white hover:bg-zinc-700",
    secondary:
      "bg-white text-zinc-900 border border-zinc-300 hover:bg-zinc-50",
  };

    return (
<button
  type="button"
  className={`${baseStyles} ${variantStyles[variant]} ${className ?? ""}`}
  {...rest}
>
  {children}
</button>
  );
}
