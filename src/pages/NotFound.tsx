
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
        <p className="text-gray-500 mb-8">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/">
            <Button className="w-full">
              <Home className="mr-2 h-4 w-4" />
              Return to Home
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
