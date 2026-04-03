import { Link } from "wouter";
import { Star, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Star className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-[#0D1117] mb-3">404</h1>
        <h2 className="text-xl font-semibold text-[#0D1117] mb-2">Page not found</h2>
        <p className="text-[#6B7280] mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/">
          <Button className="bg-primary text-[#0D1117] font-semibold hover:bg-primary/90">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}
