
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, Phone, FileText, BarChart3, User, List, FileStack, Settings } from "lucide-react";

// Define Home here before using it in the features array
const Home = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const features = [
  {
    name: "Dashboard",
    description: "View your performance metrics and activity",
    icon: BarChart3,
    path: "/dashboard",
  },
  {
    name: "Properties",
    description: "Manage your property listings",
    icon: Home,
    path: "/properties",
  },
  {
    name: "Contracts",
    description: "View and manage contracts",
    icon: FileText,
    path: "/contracts",
  },
  {
    name: "Leads",
    description: "Manage your potential clients",
    icon: User,
    path: "/leads",
  },
  {
    name: "Contacts",
    description: "Access your contact database",
    icon: Users,
    path: "/contacts",
  },
  {
    name: "Lists",
    description: "Organize contacts into targeted lists",
    icon: List,
    path: "/lists",
  },
  {
    name: "Calls",
    description: "Track and manage your call history",
    icon: Phone,
    path: "/calls",
  },
  {
    name: "Documents",
    description: "Store and manage important files",
    icon: FileStack,
    path: "/documents",
  },
  {
    name: "Seller Map Search",
    description: "Find sellers on an interactive map",
    icon: MapPin,
    path: "/seller-map",
  },
  {
    name: "Buyer Map Search",
    description: "Find buyers on an interactive map",
    icon: MapPin,
    path: "/buyer-map",
  },
  {
    name: "Settings",
    description: "Configure your account preferences",
    icon: Settings,
    path: "/settings",
  },
];

export default function Index() {
  return (
    <div className="space-y-6 py-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Welcome to Goldcup RE</h1>
        <p className="text-muted-foreground">
          Manage your properties, clients, and business from one central dashboard.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Link to={feature.path} key={feature.name}>
            <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <feature.icon className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
