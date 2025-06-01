import { useEffect, useRef, useState } from "react";

export default function PdfPreview({ url }: { url: string }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient) return;

        (async () => {
            const pdfjsLib = await import("pdfjs-dist/build/pdf");
            const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker?url");

            pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;

            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const canvas = canvasRef.current;
            if (!canvas) return;
            const context = canvas.getContext("2d");
            if (!context) return;

            const viewport = page.getViewport({ scale: 1.5 });
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport }).promise;
        })();
    }, [url, isClient]);

    return isClient ? (
        <canvas
            ref={canvasRef}
            className="w-48 h-64 border-2 border-gray-600 rounded-md shadow-md"
        />
    ) : null;

}