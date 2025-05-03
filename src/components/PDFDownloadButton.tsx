
import React from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { generatePDF } from '@/utils/pdfGenerator';
import { GPUInstance, GPURequirements } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface PDFDownloadButtonProps {
  results: GPUInstance[];
  searchRequirements?: GPURequirements;
}

const PDFDownloadButton: React.FC<PDFDownloadButtonProps> = ({ results, searchRequirements }) => {
  const { toast } = useToast();
  
  const handleDownload = async () => {
    try {
      toast({
        title: "Preparing PDF",
        description: "Your PDF report is being generated...",
      });
      
      await generatePDF(
        `GPU Options Report (${results.length} results)`, 
        results, 
        searchRequirements
      );
      
      toast({
        title: "PDF Downloaded",
        description: "Your PDF report has been generated successfully!",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      variant="outline" 
      className="flex items-center gap-2"
      disabled={results.length === 0}
    >
      <FileDown className="h-4 w-4" />
      <span>Download PDF</span>
    </Button>
  );
};

export default PDFDownloadButton;
