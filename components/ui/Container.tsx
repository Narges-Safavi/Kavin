type ContainerProps = {
    children: React.ReactNode;
    className?: string;
};

export default function Contain({children,className} :ContainerProps) {
    return ( 
    <div className={`mx-auto w-full max-w-5xl px-4 ${className ?? ""}`}>
      {children}
      </div>
    );
}