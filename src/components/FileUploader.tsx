'use client';

import { useState, type DragEvent, type ChangeEvent, useCallback } from 'react';
import { UploadCloud, File, Image as ImageIcon, FileText, Camera, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { extractTextFromImage } from '@/ai/flows/extract-text-from-image';

type FileUploaderProps = {
  onDataExtracted: (data: string[][], file: File) => void;
  onProcessing: (processing: boolean) => void;
};

const parseCsv = (csv: string): string[][] => {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotedField = false;

  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];

    if (inQuotedField) {
      if (char === '"') {
        if (i + 1 < csv.length && csv[i + 1] === '"') {
          // It's an escaped quote
          currentField += '"';
          i++; // Skip next quote
        } else {
          inQuotedField = false;
        }
      } else {
        currentField += char;
      }
    } else {
      switch (char) {
        case ',':
          currentRow.push(currentField);
          currentField = '';
          break;
        case '\n':
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
          // handle CRLF
          if (i + 1 < csv.length && csv[i + 1] === '\r') {
            i++;
          }
          break;
        case '\r':
           // handle CRLF
          if (i + 1 < csv.length && csv[i + 1] === '\n') {
            i++;
          }
          currentRow.push(currentField);
          rows.push(currentRow);
          currentRow = [];
          currentField = '';
          break;
        case '"':
          if (currentField === '') {
            inQuotedField = true;
          } else {
            currentField += char;
          }
          break;
        default:
          currentField += char;
      }
    }
  }

  // Add the last field and row if the CSV doesn't end with a newline
  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows.filter(row => row.length > 0 && (row.length > 1 || row[0] !== ''));
};


export default function FileUploader({ onDataExtracted, onProcessing }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const [isExtracting, setIsExtracting] = useState(false);

  const handleFile = useCallback(async (file: File | null) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please upload a JPG, PNG, or PDF file. You uploaded a ${file.type} file.`,
        variant: "destructive",
      });
      return;
    }

    onProcessing(true);
    setIsExtracting(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageDataUri = reader.result as string;
        try {
          const result = await extractTextFromImage({ imageDataUri });
          const extractedData = parseCsv(result.extractedText);
          onDataExtracted(extractedData, file);
          toast({
            title: "Success!",
            description: "Data has been extracted from your file.",
            variant: "default",
          });
        } catch (error) {
          console.error("Error extracting text:", error);
          toast({
            title: "Error",
            description: "Failed to extract data from the file. Please try again.",
            variant: "destructive",
          });
          onProcessing(false);
        } finally {
          setIsExtracting(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "Error",
        description: "Could not read the selected file.",
        variant: "destructive",
      });
      onProcessing(false);
      setIsExtracting(false);
    }
  }, [onDataExtracted, onProcessing, toast]);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file || null);
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file || null);
  };
  
  const triggerFileInput = () => {
    document.getElementById('file-input')?.click();
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'} ${isExtracting ? 'pointer-events-none' : ''}`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input type="file" id="file-input" className="hidden" onChange={handleInputChange} accept="image/png, image/jpeg, application/pdf" disabled={isExtracting} />
      {isExtracting ? (
        <div className="flex flex-col items-center gap-4 text-primary">
            <Loader2 className="w-12 h-12 animate-spin" />
            <p className="font-semibold">Extracting data...</p>
            <p className="text-muted-foreground">Please wait while we process your file.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <UploadCloud className={`w-12 h-12 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="font-semibold">Drag & drop your file here</p>
          <p className="text-muted-foreground">or</p>
          <Button onClick={triggerFileInput} disabled={isExtracting}>
              <File className="mr-2 h-4 w-4" /> Browse Files
          </Button>
          <div className="flex gap-4 text-muted-foreground mt-4">
              <div className="flex items-center gap-2 text-sm"><ImageIcon className="h-4 w-4" /> JPG, PNG</div>
              <div className="flex items-center gap-2 text-sm"><FileText className="h-4 w-4" /> PDF</div>
              <div className="flex items-center gap-2 text-sm"><Camera className="h-4 w-4" /> Camera (coming soon)</div>
          </div>
        </div>
      )}
    </div>
  );
}
