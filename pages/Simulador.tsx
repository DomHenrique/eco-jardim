import React, { useState, useRef } from 'react';
import { Upload, CheckCircle, AlertCircle, X, ArrowRight, Loader } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { verifyImageEnvironment, analyzeImageWithProducts } from '../services/geminiService';
import { Product } from '../types';

const Simulador: React.FC = () => {
    const { products } = useStore();
    const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Upload, 2: Loading/Verify, 3: Select Products, 4: Analysis Result
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [verificationResult, setVerificationResult] = useState<{ valid: boolean; category: string; reason: string } | null>(null);
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [analysisResult, setAnalysisResult] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                verifyImage(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const verifyImage = async (file: File) => {
        setStep(2);
        const result = await verifyImageEnvironment(file);
        setVerificationResult(result);
        if (result.valid) {
            // Wait for user to read result
        } else {
            // Error state
        }
    };

    const handleContinueToSelection = () => {
        setStep(3);
    };

    const handleRetryUpload = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setVerificationResult(null);
        setStep(1);
    };

    const toggleProductSelection = (productId: string) => {
        setSelectedProductIds(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleStartSimulation = async () => {
        if (!selectedImage) return;
        setStep(4);
        setIsAnalyzing(true);
        const selectedProductsList = products.filter(p => selectedProductIds.includes(p.id));
        const result = await analyzeImageWithProducts(selectedImage, selectedProductsList);
        setAnalysisResult(result);
        setIsAnalyzing(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                Simulador de Ambientes EcoJardim & Pedras
            </h1>

            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Progress Steps */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center text-sm overflow-x-auto">
                    <div className={`flex items-center whitespace-nowrap px-2 ${step >= 1 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 border-current">1</div>
                        Upload
                    </div>
                    <div className="h-0.5 w-8 md:w-12 bg-gray-200 flex-shrink-0"></div>
                    <div className={`flex items-center whitespace-nowrap px-2 ${step >= 2 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 border-current">2</div>
                        Verificação
                    </div>
                    <div className="h-0.5 w-8 md:w-12 bg-gray-200 flex-shrink-0"></div>
                    <div className={`flex items-center whitespace-nowrap px-2 ${step >= 3 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 border-current">3</div>
                        Seleção
                    </div>
                    <div className="h-0.5 w-8 md:w-12 bg-gray-200 flex-shrink-0"></div>
                    <div className={`flex items-center whitespace-nowrap px-2 ${step >= 4 ? 'text-green-600 font-bold' : 'text-gray-400'}`}>
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 border-current">4</div>
                        Mágica IA
                    </div>
                </div>

                <div className="p-6 md:p-10 min-h-[400px]">
                    {step === 1 && (
                        <div className="text-center py-10">
                            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Envie uma foto do seu ambiente</h2>
                            <p className="text-gray-500 mb-8">Pode ser seu jardim, garagem, área de piscina ou fachada.</p>
                            
                            <div 
                                className="border-4 border-dashed border-gray-200 rounded-2xl p-10 hover:border-green-400 transition-colors cursor-pointer bg-gray-50 flex flex-col items-center justify-center group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload size={64} className="text-gray-400 group-hover:text-green-500 mb-4 transition-colors" />
                                <span className="font-medium text-gray-600 group-hover:text-green-600">Clique para carregar uma imagem</span>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleFileChange} 
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col items-center justify-center text-center">
                            {imagePreview && (
                                <img 
                                    src={imagePreview} 
                                    alt="Preview" 
                                    className="max-h-64 rounded-lg shadow-md mb-6 object-cover"
                                />
                            )}

                            {!verificationResult ? (
                                <div className="flex flex-col items-center animate-pulse">
                                    <h3 className="text-xl font-medium text-gray-800">Analisando imagem...</h3>
                                    <p className="text-gray-500">Nossa IA está verificando o tipo de ambiente.</p>
                                </div>
                            ) : (
                                <div className="max-w-md w-full animate-fadeIn">
                                    {verificationResult.valid ? (
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                            <div className="flex items-center justify-center text-green-600 mb-3">
                                                <CheckCircle size={48} />
                                            </div>
                                            <h3 className="text-xl font-bold text-green-800 mb-2">Ambiente Identificado!</h3>
                                            <p className="text-green-700 font-medium text-lg mb-1">{verificationResult.category}</p>
                                            <p className="text-green-600 mb-6 text-sm">"{verificationResult.reason}"</p>
                                            
                                            <button 
                                                onClick={handleContinueToSelection}
                                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full transition-colors flex items-center justify-center w-full"
                                            >
                                                Continuar para Produtos <ArrowRight className="ml-2" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                            <div className="flex items-center justify-center text-red-500 mb-3">
                                                <AlertCircle size={48} />
                                            </div>
                                            <h3 className="text-xl font-bold text-red-800 mb-2">Ops, algo deu errado.</h3>
                                            <p className="text-red-700 font-medium mb-1">Não identificamos um ambiente compatível.</p>
                                            <p className="text-red-600 mb-6 text-sm">"{verificationResult.reason}"</p>
                                            
                                            <button 
                                                onClick={handleRetryUpload}
                                                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-8 rounded-full transition-colors w-full"
                                            >
                                                Tentar Outra Foto
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                             <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <h2 className="text-2xl font-bold text-gray-800">Selecione produtos para testar</h2>
                                <button 
                                    onClick={handleStartSimulation}
                                    disabled={selectedProductIds.length === 0}
                                    className={`py-3 px-6 rounded-full font-bold flex items-center transition-all w-full md:w-auto justify-center ${
                                        selectedProductIds.length > 0 
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Gerar Simulação IA <span className="ml-2 text-xs bg-white/20 px-2 py-0.5 rounded-full">{selectedProductIds.length}</span>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 h-[500px] overflow-y-auto p-2">
                                {products.map(product => (
                                    <div 
                                        key={product.id} 
                                        onClick={() => toggleProductSelection(product.id)}
                                        className={`cursor-pointer rounded-lg border-2 p-3 transition-all relative group h-full flex flex-col ${
                                            selectedProductIds.includes(product.id) 
                                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                                            : 'border-gray-200 hover:border-blue-300 bg-white'
                                        }`}
                                    >
                                        {selectedProductIds.includes(product.id) && (
                                            <div className="absolute top-2 right-2 z-10 text-blue-600 bg-white rounded-full p-1 shadow-sm">
                                                <CheckCircle size={20} className="fill-current" />
                                            </div>
                                        )}
                                        <div className="aspect-square rounded-md overflow-hidden mb-3 bg-gray-100 relative">
                                             <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <h4 className="font-semibold text-gray-800 text-sm leading-tight mb-1 flex-grow">{product.name}</h4>
                                        <p className="text-gray-500 text-xs">{product.category}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="grid md:grid-cols-2 gap-8 items-start h-full">
                            <div className="md:sticky md:top-0">
                                <h3 className="font-bold text-gray-500 mb-2 uppercase text-xs tracking-wider">Imagem Original</h3>
                                {imagePreview && (
                                    <img 
                                        src={imagePreview} 
                                        alt="Original" 
                                        className="w-full rounded-xl shadow-lg border-4 border-white"
                                    />
                                )}
                                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                                     <h4 className="font-bold text-blue-800 mb-2">Produtos Analisados:</h4>
                                     <div className="flex flex-wrap gap-2">
                                        {products.filter(p => selectedProductIds.includes(p.id)).map(p => (
                                            <span key={p.id} className="text-xs bg-white text-blue-600 px-3 py-1 rounded-full border border-blue-200 font-medium">
                                                {p.name}
                                            </span>
                                        ))}
                                     </div>
                                </div>
                                <button
                                    onClick={handleRetryUpload}
                                    className="mt-4 text-gray-500 hover:text-gray-800 underline text-sm block w-full text-center md:text-left"
                                >
                                    Começar nova simulação
                                </button>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6 md:p-8 min-h-[500px] border border-gray-100 flex flex-col relative text-left">
                                <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center">
                                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg mr-3 shadow-lg">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                    Análise do Especialista IA
                                </h3>

                                {isAnalyzing ? (
                                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-12">
                                         <Loader size={48} className="animate-spin mb-4 text-blue-500" />
                                         <p>Gerando recomendações personalizadas...</p>
                                    </div>
                                ) : (
                                    <div className="prose prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-line animate-fadeIn">
                                        {analysisResult}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Simulador;
