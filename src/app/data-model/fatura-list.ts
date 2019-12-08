export class FaturaList {
    fatura_index: number;
    fatura_data: string;
    fatura_valor: number;
    fatura_valor_pago: number;
    conta_id: number;
    conta_nome: string;
}

export class CartaoList {
    conta_id: number;
    conta_nome: string;
    conta_descricao: string;
    faturas: FaturaList[];
}
