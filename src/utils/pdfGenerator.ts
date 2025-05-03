
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { GPUInstance, GPURequirements } from '@/services/api';

export const generatePDF = async (
  title: string, 
  results: GPUInstance[], 
  requirements?: GPURequirements
): Promise<void> => {
  // Create a new PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Set title
  pdf.setFontSize(22);
  pdf.setTextColor(33, 33, 33);
  pdf.text('GPU Genius Finder', pageWidth / 2, 20, { align: 'center' });
  
  pdf.setFontSize(16);
  pdf.text(`${title}`, pageWidth / 2, 30, { align: 'center' });
  
  // Add date
  const date = new Date().toLocaleDateString();
  pdf.setFontSize(10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated on ${date}`, pageWidth / 2, 38, { align: 'center' });
  
  // Add requirements if provided
  let yPos = 50;
  if (requirements) {
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    pdf.text('Search Requirements', 14, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    
    if (requirements.minCPU) {
      pdf.text(`• Minimum CPU: ${requirements.minCPU} vCPUs`, 14, yPos);
      yPos += 6;
    }
    
    if (requirements.minRAM) {
      pdf.text(`• Minimum RAM: ${requirements.minRAM} GB`, 14, yPos);
      yPos += 6;
    }
    
    if (requirements.maxBudget) {
      pdf.text(`• Maximum Budget: $${requirements.maxBudget} per month`, 14, yPos);
      yPos += 6;
    }
    
    if (requirements.preferredRegion && requirements.preferredRegion !== 'any') {
      pdf.text(`• Preferred Region: ${requirements.preferredRegion}`, 14, yPos);
      yPos += 6;
    }
    
    if (requirements.preferredGPUType && requirements.preferredGPUType !== 'any') {
      pdf.text(`• Preferred GPU Type: ${requirements.preferredGPUType}`, 14, yPos);
      yPos += 6;
    }
    
    if (requirements.useCase) {
      pdf.text(`• Use Case: ${requirements.useCase}`, 14, yPos);
      yPos += 6;
    }
    
    yPos += 8;
  }
  
  // Add results table
  if (results.length > 0) {
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    pdf.text('GPU Options', 14, yPos);
    yPos += 8;
    
    // Table header
    pdf.setFillColor(240, 240, 240);
    pdf.rect(14, yPos, pageWidth - 28, 8, 'F');
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(9);
    
    pdf.text("GPU Type", 16, yPos + 5.5);
    pdf.text("Region", 46, yPos + 5.5);
    pdf.text("vCPUs", 71, yPos + 5.5);
    pdf.text("RAM", 91, yPos + 5.5);
    pdf.text("$/Month", 106, yPos + 5.5);
    pdf.text("$/Hour", 131, yPos + 5.5);
    pdf.text("$/Spot", 156, yPos + 5.5);
    
    yPos += 8;
    
    // Table rows
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(50, 50, 50);
    
    // Ensure we don't overflow page
    const rowHeight = 7;
    const maxRows = Math.min(results.length, 25); // Limit rows per page
    
    for (let i = 0; i < maxRows; i++) {
      const instance = results[i];
      
      // Alternate row background
      if (i % 2 === 0) {
        pdf.setFillColor(250, 250, 250);
        pdf.rect(14, yPos, pageWidth - 28, rowHeight, 'F');
      }
      
      pdf.setFontSize(8);
      pdf.text(instance.gpu_description, 16, yPos + 5);
      pdf.text(instance.region, 46, yPos + 5);
      pdf.text(instance.vcpus.toString(), 71, yPos + 5);
      pdf.text(`${instance.ram}GB`, 91, yPos + 5);
      pdf.text(`$${instance.price_per_month}`, 106, yPos + 5);
      pdf.text(`$${instance.price_per_hour}`, 131, yPos + 5);
      pdf.text(`$${instance.price_per_spot}`, 156, yPos + 5);
      
      yPos += rowHeight;
    }
    
    // If we have more results than we showed
    if (results.length > maxRows) {
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`... and ${results.length - maxRows} more options`, pageWidth / 2, yPos + 6, { align: 'center' });
    }
    
    // Add recommendation section
    yPos += 15;
    if (yPos > pdf.internal.pageSize.getHeight() - 40) {
      pdf.addPage();
      yPos = 20;
    }
    
    pdf.setFontSize(14);
    pdf.setTextColor(33, 33, 33);
    pdf.text('Recommendations', 14, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(80, 80, 80);
    
    // Find best value
    const bestValue = [...results].sort((a, b) => {
      const valueA = (a.vcpus * a.ram) / a.price_per_month;
      const valueB = (b.vcpus * b.ram) / b.price_per_month;
      return valueB - valueA;
    })[0];
    
    // Find best performance
    const bestPerformance = [...results].sort((a, b) => {
      const perfA = a.vcpus * a.ram;
      const perfB = b.vcpus * b.ram;
      return perfB - perfA;
    })[0];
    
    // Find best price
    const bestPrice = [...results].sort((a, b) => {
      return a.price_per_month - b.price_per_month;
    })[0];
    
    pdf.setFont("helvetica", "bold");
    pdf.text('Best Value Option:', 14, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${bestValue.gpu_description} in ${bestValue.region} - $${bestValue.price_per_month}/month`, 14, yPos + 6);
    
    yPos += 16;
    
    pdf.setFont("helvetica", "bold");
    pdf.text('Best Performance Option:', 14, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${bestPerformance.gpu_description} in ${bestPerformance.region} - $${bestPerformance.price_per_month}/month`, 14, yPos + 6);
    
    yPos += 16;
    
    pdf.setFont("helvetica", "bold");
    pdf.text('Best Budget Option:', 14, yPos);
    pdf.setFont("helvetica", "normal");
    pdf.text(`${bestPrice.gpu_description} in ${bestPrice.region} - $${bestPrice.price_per_month}/month`, 14, yPos + 6);
  } else {
    // No results
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('No GPU instances matched your search criteria.', pageWidth / 2, yPos + 10, { align: 'center' });
  }
  
  // Footer
  const footerText = 'Generated by GPU Genius Finder • © 2025 All rights reserved';
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(footerText, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  // Save the PDF
  pdf.save(`gpu-options-${date}.pdf`);
};
