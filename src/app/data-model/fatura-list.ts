export class FaturaList {
    fatura_index: number;
    fatura_data: string;
    fatura_valor: string;
    fatura_valor_pago: boolean;
    conta_id: number;
    conta_nome: string;
}

export class CartaoList {
    conta_id: number;
    conta_nome: string;
    conta_descricao: string;
    faturas: FaturaList[];
}
