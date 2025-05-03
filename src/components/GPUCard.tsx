
import { GPUInstance } from "@/services/api";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

interface GPUCardProps {
  gpu: GPUInstance;
  isBestValue?: boolean;
  isBestPerformance?: boolean;
  isCheapest?: boolean;
  onSelect: () => void;
}

const GPUCard = ({ 
  gpu, 
  isBestValue = false, 
  isBestPerformance = false, 
  isCheapest = false, 
  onSelect 
}: GPUCardProps) => {
  // Determine badge type
  const getBadgeLabel = () => {
    if (isBestValue) return "Best Value";
    if (isBestPerformance) return "Best Performance";
    if (isCheapest) return "Most Affordable";
    return null;
  };
  
  const badgeLabel = getBadgeLabel();
  
  const getBadgeClass = () => {
    if (isBestValue) return "bg-green-600";
    if (isBestPerformance) return "bg-blue-600";
    if (isCheapest) return "bg-orange-500";
    return "bg-gray-600";
  };

  return (
    <Card className="w-full transition-all hover:shadow-lg relative overflow-hidden">
      {badgeLabel && (
        <div className={`absolute top-0 right-0 ${getBadgeClass()} text-white py-1 px-4 text-xs font-bold rounded-bl-lg`}>
          {badgeLabel}
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">
              {gpu.resource_class.toUpperCase()}
            </CardTitle>
            <CardDescription className="font-medium">
              {gpu.gpu_description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex flex-col">
            <span className="text-muted-foreground">vCPUs</span>
            <span className="font-medium">{gpu.vcpus} Cores</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Memory</span>
            <span className="font-medium">{gpu.ram} GB</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Region</span>
            <span className="font-medium capitalize">{gpu.region}, {gpu.country}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Hourly</span>
            <span className="font-medium">${gpu.price_per_hour.toFixed(2)}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="text-2xl font-bold text-tech-blue">
          ${gpu.price_per_month}
          <span className="text-xs text-muted-foreground font-normal">/month</span>
        </div>
        <Button onClick={onSelect}>
          <Check className="mr-2 h-4 w-4" /> Select
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GPUCard;
