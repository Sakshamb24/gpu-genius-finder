
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GPURequirements } from "@/services/api";

interface SearchFormProps {
  onSearch: (criteria: GPURequirements) => void;
}

const formSchema = z.object({
  minCPU: z.number().min(0).optional(),
  minRAM: z.number().min(0).optional(),
  maxBudget: z.number().min(0).optional(),
  preferredRegion: z.string().optional(),
  preferredGPUType: z.string().optional(),
  useCase: z.string().optional(),
});

const useCases = [
  { value: "ml-training", label: "Machine Learning Training" },
  { value: "ml-inference", label: "ML Model Inference" },
  { value: "rendering", label: "3D Rendering" },
  { value: "video-processing", label: "Video Processing" },
  { value: "gaming", label: "Game Streaming" },
  { value: "general", label: "General GPU Computing" },
];

const gpuTypes = [
  { value: "any", label: "Any GPU" },
  { value: "a100", label: "NVIDIA A100" },
  { value: "a30", label: "NVIDIA A30" },
  { value: "a40", label: "NVIDIA A40" },
  { value: "a6000", label: "NVIDIA A6000" },
  { value: "v100", label: "NVIDIA V100" },
  { value: "t4", label: "NVIDIA T4" },
];

const regions = [
  { value: "any", label: "Any Region" },
  { value: "mumbai", label: "Mumbai, India" },
  { value: "bangalore", label: "Bangalore, India" },
  { value: "singapore", label: "Singapore" },
  { value: "us", label: "United States" },
  { value: "eu", label: "Europe" },
];

const SearchForm = ({ onSearch }: SearchFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      minCPU: 0,
      minRAM: 0,
      maxBudget: 2000,
      preferredRegion: "any",
      preferredGPUType: "any",
      useCase: "general",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSearch(values);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 bg-white p-6 rounded-xl shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="minCPU"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum vCPUs</FormLabel>
                  <div className="flex items-center space-x-4">
                    <FormControl>
                      <Slider
                        min={0}
                        max={128}
                        step={4}
                        defaultValue={[field.value || 0]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <span className="w-16 text-right font-medium">
                      {field.value || 0} vCPUs
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="minRAM"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum RAM (GB)</FormLabel>
                  <div className="flex items-center space-x-4">
                    <FormControl>
                      <Slider
                        min={0}
                        max={512}
                        step={8}
                        defaultValue={[field.value || 0]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    <span className="w-16 text-right font-medium">
                      {field.value || 0} GB
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Maximum Monthly Budget ($)</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="preferredRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Region</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a region" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredGPUType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred GPU Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select GPU type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {gpuTypes.map((gpu) => (
                        <SelectItem key={gpu.value} value={gpu.value}>
                          {gpu.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="useCase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Use Case</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select use case" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {useCases.map((useCase) => (
                        <SelectItem key={useCase.value} value={useCase.value}>
                          {useCase.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-tech-blue hover:bg-blue-700">
            Find GPU Solutions
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default SearchForm;
