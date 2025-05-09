'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { extractPlaceholders, extractTextFromPdf, processTextForV3 } from '@/services/externalApiService';
import { V3Client } from '@/services/apiClient';
import { V3Data } from '@/lib/types/v3Types';

interface FileDropzoneProps {
    onUploadSuccess: (result: any) => void;
    onUploadError: (error: string) => void;
    onV3DataUpdated?: (v3Data: V3Data) => void;
    isLoading: boolean;
    setIsLoading: (loading: boolean) => void;
    acceptedFileTypes?: 'pdf' | 'docx' | 'both';
}

export default function FileDropzone({
    onUploadSuccess,
    onUploadError,
    onV3DataUpdated,
    isLoading,
    setIsLoading,
    acceptedFileTypes = 'both'
}: FileDropzoneProps) {
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

    // Déterminer les types de fichiers acceptés
    const getAcceptedFileTypes = () => {
        switch (acceptedFileTypes) {
            case 'pdf':
                return {
                    'application/pdf': ['.pdf']
                };
            case 'docx':
                return {
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                };
            case 'both':
            default:
                return {
                    'application/pdf': ['.pdf'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                };
        }
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        // Déterminer les fichiers valides selon le type accepté
        let validFiles: File[] = [];

        if (acceptedFileTypes === 'pdf' || acceptedFileTypes === 'both') {
            const pdfFiles = acceptedFiles.filter(file => file.name.toLowerCase().endsWith('.pdf'));
            validFiles = [...validFiles, ...pdfFiles];
        }

        if (acceptedFileTypes === 'docx' || acceptedFileTypes === 'both') {
            const docxFiles = acceptedFiles.filter(file => file.name.toLowerCase().endsWith('.docx'));
            validFiles = [...validFiles, ...docxFiles];
        }

        if (validFiles.length === 0) {
            onUploadError(`Seuls les fichiers ${acceptedFileTypes === 'both' ? '.pdf et .docx' : acceptedFileTypes === 'pdf' ? '.pdf' : '.docx'} sont acceptés`);
            return;
        }

        setUploadedFiles(prev => [...prev, ...validFiles]);

        // Traiter le premier fichier
        const file = validFiles[0];
        setIsLoading(true);

        try {
            if (file.name.toLowerCase().endsWith('.pdf')) {
                // Traitement PDF
                const textExtractionResult = await extractTextFromPdf(file);

                if (!textExtractionResult.success || !textExtractionResult.text) {
                    throw new Error(textExtractionResult.error || "Échec de l'extraction du texte");
                }

                // Obtenir le document V3 actuel ou en créer un nouveau
                const latestDocResponse = await V3Client.getLatest();
                let v3Document = latestDocResponse.success ? latestDocResponse.data : null;

                // Créer un nouveau document V3 si nécessaire
                if (!v3Document) {
                    const newDocResponse = await V3Client.create();
                    if (!newDocResponse.success) {
                        throw new Error(newDocResponse.error || "Impossible de créer un nouveau document V3");
                    }
                    v3Document = newDocResponse.data;
                }

                // À ce stade, v3Document est garanti d'être défini
                if (!v3Document) {
                    throw new Error("Impossible d'obtenir un document V3 valide");
                }

                // Traiter le texte pour mettre à jour le V3
                const processingResult = await processTextForV3(
                    textExtractionResult.text,
                    v3Document.data as unknown as Record<string, string>
                );

                if (!processingResult.success || !processingResult.data) {
                    throw new Error(processingResult.error || "Échec du traitement des données V3");
                }

                // Nous devons nous assurer que les données ont toutes les propriétés requises de V3Data
                // en fusionnant avec les données existantes
                const updatedData = {
                    ...v3Document.data,
                    ...processingResult.data
                } as V3Data;

                // Mise à jour du document V3
                const updateResponse = await V3Client.update(v3Document.id, updatedData);

                if (!updateResponse.success || !updateResponse.data) {
                    throw new Error(updateResponse.error || "Échec de la mise à jour du document V3");
                }

                // Ajouter le fichier à la base de données
                await V3Client.addFile(v3Document.id, {
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    status: 'processed'
                });

                // Transmettre les données mises à jour
                if (onV3DataUpdated) {
                    onV3DataUpdated(updateResponse.data.data);
                }

                onUploadSuccess({
                    message: "PDF traité avec succès",
                    v3Document: updateResponse.data
                });
            } else if (file.name.toLowerCase().endsWith('.docx')) {
                // Traitement DOCX (pour l'extraction de placeholders)
                const result = await extractPlaceholders(file);

                if (result.error) {
                    onUploadError(result.error);
                } else {
                    onUploadSuccess(result);
                }
            }
        } catch (error) {
            onUploadError(error instanceof Error ? error.message : 'Une erreur est survenue lors du traitement du fichier');
        } finally {
            setIsLoading(false);
        }
    }, [onUploadSuccess, onUploadError, onV3DataUpdated, setIsLoading, acceptedFileTypes]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: getAcceptedFileTypes() as any,
        disabled: isLoading,
        multiple: false,
    });

    const removeFile = (indexToRemove: number) => {
        setUploadedFiles(files => files.filter((_, index) => index !== indexToRemove));
    };

    // Obtenir le texte à afficher pour les types de fichiers acceptés
    const getFileTypesText = () => {
        switch (acceptedFileTypes) {
            case 'pdf':
                return 'Fichier PDF uniquement';
            case 'docx':
                return 'Fichier DOCX uniquement';
            case 'both':
            default:
                return 'Fichiers PDF ou DOCX';
        }
    };

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} />

                <div className="flex flex-col items-center justify-center space-y-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3-3m0 0l3 3m-3-3v12" />
                    </svg>

                    {isDragActive ? (
                        <p className="text-blue-500 font-medium">Déposez le fichier ici...</p>
                    ) : (
                        <div>
                            <p className="text-gray-600">
                                <span className="font-medium">Cliquez pour sélectionner</span> ou glissez-déposez
                            </p>
                            <p className="text-gray-500 text-sm mt-1">{getFileTypesText()}</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="mt-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="text-blue-500 mt-2">Traitement en cours...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Liste des fichiers téléchargés */}
            {uploadedFiles.length > 0 && (
                <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Fichiers téléchargés</h3>
                    <ul className="space-y-2">
                        {uploadedFiles.map((file, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-700">{file.name}</span>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="text-red-500 hover:text-red-700"
                                    disabled={isLoading}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
} 