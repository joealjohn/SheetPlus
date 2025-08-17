'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import DataTable from '@/components/DataTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [tableData, setTableData] = useState<string[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string; } | null>(null);

  const handleDataExtracted = (extractedData: string[][], file: File) => {
    setTableData(extractedData);
    setFileInfo({ name: file.name, type: file.type });
    setIsLoading(false);
  };

  const handleProcessing = (processing: boolean) => {
    setIsLoading(processing);
    if (processing) {
      setTableData(null);
      setFileInfo(null);
    }
  };
  
  const LoadingState = () => (
    <div className="mt-8 space-y-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-40 w-full" />
    </div>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <div className="container mx-auto max-w-7xl p-4 py-8 md:p-8">
          <div className="grid gap-8">
            <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-2xl font-headline">The most powerful AI to extract data from images to sheets</CardTitle>
                <CardDescription>
                  Extract data from your images with up to 95% accuracy, even from handwritten notes. No sign-up required, enjoy free and unlimited usage. Upload an image (JPG, PNG) or a PDF to start.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUploader onDataExtracted={handleDataExtracted} onProcessing={handleProcessing} />
              </CardContent>
            </Card>

            {isLoading && <LoadingState />}

            {!isLoading && tableData && fileInfo && (
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle className="text-2xl font-headline">Extracted Data</CardTitle>
                  <CardDescription>
                    Review and edit the extracted data from <span className="font-medium text-primary">{fileInfo.name}</span>. You can add or remove rows and columns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable initialData={tableData} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
