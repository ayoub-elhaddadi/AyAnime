"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    hasNextPage: boolean;
    isLoading: boolean;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    hasNextPage,
    isLoading
}: PaginationProps) {
    const [inputPage, setInputPage] = useState(currentPage.toString());

    useEffect(() => {
        setInputPage(currentPage.toString());
    }, [currentPage]);

    const handlePageChange = (newPage: number) => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        onPageChange(newPage);
    };

    const handlePageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newPage = parseInt(inputPage);

        if (isNaN(newPage) || newPage < 1 || newPage > totalPages) {
            toast.error(`Please enter a page between 1 and ${totalPages}`);
            setInputPage(currentPage.toString());
            return;
        }

        handlePageChange(newPage);
    };

    return (
        <div className="flex items-center gap-3">
            <Button
                variant="outline"
                size="icon"
                title="Previous"
                className="border-white/5 h-10 w-10 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                disabled={currentPage === 1 || isLoading}
                onClick={() => handlePageChange(currentPage - 1)}
            >
                <ChevronLeft size={18} />
            </Button>

            <form onSubmit={handlePageSubmit} className="flex items-center gap-2">
                <Input
                    value={inputPage}
                    onChange={(e) => setInputPage(e.target.value)}
                    className="w-16 h-10 bg-zinc-900 border-white/5 text-center font-black text-primary focus:border-primary/50 transition-all rounded-xl p-0"
                />
                <span className="text-zinc-600 font-bold">/</span>
                <span className="text-zinc-500 font-bold min-w-[20px]">{totalPages}</span>
            </form>

            <Button
                variant="outline"
                size="icon"
                title="Next"
                className="border-white/5 h-10 w-10 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!hasNextPage || isLoading}
            >
                <ChevronRight size={18} />
            </Button>
        </div>
    );
}
