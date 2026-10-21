type InputProps = {
   label: string,
    id: string,
    error?: string,
}  & React.InputHTMLAttributes<HTMLInputElement>;

export default function Input({
    label,
    id,
    error,
    className,
    ...rest
} :InputProps) {
  const errorId = `${id}-error`;

    return (
    <div>
         <label
         htmlFor={id}
         className="mb-1 block text-sm font-medium text-zinc-900"
  >
{label}
  </label>
         <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`block w-full max-w-full min-w-0 rounded-lg border px-3 py-2 text-sm sm:text-base ${
          error ? "border-red-500" : "border-zinc-300"
              } ${className ?? ""}`}
        {...rest}
        />
      {error &&
      <p id={errorId} role="alert" className="mt-1 text-sm text-red-600">
      {error}</p>}
      </div>
    );
}
