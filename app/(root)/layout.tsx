import Sidebar from "@/components/UI/drawer/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="w-full overflow-x-hidden flex flex-row">
      <Sidebar />
      <div className="flex-1">{children}</div>
    </div>
  );
}
