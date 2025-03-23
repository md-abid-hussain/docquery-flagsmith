import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileQuestion, HomeIcon } from "lucide-react";

interface NotFoundProps {
  title?: string;
  description?: string;
  backUrl?: string;
  backLabel?: string;
  showHomeButton?: boolean;
}

export function NotFound({
  title = "Page Not Found",
  description = "Sorry, we couldn't find the page you're looking for.",
  backUrl = "/d/chat",
  backLabel = "Go to Repositories",
  showHomeButton = true,
}: NotFoundProps) {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="pb-4">
          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
            <FileQuestion className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-center text-xl">{title}</CardTitle>
        </CardHeader>

        <CardContent className="text-center pb-6">
          <p className="text-muted-foreground">{description}</p>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Link href={backUrl} className="w-full">
            <Button variant="default" className="w-full">
              {backLabel}
            </Button>
          </Link>

          {showHomeButton && (
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full gap-2">
                <HomeIcon className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
