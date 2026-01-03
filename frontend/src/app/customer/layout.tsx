export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>
      {children}
    </div>
  );
}
