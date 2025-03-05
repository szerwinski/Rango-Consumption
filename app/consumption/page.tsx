'use client';

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import axios from "axios";

// Tipos para os dados de consumo
type PurchaseItem = {
    item: string;
    quantity: number | string;
    unitPrice: number | string;
    totalPrice: number | string;
    byWeight?: boolean;
};

type ConsumptionData = {
    name: string;
    purchases: { [date: string]: PurchaseItem[] };
    total: number;
};

function Consumption() {
    const [id, setId] = useState<string | null>(null);
    const [data, setData] = useState<ConsumptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});

    // Obtém o ID manualmente via window.location.search (CSR puro)
    useEffect(() => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const clientId = urlParams.get("id");
            if (clientId) {
                setId(clientId);
            } else {
                setLoading(false);
            }
        }
    }, []);

    // Faz a requisição à API somente se o ID for válido
    useEffect(() => {
        if (!id) return;

        axios.get(`https://api.rangosemfila.com.br/v2/clientsConsumptionReport?id=${id}`)
            .then(response => {
                if (response.data) {
                    setData(response.data);
                }
            })
            .catch(error => console.error("Erro ao buscar os dados:", error))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p className="text-center text-gray-600">Carregando...</p>;
    if (!data) return <p className="text-center text-red-500">Aluno não encontrado.</p>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
            <div className="w-full max-w-lg flex flex-col items-center">
                <Image src="/logo.jpeg" alt="RanGo Logo" width={120} height={120} className="mb-6" />
                <div className="w-full p-6 bg-white shadow-xl rounded-lg border border-gray-300">
                    <h2 className="text-2xl font-bold text-orange-600 mb-4 text-center">
                        Resumo do Consumo de {data.name}
                    </h2>
                    <ul className="list-none divide-y divide-gray-300">
                        {Object.entries(data.purchases).map(([date, items]) => {
                            // Ajuste correto do fuso horário removido


                            return (
                                <li key={date} className="py-2 text-gray-700 font-medium">
                                    <div className="flex justify-between cursor-pointer" onClick={() => setExpanded(prev => ({ ...prev, [date]: !prev[date] }))}>
                                        {date} <span>{expanded[date] ? "🔼" : "🔽"}</span>
                                    </div>
                                    {expanded[date] && (
                                        <ul className="mt-2 text-gray-600">
                                            {items.map((item, index) => (
                                                <li key={index} className="ml-4">
                                                    {item.byWeight
                                                        ? `${(Number(item.quantity) / 1000000).toFixed(3)} kg ${item.item} - R$ ${parseFloat(String((Number(item.totalPrice)) / 1000000)).toFixed(2)}`
                                                        : `${item.quantity}x ${item.item} - R$ ${parseFloat(String(item.totalPrice)).toFixed(2)}`
                                                    }
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                    <p className="text-xl font-semibold mt-4 text-center text-gray-800">
                        Total: <span className="text-green-600">R$ {data.total.toFixed(2)}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}

// ⚡ Força o carregamento dinâmico (evita erro de build)
export default dynamic(() => Promise.resolve(Consumption), { ssr: false });
