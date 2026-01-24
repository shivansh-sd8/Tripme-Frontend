import HostHeader from "@/components/shared/HostHeader";
import Footer from "@/components/shared/Footer";

export default function HostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <HostHeader />
      <main className="pt-28">
        {children}
      </main>
      <Footer />
    </div>
  );
} 