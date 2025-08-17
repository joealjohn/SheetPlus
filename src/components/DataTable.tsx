'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Download, X, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Packer, Document, Table as DocxTable, TableRow as DocxTableRow, TableCell as DocxTableCell, Paragraph, TextRun, WidthType } from 'docx';
import { saveAs } from 'file-saver';


type DataTableProps = {
  initialData: string[][];
};

export default function DataTable({ initialData }: DataTableProps) {
  const [data, setData] = useState(initialData);
  const { toast } = useToast();

  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const handleCellChange = (e: ChangeEvent<HTMLInputElement>, rowIndex: number, colIndex: number) => {
    const newData = [...data];
    newData[rowIndex][colIndex] = e.target.value;
    setData(newData);
  };

  const addRow = () => {
    if (data.length === 0 || data[0].length === 0) {
      setData([['']]);
      return;
    }
    const newRow = new Array(data[0].length).fill('');
    setData([...data, newRow]);
  };

  const addColumn = () => {
    if (data.length === 0) {
      setData([['']]);
      return;
    }
    const newData = data.map(row => [...row, '']);
    setData(newData);
  };

  const removeRow = (rowIndex: number) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
  };

  const removeColumn = (colIndex: number) => {
    const newData = data.map(row => row.filter((_, index) => index !== colIndex));
    setData(newData);
  };

  const exportToCSV = () => {
    const headers = data.length > 0 ? data[0] : [];
    const rows = data.length > 1 ? data.slice(1) : [];

    const formatCell = (cell: string) => {
        const result = cell.replace(/"/g, '""');
        if (result.includes(',') || result.includes('"') || result.includes('\n')) {
            return `"${result}"`;
        }
        return result;
    };
    
    let csvContent = headers.map(formatCell).join(',') + '\r\n';
    
    rows.forEach(row => {
        csvContent += row.map(formatCell).join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'exported_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({
        title: "Export Successful",
        description: "Your data has been exported as a CSV file.",
        variant: 'default',
      });
  };

  const exportToWord = () => {
    if (data.length === 0) {
        toast({
            title: "Export Failed",
            description: "There is no data to export.",
            variant: "destructive",
        });
        return;
    }

    const table = new DocxTable({
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
        rows: data.map((rowData, rowIndex) => {
            return new DocxTableRow({
                children: rowData.map((cellData) => {
                    return new DocxTableCell({
                        children: [new Paragraph({
                            children: [
                                new TextRun({
                                    text: cellData,
                                    bold: rowIndex === 0,
                                })
                            ]
                        })],
                    });
                }),
            });
        }),
    });

    const doc = new Document({
        sections: [{
            children: [table],
        }],
    });

    Packer.toBlob(doc).then(blob => {
        saveAs(blob, "exported_data.docx");
        toast({
            title: "Export Successful",
            description: "Your data has been exported as a Word document.",
            variant: 'default',
        });
    });
  };

  if (data.length === 0) {
    return (
        <div className="text-center py-10">
            <p className="text-muted-foreground">No data to display. Add a row to start.</p>
            <Button onClick={addRow} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Row
            </Button>
        </div>
    );
  }

  const headers = data.length > 0 ? data[0] : [];
  const bodyRows = data.length > 1 ? data.slice(1) : [];


  return (
    <TooltipProvider>
    <div className="w-full">
        <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
                <Button onClick={addRow} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Row
                </Button>
                <Button onClick={addColumn} variant="outline" size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Column
                </Button>
            </div>
            <div className="flex gap-2">
                <Button onClick={exportToWord} variant="default" size="sm">
                    <FileText className="mr-2 h-4 w-4" /> Export Word
                </Button>
                <Button onClick={exportToCSV} variant="default" size="sm">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>
        </div>
        <div className="relative overflow-x-auto border rounded-lg">
            <Table>
            <TableHeader>
                <TableRow className="bg-muted/50">
                <TableHead className="w-12"></TableHead>
                {headers.map((_, colIndex) => (
                    <TableHead key={colIndex} className="relative group p-2">
                        <Input
                            type="text"
                            value={data[0][colIndex]}
                            onChange={(e) => handleCellChange(e, 0, colIndex)}
                            className="font-bold border-0 bg-transparent min-w-40"
                        />
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeColumn(colIndex)}
                                >
                                <X className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delete Column</p>
                            </TooltipContent>
                        </Tooltip>
                    </TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {bodyRows.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="group">
                    <TableCell className="relative p-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeRow(rowIndex + 1)}
                            >
                            <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Delete Row</p>
                        </TooltipContent>
                    </Tooltip>
                    </TableCell>
                    {row.map((cell, colIndex) => (
                    <TableCell key={colIndex} className="p-2">
                        <Input
                        type="text"
                        value={cell}
                        onChange={(e) => handleCellChange(e, rowIndex + 1, colIndex)}
                        className="w-full min-w-40"
                        />
                    </TableCell>
                    ))}
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
    </div>
    </TooltipProvider>
  );
}
